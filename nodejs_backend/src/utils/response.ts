/**
 * 创建标准API响应格式
 */
export function createApiResponse(
  success: boolean,
  data?: any,
  message?: string,
  error?: string
) {
  return {
    success,
    data,
    message,
    error,
    timestamp: new Date().toISOString()
  };
}

/**
 * 创建成功响应
 */
export function createSuccessResponse(data?: any, message?: string) {
  return createApiResponse(true, data, message);
}

/**
 * 创建错误响应
 */
export function createErrorResponse(error: string, data?: any) {
  return createApiResponse(false, data, undefined, error);
} 