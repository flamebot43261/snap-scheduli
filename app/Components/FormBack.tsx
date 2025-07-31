import React from 'react';
// No need to import Logo for require()
import styles from '../app.module.css'; // Assuming you have a CSS file for styling
import DownloadPage from './DownloadPage';

const FormBack = () => {

    return (
        <>
            <div className={styles.box}>
                <DownloadPage width="auto" height="50px" />
            </div>
        </>
    );
}

/*
                <SubmitFile width="auto" height="50px"/>

*/

export default FormBack;