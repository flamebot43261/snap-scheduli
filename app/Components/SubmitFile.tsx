import React, { useRef, useState } from 'react';
import { Image } from 'react-native';
import { ApiCall } from '../Utils/apiCall';
import styles from '../app.module.css'; // Assuming you have a CSS file for styling

interface CustomFileUploadProps {
  onApiComplete: (status: boolean) => void;
  ApiSuccess: (status: boolean) => void;
  onClick?: () => void;
  width?: string;
  height?: string;
}

interface ApiResponse {
    error?: boolean;
    success?: boolean;
    message?: string;
}

const SubmitFile: React.FC<CustomFileUploadProps> = ({ width, height, onApiComplete, onClick, ApiSuccess }) => {

    const inputRef = useRef<HTMLInputElement>(null);

    const [fileName, setFileName] = useState<string | null>(null);

    const handleInputClick = (): void => {
        inputRef.current?.click();
    };

    const [error, setError] = useState<string | boolean>(false);

    const handleSubmit = async () => {
        onClick?.(); // Call the onClick prop if provided
        const file: File | undefined = inputRef.current?.files?.[0];

        if (!file) {
            console.error('No file selected.');
            setError("No file selected");
            return;
        }

        try {
            const apiResult = await ApiCall(file);

            if (!apiResult) {
                setError("No response from server.");
                return;
            }

            const response: ApiResponse = apiResult;

            if (response.error) {
                setError(response.message || "Upload failed.");
                console.error("Upload failed:", response.message);
                ApiSuccess?.(false);
            }

            if (response.success) {
                setError("");
                onApiComplete?.(true);
                ApiSuccess?.(true);
                console.log("Upload successful:", response.message);
            }

        } catch (err) {
            setError("An error occurred while uploading. Please try again.");
            console.error(err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file: File | undefined = e.target.files?.[0];
        if (file) {
            console.log("Selected file:", file.name);
            setFileName(file.name);
        }
    };

    return (
        <>
            <Image source={require('../../assets/images/SSLogo.png')} style={{ width: 300, height: 300 }} accessibilityLabel="Logo" />
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>} 

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
                    className={styles.hiddenInput}
                />
            </div>   
            <br />
            <br />
            <button onClick={handleSubmit} className={styles.uploadButton}>
                Submit
            </button>     
        </>
    );
}




export default SubmitFile;