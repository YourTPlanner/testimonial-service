

export interface IErrorResponse {
    success: boolean;
    error: any;
    message: string;
    statusCode: number;
}


export abstract class BaseErrorHandler {
    protected buildErrorResponse(error: any, message?: string, statusCode?: number): IErrorResponse {
        return {
            success: false,
            error,
            message : message ?? "",
            statusCode : statusCode ?? 500,
        }
    }
}