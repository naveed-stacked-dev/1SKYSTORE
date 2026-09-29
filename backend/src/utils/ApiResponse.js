/**
 * Standard API response wrapper
 * Ensures consistent response format across all endpoints
 */
class ApiResponse {
  constructor(statusCode, message, data = null, error = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.error = error;
  }

  static success(res, message = 'Success', data = null, statusCode = 200) {
    return res.status(statusCode).json({
      statusCode,
      success: true,
      message,
      data,
      error: null,
    });
  }

  static created(res, message = 'Created successfully', data = null) {
    return ApiResponse.success(res, message, data, 201);
  }

  static error(res, statusCode = 500, message = 'Error', error = null) {
    return res.status(statusCode).json({
      statusCode,
      success: false,
      message,
      data: null,
      error,
    });
  }

  static paginated(res, message, data, pagination) {
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message,
      data,
      pagination,
      error: null,
    });
  }
}

module.exports = ApiResponse;
