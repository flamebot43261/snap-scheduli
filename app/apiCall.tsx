

function ApiCall(fileInput: File) {

      if (!fileInput) {
          console.error('No file selected.');
          return;
      }

    const formData = new FormData();
    formData.append('image', fileInput);

    fetch('http://localhost:3000/api/uploadImage', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
}


export default ApiCall