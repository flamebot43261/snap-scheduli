import React, { useEffect, useRef, useState } from 'react';
import styles from '../app.module.css';
import { EventType } from './FormBack';

interface EventBubbleProps {  // Renamed interface to match component
    UID: number;
    Name?: string;
    BeginDate?: Date;
    EndDate?: Date;
    BeginTime?: string;
    EndTime?: string;
    AllDay?: boolean;
    Description?: string;
    Location?: string;
    URL?: string;
    onUpdate?: (event: EventType) => void;
    onDelete?: () => void;
}

// Renamed component to EventBubble to match filename
const EventBubble: React.FC<EventBubbleProps> = ({ 
    UID, 
    Name, 
    BeginDate, 
    EndDate, 
    BeginTime, 
    EndTime, 
    AllDay, 
    Description, 
    Location, 
    URL,
    onUpdate,
    onDelete 
}) => {
    const [name, setName] = useState(Name || '');
    const [beginDate, setBeginDate] = useState(BeginDate || new Date());
    const [endDate, setEndDate] = useState(EndDate || new Date());
    const [beginTime, setBeginTime] = useState(BeginTime || '00:00');
    const [endTime, setEndTime] = useState(EndTime || '00:00');
    const [allDay, setAllDay] = useState(AllDay || false);
    const [description, setDescription] = useState(Description || '');
    const [location, setLocation] = useState(Location || '');
    const [url, setUrl] = useState(URL || '');

    // Add this ref to track user edits
    const userEditingRef = useRef(false);

    // Safe time parsing function
    const parseTime = (timeStr: string) => {
        if (!timeStr || timeStr === '') return [0, 0];
        try {
            const parts = timeStr.split(':').map(Number);
            return [parts[0] || 0, parts[1] || 0];
        } catch (e) {
            console.error("Time parsing error:", e);
            return [0, 0];
        }
    };

    // Modified handleUpdate function
    const handleUpdate = () => {
        if (!onUpdate) return;

        try {
            // Create date objects from the date and time inputs
            const startDateTime = new Date(beginDate);
            const [startHours, startMinutes] = parseTime(beginTime);
            startDateTime.setHours(startHours, startMinutes, 0, 0);

            const endDateTime = new Date(endDate);
            const [endHours, endMinutes] = parseTime(endTime);
            endDateTime.setHours(endHours, endMinutes, 0, 0);
            
            // Debug output to see what's being compared
            console.log(`Time comparison for ${name}:`, {
                beginDate: beginDate.toISOString(),
                endDate: endDate.toISOString(),
                beginTime,
                endTime,
                startDateTime: startDateTime.toISOString(),
                endDateTime: endDateTime.toISOString(),
                comparison: endDateTime <= startDateTime
            });
            
            // ONLY perform auto-correction if we're not actively editing
            // AND the times are invalid
            if (endDateTime < startDateTime && !userEditingRef.current) {
                console.warn(`End time must be after start time for "${name}" - adjusting end time`);
                
                // Just add 1 hour to the end time, regardless of date
                endDateTime.setTime(startDateTime.getTime() + 60 * 60 * 1000);
                
                // Update the displayed end time
                const newEndTime = 
                    endDateTime.getHours().toString().padStart(2, '0') + 
                    ':' + 
                    endDateTime.getMinutes().toString().padStart(2, '0');
                    
                console.log(`Adjusted end time to ${newEndTime}`);
                setEndTime(newEndTime);
            }
            
            onUpdate({
                id: UID,
                name,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                location,
                description,
                allDay,
                url
            });
        } catch (e) {
            console.error("Error updating event:", e);
        }
    };

    // Call handleUpdate whenever any field changes
    useEffect(() => {
        // Use a timeout to avoid too many rapid updates
        const timer = setTimeout(() => {
            userEditingRef.current = false;
            handleUpdate();
        }, 500); // Increased debounce time
        
        return () => clearTimeout(timer);
    }, [name, beginDate, endDate, beginTime, endTime, allDay, description, location, url]);

    // Modified time input handlers
    const handleBeginTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        userEditingRef.current = true;
        setBeginTime(e.target.value);
    };
    
    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        userEditingRef.current = true;
        setEndTime(e.target.value);
    };

    return (
        <div className={styles.EventBubble}>
            <label>
                Event Name:
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                />
            </label>
            <br />
            <label>
                Begin Date:
                <input 
                    type="date" 
                    value={beginDate.toISOString().split('T')[0]} 
                    onChange={(e) => {
                        // Create a date that preserves the selected date regardless of timezone
                        const selectedDate = new Date(e.target.value + 'T00:00:00');
                        // Create a new date preserving time from the current date
                        const newDate = new Date(beginDate);
                        newDate.setFullYear(selectedDate.getFullYear());
                        newDate.setMonth(selectedDate.getMonth());
                        newDate.setDate(selectedDate.getDate());
                        setBeginDate(newDate);
                    }} 
                />
            </label>
            <label>
                End Date:
                <input 
                    type="date" 
                    value={endDate.toISOString().split('T')[0]} 
                    onChange={(e) => {
                        // Create a date that preserves the selected date regardless of timezone
                        const selectedDate = new Date(e.target.value + 'T00:00:00');
                        // Create a new date preserving time from the current date
                        const newDate = new Date(endDate);
                        newDate.setFullYear(selectedDate.getFullYear());
                        newDate.setMonth(selectedDate.getMonth());
                        newDate.setDate(selectedDate.getDate());
                        setEndDate(newDate);
                    }} 
                />
            </label>
            <br />
            <label>
                Begin Time:
                <input 
                    type="time" 
                    value={beginTime} 
                    onChange={handleBeginTimeChange}
                />
            </label>
            <label>
                End Time:
                <input 
                    type="time" 
                    value={endTime} 
                    onChange={handleEndTimeChange}
                />
            </label>
            <label>
                All Day:
                <input 
                    type="checkbox" 
                    checked={allDay} 
                    onChange={(e) => setAllDay(e.target.checked)} 
                />
            </label>
            <br />
            <label>
                Description:
                <textarea 
                    style={{
                        width: "100%",
                        height: "100px",
                        resize: "none",
                        overflowY: "auto",
                        overflowX: "hidden",
                        padding: "8px",
                        boxSizing: "border-box"
                    }}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </label>
            <br />
            <label>
                Location:
                <input 
                    type="text" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                />
            </label>
            <label>
                URL:
                <input 
                    type="text" 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)} 
                />
            </label>
            
            {onDelete && (
                <button 
                    type="button"
                    onClick={onDelete}
                    className={styles.deleteButton || styles.uploadButton}
                >
                    Delete Event
                </button>
            )}
        </div>
    );
};

// Export with correct name
export default EventBubble;