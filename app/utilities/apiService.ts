// Define TypeScript interfaces for better type safety
export interface ApiResponse {
  success: boolean;
  error: boolean;
  message: string;
  events?: Array<{
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    location: string;
    description?: string;
    allDay?: boolean;
  }>;
  session_id?: string;
}

/**
 * Uploads a schedule image to the backend for processing
 */
export async function uploadScheduleImage(fileInput: File | Blob, startDate?: string, numberOfWeeks?: string | number): Promise<ApiResponse> {
  if (!fileInput) {
    return { 
      success: false, 
      error: true, 
      message: 'No image selected' 
    };
  }

  try {
    const formData = new FormData();
    
    if (fileInput instanceof File) {
      formData.append('image', fileInput);
    } else {
      formData.append('image', fileInput as any, 'schedule.png');
    }
    
    if (startDate) formData.append('startDate', startDate);
    if (numberOfWeeks) formData.append('numberOfWeeks', numberOfWeeks.toString());

    const response = await fetch('http://localhost:3000/api/convert-schedule', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    return { 
      success: true, 
      error: false, 
      message: 'Schedule processed successfully', 
      events: data.events,
      session_id: data.session_id 
    };
  } catch (error) {
    return { 
      success: false, 
      error: true, 
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export default { uploadScheduleImage };