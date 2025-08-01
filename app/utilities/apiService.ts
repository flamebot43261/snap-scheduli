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
 * @param fileInput The schedule image file to upload
 * @param startDate Optional start date for the schedule (YYYY-MM-DD format)
 * @param endDate Optional end date for the schedule (YYYY-MM-DD format)
 * @returns ApiResponse object with success status and parsed events data
 */
export async function uploadScheduleImage(fileInput: File, startDate?: string, endDate?: string): Promise<ApiResponse> {
  if (!fileInput) {
    console.error('No image selected.');
    return { 
      success: false, 
      error: true, 
      message: 'No image selected' 
    };
  }

  try {
    // Create form data with file and optional date parameters
    const formData = new FormData();
    formData.append('image', fileInput);
    
    if (startDate) formData.append('startDate', startDate);
    if (endDate) formData.append('endDate', endDate);

    // Make the API call
    const response = await fetch('http://localhost:3000/api/convert-schedule', {
      method: 'POST',
      body: formData,
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error (${response.status}): ${errorText}`);
    }

    // Parse the JSON response
    const data = await response.json();
    
    // Return a successful response with the events data
    return { 
      success: true, 
      error: false, 
      message: 'Schedule processed successfully', 
      events: data.events,
      session_id: data.session_id 
    };
  } catch (error) {
    // Handle any errors that occurred during the request
    console.error('API call error:', error);
    return { 
      success: false, 
      error: true, 
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}