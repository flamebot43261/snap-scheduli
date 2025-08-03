from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import io
from datetime import datetime, timedelta
from google.cloud import vision
from dateutil import parser as date_parser
from ics import Calendar, Event as IcsEvent
import re
import logging
from OCRService import OCRService
from ScheduleParser import ScheduleParser
from ICSExporter import ICSExporter
from event import Event

logging.basicConfig(
    level=logging.DEBUG,
    format="%(levelname)s:%(name)s:%(message)s"
)

app = Flask(__name__)
CORS(app, origins=["http://localhost:8081"], supports_credentials=True, allow_headers="*")

#initialize Google Cloud Vision Client
vision_client = None
try:
    vision_client = vision.ImageAnnotatorClient()
    logging.info("Google Cloud Vision client initialized successfully.")
except Exception as e:
    logging.error(f"Failed to initialize Google Cloud Vision client: {e}")
    vision_client = None

# Initialize service classes
ocr_service_instance = OCRService(vision_client)
schedule_parser_instance = ScheduleParser()
ics_exporter_instance = ICSExporter()

def multiply_weekly_events(base_events, start_date, number_of_weeks):
    """
    Takes a list of events for one week and creates instances for the specified number of weeks
    """
    all_events = []
    
    for week_offset in range(number_of_weeks):
        for base_event in base_events:
            # Calculate the date offset for this week
            days_offset = week_offset * 7
            
            # Create new datetime objects with the offset
            new_start_time = base_event.start_time + timedelta(days=days_offset)
            new_end_time = base_event.end_time + timedelta(days=days_offset)
            
            # Create a new event instance
            new_event = Event(
                name=base_event.name,
                start_time=new_start_time,
                end_time=new_end_time,
                location=base_event.location,
                recurrence_rule=None
            )
            all_events.append(new_event)
    
    logging.info(f"Multiplied {len(base_events)} base events into {len(all_events)} total events for {number_of_weeks} weeks")
    return all_events

@app.route('/api/convert-schedule', methods=['POST'])
#main function logic to parse requests from app and 
# orchestrate class calls.
def convert_picture_to_ics():
    logging.info("Received request to /api/convert-schedule")
    #validate file upload
    if 'image' not in request.files:
        logging.warning("No 'image' uploaded to the request.")
        return jsonify({"error": "No image uploaded to the request"}), 400
    file = request.files['image']
    if file.filename == '':
        logging.warning("No selected file name.")
        return jsonify({"error": "No selected file."}), 400
    
    if not vision_client:
        logging.error("OCR service not initialized. Cannot process request.")
        return jsonify({"error": "Backend OCR service not configured. Please check server logs."}), 500

    try:
        #Read content
        image_content=file.read()
        logging.info(f"File recieved: {file.filename}. Size: {len(image_content)} bytes.")
        #Perform OCR
        raw_text=ocr_service_instance.process_image(image_content)
        logging.info("OCR Service returned raw text.")
        #Parse text into event objects
        logging.info("Parsing raw text into event objects...")
        #define recurrence rule (if applicable)
        
        raw_text=ocr_service_instance.process_image(image_content)
        logging.info('OCR Service returned raw text.')
        
        # Get start date and number of weeks from request
        today=datetime.now().date()
        schedule_start=today
        number_of_weeks = 1  # Default to 1 week

        if 'startDate' in request.form:
            try: 
                schedule_start = date_parser.parse(request.form['startDate']).date() 
                logging.info(f"Using provided start date: {schedule_start}")
            except Exception as e: 
                logging.warning(f"Failed to parse startDate: {e}, using default")
                pass
        
        if 'numberOfWeeks' in request.form:
            try: 
                number_of_weeks = int(request.form['numberOfWeeks'])
                logging.info(f"Using provided number of weeks: {number_of_weeks}")
            except (ValueError, TypeError) as e: 
                logging.warning(f"Failed to parse numberOfWeeks: {e}, using default")
                pass

        # Calculate end date based on number of weeks
        schedule_end = schedule_start + timedelta(weeks=number_of_weeks)
        logging.info(f"Schedule range: {schedule_start} to {schedule_end} ({number_of_weeks} weeks)")

        events=schedule_parser_instance.parse_text(raw_text, schedule_start_date=schedule_start, schedule_end_date=schedule_end)

        events_json= []
        for event in events:
            events_json.append({
                'id': id(event),  # Use object id as temporary identifier
                'name': event.name,
                'startTime': event.start_time.isoformat(),
                'endTime': event.end_time.isoformat(),
                'location': event.location or '',
                'allDay': False
            })
        
        session_id=os.urandom(16).hex()
        app.config[f'events_{session_id}'] = events
        app.config[f'weeks_{session_id}'] = number_of_weeks
        app.config[f'start_date_{session_id}'] = schedule_start.isoformat()

        return jsonify({
            "success": True,
            "events": events_json,
            "session_id": session_id,
            "number_of_weeks": number_of_weeks,
            "start_date": schedule_start.isoformat()
        })

    except Exception as e:
        logging.exception(f"An unexpected error has occured during processing: {e}")
        return jsonify({"error": f"Processing error: {str(e)}"}), 500

