import React, { useState } from 'react';
import styles from '../app.module.css';
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
    // This should start with 'upload', not 'download'
    const [currentStep, setCurrentStep] = useState<'upload' | 'edit' | 'download'>('upload');
    const [events, setEvents] = useState<EventType[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUploadSuccess = (uploadedEvents: EventType[], newSessionId: string) => {
        setEvents(uploadedEvents);
        setSessionId(newSessionId);
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
        <div className={styles.box}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            {currentStep === 'upload' && (
                <SubmitFile 
                    width="auto" 
                    height="auto" 
                    onUploadSuccess={handleUploadSuccess}
                    onError={setError}
                />
            )}
            
            {currentStep === 'edit' && (
                <>
                    <button onClick={handleBack} className={styles.backButton}>Back to Upload</button>
                    <EditPage 
                        width="auto" 
                        height="auto" 
                        events={events}
                        onEditComplete={handleEditComplete}
                        onError={setError}
                    />
                </>
            )}
            
            {currentStep === 'download' && (
                <>
                    <button onClick={handleBack} className={styles.backButton}>Back to Edit</button>
                    <DownloadPage 
                        width="auto" 
                        height="auto" 
                        sessionId={sessionId}
                    />
                </>
            )}
        </div>
    );
};

export default FormBack;