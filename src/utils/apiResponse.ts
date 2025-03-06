import { Response } from "express";

interface ApiResponse {
    success: boolean;
    message?: string;
    data?: any;
    res : Response;
    statusCode ?: number | undefined;
}

interface ApiErrorResponse {
    success: boolean;
    message?: string | any;
    statusCode?: number;
    reason?: string | any;
    res : Response;
}

/**
 * Sends a successful API response.
 * @param res Express Response object
 * @param success Indicates if the operation was successful
 * @param message Success message
 * @param data Optional data to include in the response
 */
export const apiResponse = ({ message, res, success, data, statusCode } : ApiResponse): void => {
    if (res.headersSent) {
        return;
    }

    res.status(statusCode || 200).json({
        success,
        message,
        data,
    })
}

/**
 * Sends an error API response.
 * @param res Express Response object
 * @param message Error message
 * @param code HTTP status code (defaults to 500)
 * @param reason Additional information about the error
 */
export const apiErrorResponse = ({ statusCode, message, res, reason } : ApiErrorResponse): void => {
    
    if (res.headersSent) {
        return;
    }
    
    res.status(statusCode || 500).json({
        success: false,
        message,
        reason,
    })
}