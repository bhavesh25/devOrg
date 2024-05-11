// parentComponent.js
import { LightningElement } from 'lwc';
import { initializeErrorHandling } from 'c/errorHandling';

export default class ParentComponent extends LightningElement {
    connectedCallback() {
        initializeErrorHandling(this.handleError.bind(this));

        // Simulate an error
        throw new Error('An uncaught exception occurred in ParentComponent!');
    }

    handleError(error) {
        console.error('Error handled in ParentComponent:', error.message);
        // Handle the error or log it as needed
    }
}
