// Remove the duplicate interface declarations
import axios from "axios";

// This would be set in the environment variables in a real application
// For S3 static hosting, we can use a configuration file or embed it directly
const LAMBDA_FUNCTION_URL = import.meta.env.VITE_LAMBDA_FUNCTION_URL || "https://your-lambda-function-url.lambda-url.region.on.aws";

// Optional headers for authentication or IP verification
const headers = {
  "Content-Type": "application/json",
  // Add any custom headers required for authentication
  // "x-api-key": "your-api-key",
};

export interface AnalysisRequest {
  message?: string;
  file?: File;
}

export interface AnalysisResponse {
  message: string;
  analysis?: {
    summary?: string;
    keyFindings?: string[];
    recommendations?: string[];
    followUp?: string;
  };
  error?: string;
}

export const analyzeDocument = async (request: AnalysisRequest): Promise<AnalysisResponse> => {
  try {
    console.log("API Request:", {
      url: LAMBDA_FUNCTION_URL,
      type: request.file ? "file upload" : "text message",
      message: request.message,
      file: request.file ? `${request.file.name} (${request.file.size} bytes)` : null
    });

    // If there's a file, we need to handle it differently
    if (request.file) {
      const formData = new FormData();
      
      // Add the file to the form data
      formData.append("file", request.file);
      
      // Add the message if it exists
      if (request.message) {
        formData.append("message", request.message);
      }
      
      const response = await axios.post(LAMBDA_FUNCTION_URL, formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log("API Response Headers:", response.headers);
      console.log("API Response Status:", response.status);
      console.log("API Response Data:", response.data);
      
      return response.data;
    } else {
      // If there's only a message, send as JSON
      const response = await axios.post(
        LAMBDA_FUNCTION_URL,
        { message: request.message },
        { headers }
      );
      
      console.log("API Response Headers:", response.headers);
      console.log("API Response Status:", response.status);
      console.log("API Response Data:", response.data);
      
      return response.data;
    }
  } catch (error) {
    console.error("Error analyzing document:", error);
    
    // Log more detailed error information
    if (axios.isAxiosError(error)) {
      console.error("API Error Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        }
      });
      
      if (error.response) {
        // Return the error message from the server if available
        return {
          message: "Error",
          error: error.response.data.error || "An error occurred while analyzing the document.",
        };
      }
    }
    
    // Generic error message
    return {
      message: "Error",
      error: "An error occurred while communicating with the server. Please try again later.",
    };
  }
}; 