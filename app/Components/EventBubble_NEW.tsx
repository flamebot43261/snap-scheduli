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

// FIXED EventBubble component with proper timezone handling
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

    const userEditingRef = useRef(false);

    // Watch for prop changes and update state accordingly
    useEffect(() => {
        if (!userEditingRef.current) {
            if (BeginTime !== undefined && BeginTime !== beginTime) {
                setBeginTime(BeginTime);
            }
            if (EndTime !== undefined && EndTime !== endTime) {
                setEndTime(EndTime);
            }
            if (Name !== undefined) setName(Name);
            if (BeginDate !== undefined) setBeginDate(BeginDate);
            if (EndDate !== undefined) setEndDate(EndDate);
            if (Location !== undefined) setLocation(Location);
            if (Description !== undefined) setDescription(Description);
            if (URL !== undefined) setUrl(URL);
            if (AllDay !== undefined) setAllDay(AllDay);
        }
    }, [BeginTime, EndTime, Name, BeginDate, EndDate, Location, Description, URL, AllDay]);

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

    // Convert 24-hour time to 12-hour AM/PM format
    const formatTimeToAMPM = (timeStr: string) => {
        if (!timeStr || timeStr === '') return '12:00 AM';
        try {
            const [hours, minutes] = parseTime(timeStr);
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
            return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        } catch (e) {
            console.error("Time formatting error:", e);
            return '12:00 AM';
        }
    };

    // FIXED handleUpdate function - correct timezone handling
    const handleUpdate = () => {
        if (!onUpdate) return;

        try {
            console.log(`🔧 EventBubble ${UID} handleUpdate DEBUG:`);
            console.log(`   📅 beginDate: ${beginDate.toISOString()} (${beginDate.toLocaleString()})`);
            console.log(`   📅 endDate: ${endDate.toISOString()} (${endDate.toLocaleString()})`);
            console.log(`   🕐 beginTime: "${beginTime}"`);
            console.log(`   🕐 endTime: "${endTime}"`);
            
            // Create dates in local timezone properly
            const startDateTime = new Date();
            startDateTime.setFullYear(beginDate.getFullYear(), beginDate.getMonth(), beginDate.getDate());
            const [startHours, startMinutes] = parseTime(beginTime);
            console.log(`   🔢 startHours: ${startHours}, startMinutes: ${startMinutes}`);
            startDateTime.setHours(startHours, startMinutes, 0, 0);
            console.log(`   ✅ startDateTime after setHours: ${startDateTime.toISOString()}`);

            const endDateTime = new Date();
            endDateTime.setFullYear(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            const [endHours, endMinutes] = parseTime(endTime);
            console.log(`   🔢 endHours: ${endHours}, endMinutes: ${endMinutes}`);
            console.log(`   📊 endDateTime before setHours: ${endDateTime.toISOString()}`);
            endDateTime.setHours(endHours, endMinutes, 0, 0);
            console.log(`   ✅ endDateTime after setHours: ${endDateTime.toISOString()}`);

            const eventData = {
                id: UID,
                name,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                location,
                description,
                allDay,
                url
            };
            
            console.log(`EventBubble ${UID} update: ${name} ${beginTime}-${endTime}`);
            console.log(`  → startTime: ${eventData.startTime}`);
            console.log(`  → endTime: ${eventData.endTime}`);
            onUpdate(eventData);
        } catch (e) {
            console.error("Error updating event:", e);
        }
    };

    // Call handleUpdate whenever any field changes with debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            userEditingRef.current = false;
            handleUpdate();
        }, 500);
        
        return () => clearTimeout(timer);
    }, [name, beginDate, endDate, beginTime, endTime, allDay, description, location, url]);

    // Date picker handlers
    const onBeginDateChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            setShowBeginDatePicker(false);
            return;
        }
        
        const currentDate = selectedDate || beginDate;
        setShowBeginDatePicker(Platform.OS === 'ios');
        userEditingRef.current = true;
        setBeginDate(new Date(currentDate));
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            setShowEndDatePicker(false);
            return;
        }
        
        const currentDate = selectedDate || endDate;
        setShowEndDatePicker(Platform.OS === 'ios');
        userEditingRef.current = true;
        setEndDate(new Date(currentDate));
    };

    // Time picker handlers
    const onBeginTimeChange = (event: any, selectedTime?: Date) => {
        if (event.type === 'dismissed') {
            setShowBeginTimePicker(false);
            return;
        }
        
        if (!selectedTime) return;
        
        setShowBeginTimePicker(Platform.OS === 'ios');
        userEditingRef.current = true;
        
        const newTime = selectedTime.getHours().toString().padStart(2, '0') + 
                       ':' + 
                       selectedTime.getMinutes().toString().padStart(2, '0');
        
        setBeginTime(newTime);
        
        setTimeout(() => {
            userEditingRef.current = false;
        }, 1000);
    };

    const onEndTimeChange = (event: any, selectedTime?: Date) => {
        if (event.type === 'dismissed') {
            setShowEndTimePicker(false);
            return;
        }
        
        if (!selectedTime) return;
        
        setShowEndTimePicker(Platform.OS === 'ios');
        userEditingRef.current = true;
        
        const newTime = selectedTime.getHours().toString().padStart(2, '0') + 
                       ':' + 
                       selectedTime.getMinutes().toString().padStart(2, '0');
        
        setEndTime(newTime);
        
        setTimeout(() => {
            userEditingRef.current = false;
        }, 1000);
    };

    return (
        <View style={styles.container}>
            <View style={styles.field}>
                <Text style={styles.label}>Event Name:</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />
            </View>

            <View style={styles.fieldRow}>
                <View style={styles.fieldHalf}>
                    <Text style={styles.label}>Begin Date:</Text>
                    {Platform.OS === 'web' ? (
                        <input
                            type="date"
                            value={beginDate.toISOString().split('T')[0]}
                            onChange={(e) => {
                                userEditingRef.current = true;
                                setBeginDate(new Date(e.target.value));
                            }}
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 4,
                                padding: 10,
                                backgroundColor: 'white',
                                fontSize: 16,
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        />
                    ) : (
                        <>
                            <TouchableOpacity 
                                style={styles.dateInput}
                                onPress={() => setShowBeginDatePicker(true)}
                            >
                                <Text style={styles.clickableText}>{beginDate.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                            {showBeginDatePicker && (
                                <DateTimePicker
                                    value={beginDate}
                                    mode="date"
                                    display="default"
                                    onChange={onBeginDateChange}
                                />
                            )}
                        </>
                    )}
                </View>

                <View style={styles.fieldHalf}>
                    <Text style={styles.label}>End Date:</Text>
                    {Platform.OS === 'web' ? (
                        <input
                            type="date"
                            value={endDate.toISOString().split('T')[0]}
                            onChange={(e) => {
                                userEditingRef.current = true;
                                setEndDate(new Date(e.target.value));
                            }}
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 4,
                                padding: 10,
                                backgroundColor: 'white',
                                fontSize: 16,
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        />
                    ) : (
                        <>
                            <TouchableOpacity 
                                style={styles.dateInput}
                                onPress={() => setShowEndDatePicker(true)}
                            >
                                <Text style={styles.clickableText}>{endDate.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                            {showEndDatePicker && (
                                <DateTimePicker
                                    value={endDate}
                                    mode="date"
                                    display="default"
                                    onChange={onEndDateChange}
                                />
                            )}
                        </>
                    )}
                </View>
            </View>

            <View style={styles.fieldRow}>
                <View style={styles.fieldThird}>
                    <Text style={styles.label}>Begin Time:</Text>
                    {Platform.OS === 'web' ? (
                        <input
                            type="time"
                            value={beginTime}
                            onChange={(e) => {
                                userEditingRef.current = true;
                                setBeginTime(e.target.value);
                                
                                setTimeout(() => {
                                    userEditingRef.current = false;
                                }, 1000);
                            }}
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 4,
                                padding: 10,
                                backgroundColor: 'white',
                                fontSize: 16,
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        />
                    ) : (
                        <>
                            <TouchableOpacity 
                                style={styles.timeInput}
                                onPress={() => setShowBeginTimePicker(true)}
                            >
                                <Text style={styles.clickableText}>{formatTimeToAMPM(beginTime)}</Text>
                            </TouchableOpacity>
                            {showBeginTimePicker && (
                                <DateTimePicker
                                    value={(() => {
                                        const [hours, minutes] = parseTime(beginTime);
                                        const date = new Date();
                                        date.setHours(hours, minutes, 0, 0);
                                        return date;
                                    })()}
                                    mode="time"
                                    is24Hour={false}
                                    display="default"
                                    onChange={onBeginTimeChange}
                                />
                            )}
                        </>
                    )}
                </View>

                <View style={styles.fieldThird}>
                    <Text style={styles.label}>End Time:</Text>
                    {Platform.OS === 'web' ? (
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => {
                                userEditingRef.current = true;
                                setEndTime(e.target.value);
                                
                                setTimeout(() => {
                                    userEditingRef.current = false;
                                }, 1000);
                            }}
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 4,
                                padding: 10,
                                backgroundColor: 'white',
                                fontSize: 16,
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        />
                    ) : (
                        <>
                            <TouchableOpacity 
                                style={styles.timeInput}
                                onPress={() => setShowEndTimePicker(true)}
                            >
                                <Text style={styles.clickableText}>{formatTimeToAMPM(endTime)}</Text>
                            </TouchableOpacity>
                            {showEndTimePicker && (
                                <DateTimePicker
                                    value={(() => {
                                        const [hours, minutes] = parseTime(endTime);
                                        const date = new Date();
                                        date.setHours(hours, minutes, 0, 0);
                                        return date;
                                    })()}
                                    mode="time"
                                    is24Hour={false}
                                    display="default"
                                    onChange={onEndTimeChange}
                                />
                            )}
                        </>
                    )}
                </View>

                <View style={styles.fieldThird}>
                    <Text style={styles.label}>All Day:</Text>
                    <Switch
                        value={allDay}
                        onValueChange={setAllDay}
                    />
                </View>
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Location:</Text>
                <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Description:</Text>
                <TextInput
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>URL:</Text>
                <TextInput
                    style={styles.input}
                    value={url}
                    onChangeText={setUrl}
                />
            </View>

            {onDelete && (
                <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                    <Text style={styles.deleteButtonText}>Delete Event</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: '90%',
    },
    field: {
        marginBottom: 15,
    },
    fieldRow: {
        flexDirection: 'row',
        marginBottom: 15,
        justifyContent: 'space-between',
    },
    fieldHalf: {
        flex: 0.48,
    },
    fieldThird: {
        flex: 0.3,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        backgroundColor: 'white',
        fontSize: 16,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    timeInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    clickableText: {
        fontSize: 16,
        color: '#007AFF',
    },
    deleteButton: {
        backgroundColor: '#ff4444',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default EventBubble;
