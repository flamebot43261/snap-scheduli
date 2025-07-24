import React, { useRef, useState } from 'react';
import { Image } from 'react-native';
import ApiCall from '../apiCall';
import styles from '../app.module.css'; // Assuming you have a CSS file for styling

interface CustomFileUploadProps {
  width?: string;
  height?: string;
}

const SubmitFile: React.FC<CustomFileUploadProps> = ({ width, height }) => {

    const inputRef = useRef<HTMLInputElement>(null);

    const [fileName, setFileName] = useState<string | null>(null);

    const handleInputClick = () => {
        inputRef.current?.click();
    };

    const [error, setError] = useState<string | boolean>(false);

    const handleSubmit = () => {
        const file = inputRef.current?.files?.[0];
        if (!file) {
            console.error('No file selected.');
            setError("No file selected");
            return;
        }

        try{
            const response = ApiCall(file);
            if (response?.error){
                setError(true);
            }
            if (response?.success) {
                setError(false);
                console.log("Upload successful:", response?.message)
            }
        }
        catch (err) {
        setError("An error occurred while uploading. Please try again.");
        console.error(err);
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