from ics import Calendar, Event as IcsEvent
import logging

#temporary import for  testing
from datetime import datetime


class ICSExporter:
    def __init__(self):
        logging.info("ICSExporter initialized.")
    
    def generate_ics(self, events: list) -> str:
        c=Calendar()

        #edge cases: if no events passed through the parameter
        if not events:
            logging.warning("No events provided to ICSExporter. Generating empty calendar.")
            return str(c)

        for event in events:
            try:
                ics_event=event.to_ics_event()
                c.events.add(ics_event)
                logging.debug(f"Added event to calendar: {event.name}")
            except Exception as e:
                logging.error(f"Error, couldn't add event to calendar: : {event.name}")
        
        ics_content=str(c)

        logging.info=(f"Generated ICS content of length {len(ics_content)}.")
        return ics_content
    
# used for testing
# if __name__ == "__main__":
#     from event import Event
#     from google.cloud import vision
#     from OCRService import OCRService
#     from ScheduleParser import ScheduleParser
#     import datetime
    
#     # Set up the OCR service
#     client = vision.ImageAnnotatorClient()
#     ocr_service = OCRService(client)
    
#     # File path for the test image
#     file_path = "/mnt/c/Users/flame/Downloads/test_image.png"
    
#     print("=== TEST: Processing schedule image to ICS ===")
    
#     try:
#         # Read the image file
#         print(f"Reading image from {file_path}...")
#         with open(file_path, "rb") as img_file:
#             image_bytes = img_file.read()
        
#         # Process the image with OCR
#         print("Processing image with OCR...")
#         ocr_result = ocr_service.process_image(image_bytes)
        
#         # Parse the OCR results
#         print("Parsing schedule from OCR results...")
#         parser = ScheduleParser()
        
#         # Define semester start and end dates
#         semester_start = datetime.date(2025, 5, 12)  # May 12, 2025
#         semester_end = datetime.date(2025, 5, 16)
        
#         # Parse the text to extract events
#         events = parser.parse_text(ocr_result, semester_start, semester_end)
#         print(f"Successfully parsed {len(events)} events from the schedule.")
        
#         # Print a summary of each event
#         print("\nEvent Summary:")
#         for i, event in enumerate(events, 1):
#             print(f"{i}. {event.name} on {event.start_time.strftime('%A')} at {event.start_time.strftime('%I:%M %p')} - {event.end_time.strftime('%I:%M %p')}, Location: {event.location or 'N/A'}")
        
#         # Generate ICS content
#         print("\nGenerating ICS file...")
#         exporter = ICSExporter()
#         ics_content = exporter.generate_ics(events)
        
#         # Print the first 500 characters of ICS content (to avoid overwhelming output)
#         preview_length = min(500, len(ics_content))
#         print(f"\nICS Content Preview (first {preview_length} characters):")
#         print(ics_content[:preview_length])
#         print("...")
        
#         # Save to file (optional)
#         output_file_path = "/mnt/c/Users/flame/iCloudDrive/UC_SUMMER_2025/software_eng_project/snap-scheduli/config/schedule.ics"
#         with open(output_file_path, "w") as f:
#             f.write(ics_content)
#         print(f"\nFull ICS content saved to {output_file_path}")
        
#     except Exception as e:
#         print(f"Error during testing: {e}")