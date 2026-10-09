/**
 * Provides reusable HTTP error translation for infrastructure services.
 */
export class ErrorHandlingEnabledBaseType {

    /**
     * Creates an operation-specific HTTP error handler.
     *
     * The three cases are preserved from the original model: a 404 gets a
     * "not found" message, a network/ErrorEvent failure forwards the
     * underlying message, and anything else falls back to the status text.
     *
     * @param {string} operation - Name of the failed operation.
     * @returns {(error: import('axios').AxiosError) => Promise<never>} Function that transforms an HTTP error into a rejected promise.
     */
    handleError(operation) {
        return (error) => {
            let errorMessage = operation;

            const responseStatus = error?.response?.status ?? error?.status;
            const statusText = error?.response?.statusText ?? error?.statusText;
            const message = error?.message || error?.error?.message;

            if (responseStatus === 404) {
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