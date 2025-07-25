from datetime import datetime, timedelta
from dateutil import parser as date_parser
import re
import logging

class ScheduleParser:
    def __init__(self):
        logging.info("ScheduleParser initialized.")
    
    def parse_text(self, raw_text: str, semester_start_date: datetime.date, semester_end_date: datetime.date) -> list:
        #TODO: implement parsing into event items after receiving raw data from OCR
        events=[]
        lines = raw_text.split("\n")
        
        days_in_week = {
            'Monday':['Monday','Mon'],
            'Tuesday':['Tuesday','Tues'],
            'Wednesday':['Wednesday','Wed'],
            'Thursday':['Thursday','Thurs'],
            'Friday':['Friday','Fri'],
            'Saturday':['Saturday','Sat'],
            'Sunday':['Sunday','Sun'],
        }

        #TODO: regex pattern implementation
        # event_line_pattern=re.compile(
        #     r'',
        #     r'',
        #     r''
        # )

        current_day_in_week = None

        for line in lines: 
            line=line.strip()
            print(line)
            if not line:
                continue
            #boolean to see if a day has been found
            found_day=False

            # Find the upper day headers first
            # # for every day name and its corresponding pattern in the day of the week
            # for day_name, patterns in days_in_week: 
            #     # for each individual pattern (ex. in day name Monday, patterns "Monday" or "Mon")
            #     for pattern in patterns:
            #         # if that pattern is found in that cleaned line
            #         if pattern in line: 
            #             current_day_in_week = day_name
            #             logging.info(f"Detected day header: {current_day_in_week}")
            #             found_day = True
            #             break
            #     if found_day: 
            #         break
            # if found_day:
            #     continue

            # match=event_line_pattern.search(line)
            # if match and current_day_in_week:
            #     start_time_str,end_time_str,event_name_raw,location=match.groups()
        return events

# if __name__ == "__main__":
#     from google.cloud import vision
#     from OCRService import OCRService
#     import datetime

#     file_path = "/mnt/c/Users/flame/Downloads/test_image.png"
#     client = vision.ImageAnnotatorClient()
#     ocr_service = OCRService(client)
#     with open(file_path, "rb") as img_file:
#         image_bytes = img_file.read()
    
#     result = ocr_service.process_image(image_bytes)
#     print("OCR Result:")
#     print(result)
#     print("------------------------------------")
#     # Create ScheduleParser instance
#     parser = ScheduleParser()
#     # Example semester dates (adjust as needed)
#     semester_start = datetime.date(2025, 7, 1)
#     semester_end = datetime.date(2025, 12, 31)
#     # Parse the OCR result

#     print("Parser cleaned Result:")

#     events = parser.parse_text(result, semester_start, semester_end)
#     print("------------------------------------")
