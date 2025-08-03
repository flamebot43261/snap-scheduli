import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { updateEvents } from '../utilities/apiService';
import EventBubble from './EventBubble';
import { EventType } from './FormBack';

interface EditPageProps {
  width?: number;
  height?: number;
  events: EventType[];
  originalSessionId?: string | null;
  onEditComplete: (events: EventType[], sessionId: string) => void;
  onError: (error: string) => void;
}

const EditPage: React.FC<EditPageProps> = ({ 
  width, 
  height, 
  events,
  originalSessionId,
  onEditComplete,
  onError
}) => {
    const [forceRefresh, setForceRefresh] = useState(0);
    const [weekCount, setWeekCount] = useState(1); // Changed default from 12 to 1
    const [loading, setLoading] = useState(false);
    const [editedEvents, setEditedEvents] = useState<EventType[]>(events);

    const handleEventUpdate = (updatedEvent: EventType) => {
        console.log('EditPage: Received event update:', updatedEvent);
        console.log('EditPage: Updated event details:', {
            id: updatedEvent.id,
            name: updatedEvent.name,
            startTime: updatedEvent.startTime,
            endTime: updatedEvent.endTime,
            location: updatedEvent.location,
            description: updatedEvent.description
        });
        
        setEditedEvents(prevEvents => {
            const newEvents = prevEvents.map(event => 
                event.id === updatedEvent.id ? updatedEvent : event
            );
            console.log('EditPage: Updated editedEvents state:', newEvents);
            return newEvents;
        });
    };

    const forceUpdateAllEvents = () => {
        console.log('Forcing refresh of all EventBubbles...');
        setForceRefresh(prev => prev + 1);
    };

    const handleAddEvent = () => {
        const newEvent: EventType = {
            id: Date.now(),
            name: 'New Event',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
            location: '',
            description: '',
            allDay: false
        };
        
        setEditedEvents([...editedEvents, newEvent]);
    };

    const handleDeleteEvent = (id: number) => {
        setEditedEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    };

    const handleSubmit = async () => {
        setLoading(true);
        
        // Force all EventBubbles to update immediately
        console.log('🔄 Forcing immediate update of all EventBubbles...');
        forceUpdateAllEvents();
        
        // Wait longer to ensure all updates are processed
        console.log('⏳ Waiting for EventBubble updates to complete...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Increased to 3 seconds
        
        // Debug: Log what events we're about to send
        console.log('=== DETAILED SUBMIT DEBUG INFO ===');
        console.log(`📊 Total events to submit: ${editedEvents.length}`);
        console.log('📦 Full editedEvents state:', JSON.stringify(editedEvents, null, 2));
        
        editedEvents.forEach((event, index) => {
            console.log(`\n📅 Event ${index + 1}: "${event.name}"`);
            console.log(`   🆔 ID: ${event.id}`);
            console.log(`   🕐 Start: ${event.startTime}`);
            console.log(`   🕐 End: ${event.endTime}`);
            console.log(`   📍 Location: ${event.location}`);
            console.log(`   📝 Description: ${event.description}`);
            
            // Parse and display human-readable times
            const startDate = new Date(event.startTime);
            const endDate = new Date(event.endTime);
            console.log(`   👁️ Human readable - Start: ${startDate.toLocaleString()}`);
            console.log(`   👁️ Human readable - End: ${endDate.toLocaleString()}`);
            
            // Show what will be sent to backend
            console.log(`   📨 ISO being sent to backend - Start: ${event.startTime}`);
            console.log(`   📨 ISO being sent to backend - End: ${event.endTime}`);
            console.log(`   🔍 End time breakdown:`);
            console.log(`      - Year: ${endDate.getFullYear()}`);
            console.log(`      - Month: ${endDate.getMonth() + 1}`);
            console.log(`      - Date: ${endDate.getDate()}`);
            console.log(`      - Hours: ${endDate.getHours()}`);
            console.log(`      - Minutes: ${endDate.getMinutes()}`);
        });
        console.log('=== END DETAILED SUBMIT DEBUG INFO ===');
        
        try {
            // Use the centralized API service
            const response = await updateEvents(editedEvents, originalSessionId || undefined);
            
            if (response.success && response.session_id) {
                onEditComplete(editedEvents, response.session_id);
            } else {
                throw new Error(response.message || 'Failed to update events');
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
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
            >
                <Text style={styles.heading}>Edit Your Events</Text>
                
                {/* Manual update button for debugging */}
                <TouchableOpacity 
                    style={styles.debugButton} 
                    onPress={forceUpdateAllEvents}
                >
                    <Text style={styles.debugButtonText}>Force Refresh All Events</Text>
                </TouchableOpacity>
                
                {!editedEvents || editedEvents.length === 0 ? (
                    <Text style={styles.noEvents}>No events found</Text>
                ) : (
                    editedEvents.map((event) => {
                        const startDate = new Date(event.startTime);
                        const endDate = new Date(event.endTime);
                        
                        // Use the same approach as the working PR #8 - this preserves timezone correctly
                        const beginTime = startDate.toTimeString().slice(0, 5);
                        const endTime = endDate.toTimeString().slice(0, 5);
                        
                        console.log(`🔍 EditPage: Rendering EventBubble for "${event.name}"`);
                        console.log(`   📅 Event data from state:`, event);
                        console.log(`   🕐 Original startTime ISO: ${event.startTime}`);
                        console.log(`   🕐 Original endTime ISO: ${event.endTime}`);
                        console.log(`   📊 Parsed startDate object: ${startDate.toLocaleString()}`);
                        console.log(`   📊 Parsed endDate object: ${endDate.toLocaleString()}`);
                        console.log(`   🔢 getHours/getMinutes startDate: ${startDate.getHours()}:${startDate.getMinutes()}`);
                        console.log(`   🔢 getHours/getMinutes endDate: ${endDate.getHours()}:${endDate.getMinutes()}`);
                        console.log(`   ⏰ Final extracted beginTime: ${beginTime}`);
                        console.log(`   ⏰ Final extracted endTime: ${endTime}`);
                        
                        return (
                            <View key={event.id} style={styles.eventContainer}>
                                <EventBubble
                                    UID={event.id}
                                    Name={event.name}
                                    BeginDate={startDate}
                                    EndDate={endDate}
                                    BeginTime={beginTime}
                                    EndTime={endTime}
                                    AllDay={event.allDay || false}
                                    Description={event.description || ''}
                                    Location={event.location || ''}
                                    URL={event.url || ''}
                                    onUpdate={handleEventUpdate}
                                    onDelete={() => handleDeleteEvent(event.id)}
                                    key={`${event.id}-${forceRefresh}`} // Force re-render when forceRefresh changes
                                />
                            </View>
                        )
                    })
                )}
                
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={handleAddEvent}
                    >
                        <Text style={styles.buttonText}>Add New Event</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Processing...' : 'Get Downloadable ICS File'}
                        </Text>
                    </TouchableOpacity>
                    
                    {loading && <ActivityIndicator size="large" color="#0000ff" />}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    eventContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
    },
    noEvents: {
        marginVertical: 20,
        fontSize: 16,
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
        width: '80%',
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: 'green',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
        width: '80%',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    debugButton: {
        backgroundColor: '#FF9800',
        padding: 10,
        borderRadius: 6,
        marginBottom: 15,
        width: '80%',
        alignItems: 'center',
    },
    debugButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default EditPage;