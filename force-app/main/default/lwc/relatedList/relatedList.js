import { LightningElement, track, api, wire } from "lwc";
import { NavigationMixin, CurrentPageReference } from "lightning/navigation";
import RelatedListHelper from "./relatedListHelper";
const linkField = "linkField";

export default class RelatedList extends NavigationMixin(LightningElement) {
    @track state = {};
    @api sobjectApiName;
    @api relatedFieldApiName;
    @api numberOfRecords = 6;
    @api sortedBy;
    @api sortedDirection = "ASC";
    @api rowActionHandler;
    @api fields;
    @api relatedListLabel = "";
    @api customActions = [];
    @api filterCondition = "";
    @api recordIdPrefixForUrl = "";
    @api linkField = "";
    @api fieldLabel = "";
    @api isViewAllPage = false;
    @api viewAllPageHeight = 400;
    @api communityViewAllPageUrl = "";
    @api fieldType = "";
    @api parentObjNameField;
    showSpinner = false;

    @api c__sobjectApiName;
    @api c__relatedFieldApiName;
    @api c__numberOfRecords;
    @api c__sortedBy;
    @api c__sortedDirection = "ASC";
    @api c__fields;
    @api c__relatedListLabel = "";
    @api c__filterCondition = "";
    @api c__recordIdPrefixForUrl = "";
    @api c__linkField = "";
    @api c__fieldLabel = "";
    @api c__isViewAllPage;
    @api c__viewAllPageHeight = 400;
    @api c__fieldType = "";
    @api c__recordId;
    @api c__parentObjNameField;
    totalNumberOfRows = 0;
    loadMoreStatus;
    dataLoadedCount = 0;
    targetDatatable;
    labelArray = [];

    //delete after
    loadMoreCount = 0;

    helper = new RelatedListHelper();
    connectedCallback() {


        this.labelArray = this.fieldLabel.split(",");
        this.init();
    }

