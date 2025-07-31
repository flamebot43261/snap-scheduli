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
        import pytz
        ics_event=IcsEvent()
        ics_event.name = self.name

        #TODO: Need to implement time zone fetch from frontend. using 
        # EST for testing.
        local_tz=pytz.timezone('America/New_York')

        if self.start_time.tzinfo is None:
            start_time_aware=local_tz.localize(self.start_time)
        else: 
            start_time_aware=self.start_time

        if self.end_time.tzinfo is None:
            end_time_aware=local_tz.localize(self.end_time)
        else: 
            end_time_aware=self.end_time


        ics_event.begin = start_time_aware
        ics_event.end = end_time_aware


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