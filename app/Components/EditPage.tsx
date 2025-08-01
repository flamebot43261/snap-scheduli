import React, { useState } from 'react';
import styles from '../app.module.css';
import EventBubble from './EventBubble';
import { EventType } from './FormBack';

interface EditPageProps {
  width?: string;
  height?: string;
  events: EventType[];  // Add this to receive events from parent
  onEditComplete: (events: EventType[], sessionId: string) => void;  // Add this to communicate back to parent
  onError: (error: string) => void;  // Add this to handle and communicate errors
}

const EditPage: React.FC<EditPageProps> = ({ 
  width, 
  height, 
  events,
  onEditComplete,
  onError
}) => {
    // State to track edited events
    const [editedEvents, setEditedEvents] = useState<EventType[]>(events);
    const [loading, setLoading] = useState(false);

    // Handler for when an event is updated
    const handleEventUpdate = (updatedEvent: EventType) => {
        setEditedEvents(prevEvents => 
            prevEvents.map(event => 
                event.id === updatedEvent.id ? updatedEvent : event
            )
        );
    };

    // Handler to add a new event
    const handleAddEvent = () => {
        const newEvent: EventType = {
            id: Date.now(),  // Use timestamp as temporary ID
            name: 'New Event',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
            location: '',
            description: '',
            allDay: false
        };
        
        setEditedEvents([...editedEvents, newEvent]);
    };

    // Handler to delete an event
    const handleDeleteEvent = (id: number) => {
        setEditedEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await fetch('http://localhost:3000/api/update-events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ events: editedEvents }),
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.session_id) {
                onEditComplete(editedEvents, data.session_id);
            } else {
                throw new Error(data.error || 'Failed to update events');
            }
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            onError(`Error: ${errorMessage}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            overflowY: 'scroll', 
            height: '100%', 
            width: '100%', 
            alignContent: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
        }}>
            <form 
                style={{gap: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}
                onSubmit={handleSubmit}
            >
                <h1>Revise Events As Needed</h1>
                
                {editedEvents.length === 0 ? (
                    <p>No events detected. Add an event or go back to try again.</p>
                ) : (
                    editedEvents.map((event) => (
                        <EventBubble
                            key={event.id}
                            UID={event.id}
                            Name={event.name}
                            BeginDate={new Date(event.startTime)}
                            EndDate={new Date(event.endTime)}
                            BeginTime={new Date(event.startTime).toTimeString().slice(0, 5)}
                            EndTime={new Date(event.endTime).toTimeString().slice(0, 5)}
                            AllDay={event.allDay || false}
                            Description={event.description || ''}
                            Location={event.location || ''}
                            URL={event.url || ''}
                            onUpdate={handleEventUpdate}
                            onDelete={() => handleDeleteEvent(event.id)}
                        />
                    ))
                )}
                
                <button 
                    type="button"
                    className={styles.addButton || styles.uploadButton}
                    onClick={handleAddEvent}
                >
                    Add New Event
                </button>
                
                <button 
                    type="submit" 
                    className={styles.uploadButton}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Get Downloadable ICS File'}
                </button>
            </form>
        </div>
    );
};

export default EditPage;