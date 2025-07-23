from datetime import datetime
class Event:
    def __init__(self, name: str, start_time: datetime, end_time: datetime, location: str = None, recurrence_rule: str = None):
        self.name = name
        self.start_time = start_time
        self.end_time = end_time
        self.location = location
        self.recurrence_rule = recurrence_rule

    def __repr():
        return f"Event(Name='{self.name}' ,Start='{self.start_time}' ,End='{self.end_time}' ,Location='{location}' ,Recurrence='{recurrence_rule}')"
    
    def to_ics_event(self):
        pass
    
