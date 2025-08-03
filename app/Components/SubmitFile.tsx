import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { uploadScheduleImage } from '../utilities/apiService';
import { EventType } from './FormBack';

interface CustomFileUploadProps {
  width?: number;
  height?: number;
  onUploadSuccess?: (events: EventType[], sessionId: string) => void;
  onError?: (error: string) => void;
}

const SubmitFile: React.FC<CustomFileUploadProps> = ({ 
  width, 
  height, 
  onUploadSuccess, 
  onError 
}) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [numberOfWeeks, setNumberOfWeeks] = useState<string>('1'); // Changed from '12' to '1'
    const [error, setError] = useState<string | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);

    const pickImage = async () => {
        // Request permissions
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission to access media library is required!');
                if (onError) onError('Permission to access media library is required!');
                return;
            }
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
                setFileName(result.assets[0].uri.split('/').pop() || 'schedule.png');
                setError(null);
            }
        } catch (e) {
            console.error("Error selecting image:", e);
            setError('Failed to select image. Please try again.');
            if (onError) onError('Failed to select image. Please try again.');
        }
    };

    const handleSubmit = async () => {
        if (!selectedImage) {
            const errorMsg = "No image selected";
            setError(errorMsg);
            if (onError) onError(errorMsg);
            return;
        }

        setLoading(true);
        try {
            // Validate number of weeks
            const weeksNum = parseInt(numberOfWeeks, 10);
            if (isNaN(weeksNum) || weeksNum <= 0) {
                const errorMsg = "Please enter a valid number of weeks (greater than 0)";
                setError(errorMsg);
                if (onError) onError(errorMsg);
                setLoading(false);
                return;
            }
            
            // For React Native, we need to handle file upload differently
            // Fetch the file and convert it to a blob
            const response = await fetch(selectedImage);
            const blob = await response.blob();
            
            // Create a File object (for web) or use FormData (for native)
            const file = new File([blob], fileName || 'schedule.png', { type: 'image/png' });
            
            // Format start date as string for the API
            const startDateStr = startDate.toISOString().split('T')[0];
            
            // Call the API with numberOfWeeks instead of calculating endDate
            const apiResponse = await uploadScheduleImage(file, startDateStr, weeksNum);
            
            if (apiResponse.error) {
                const errorMsg = apiResponse.message || "Upload failed";
                setError(errorMsg);
                if (onError) onError(errorMsg);
            } else if (apiResponse.success) {
                setError(null);
                console.log("Upload successful:", apiResponse.message);
                // Call the parent component's success handler
                if (onUploadSuccess && apiResponse.events && apiResponse.session_id) {
                    onUploadSuccess(apiResponse.events, apiResponse.session_id);
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

    // Date picker handlers
    const onStartDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || startDate;
        setShowStartDatePicker(Platform.OS === 'ios');
        setStartDate(currentDate);
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                bounces={false}
            >
                <Image 
                    source={require('../../assets/images/SSLogo.png')} 
                    style={styles.logo} 
                    accessibilityLabel="Logo" 
                />
                
                {error && <Text style={styles.errorText}>{error}</Text>}
            
            <View style={styles.dateContainer}>
                <View style={styles.dateField}>
                    <Text style={styles.label}>Schedule Start Date:</Text>
                    <TouchableOpacity 
                        style={styles.dateButton}
                        onPress={() => setShowStartDatePicker(true)}
                    >
                        <Text>{startDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    {showStartDatePicker && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display="default"
                            onChange={onStartDateChange}
                        />
                    )}
                </View>
                
                <View style={styles.dateField}>
                    <Text style={styles.label}>Number of Weeks:</Text>
                    <TextInput
                        style={styles.weeksInput}
                        value={numberOfWeeks}
                        onChangeText={setNumberOfWeeks}
                        placeholder="Enter number of weeks"
                        keyboardType="numeric"
                        maxLength={3}
                    />
                    <Text style={styles.helperText}>
                        End Date: {(() => {
                            const weeksNum = parseInt(numberOfWeeks, 10);
                            if (isNaN(weeksNum) || weeksNum <= 0) return 'Invalid';
                            const endDate = new Date(startDate);
                            endDate.setDate(endDate.getDate() + (weeksNum * 7));
                            return endDate.toLocaleDateString();
                        })()}
                    </Text>
                </View>
            </View>

            <TouchableOpacity 
                style={[
                    styles.uploadBox, 
                    { 
                        width: width || 300, 
                        maxHeight: selectedImage ? 250 : (height || 200),
                        minHeight: selectedImage ? 200 : (height || 200)
                    }
                ]}
                onPress={pickImage}
            >
                {selectedImage ? (
                    <>
                        <Image 
                            source={{ uri: selectedImage }} 
                            style={styles.preview} 
                            accessibilityLabel="Selected Image"
                        />
                        <Text style={styles.fileName}>{fileName}</Text>
                    </>
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Image 
                            source={require('../../assets/images/FileIcon.png')} 
                            style={styles.icon} 
                            accessibilityLabel="Upload Icon" 
                        />
                        <Text style={styles.placeholderText}>Tap to select an image</Text>
                    </View>
                )}
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.submitText}>
                    {loading ? 'Processing...' : 'Submit'}
                </Text>
            </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        alignItems: 'center',
        padding: 20,
        paddingBottom: 60,
        minHeight: '100%',
    },
    logo: {
        width: 250,
        height: 250,
        marginBottom: 20,
    },
    errorText: {
        color: 'red',
        fontWeight: 'bold',
        marginBottom: 15,
    },
    dateContainer: {
        width: '100%',
        marginBottom: 20,
    },
    dateField: {
        marginBottom: 15,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        backgroundColor: 'white',
    },
    uploadBox: {
        borderWidth: 2,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        borderRadius: 12,
        backgroundColor: '#fafafa',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        padding: 10,
    },
    placeholderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 40,
        height: 40,
        marginBottom: 10,
    },
    placeholderText: {
        fontSize: 16,
        color: '#333',
    },
    preview: {
        width: '90%',
        maxHeight: 180,
        resizeMode: 'contain',
    },
    fileName: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    submitButton: {
        backgroundColor: 'green',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
    weeksInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        backgroundColor: 'white',
        fontSize: 16,
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        fontStyle: 'italic',
    },
    submitText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default SubmitFile;