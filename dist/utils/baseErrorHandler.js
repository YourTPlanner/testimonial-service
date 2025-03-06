"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseErrorHandler = void 0;
class BaseErrorHandler {
    buildErrorResponse(error, message, statusCode) {
        return {
            success: false,
            error,
            message: message !== null && message !== void 0 ? message : "",
            statusCode: statusCode !== null && statusCode !== void 0 ? statusCode : 500,
        };
    }
}
exports.BaseErrorHandler = BaseErrorHandler;
