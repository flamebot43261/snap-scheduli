from datetime import datetime, timedelta
from dateutil import parser as date_parser
import re
import logging
from google.cloud import vision
from event import Event

logging.basicConfig(level=logging.DEBUG)

class ScheduleParser:
    def __init__(self):
        logging.info("ScheduleParser initialized.")
        self.day_names_ordered = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
        self.day_map = {
            'Monday': 0, 'Mon': 0,
            'Tuesday': 1, 'Tue': 1,
            'Wednesday': 2, 'Wed': 2,
            'Thursday': 3, 'Thu': 3,
            'Friday': 4, 'Fri': 4,
            'Saturday': 5, 'Sat': 5,
            'Sunday': 6, 'Sun': 6
        }
        self.event_types = "(?:Lecture|Laboratory|Recitation|Seminar|Studio|Discussion|Lab|Course|Class|Tutorial)"

    def _get_bbox_coords(self, bbox_vertices):
        """Extracts min/max X/Y from a list of bounding box vertices."""
        min_x = min(v.x for v in bbox_vertices)
        max_x = max(v.x for v in bbox_vertices)
        min_y = min(v.y for v in bbox_vertices)
        max_y = max(v.y for v in bbox_vertices)
        return min_x, max_x, min_y, max_y

    
    def _is_overlapping_x(self, bbox1, bbox2, threshold=0.5):
        min_x1, max_x1, _, _ = bbox1
        min_x2, max_x2, _, _ = bbox2
        overlap_start = max(min_x1, min_x2)
        overlap_end = min(max_x1, max_x2)
        if overlap_start < overlap_end:
            overlap_width = overlap_end - overlap_start
            return overlap_width / (max_x1 - min_x1) >= threshold or \
                   overlap_width / (max_x2 - min_x2) >= threshold
        return False

    def _is_overlapping_y(self, bbox1, bbox2, threshold=0.5):
        _, _, min_y1, max_y1 = bbox1
        _, _, min_y2, max_y2 = bbox2
        overlap_start = max(min_y1, min_y2)
        overlap_end = min(max_y1, max_y2)
        if overlap_start < overlap_end:
            overlap_height = overlap_end - overlap_start
            return overlap_height / (max_y1 - min_y1) >= threshold or \
                   overlap_height / (max_y2 - min_y2) >= threshold
        return False

    def parse_text(self, full_text_annotation: vision.TextAnnotation, semester_start_date: datetime.date, semester_end_date: datetime.date) -> list:
        events = []
        
        if not full_text_annotation or not full_text_annotation.pages:
            logging.warning("No text annotation or pages found in OCR response.")
            return []

        word_elements = []
        for page in full_text_annotation.pages:
            for block in page.blocks:
                for paragraph in block.paragraphs:
                    for word in paragraph.words:
                        word_text = ''.join([symbol.text for symbol in word.symbols])
                        bbox = self._get_bbox_coords(word.bounding_box.vertices)
                        word_elements.append({'text': word_text, 'bbox': bbox})
        
        if not word_elements:
            logging.warning("No words extracted from OCR. Cannot parse events.")
            return []


        word_elements.sort(key=lambda x: (x['bbox'][2], x['bbox'][0]))

        
        max_x_overall = max(w['bbox'][1] for w in word_elements) if word_elements else 1 
        max_y_overall = max(w['bbox'][3] for w in word_elements) if word_elements else 1 
        
        day_headers_raw = [] 
        day_header_pattern = re.compile(r'^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)$', re.IGNORECASE)
        header_y_max = max_y_overall * 0.15

        for word_elem in word_elements:
            word_text = word_elem['text']
            min_x, max_x, min_y, max_y = word_elem['bbox']

            if min_y < header_y_max and day_header_pattern.match(word_text):
                day_name = word_text.capitalize()
                day_headers_raw.append({'day_name': day_name, 'bbox': word_elem['bbox']})
                logging.debug(f"Identified potential day header: {day_name} at {word_elem['bbox']}")

        day_headers_raw.sort(key=lambda x: x['bbox'][0])

        
        day_columns = [] 
        for i, header in enumerate(day_headers_raw):
            x_start = header['bbox'][0] 
            x_end = None
            if i + 1 < len(day_headers_raw):

                x_end = day_headers_raw[i+1]['bbox'][0] - 5 
            else:

                x_end = max_x_overall 
            
            day_columns.append({'day_name': header['day_name'], 'x_start': x_start, 'x_end': x_end})
            logging.debug(f"Defined column for {header['day_name']}: X-range [{x_start}, {x_end}]")

        if not day_columns:
            logging.warning("No valid day columns could be defined. Cannot parse spatially.")
            return []

        
        text_by_day_column = {day['day_name']: [] for day in day_columns}
        
        time_slot_marker_pattern = re.compile(r'^\d{1,2}:\d{2}(?:AM|PM)$', re.IGNORECASE)

        for word_elem in word_elements:
            word_text = word_elem['text']
            min_x, max_x, min_y, max_y = word_elem['bbox']

            if day_header_pattern.match(word_text) or time_slot_marker_pattern.match(word_text):
                continue

            assigned_to_day = False
            for col in day_columns:
                word_center_x = (min_x + max_x) / 2
                if col['x_start'] <= word_center_x <= col['x_end']:
                    text_by_day_column[col['day_name']].append(word_elem)
                    assigned_to_day = True
                    break
                if self._is_overlapping_x(word_elem['bbox'], (col['x_start'], col['x_end'], min_y, max_y), threshold=0.5):
                    text_by_day_column[col['day_name']].append(word_elem)
                    assigned_to_day = True
                    break

            if not assigned_to_day:
                logging.debug(f"Word '{word_text}' (bbox {word_elem['bbox']}) not assigned to any day column.")

        
        event_regex = re.compile(
            r'([A-Z]{2,5}[\s\n]*\d{3,4}(?:-[\s\n]*\d{3})?[\s\n]+' + self.event_types + '?)' 
            r'[\s\n\.-]*?' 
            r'(\d{1,2}:\d{2}(?:AM|PM))[\s\n]*-[\s\n]*(\d{1,2}:\d{2}(?:AM|PM))' 
            r'[\s\n\.-]*?' 
            r'([A-Za-z\s]+[\s\n]*\d{3,4})?'
            , re.IGNORECASE | re.DOTALL
        )

        for day_name, day_words in text_by_day_column.items():
            if not day_words:
                logging.info(f"No content words found for {day_name} column.")
                continue

            day_words.sort(key=lambda x: x['bbox'][2])

            day_text_content = " ".join([w['text'] for w in day_words])
            logging.debug(f"Combined text for {day_name}:\n{day_text_content}")

            for match in event_regex.finditer(day_text_content):
                event_name_raw, start_time_str, end_time_str, location = match.groups()
                
                event_name = ' '.join(event_name_raw.split()).strip()
                location = ' '.join(location.split()).strip() if location else None
                
                logging.info(f"Detected event in {day_name}: Name='{event_name}', Start='{start_time_str}', End='{end_time_str}', Location='{location}'")
                
                day_index = self.day_map.get(day_name, -1)
                if day_index == -1:
                    logging.error(f"Invalid day name '{day_name}' encountered. Skipping event.")
                    continue

                first_occurrence_date = semester_start_date
                while first_occurrence_date.weekday() != day_index:
                    first_occurrence_date += timedelta(days=1)

                try:
                    event_start_datetime = date_parser.parse(f"{first_occurrence_date} {start_time_str}")
                    event_end_datetime = date_parser.parse(f"{first_occurrence_date} {end_time_str}")
                except Exception as e:
                    logging.error(f"Could not parse datetime for event '{event_name}' on '{day_name}': {e}")
                    continue

                rrule_until_str = semester_end_date.strftime('%Y%m%dT235959Z')
                recurrence_rule = f"FREQ=WEEKLY;UNTIL={rrule_until_str}"
                
                new_event = Event(
                    name=event_name,
                    start_time=event_start_datetime,
                    end_time=event_end_datetime,
                    location=location,
                    recurrence_rule=recurrence_rule
                )
                events.append(new_event)
                logging.info(f"Successfully created event: {new_event.name} on {day_name}")
        
        return events


if __name__ == "__main__":
    from google.cloud import vision
    from OCRService import OCRService
    import datetime

    file_path = "/mnt/c/Users/flame/Downloads/test_image.png"
    client = vision.ImageAnnotatorClient()
    ocr_service = OCRService(client)
    with open(file_path, "rb") as img_file:
        image_bytes = img_file.read()
    
    result = ocr_service.process_image(image_bytes)
    print("OCR Result:")
    print(result)
    print("------------------------------------")

    parser = ScheduleParser()

    semester_start = datetime.date(2025, 7, 1)
    semester_end = datetime.date(2025, 12, 31)

    print("Parser cleaned Result:")

    events = parser.parse_text(result, semester_start, semester_end)
    print("------------------------------------")
