/**
 * Standard API Response Structure from Backend
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  errors?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  meta?: {
    totalPages: number;
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Standardized error response
 */
export interface ApiErrorResponse {
  success: false;
  data: null;
  message: string;
  errors?: Record<string, any>;
}

/**
 * Type guard to check if response is successful
 */
export const isApiSuccess = <T>(
  response: any
): response is ApiResponse<T> => {
  return response && response.success === true;
};

/**
 * Type guard to check if error is API error
 */
export const isApiError = (error: any): error is ApiErrorResponse => {
  return error && error.success === false;
};
