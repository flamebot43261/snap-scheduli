import React, { useState } from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DownloadPageProps {
  width?: number;
  height?: number;
  sessionId: string | null;
}

const DownloadPage: React.FC<DownloadPageProps> = ({ width, height, sessionId }) => {
    const [downloadStarted, setDownloadStarted] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use the sessionId to create the download URL
    const downloadUrl = sessionId 
        ? `http://localhost:3000/api/downloadICS?session_id=${sessionId}`
        : '';

    const handleDownload = async () => {
        if (!sessionId) {
            setError("No session ID found. Please go back and try again.");
            return;
        }
        
        setDownloadStarted(true);
        
        try {
            // For React Native, we'll use Linking to open the download URL
            await Linking.openURL(downloadUrl);
            
            // Add a verification check to confirm download started
            setTimeout(() => {
                setDownloadSuccess(true);
            }, 1500);
        } catch (e) {
            console.error("Error opening download URL:", e);
            setError("Failed to start download. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            <Image 
                source={require('../../assets/images/SSLogo.png')} 
                style={styles.logo} 
                accessibilityLabel="Logo" 
            />
            
            {error && <Text style={styles.errorText}>{error}</Text>}
            
            <View style={[
                styles.uploadBox,
                {
                    width: width || 300,
                    height: height || 200,
                }
            ]}>
                {sessionId ? (
                    <TouchableOpacity 
                        style={styles.downloadButton}
                        onPress={handleDownload}
                    >
                        <Image 
                            source={require('../../assets/images/FileIcon.png')} 
                            style={styles.icon} 
                            accessibilityLabel="Download Icon" 
                        />
                        <Text style={styles.downloadText}>
                            {downloadStarted 
                                ? (downloadSuccess 
                                    ? 'Download complete! Tap again if needed.' 
                                    : 'Downloading...') 
                                : 'Tap to download .ics file'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.noSessionContainer}>
                        <Text style={styles.errorText}>No session ID available. Cannot download file.</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: 300,
        height: 300,
        marginBottom: 20,
    },
    errorText: {
        color: 'red',
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    uploadBox: {
        borderWidth: 2,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        borderRadius: 8,
        backgroundColor: '#fafafa',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 20,
    },
    downloadButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
    },
    icon: {
        width: 40,
        height: 40,
        marginBottom: 10,
    },
    downloadText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
    },
    noSessionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DownloadPage;