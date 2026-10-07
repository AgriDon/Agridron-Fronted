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

            if (error.status === 404) {
                errorMessage = `${operation}: Resource not found`;
            } else if (error.error instanceof ErrorEvent) {
                errorMessage = `${operation}: ${error.error.message}`;
            } else {
                errorMessage = `${operation}: ${error.statusText || 'Unexpected error'}`;
            }

            return Promise.reject(new Error(errorMessage));
        };
    }
}