    @track currentPageReference;
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
        if (this.currentPageReference?.state?.c__sobjectApiName) {
            this.sobjectApiName = this.currentPageReference?.state?.c__sobjectApiName;
        }
        if (this.currentPageReference?.state?.c__relatedFieldApiName) {
            this.relatedFieldApiName = this.currentPageReference?.state?.c__relatedFieldApiName;
        }
        if (this.currentPageReference?.state?.c__numberOfRecords) {
            this.numberOfRecords = Number(this.currentPageReference?.state?.c__numberOfRecords);
        }
        if (this.currentPageReference?.state?.c__sortedBy) {
            this.sortedBy = this.currentPageReference?.state?.c__sortedBy;
        }
        if (this.currentPageReference?.state?.c__sortedDirection) {
            this.sortedDirection = this.currentPageReference?.state?.c__sortedDirection;
        }
        if (this.currentPageReference?.state?.c__fields) {
            this.fields = this.currentPageReference?.state?.c__fields;
        }
        if (this.currentPageReference?.state?.c__relatedListLabel) {
            this.relatedListLabel = this.currentPageReference?.state?.c__relatedListLabel;
        }
        if (this.currentPageReference?.state?.c__filterCondition) {
            this.filterCondition = this.currentPageReference?.state?.c__filterCondition;
        }
        if (this.currentPageReference?.state?.c__recordIdPrefixForUrl) {
            this.recordIdPrefixForUrl = this.currentPageReference?.state?.c__recordIdPrefixForUrl;
        }
        if (this.currentPageReference?.state?.c__linkField) {
            this.linkField = this.currentPageReference?.state?.c__linkField;
        }
        if (this.currentPageReference?.state?.c__fieldLabel) {
            this.fieldLabel = this.currentPageReference?.state?.c__fieldLabel;
        }
        if (this.currentPageReference?.state?.c__isViewAllPage) {
            this.isViewAllPage = this.currentPageReference?.state?.c__isViewAllPage;
        }
        if (this.currentPageReference?.state?.c__viewAllPageHeight) {
            this.viewAllPageHeight = this.currentPageReference?.state?.c__viewAllPageHeight;
        }
        if (this.currentPageReference?.state?.c__fieldType) {
            this.fieldType = this.currentPageReference?.state?.c__fieldType;
        }
        if (this.currentPageReference?.state?.c__recordId) {
            this.recordId = this.currentPageReference?.state?.c__recordId;
        }
        if( this.currentPageReference?.state?.c__parentObjNameField){
            this.parentObjNameField = this.currentPageReference?.state?.c__parentObjNameField;
        }
    }


    openViewAll() {
        this[NavigationMixin.GenerateUrl]({
            type: "standard__navItemPage",
            attributes: {
                apiName: 'Related_List'
            },
            state: {
                c__sobjectApiName: this.sobjectApiName,
                c__relatedFieldApiName: this.relatedFieldApiName,
                c__numberOfRecords: 50,
                c__sortedBy: this.sortedBy,
                c__sortedDirection: this.sortedDirection,
                c__fields: this.fields,
                c__relatedListLabel: this.relatedListLabel,
                c__filterCondition: this.filterCondition,
                c__recordIdPrefixForUrl: this.recordIdPrefixForUrl,
                c__linkField: this.linkField,
                c__fieldLabel: this.fieldLabel,
                c__isViewAllPage: true,
                c__viewAllPageHeight: this.viewAllPageHeight,
                c__fieldType: this.fieldType,
                c__recordId: this.recordId,
                c__parentObjNameField: this.parentObjNameField
            }
        }).then(url => {
            window.open(url, "_blank");
        });
    }

    @api
    get recordId() {
        return this.state.recordId;
    }

    set recordId(value) {
        this.state.recordId = value;
        this.init();
    }
    get hasRecords() {
        return this.state.records != null && this.state.records.length;
    }

    get datatableMaxHeight() {
        //return `max-height:${this.viewAllPageHeight}px`;
        return `height: ${this.viewAllPageHeight}px;overflow:scroll`
    }
    get datatableHeight() {
        return `height: ${this.viewAllPageHeight}px;overflow:scroll`;
    }

    openObjectHomeHandler() {
        this[NavigationMixin.Navigate]({
          type: "standard__objectPage",
          attributes: {
            objectApiName: this.state.sObjName,
            actionName: "home"
          }
        });
      }

      openRecordPage(){
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
              objectApiName: this.state.sObjName,
              actionName: "view",
              recordId: this.recordId
            }
          });
      }

    async init() {
        debugger;
        this.showSpinner = true;
        this.state.showRelatedList = this.recordId != null;
        if (
            !(
                this.recordId &&
                this.sobjectApiName &&
                this.relatedFieldApiName &&
                this.fields &&
                this.relatedListLabel &&
                this.filterCondition &&
                this.parentObjNameField
            )
        ) {
            //this.state.records = [];
            return;
        }

        if(this.targetDatatable){
            this.targetDatatable.enableInfiniteLoading = true;
        }

        this.state.fields = this.fields;
        this.state.relatedFieldApiName = this.relatedFieldApiName;
        this.state.recordId = this.recordId;
        this.state.numberOfRecords = Number(this.numberOfRecords);
        this.state.sobjectApiName = this.sobjectApiName;
        this.state.sortedBy = this.sortedBy;
        this.state.sortedDirection = this.sortedDirection;
        this.state.customActions = this.customActions;
        this.state.filterCondition = this.filterCondition;
        this.state.parentObjNameField = this.parentObjNameField;
        this.state.offsetNumber = this.numberOfRecords;

        const data = await this.helper.fetchData(this.state);
        if (!data) {
            return;
        }

        this.state.sObjName = data.sObjName;
        this.state.pluralLabel = data.pluralLabel;
        this.state.records = this.processRecords(data.records);
        this.state.iconName = data.iconName;
        this.state.sobjectLabel = data.sobjectLabel;
        this.state.sobjectLabelPlural = data.sobjectLabelPlural;
        this.state.title = data.title;
        this.state.parentRelationshipApiName = data.parentRelationshipApiName;
        this.state.columns = this.createColumn(
            this.fields.trim().replace(/ /g, ""),
            data.fieldLabel
        ); //this.helper.initColumnsWithActions(this.columns, this.customActions)
        console.log("======" + JSON.stringify(this.state.columns));
        this.totalNumberOfRows = data.totalCount;
        this.state.totalNumberOfRows = data.totalCount;
        this.state.dataLoadedCount =  this.state.records.length;
        this.dataLoadedCount = this.state.records.length;
        this.state.parentRecName = data.parentRecordName;
        this.showSpinner = false;
    }

    processRecords(records) {
        let recordsToDisplay = [];
        records.forEach((record) => {
            let fields = {};
            if (this.linkField) {
                fields[linkField] = this.recordIdPrefixForUrl + record.Id;
            }
            this.fields.split(",").forEach((element) => {
                if (element.includes(".")) {
                    let fldValue;
                    element.split(".").forEach((fld) => {
                        fldValue = fldValue ? fldValue[fld.trim()] : record[fld.trim()];
                    });
                    fields[element.trim()] = fldValue;
                } else {
                    fields[element.trim()] = record[element.trim()];
                }
            });
            fields.Id = record.Id;
            recordsToDisplay.push(fields);
        });
        return recordsToDisplay;
    }

    createColumn(fields, labels) {
        let column = [];
        const labelList = this.fieldType.split(",");
        if (fields.includes(",")) {
            fields.split(",").forEach((field, index) => {
                const label = labelList[index] ? labelList[index]?.trim() : "text";
                if (field !== "Id" && field !== "id") {
                    if (field === this.linkField) {
                        let col = {
                            label: this.labelArray[index].trim(),
                            fieldName: linkField,
                            type: "url",
                            typeAttributes: { label: { fieldName: field }, target: "_blank" },
                            wrapText: true,
                            hideDefaultActions: true
                        };
                        column.push(col);
                    } else {
                        let col = {
                            label: this.labelArray[index].trim(),
                            fieldName: field,
                            wrapText: true,
                            hideDefaultActions: true,
                            type: label
                        };
                        if (label === "date-time") {
                            col.type = "date";
                            col.typeAttributes = {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit"
                            };
                        }
                        column.push(col);
                    }
                }
            });
        } else {
            if (fields !== "Id" && fields !== "id") {
                let col = { label: labels, fieldName: fields };
                column.push(col);
            }
        }
        return column;
    }

    get viewAllLink() {
        return `${this.communityViewAllPageUrl}?relatedListLabel=${this.relatedListLabel}&sobjectApiName=${this.sobjectApiName}&relatedFieldApiName=${this.relatedFieldApiName}&sortedBy=${this.sortedBy}&sortedDirection=${this.sortedDirection}&fields=${this.fields}&fieldLabel=${this.fieldLabel}&linkField=${this.linkField}&filterCondition=${this.filterCondition}&recordIdPrefixForUrl=${this.recordIdPrefixForUrl}`;
    }

    handleRefreshData() {
        this.init();
    }

    loadMoreData(event) {
        this.loadMoreCount++;
        if (this.loadMoreCount >= 40) {
            console.log("==========infinite");
            return;
        }
        this.targetDatatable = event.target;
        this.targetDatatable.enableInfiniteLoading = false;
        if (this.totalNumberOfRows < this.numberOfRecords) {
            this.disableInfiniteScroll();
            this.loadMoreStatus = "";
            return;
        }
        //Display a spinner to signal that data is being loaded
        event.target.isLoading = true;
        
        //Display "Loading" when more data is being loaded
        this.loadMoreStatus = "Loading";

        if (this.dataLoadedCount >= this.totalNumberOfRows) {
            this.disableInfiniteScroll();
            return;
        } 
        this.getMoreData();
        event.target.isLoading = false;
    }



    async getMoreData() {
        if (!this.targetDatatable.enableInfiniteLoading) {
            //return;
        }
        const stateCopy = JSON.parse(JSON.stringify(this.state));
        stateCopy.records = [];
        const data = await this.helper.fetchMoreData(stateCopy);
        this.targetDatatable.enableInfiniteLoading = true;
        if (!data || !data.records) {
            this.targetDatatable.enableInfiniteLoading = false;
            return;
        }
        
        const currentData = this.state.records;
        const newData = currentData.concat(this.processRecords(data.records));
        this.state.records = newData;
        console.log('===records count'+ newData.length);
        this.state.dataLoadedCount = newData.length;
        this.state.offsetNumber = newData.length;
        this.dataLoadedCount = newData.length;
        this.loadMoreStatus = "";
        if (this.dataLoadedCount >= this.totalNumberOfRows) {
            this.state.title = ` (${this.dataLoadedCount})`;
            this.disableInfiniteScroll();
        } else {
            this.state.title = ` (${this.dataLoadedCount}+)`;
        }
        this.targetDatatable.isLoading = false;
    }

    disableInfiniteScroll() {
        this.targetDatatable.enableInfiniteLoading = false;
        this.loadMoreStatus = "No more data to load";
    }
}
