import { LightningElement } from 'lwc';

export default class NoledgelossBooklet extends LightningElement {
    activeSectionMessage = '';

    handleToggleSection(event) {
        this.activeSectionMessage =
            'Open section name:  ' + event.detail.openSections;
    }

    handleSetActiveSectionC() {
        const accordion = this.template.querySelector('.example-accordion');

        accordion.activeSectionName = 'C';
    }

    hideModalBox(){
        this.dispatchEvent(new CustomEvent('closepopup'));
    }
}