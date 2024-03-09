export default class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);

    this.statusCode = statusCode || 500;
    this.message = message || 'Internal server error';

    Error.captureStackTrace(this, this.constructor);
  }
}
