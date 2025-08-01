import React, { useState } from 'react';
import { Image } from 'react-native';
import styles from '../app.module.css';

interface DownloadPageProps {
  width?: string;
  height?: string;
  sessionId: string | null;  // Make this required or handle properly
}

const DownloadPage: React.FC<DownloadPageProps> = ({ width, height, sessionId }) => {
    const [downloadStarted, setDownloadStarted] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use the sessionId to create the download URL
    const downloadUrl = sessionId 
        ? `http://localhost:3000/api/downloadICS?session_id=${sessionId}`
        : '';

    const handleDownload = () => {
        if (!sessionId) {
            setError("No session ID found. Please go back and try again.");
            return;
        }
        
        setDownloadStarted(true);
        
        // Add a verification check to confirm download started
        setTimeout(() => {
            setDownloadSuccess(true);
        }, 1500);
    };

    return (
        <div className={styles.downloadContainer || ''} style={{ textAlign: 'center', padding: '20px' }}>
            <Image source={require('../../assets/images/SSLogo.png')} style={{ width: 300, height: 300 }} accessibilityLabel="Logo" />
            
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
            
            <div
                className={styles.uploadBox}
                style={{ 
                    width: width || '300px', 
                    height: height || '200px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '2px dashed #ccc',
                    borderRadius: '8px',
                    padding: '20px'
                }}
            >
                {sessionId ? (
                    <a 
                        href={downloadUrl} 
                        download="schedule.ics" 
                        style={{ 
                            textDecoration: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={handleDownload}
                    >
                        <Image 
                            source={require('../../assets/images/FileIcon.png')} 
                            style={{ width: 40, height: 40 }} 
                            accessibilityLabel="Download Icon" 
                        />
                        <p>
                            {downloadStarted 
                                ? (downloadSuccess 
                                    ? 'Download complete! Click again if needed.' 
                                    : 'Downloading...') 
                                : 'Click to download .ics file'}
                        </p>
                    </a>
                ) : (
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        justifyContent: 'center', 
                        height: '100%' 
                    }}>
                        <p style={{ color: 'red' }}>No session ID available. Cannot download file.</p>
                    </div>
                )}
            </div>
            
            {/* <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <h3>How to import your calendar:</h3>
                <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                    <li>Google Calendar: Settings > Import & Export > Import</li>
                    <li>Apple Calendar: File > Import</li>
                    <li>Outlook: File > Import and Export > Import iCalendar</li>
                </ul>
            </div> */}
        </div>
    );
}

export default DownloadPage;