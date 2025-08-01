import React, { useRef, useState } from 'react';
import { Image } from 'react-native';
import styles from '../app.module.css';
import { uploadScheduleImage } from '../utilities/apiService';
import { EventType } from './FormBack';

interface CustomFileUploadProps {
  width?: string;
  height?: string;
  onUploadSuccess?: (events: EventType[], sessionId: string) => void;
  onError?: (error: string) => void;
}

const SubmitFile: React.FC<CustomFileUploadProps> = ({ 
  width, 
  height, 
  onUploadSuccess, 
  onError 
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [error, setError] = useState<string | boolean>(false);

    const handleInputClick = () => {
        inputRef.current?.click();
    };

    const handleSubmit = async () => {
        const file = inputRef.current?.files?.[0];
        if (!file) {
            const errorMsg = "No file selected";
            setError(errorMsg);
            if (onError) onError(errorMsg);
            return;
        }

        setLoading(true);
        try {
            // Call the API with await since it's an async function
            const response = await uploadScheduleImage(file, startDate, endDate);
            
            if (response.error) {
                const errorMsg = response.message || "Upload failed";
                setError(errorMsg);
                if (onError) onError(errorMsg);
            } else if (response.success) {
                setError(false);
                console.log("Upload successful:", response.message);
                // Call the parent component's success handler
                if (onUploadSuccess && response.events && response.session_id) {
                    onUploadSuccess(response.events, response.session_id);
                }
            }
        } catch (err) {
            const errorMsg = "An error occurred while uploading. Please try again.";
            setError(errorMsg);
            if (onError) onError(errorMsg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log("Selected file:", file.name);
            setFileName(file.name);
        }
    };

    return (
        <>
            <Image source={require('../../assets/images/SSLogo.png')} style={{ width: 300, height: 300 }} accessibilityLabel="Logo" />
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{typeof error === 'string' ? error : 'An error occurred'}</p>}
            
            <div className={styles.dateSelectors}>
                <div>
                    <label htmlFor="start-date">Semester Start Date:</label>
                    <input 
                        type="date" 
                        id="start-date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="end-date">Semester End Date:</label>
                    <input 
                        type="date" 
                        id="end-date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            <div
                className={styles.uploadBox}
                style={{ width, height }}
                onClick={handleInputClick}
            >
                {fileName ? (
                    <p>{fileName}</p>
                ) : (
                    <div style={{ justifyItems: 'center'}}>
                        <Image source={require('../../assets/images/FileIcon.png')} style={{ width: 40, height: 40 }} accessibilityLabel="Upload Icon" />
                        <p>Click or drag a file here</p>
                    </div>
                )}
                <input
                    type="file"
                    ref={inputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className={styles.hiddenInput}
                />
            </div>   
            <br />
            <br />
            <button 
                onClick={handleSubmit} 
                className={styles.uploadButton}
                disabled={loading}
            >
                {loading ? 'Processing...' : 'Submit'}
            </button>     
        </>
    );
};

export default SubmitFile;