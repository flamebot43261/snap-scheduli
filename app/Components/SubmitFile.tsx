import React, { useRef, useState } from 'react';
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

    const handleSubmit = () => {
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
            <div
            className={styles.uploadBox}
            style={{ width, height }}
            onClick={handleInputClick}
            >
            {fileName ? (
                <p>{fileName}</p>
            ) : (
                <div>
                    <img src="../../assets/images/FileIcon.png" alt="Upload Icon" />
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
            <button onClick={handleSubmit} className={styles.uploadButton}>
            Upload File
            </button>     
        </>

    );
}




export default SubmitFile;