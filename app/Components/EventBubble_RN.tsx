import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { EventType } from './FormBack';

interface EventBubbleProps {
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
    
    const [showBeginDatePicker, setShowBeginDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showBeginTimePicker, setShowBeginTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

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
    const handleBeginTimeChange = (event: any, selectedTime?: Date) => {
        userEditingRef.current = true;
        if (selectedTime) {
            const timeString = selectedTime.toTimeString().slice(0, 5);
            setBeginTime(timeString);
        }
        setShowBeginTimePicker(false);
    };
    
    const handleEndTimeChange = (event: any, selectedTime?: Date) => {
        userEditingRef.current = true;
        if (selectedTime) {
            const timeString = selectedTime.toTimeString().slice(0, 5);
            setEndTime(timeString);
        }
        setShowEndTimePicker(false);
    };

    const handleBeginDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || beginDate;
        setShowBeginDatePicker(Platform.OS === 'ios');
        setBeginDate(currentDate);
    };

    const handleEndDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || endDate;
        setShowEndDatePicker(Platform.OS === 'ios');
        setEndDate(currentDate);
    };

    return (
        <View style={styles.container}>
            <View style={styles.field}>
                <Text style={styles.label}>Event Name:</Text>
                <TextInput 
                    style={styles.input}
                    value={name} 
                    onChangeText={setName}
                    placeholder="Enter event name"
                />
            </View>

            <View style={styles.fieldRow}>
                <View style={styles.fieldHalf}>
                    <Text style={styles.label}>Begin Date:</Text>
                    <TouchableOpacity 
                        style={styles.dateInput}
                        onPress={() => setShowBeginDatePicker(true)}
                    >
                        <Text>{beginDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    {showBeginDatePicker && (
                        <DateTimePicker
                            value={beginDate}
                            mode="date"
                            display="default"
                            onChange={handleBeginDateChange}
                        />
                    )}
                </View>

                <View style={styles.fieldHalf}>
                    <Text style={styles.label}>End Date:</Text>
                    <TouchableOpacity 
                        style={styles.dateInput}
                        onPress={() => setShowEndDatePicker(true)}
                    >
                        <Text>{endDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    {showEndDatePicker && (
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            display="default"
                            onChange={handleEndDateChange}
                        />
                    )}
                </View>
            </View>

            <View style={styles.fieldRow}>
                <View style={styles.fieldHalf}>
                    <Text style={styles.label}>Begin Time:</Text>
                    <TouchableOpacity 
                        style={styles.timeInput}
                        onPress={() => setShowBeginTimePicker(true)}
                    >
                        <Text>{beginTime}</Text>
                    </TouchableOpacity>
                    {showBeginTimePicker && (
                        <DateTimePicker
                            value={new Date(`2000-01-01T${beginTime}:00`)}
                            mode="time"
                            display="default"
                            onChange={handleBeginTimeChange}
                        />
                    )}
                </View>

                <View style={styles.fieldHalf}>
                    <Text style={styles.label}>End Time:</Text>
                    <TouchableOpacity 
                        style={styles.timeInput}
                        onPress={() => setShowEndTimePicker(true)}
                    >
                        <Text>{endTime}</Text>
                    </TouchableOpacity>
                    {showEndTimePicker && (
                        <DateTimePicker
                            value={new Date(`2000-01-01T${endTime}:00`)}
                            mode="time"
                            display="default"
                            onChange={handleEndTimeChange}
                        />
                    )}
                </View>
            </View>

            <View style={styles.field}>
                <View style={styles.switchRow}>
                    <Text style={styles.label}>All Day:</Text>
                    <Switch 
                        value={allDay} 
                        onValueChange={setAllDay}
                    />
                </View>
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Description:</Text>
                <TextInput 
                    style={styles.textArea}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter description"
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Location:</Text>
                <TextInput 
                    style={styles.input}
                    value={location} 
                    onChangeText={setLocation}
                    placeholder="Enter location"
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>URL:</Text>
                <TextInput 
                    style={styles.input}
                    value={url} 
                    onChangeText={setUrl}
                    placeholder="Enter URL"
                />
            </View>

            {onDelete && (
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={onDelete}
                >
                    <Text style={styles.buttonText}>Delete Event</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 15,
        marginVertical: 10,
        width: '100%',
        maxWidth: 500,
    },
    field: {
        marginBottom: 15,
    },
    fieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    fieldHalf: {
        width: '48%',
    },
    fieldThird: {
        width: '30%',
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        backgroundColor: 'white',
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        backgroundColor: 'white',
    },
    timeInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        backgroundColor: 'white',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        backgroundColor: 'white',
        height: 100,
        textAlignVertical: 'top',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    deleteButton: {
        backgroundColor: '#ff5252',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});

export default EventBubble;
