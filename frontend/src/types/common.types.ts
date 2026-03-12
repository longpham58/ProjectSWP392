export interface ResponseDto<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// Helper methods for creating ResponseDto
export class ResponseDtoHelper {
  static success<T>(data: T, message: string = 'Success'): ResponseDto<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error<T = null>(message: string, data: T = null as T): ResponseDto<T> {
    return {
      success: false,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }
}