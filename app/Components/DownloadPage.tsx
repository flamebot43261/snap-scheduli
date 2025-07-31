import React from 'react';
import { Image } from 'react-native';
import styles from '../app.module.css';

interface CustomFileUploadProps {
  width?: string;
  height?: string;
}

const DownloadPage: React.FC<CustomFileUploadProps> = ({ width, height }) => {


    return (
        <>
            <Image source={require('../../assets/images/SSLogo.png')} style={{ width: 300, height: 300 }} accessibilityLabel="Logo" />
            <div
            className={styles.uploadBox}
            style={{ width, height }}
            >

            <a href="/download" download="file.txt" style={{ justifyItems: 'center', all: "unset", alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                <Image source={require('../../assets/images/FileIcon.png')} style={{ width: 40, height: 40 }} accessibilityLabel="Upload Icon" />
                <p>Click to download .ics file</p>
            </a>
            </div>     
        </>

    );
}



export default DownloadPage;