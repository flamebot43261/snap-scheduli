

function ApiCall(fileInput: File) {

      if (!fileInput) {
          console.error('No image selected.');
          return;
      }

    const formData = new FormData();
    formData.append('image', fileInput);

    fetch('http://localhost:3000/api/convert-schedule', {
        method: 'POST',
        body: formData,
        headers: {
        'Content-Type': 'multipart/form-data',
        },
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

    return { success: true, error: false, message: 'File uploaded successfully' };
}


export default ApiCall