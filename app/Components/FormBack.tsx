import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import styles from '../app.module.css'; // Assuming you have a CSS file for styling
import SubmitFile from './SubmitFile';

const FormBack = () => {

    return (
        <>
            <div className={styles.box}>
                <h1>SnapScheduli</h1>
                <SubmitFile width="400px" height="250px"/>
            </div>
        </>
    );
}




export default FormBack;