@app.route('/api/update-events', methods=['POST'])
def update_events():
    try: 
        data = request.json
        events_data = data.get('events', [])
        
        logging.info(f"🔥 BACKEND: Received {len(events_data)} events for update")
        for i, event_data in enumerate(events_data):
            logging.info(f"🔥 BACKEND Event {i+1}: {event_data.get('name', 'Unknown')}")
            logging.info(f"   📅 Raw Start Time ISO: {event_data.get('startTime')}")
            logging.info(f"   📅 Raw End Time ISO: {event_data.get('endTime')}")
            
            # Parse and log human-readable times
            try:
                if event_data.get('startTime'):
                    start_dt = datetime.fromisoformat(event_data['startTime'].replace('Z', '+00:00'))
                    logging.info(f"   👁️ Start Human: {start_dt.strftime('%Y-%m-%d %H:%M:%S %Z')}")
                if event_data.get('endTime'):
                    end_dt = datetime.fromisoformat(event_data['endTime'].replace('Z', '+00:00'))
                    logging.info(f"   👁️ End Human: {end_dt.strftime('%Y-%m-%d %H:%M:%S %Z')}")
            except Exception as e:
                logging.error(f"   ❌ Error parsing times: {e}")

        updated_events = []
        for event_data in events_data: 
            try:
                # Enhanced debugging to see exactly what we're receiving
                logging.info(f"🔧 Processing event '{event_data['name']}':")
                logging.info(f"   📨 Raw startTime from frontend: {event_data['startTime']}")
                logging.info(f"   📨 Raw endTime from frontend: {event_data['endTime']}")
                
                # Parse datetime strings from frontend
                start_time = datetime.fromisoformat(event_data['startTime'])
                end_time = datetime.fromisoformat(event_data['endTime'])
                
                # Respect user's choice of times - no automatic corrections
                # Users should be able to set any times they want, including cross-day events
                logging.info(f"   🕐 Parsed start_time: {start_time.strftime('%Y-%m-%d %H:%M:%S %Z')}")
                logging.info(f"   🕐 Parsed end_time: {end_time.strftime('%Y-%m-%d %H:%M:%S %Z')}")
                logging.info(f"   🌍 Start timezone info: {start_time.tzinfo}")
                logging.info(f"   🌍 End timezone info: {end_time.tzinfo}")
                
                # Respect user's choice of times - no automatic corrections
                # Users should be able to set any times they want, including cross-day events
                logging.info(f"   � Parsed start_time: {start_time.strftime('%Y-%m-%d %H:%M:%S %Z')}")
                logging.info(f"   🕐 Parsed end_time: {end_time.strftime('%Y-%m-%d %H:%M:%S %Z')}")
                logging.info(f"   🌍 Start timezone info: {start_time.tzinfo}")
                logging.info(f"   🌍 End timezone info: {end_time.tzinfo}")
                
                #event object gets assigned values
                event = Event(
                    name=event_data['name'],
                    start_time=start_time,
                    end_time=end_time,
                    location=event_data.get('location',''),
                    recurrence_rule=None
                )
                
                logging.info(f"   ✅ Created Event object:")
                logging.info(f"      Name: {event.name}")
                logging.info(f"      Start: {event.start_time.strftime('%Y-%m-%d %H:%M:%S %Z')}")
                logging.info(f"      End: {event.end_time.strftime('%Y-%m-%d %H:%M:%S %Z')}")
                logging.info(f"      Location: {event.location}")
                
                # Set description if available
                if hasattr(event, 'description') and 'description' in event_data:
                    event.description = event_data['description']
                    
                updated_events.append(event)
            except Exception as e:
                logging.error(f"Error processing event {event_data.get('name', 'unknown')}: {e}")
                continue

        # Ensure we have events after processing
        if not updated_events:
            return jsonify({"error": "No valid events to update"}), 400

        session_id = os.urandom(16).hex()
        app.config[f'events_{session_id}'] = updated_events
        # Preserve the original session's week and start date info if available
        original_session_id = request.json.get('original_session_id')
        if original_session_id:
            if f'weeks_{original_session_id}' in app.config:
                app.config[f'weeks_{session_id}'] = app.config[f'weeks_{original_session_id}']
            if f'start_date_{original_session_id}' in app.config:
                app.config[f'start_date_{session_id}'] = app.config[f'start_date_{original_session_id}']

        return jsonify({
            "success": True,
            "session_id": session_id,
            "message": "Events updated successfully"
        })
    
    except Exception as e: 
        logging.exception(f"Error updating events: {e}")
        return jsonify({"error": f"Update error: {str(e)}"}), 500

