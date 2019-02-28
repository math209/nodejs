const { STATUS_CODES } = require('http');

class HttpError extends Error {
    constructor(status, message=STATUS_CODES[status]) {
        super(message);

        Error.captureStackTrace(this, this.constructor);

        this.name = 'HttpError';
        this.status = status;
        this.message = message || 'Error';
    }
}
exports.HttpError = HttpError;

class AuthError extends Error {
    constructor(message){
        super (message);

        Error.captureStackTrace(this, this.constructor);

        this.name = "AuthError";
        this.status = 403;
        this.message = message;
    }
}
exports.AuthError = AuthError;

class DataError extends Error {
    constructor(status, message){
        super (message);

        Error.captureStackTrace(this, this.constructor);

        this.name = "DataError";
        this.status = status;
        this.message = message;
    }
}
exports.DataError = DataError;