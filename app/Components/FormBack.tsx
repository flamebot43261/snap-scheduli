import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DownloadPage from './DownloadPage';
import EditPage from './EditPage';
import SubmitFile from './SubmitFile';

// Define event type for our application
export interface EventType {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    location: string;
    description?: string;
    allDay?: boolean;
    url?: string;
}

const FormBack = () => {
    const [currentStep, setCurrentStep] = useState<'upload' | 'edit' | 'download'>('upload');
    const [events, setEvents] = useState<EventType[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [numberOfWeeks, setNumberOfWeeks] = useState<number>(12);
    const [startDate, setStartDate] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleUploadSuccess = (uploadedEvents: EventType[], newSessionId: string, weeks?: number, startDate?: string) => {
        setEvents(uploadedEvents);
        setSessionId(newSessionId);
        if (weeks) setNumberOfWeeks(weeks);
        if (startDate) setStartDate(startDate);
        setCurrentStep('edit');
    };

    const handleEditComplete = (updatedEvents: EventType[], newSessionId: string) => {
        setEvents(updatedEvents);
        setSessionId(newSessionId);
        setCurrentStep('download');
    };

    const handleBack = () => {
        if (currentStep === 'edit') setCurrentStep('upload');
        if (currentStep === 'download') setCurrentStep('edit');
    };

    return (
        <View style={styles.container}>
            {error && <Text style={styles.errorMessage}>{error}</Text>}
            
            {currentStep === 'upload' && (
                <SubmitFile 
                    width={300} 
                    height={200}
                    onUploadSuccess={handleUploadSuccess}
                    onError={setError}
                />
            )}
            
            {currentStep === 'edit' && (
                <View style={styles.stepContainer}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={handleBack}
                    >
                        <Text style={styles.backButtonText}>← Back to Upload</Text>
                    </TouchableOpacity>
                    <EditPage 
                        events={events}
                        originalSessionId={sessionId}
                        onEditComplete={handleEditComplete}
                        onError={setError}
                    />
                </View>
            )}
            
            {currentStep === 'download' && (
                <View style={styles.stepContainer}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={handleBack}
                    >
                        <Text style={styles.backButtonText}>← Back to Edit</Text>
                    </TouchableOpacity>
                    <DownloadPage 
                        width={300}
                        height={200}
                        sessionId={sessionId}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '90%',
        maxWidth: 700,
        marginVertical: 40,
        marginHorizontal: 'auto',
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        padding: 20,
    },
    stepContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    errorMessage: {
        backgroundColor: '#ffeeee',
        color: 'red',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        width: '100%',
        textAlign: 'center',
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    backButtonText: {
        color: 'blue',
        fontSize: 16,
    }
});

export default FormBack;