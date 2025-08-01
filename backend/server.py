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
        today=datetime.now().date()
        schedule_start=today
        schedule_end=today + timedelta(days=120)

        #Get dates from request if provided

        if 'startDate' in request.form:
            try: 
                schedule_start = date_parser.parse(request.form['startDate']).date() 
            except: 
                pass
        
        if 'endDate' in request.form:
            try: 
                schedule_end = date_parser.parse(request.form['endDate']).date() 
            except: 
                pass

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

        return jsonify({
            "success": True,
            "events": events_json,
            "session_id": session_id
        })

    except Exception as e:
        logging.exception(f"An unexpected error has occured during processing: {e}")
        return jsonify({"error": f"Processing error: {str(e)}"}), 500

@app.route('/api/update-events', methods=['POST'])
def update_events():
    try: 
        data = request.json
        events_data = data.get('events', [])

        updated_events = []
        for event_data in events_data: 
            try:
                start_time = datetime.fromisoformat(event_data['startTime'])
                end_time = datetime.fromisoformat(event_data['endTime'])
                
                # Server-side validation - ensure end time is after start time
                if end_time <= start_time:
                    logging.warning(f"Fixed invalid time range for event: {event_data['name']}")
                    # Add 1 hour to end time
                    end_time = start_time + timedelta(hours=1)
                
                #event object gets assigned values
                event = Event(
                    name=event_data['name'],
                    start_time=start_time,
                    end_time=end_time,
                    location=event_data.get('location',''),
                    recurrence_rule=None
                )
                
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
        events = app.config[f'events_{session_id}']
        logging.info(f"Found {len(events)} events for session ID {session_id}")
        
        # Log event details to help diagnose issues
        for i, event in enumerate(events):
            logging.debug(f"Event {i+1}: {event.name}, {event.start_time} - {event.end_time}, Location: {event.location}")

        exporter = ICSExporter()
        ics_content = exporter.generate_ics(events)
        logging.info(f"Generated ICS content with {len(ics_content)} characters")

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
