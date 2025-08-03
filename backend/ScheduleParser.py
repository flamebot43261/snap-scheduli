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
        self.event_types_list = ['Lecture', 'Laboratory', 'Recitation', 'Seminar', 'Studio', 'Discussion', 'Lab', 'Course', 'Class', 'Tutorial']
        self.event_types_pattern = "(?:" + "|".join(self.event_types_list) + ")"


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
            width1 = max_x1 - min_x1
            width2 = max_x2 - min_x2
            
            return (width1 > 0 and overlap_width / width1 >= threshold) or \
                   (width2 > 0 and overlap_width / width2 >= threshold)
        return False

    def _group_words_by_proximity(self, words, y_threshold_multiplier=1.5):
        """Groups words into blocks based on vertical proximity."""
        if not words:
            return []
        
        # Sort words primarily by their top y-coordinate, then by x-coordinate
        words.sort(key=lambda w: (w['bbox'][2], w['bbox'][0]))
        
        blocks = []
        current_block = [words[0]]
        
        for i in range(1, len(words)):
            prev_word = current_block[-1]
            current_word = words[i]
            
            # Estimate line height from the previous word's height
            prev_word_height = prev_word['bbox'][3] - prev_word['bbox'][2]
            vertical_gap_threshold = prev_word_height * y_threshold_multiplier
            
            # Check the vertical distance between the bottom of the last word in the block and the top of the current word
            vertical_gap = current_word['bbox'][2] - prev_word['bbox'][3]
            
            if vertical_gap < vertical_gap_threshold:
                # If the gap is small, the word belongs to the current event block
                current_block.append(current_word)
            else:
                # A large gap indicates a new event block
                blocks.append(current_block)
                current_block = [current_word]
        
        # Add the last block
        if current_block:
            blocks.append(current_block)
            
        return blocks

    def parse_text(self, full_text_annotation: vision.TextAnnotation, schedule_start_date: datetime.date, schedule_end_date: datetime.date) -> list:
        events = []
        
        if not full_text_annotation or not full_text_annotation.pages:
            logging.warning("No text annotation or pages found in OCR response.")
            return []

        word_elements = [
            {
                'text': ''.join([symbol.text for symbol in word.symbols]),
                'bbox': self._get_bbox_coords(word.bounding_box.vertices)
            }
            for page in full_text_annotation.pages
            for block in page.blocks
            for paragraph in block.paragraphs
            for word in paragraph.words
        ]
        
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

        
        # Redefine column boundaries based on midpoints between headers for better accuracy
        day_columns = []
        if day_headers_raw:
            # Calculate center points for each header
            header_centers = [
                (h['bbox'][0] + h['bbox'][1]) / 2 for h in day_headers_raw
            ]

            for i, header in enumerate(day_headers_raw):
                # Column starts at the midpoint between this and the previous header
                # For the first header, the column starts at the beginning of the page (x=0)
                x_start = (header_centers[i-1] + header_centers[i]) / 2 if i > 0 else 0

                # Column ends at the midpoint between this and the next header
                # For the last header, the column extends to the end of the page
                x_end = (header_centers[i] + header_centers[i+1]) / 2 if i + 1 < len(header_centers) else max_x_overall
                
                day_columns.append({'day_name': header['day_name'], 'x_start': x_start, 'x_end': x_end})
                logging.debug(f"Defined column for {header['day_name']}: X-range [{x_start}, {x_end}]")

        if not day_columns:
            logging.warning("No valid day columns could be defined. Cannot parse spatially.")
            return []

        
        text_by_day_column = {day['day_name']: [] for day in day_columns}
        
        time_slot_marker_pattern = re.compile(r'^\d{1,2}:\d{2}(?:AM|PM)$', re.IGNORECASE)
        date_component_pattern = re.compile(r'^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}$', re.IGNORECASE)
        general_header_footer_pattern = re.compile(r'^(Schedule|Time|PM)$', re.IGNORECASE)


        for word_elem in word_elements:
            word_text = word_elem['text']
            min_x, max_x, min_y, max_y = word_elem['bbox']

            if day_header_pattern.match(word_text) or \
               time_slot_marker_pattern.match(word_text) or \
               date_component_pattern.match(word_text) or \
               general_header_footer_pattern.match(word_text):
                continue

            assigned_to_day = False
            for col in day_columns:
                word_center_x = (min_x + max_x) / 2
                col_x_start, col_x_end = col['x_start'], col['x_end']

                if col_x_start <= word_center_x <= col_x_end:
                    text_by_day_column[col['day_name']].append(word_elem)
                    assigned_to_day = True
                    break
                if self._is_overlapping_x(word_elem['bbox'], (col['x_start'], col['x_end'], min_y, max_y), threshold=0.1): # 10% overlap
                    text_by_day_column[col['day_name']].append(word_elem)
                    assigned_to_day = True
                    break

            if not assigned_to_day:
                logging.debug(f"Word '{word_text}' (bbox {word_elem['bbox']}) not assigned to any day column.")

        
        event_regex = re.compile(
            # Group 1: Course Code & Name (e.g., "CS 4071-001 Lecture")
            # Making department code (like "CS") optional with (?:[A-Z]{2,5}\s*)?
            r'(?:([A-Z]{2,5}\s*))?(\d{3,4}[A-Z]?\s*(?:-\s*\d{3})?.*?)\s+'
            
            # Group 2: Start Time (Optional)
            # Now more flexible to handle various formats
            r'(?:(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*-\s*)?'
            
            # Group 3: End Time (Required, but more flexible)
            r'(\d{1,2}:\d{2}\s*(?:AM|PM)?)'
            
            # Group 4: Location (Optional)
            r'(?:\s+([A-Z\s\d]+))?',
            re.IGNORECASE | re.DOTALL
        )

        # Backup regex for cases where only an end time is present
        fallback_regex = re.compile(
            # Group 1: Course Code & Name
            r'([A-Z]{0,5}\s*\d{3,4}[A-Z]?\s*(?:-\s*\d{3})?.*?)\s*-\s*'
            
            # Group 2: End Time
            r'(\d{1,2}:\d{2})\s*'
            
            # Group 3: Location (Optional)
            r'([A-Z\s\d]+)?',
            re.IGNORECASE | re.DOTALL
        )

        # Extract time markers from the schedule for reference
        time_markers = []
        time_marker_pattern = re.compile(r'^(\d{1,2}:\d{2})\s*(AM|PM)?$', re.IGNORECASE)
        
        for word_elem in word_elements:
            word_text = word_elem['text']
            match = time_marker_pattern.match(word_text)
            if match:
                time_str = match.group(1)
                ampm = match.group(2)
                if ampm:
                    time_str += ampm
                time_markers.append({
                    'time': time_str,
                    'y_center': (word_elem['bbox'][2] + word_elem['bbox'][3]) / 2
                })
        
        # Sort time markers by vertical position
        time_markers.sort(key=lambda m: m['y_center'])
        logging.debug(f"Identified time markers: {[m['time'] for m in time_markers]}")

        for day_name, day_words in text_by_day_column.items():
            if not day_words:
                logging.info(f"No content words found for {day_name} column.")
                continue

            # Group words into event blocks based on vertical spacing
            event_blocks = self._group_words_by_proximity(day_words)

            for block in event_blocks:
                # Sort words in the block left-to-right, top-to-bottom before joining
                block.sort(key=lambda w: (w['bbox'][2], w['bbox'][0]))
                block_text = " ".join([w['text'] for w in block])
                logging.debug(f"Processing block for {day_name}: {block_text}")

                match = event_regex.search(block_text)
                if not match:
                    # Try the fallback regex for cases with only end time
                    match = fallback_regex.search(block_text)
                    if match:
                        course_info, end_time_str, location = match.groups()
                        # Add default department code if missing
                        event_name_raw = course_info if course_info.upper().startswith('CS') else f"CS {course_info}"
                        
                        # Get vertical center of this block
                        block_y_center = sum(w['bbox'][2] + w['bbox'][3] for w in block) / (2 * len(block))
                        
                        # Find the closest time marker above this block
                        start_time_str = None
                        for i, marker in enumerate(time_markers):
                            if marker['y_center'] < block_y_center and (i+1 >= len(time_markers) or time_markers[i+1]['y_center'] > block_y_center):
                                start_time_str = marker['time']
                                logging.info(f"Inferred start time '{start_time_str}' for block at y={block_y_center} based on position")
                                break
                                
                        if not start_time_str:
                            # If we couldn't infer the start time, skip this block
                            logging.warning(f"Cannot determine start time for: {block_text}")
                            continue
                    else:
                        continue
                else:
                    # Original regex worked - handle normally
                    dept_code, course_details, start_time_str, end_time_str, location = match.groups()
                    
                    # Combine department code (if present) with course details
                    if dept_code:
                        event_name_raw = dept_code + course_details
                    else:
                        # If department code is missing, prepend "CS " as a fallback since this is for CS classes
                        event_name_raw = "CS " + course_details
                
                # If start time is missing from the match, the single time found is the end time.
                # We will use the end time as the start time as well for these cases.
                if not start_time_str and end_time_str:
                    logging.warning(f"Start time missing for block: '{block_text}'. Using end time '{end_time_str}' as start time.")
                    start_time_str = end_time_str
                
                # If no time information could be parsed at all, skip the block.
                if not start_time_str or not end_time_str:
                    logging.warning(f"Skipping block with insufficient time information: {block_text}")
                    continue

                # Clean up extracted strings
                event_name = ' '.join(event_name_raw.replace('\n', ' ').split()).strip()
                
                # Clean time strings and ensure they have AM/PM designation
                start_time_str = ''.join(start_time_str.split()) if start_time_str else None
                end_time_str = ''.join(end_time_str.split()) if end_time_str else None
                
                # Add AM/PM if missing based on context
                if start_time_str and not ('AM' in start_time_str.upper() or 'PM' in start_time_str.upper()):
                    # For course schedules, apply reasonable defaults:
                    # - Before 7:00 is assumed to be PM (afternoon/evening classes)
                    # - 7:00-11:59 is assumed to be AM (morning classes)
                    # - 12:00-6:59 is assumed to be PM (afternoon/evening classes)
                    hour = int(start_time_str.split(':')[0])
                    if hour >= 7 and hour < 12:
                        start_time_str += 'AM'
                    else:
                        start_time_str += 'PM'
                
                if end_time_str and not ('AM' in end_time_str.upper() or 'PM' in end_time_str.upper()):
                    hour = int(end_time_str.split(':')[0])
                    if hour >= 7 and hour < 12:
                        end_time_str += 'AM'
                    else:
                        end_time_str += 'PM'
                
                # Use vertical position in the schedule to infer time context
                # (Remove the hardcoded course-specific time assignments)
                block_y_center = sum(w['bbox'][2] + w['bbox'][3] for w in block) / (2 * len(block))
                
                # If we have time markers from the schedule, use them to verify/correct our times
                if time_markers:
                    # Find the closest time marker row to this block's vertical position
                    closest_marker = None
                    min_distance = float('inf')
                    
                    for marker in time_markers:
                        distance = abs(marker['y_center'] - block_y_center)
                        if distance < min_distance:
                            min_distance = distance
                            closest_marker = marker
                    
                    # If we found a close time marker and the parsed time looks suspicious,
                    # consider using the marker's time information
                    if closest_marker and min_distance < max_y_overall * 0.05:  # Within 5% of the vertical height
                        marker_time = closest_marker['time']
                        logging.debug(f"Block at y={block_y_center:.1f} is close to time marker {marker_time} at y={closest_marker['y_center']:.1f}")
                        
                        # Extract hours from marker and parsed times for comparison
                        marker_hour = int(marker_time.split(':')[0])
                        parsed_start_hour = int(start_time_str.split(':')[0]) if start_time_str else None
                        
                        # If the parsed start time differs significantly from the marker time,
                        # consider the marker time more reliable
                        if parsed_start_hour and abs(parsed_start_hour - marker_hour) > 2:
                            logging.info(f"Correcting suspicious start time {start_time_str} to match marker time {marker_time}")
                            start_time_str = marker_time
                
                location = ' '.join(location.replace('\n', ' ').split()).strip() if location else None
                
                logging.info(f"Detected event in {day_name}: Name='{event_name}', Start='{start_time_str}', End='{end_time_str}', Location='{location}'")
                
                day_index = self.day_map.get(day_name, -1)
                if day_index == -1:
                    logging.error(f"Invalid day name '{day_name}' encountered. Skipping event.")
                    continue

                # Find first occurrence of this day of week within the schedule
                first_occurrence_date = schedule_start_date
                while first_occurrence_date.weekday() != day_index:
                    first_occurrence_date += timedelta(days=1)
                
                # Generate only ONE WEEK of events (for editing purposes)
                # The frontend will multiply this week by the number of weeks specified
                current_date = first_occurrence_date
                
                # Only create events for the first week
                if current_date <= schedule_end_date:
                    try:
                        # Create datetime objects for this specific occurrence
                        event_start_datetime = date_parser.parse(f"{current_date.isoformat()} {start_time_str}")
                        event_end_datetime = date_parser.parse(f"{current_date.isoformat()} {end_time_str}")
                        
                        # Handle case where end time is on the next day (e.g., evening classes)
                        if event_end_datetime < event_start_datetime:
                            event_end_datetime += timedelta(days=1)
                        
                        # Create event without recurrence rule (since we're creating individual instances)
                        new_event = Event(
                            name=event_name,
                            start_time=event_start_datetime,
                            end_time=event_end_datetime,
                            location=location,
                            recurrence_rule=None  # No recurrence rule needed for individual events
                        )
                        events.append(new_event)
                        logging.debug(f"Created event instance for first week: {new_event.name} on {current_date.isoformat()}")
                        
                    except Exception as e:
                        logging.error(f"Could not create event for '{event_name}' on {current_date.isoformat()}: {e}")
                
                logging.info(f"Successfully created first week instance for: {event_name} on {day_name}")
        
        return events


# if __name__ == "__main__":
#     from google.cloud import vision
#     from OCRService import OCRService
#     import datetime

#     file_path = "/mnt/c/Users/flame/Downloads/image.png"
#     client = vision.ImageAnnotatorClient()
#     ocr_service = OCRService(client)
#     with open(file_path, "rb") as img_file:
#         image_bytes = img_file.read()
    
#     result = ocr_service.process_image(image_bytes)
#     print("OCR Result:")
#     print(result)
#     print("------------------------------------")

#     parser = ScheduleParser()

#     schedule_start = datetime.date(2025, 7, 21)
#     schedule_end = datetime.date(2025, 8, 1)

#     print("Parser cleaned Result:")

#     events = parser.parse_text(result, schedule_start, schedule_end)
#     print("------------------------------------")

#     print("List of Events: \n")

#     for event in events: 
#         print(event)
#         print("\n")