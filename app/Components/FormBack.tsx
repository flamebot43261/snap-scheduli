import React from 'react';
import { Image } from 'react-native';
// No need to import Logo for require()
import styles from '../app.module.css'; // Assuming you have a CSS file for styling
import SubmitFile from './SubmitFile';

const FormBack = () => {

    return (
        <>
            <div className={styles.box}>
                <Image source={require('../../assets/images/SSLogo.png')} style={{ width: 300, height: 300 }} accessibilityLabel="Logo" />
                <SubmitFile width="auto" height="50px"/>
            </div>
        </>
    );
}




export default FormBack;