class AppError extends Error {
    public statusCode: number;
    public status: string | boolean;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? false : 'error';
        this.isOperational = true; // for third-party APIs error or optional error

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
