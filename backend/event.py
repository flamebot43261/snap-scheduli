from datetime import datetime
class Event:
    def __init__(self, name: str, start_time: datetime, end_time: datetime, location: str = None, recurrence_rule: str = None):
        self.name = name
        self.start_time = start_time
        self.end_time = end_time
        self.location = location
        self.recurrence_rule = recurrence_rule

    def __repr__(self):
        return f"Event(Name='{self.name}', Start='{self.start_time}', End='{self.end_time}', Location='{self.location}', Recurrence='{self.recurrence_rule}')"
    
    def to_ics_event(self):
        from ics import Event as IcsEvent
        ics_event=IcsEvent()
        ics_event.name = self.name
        ics_event.begin = self.start_time
        ics_event.end = self.end_time
        if self.location:
            ics_event.location = self.location
        if self.recurrence_rule:
            ics_event.rrule = self.recurrence_rule
        
        return ics_event    

# if __name__ == "__main__":
#     start = datetime(2025, 7, 23, 16, 40)
#     end = datetime(2025, 7, 23, 17, 40)
#     event1=Event(name="Dentist Appointment", start_time=start,end_time=end,location="Dental Clinic")
#     print(event1)