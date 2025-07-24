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

#     start = datetime(2025, 7, 23, 16, 40)
#     end = datetime(2025, 7, 23, 17, 40)
#     event1 = Event(name="Dentist Appointment", start_time=start, end_time=end, location="Dental Clinic")
#     event2 = Event(name="Meeting", start_time=start, end_time=end, location="Office", recurrence_rule="FREQ=DAILY;COUNT=2")

#     exporter = ICSExporter()
#     print("ICS with events:")
#     print(exporter.generate_ics([event1, event2]))

#     print("\nICS with no events:")
#     print(exporter.generate_ics([]))