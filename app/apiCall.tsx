import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';


const ApiCall = () => {
    
    const [message, setMessage] = useState('');
    const [endapi, setEndapi] = useState(false);
    const [file, setFile] = useState<File | null>(null);


    const handleSubmit = () => {

      if (!file) {
          console.error('No file selected.');
          return;
      }
      const formData = new FormData();
      formData.append('file', file);

      fetch('http://localhost:3000/api/uploadImage', {
          method: 'POST',
          body: formData
      })
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching data:', error));
      setEndapi(true);
    }

    return (
        <View>
            <div>
                <input
                    type="file"
                    onChange={(event) => {
                        const files = event.target.files;
                        if (files && files.length > 0) {
                            setFile(files[0]);
                        } else {
                            setFile(null);
                        }
                    }}
                />
                <button onClick={handleSubmit}>Upload File</button>
            </div>
            {endapi && <Text>{message}</Text>}
        </View>
    );
}


export default ApiCall