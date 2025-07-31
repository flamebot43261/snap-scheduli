

export async function ApiCall(fileInput: File) {

      if (!fileInput) {
          console.error('No image selected.');
          return;
      }

    const formData = new FormData();
    formData.append('image', fileInput);

    try {
        const response = await fetch('http://localhost:3000/api/convert-schedule', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log(data);
        return { success: true, error: false, message: 'File uploaded successfully', data };
    } catch (error) {
        console.error(error);
        return { success: false, error: true, message: 'Upload failed' };
    }
}