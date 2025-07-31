import React, { useState } from 'react';
import styles from '../app.module.css';
import DownloadPage from './DownloadPage';
import EditPage from './EditPage';
import LoadingScreen from './LoadingScreen';
import SubmitFile from './SubmitFile';

const FormBack = () => {

    const [displaySubmitFile, setDisplaySubmitFile] = useState(true);
    const [displayEditPage, setDisplayEditPage] = useState(false);
    const [displayDownloadPage, setDisplayDownloadPage] = useState(false);
    const [displayLoading, setDisplayLoading] = useState(false);
    
    const SubmitApiCall = (status: boolean) => {
        if (status) {
            setDisplaySubmitFile(false);
            setDisplayEditPage(true);
        }
    };

    const DownloadApiCall = (status: boolean) => {
        if (status) {
            setDisplayEditPage(false);
            setDisplayDownloadPage(true);
        }
    };

    const DisplayLoadingScreen = () => {
        //setDisplayLoading(true);
        //setDisplaySubmitFile(false);
        //setDisplayEditPage(false);
        //setDisplayDownloadPage(false);
    };

    return (
        <>
            <div className={styles.box}>
                {displaySubmitFile && <SubmitFile onApiComplete={SubmitApiCall} onClick={DisplayLoadingScreen} ApiSuccess={DownloadApiCall} width="auto" height="50px" />}
                {displayEditPage && <EditPage onApiComplete={DownloadApiCall} width="auto" height="50px" />}
                {displayDownloadPage && <DownloadPage width="auto" height="50px" />}
                {displayLoading && <LoadingScreen />}
            </div>
        </>
    );
}

export default FormBack;