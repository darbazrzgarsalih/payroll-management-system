export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found.") {
        super(message, 404);
    }
}

export class BadRequestError extends AppError {
    constructor(message = "Bad request.") {
        super(message, 400);
    }
}

export class InternalServerError extends AppError {
    constructor(message = "Internal server error.") {
        super(message, 500);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized.") {
        super(message, 401)
    }
}