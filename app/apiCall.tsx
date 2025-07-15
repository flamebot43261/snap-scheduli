import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';


const ApiCall = () => {
    
    const [message, setMessage] = useState('');

    useEffect(() => {
      fetch('http://localhost:3000/api/data') // Replace with your backend URL
        .then(response => response.json())
        .then(data => setMessage(data.message))
        .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <View>
            <Text>{message}</Text>
        </View>
    );
}


export default ApiCall