from datetime import datetime, timedelta
from dateutil import parser as date_parser
import re
import logging

class ScheduleParser:
    def __init__(self):
        logging.info("ScheduleParser initialized.")
    
    def parse_text(self, raw_text: str, semester_start_date: datetime.date, semester_end_date: datetime.date) -> list:
        pass
    
