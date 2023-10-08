import { LightningElement,api } from 'lwc';

export default class KnowledgeUnitTooltip extends LightningElement {
    months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC"
      ];
      weekDaysFull = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ]
    @api tooltipData;
    connectedCallback(){
        console.log('tooltipData::::::::'+JSON.stringify(this.tooltipData));
    }
    get isZoomOrGmail(){
        return this.tooltipData?.Source === 'gmail' || this.tooltipData?.Source === 'zoom' ? true : false;
    }
    get month(){
        return this.months[new Date(this.tooltipData.Date).getMonth()];
    }
    get getFormattedDate(){
        const dateVal = this.tooltipData?.Date;
        const timeVal = this.tooltipData?.Time;
        const dt = new Date(dateVal);
        return this.weekDaysFull[dt.getDay()] + ", "+this.months[dt.getMonth()]+" "+dt.getDate()+", "+dt.getFullYear()+" "+timeVal;
    }
    get date(){
        return new Date(this.tooltipData.Date).getDate();
    }
}