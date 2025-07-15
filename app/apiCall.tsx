import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';


const ApiCall = () => {
    
    const [message, setMessage] = useState('');

    const handleSubmit = () => {

      const formData = new FormData();
      const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        console.error('No file selected.');
        return;
      }
      formData.append('file', fileInput.files[0]);

      fetch('http://localhost:3000/api/data', {
          method: 'POST',
          body: formData
      })
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching data:', error));
    }

    return (
        <View>
            <form id="uploadForm" onSubmit={handleSubmit}>
                <input type="file" name="file" id="fileInput" />
                <button type="submit">Upload</button>
            </form>
        </View>
    );
}


export default ApiCall