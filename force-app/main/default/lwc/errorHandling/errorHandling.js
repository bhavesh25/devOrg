// errorHandling.js
export const initializeErrorHandling = (callback) => {
    window.addEventListener('error', (event) => {
        // Extract relevant error information from the event
        const error = {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error,
        };

        // Call the provided callback function
        if (callback) {
            callback(error);
        }

        // Additional global error handling logic
        console.error('Global error handled:', error.message);
        // You can add more logic here, such as sending errors to a logging service
    });
};
