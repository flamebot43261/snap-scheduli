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
  number_of_weeks?: number;
  start_date?: string;
}

/**
 * Get the appropriate API base URL based on the platform
 */
const getApiBaseUrl = () => {
  // For iOS simulator, use localhost
  // For iOS device, you'll need your computer's IP address
  if (__DEV__) {
    // Development mode
    return 'http://localhost:3000';
  }
  // Production mode - replace with your actual server URL
  return 'http://your-production-server.com';
};

/**
 * Uploads a schedule image to the backend for processing
 * @param fileInput The schedule image file to upload
 * @param startDate Optional start date for the schedule (YYYY-MM-DD format)
 * @param numberOfWeeks Number of weeks for the schedule duration
 * @returns ApiResponse object with success status and parsed events data
 */
export async function uploadScheduleImage(fileInput: File | Blob, startDate?: string, numberOfWeeks?: string | number): Promise<ApiResponse> {
  if (!fileInput) {
    console.error('No image selected.');
    return { 
      success: false, 
      error: true, 
      message: 'No image selected' 
    };
  }

  try {
    const baseUrl = getApiBaseUrl();
    
    // Create form data with file and optional parameters  
    const formData = new FormData();
    
    // Handle both File objects (web) and Blob objects (React Native)
    if (fileInput instanceof File) {
      formData.append('image', fileInput);
    } else {
      // For React Native, we need to add more metadata
      formData.append('image', fileInput as any, 'schedule.png');
    }
    
    if (startDate) formData.append('startDate', startDate);
    if (numberOfWeeks) formData.append('numberOfWeeks', numberOfWeeks.toString());

    console.log('Making API call to:', `${baseUrl}/api/convert-schedule`);

    // Make the API call with timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${baseUrl}/api/convert-schedule`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      // Add headers for better compatibility
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

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
    // Handle specific error types
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('API request timed out');
      return { 
        success: false, 
        error: true, 
        message: 'Request timed out. Please try again.'
      };
    }
    
    // Handle network errors
    console.error('API call error:', error);
    return { 
      success: false, 
      error: true, 
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure the backend server is running.`
    };
  }
}

// Add a default export to fix the routing warning
export default {
  uploadScheduleImage
};
