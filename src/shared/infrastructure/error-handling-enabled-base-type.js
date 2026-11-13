/**
 * Provides reusable HTTP error translation for infrastructure services.
 */
export class ErrorHandlingEnabledBaseType {

    /**
     * Creates an operation-specific HTTP error handler with support for RFC 7807 Problem Details.
     *
     * @param {string} operation - Name of the failed operation.
     * @returns {(error: import('axios').AxiosError) => Promise<never>} Function that transforms an HTTP error into a rejected promise.
     */
    handleError(operation) {
        return (error) => {
            let errorMessage = operation;

            const responseData = error?.response?.data;
            const responseStatus = error?.response?.status ?? error?.status;
            const statusText = error?.response?.statusText ?? error?.statusText;
            const message = error?.message || error?.error?.message;

            // 1. Try RFC 7807 Problem Details fields from ASP.NET Core
            let problemMessage = null;
            if (responseData && typeof responseData === 'object') {
                if (responseData.detail) {
                    problemMessage = responseData.detail;
                } else if (responseData.errors && typeof responseData.errors === 'object') {
                    const validationMessages = Object.values(responseData.errors).flat().filter(Boolean);
                    if (validationMessages.length > 0) {
                        problemMessage = validationMessages.join(' ');
                    }
                } else if (responseData.title) {
                    problemMessage = responseData.title;
                }
            }

            if (problemMessage) {
                errorMessage = `${operation}: ${problemMessage}`;
            } else if (responseStatus === 404) {
                errorMessage = `${operation}: Resource not found`;
            } else if (error instanceof ErrorEvent || error?.error instanceof ErrorEvent) {
                errorMessage = `${operation}: ${message || 'Network error'}`;
            } else if (error?.code === 'ERR_NETWORK' || (!responseStatus && message)) {
                errorMessage = `${operation}: ${message}`;
            } else if (statusText) {
                errorMessage = `${operation}: ${statusText}`;
            } else if (message) {
                errorMessage = `${operation}: ${message}`;
            } else {
                errorMessage = `${operation}: Unexpected error`;
            }

            return Promise.reject(new Error(errorMessage));
        };
    }
}
