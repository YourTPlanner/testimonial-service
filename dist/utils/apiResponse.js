"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiErrorResponse = exports.apiResponse = void 0;
/**
 * Sends a successful API response.
 * @param res Express Response object
 * @param success Indicates if the operation was successful
 * @param message Success message
 * @param data Optional data to include in the response
 */
const apiResponse = ({ message, res, success, data, statusCode }) => {
    if (res.headersSent) {
        return;
    }
    res.status(statusCode || 200).json({
        success,
        message,
        data,
    });
};
exports.apiResponse = apiResponse;
/**
 * Sends an error API response.
 * @param res Express Response object
 * @param message Error message
 * @param code HTTP status code (defaults to 500)
 * @param reason Additional information about the error
 */
const apiErrorResponse = ({ statusCode, message, res, reason }) => {
    if (res.headersSent) {
        return;
    }
    res.status(statusCode || 500).json({
        success: false,
        message,
        reason,
    });
};
exports.apiErrorResponse = apiErrorResponse;