@app.route('/api/accessEditor', methods=['GET'])
def accessEditor():
    # This route can be used to access the editor page
    return jsonify({"message": "Accessing editor page"}), 200


@app.route('/api/downloadICS', methods=['GET'])
def downloadICS():
    session_id = request.args.get('session_id')
    if not session_id or f'events_{session_id}' not in app.config: 
        logging.error(f"No events found for session ID: {session_id}")
        return jsonify({"error": "No events found for download"}), 404
    
    try: 
        base_events = app.config[f'events_{session_id}']
        number_of_weeks = app.config.get(f'weeks_{session_id}', 1)
        start_date_str = app.config.get(f'start_date_{session_id}', None)
        
        logging.info(f"🗂️ DOWNLOAD ICS: Found {len(base_events)} base events for session ID {session_id}")
        logging.info(f"🗂️ DOWNLOAD ICS: Multiplying events for {number_of_weeks} weeks")
        
        # Log the base events before multiplication
        for i, event in enumerate(base_events):
            logging.info(f"🗂️ BASE Event {i+1}: '{event.name}'")
            logging.info(f"   🕐 Start: {event.start_time.strftime('%Y-%m-%d %H:%M:%S %Z')}")
            logging.info(f"   🕐 End: {event.end_time.strftime('%Y-%m-%d %H:%M:%S %Z')}")
            logging.info(f"   📍 Location: {event.location}")
        
        # Get the start date for proper calculation
        if start_date_str:
            start_date = date_parser.parse(start_date_str).date()
        else:
            # Fallback to the first event's date if no start date stored
            start_date = base_events[0].start_time.date() if base_events else datetime.now().date()
        
        # Multiply the base events for the full schedule
        all_events = multiply_weekly_events(base_events, start_date, number_of_weeks)
        
        # Log the multiplied events to see if times are preserved
        logging.info(f"🗂️ DOWNLOAD ICS: Generated {len(all_events)} total events for download")
        for i, event in enumerate(all_events[:3]):  # Log first 3 events only
            logging.info(f"🗂️ MULTIPLIED Event {i+1}: '{event.name}'")
            logging.info(f"   🕐 Start: {event.start_time.strftime('%Y-%m-%d %H:%M:%S %Z')}")
            logging.info(f"   🕐 End: {event.end_time.strftime('%Y-%m-%d %H:%M:%S %Z')}")

        exporter = ICSExporter()
        ics_content = exporter.generate_ics(all_events)
        logging.info(f"🗂️ DOWNLOAD ICS: Generated ICS content with {len(ics_content)} characters")
        
        # Log a snippet of the ICS content to see the actual times
        if "CS 3093C" in ics_content:
            lines = ics_content.split('\n')
            cs_lines = [line for line in lines if 'CS 3093C' in line or 'DTSTART' in line or 'DTEND' in line]
            logging.info(f"🗂️ CS 3093C ICS snippet: {cs_lines[:10]}")

        buffer = io.BytesIO()
        buffer.write(ics_content.encode('utf-8'))
        buffer.seek(0)

        # Send the file for download
        return send_file(
            buffer,
            mimetype='text/calendar',
            as_attachment=True,
            download_name='schedule.ics'
        )

    except Exception as e: 
        logging.exception(f"Error generating ICS file: {e}")
        return jsonify({"error": f"Download error: {str(e)}"}), 500


@app.route('/api/shareICS', methods=['POST'])
def shareICS():
    # This route can be used to share the ICS file
    return jsonify({"message": "Sharing ICS file"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=3000)
