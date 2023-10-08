import { LightningElement, wire, api, track } from "lwc";
import getDataJson from "@salesforce/apex/knowledgeUnitGraphHelper.getDataJson";
import getImageUrls from "@salesforce/apex/knowledgeUnitGraphHelper.getImageUrls";

export default class KnowledgeUnitGraph extends LightningElement {
  @api recordId; // This property is automatically populated with the record Id
  @track currentActiveMonth = "";
  @track currentActiveYear = "";
  @track noAnalytics = true;
  @track TeamOptionsTab = false;

  @track TimeStamps = [];
  @track visibleTimeStamps = [];
  @track TimeStampsCount = 1;
  @track DayStamps = [];
  @track positionsData = [];

  weekDays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  weekDaysFull = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
  
  months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec"
  ];

  @track apiData = [];
  @track jsonData = [{ events: [] }];
  @track imageIcons = {};

  @track TeamOptions = [{ Label: "All", Value: true }];

  connectedCallback() {
    getImageUrls()
      .then((result) => {
        result.forEach((element) => {
          this.imageIcons["" + element.Name + ""] = element.Image_Link__c;
        });

        getDataJson({ recordID: this.recordId })
          .then((result) => {
            this.apiData = result;
            this.currentActiveMonth = this.months[new Date().getMonth()];
            this.currentActiveYear = new Date().getFullYear();

            this.resetTemasDropDown();

            this.jsonData[0].events = this.apiData[0].events.filter(
              (element) => {
                return (
                  new Date(element.event_date).getMonth() ==
                  new Date().getMonth() &&
                  new Date(element.event_date).getFullYear() ==
                  new Date().getFullYear()
                );
              }
            );
            this.noAnalytics = this.jsonData[0].events.length == 0;
            this.initializeGraph();
          })
          .catch((error) => {
            console.log(error);
            this.currentActiveMonth = this.months[new Date().getMonth()];
            this.currentActiveYear = new Date().getFullYear();
            this.noAnalytics = this.jsonData[0].events.length == 0;
            this.initializeGraph();
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  resetTemasDropDown() {
    this.TeamOptions = [{ Label: "All", Value: true }];
    this.apiData[0].events.forEach((element) => {
      let availableElements = this.TeamOptions.filter((elm) => {
        return elm.Label == element.event_team;
      });
      if (availableElements.length == 0) {
        this.TeamOptions.push({ Label: element.event_team, Value: false });
      }
    });
  }

  SyncData() {
    getDataJson({ recordID: this.recordId })
      .then((result) => {
        this.apiData = result;
        this.resetTemasDropDown();

        this.jsonData[0].events = this.apiData[0].events.filter((element) => {
          return (
            new Date(element.event_date).getMonth() ==
            this.months.indexOf(this.currentActiveMonth) &&
            new Date(element.event_date).getFullYear() == this.currentActiveYear
          );
        });
        this.noAnalytics = this.jsonData[0].events.length == 0;
        this.initializeGraph();
      })
      .catch((error) => {
        console.log(error);
        this.currentActiveMonth = this.months[new Date().getMonth()];
        this.currentActiveYear = new Date().getFullYear();
        this.noAnalytics = this.jsonData[0].events.length == 0;
        this.initializeGraph();
      });
  }

  dateChanged(event) {
    let dateValue = event.target.value;
    if (dateValue == "") {
      this.currentActiveMonth = this.months[new Date().getMonth()];
      this.currentActiveYear = new Date().getFullYear();
    } else {
      this.currentActiveMonth = this.months[new Date(dateValue).getMonth()];
      this.currentActiveYear = new Date(dateValue).getFullYear();
    }
    this.jsonData[0].events = this.apiData[0].events.filter((element) => {
      return (
        new Date(element.event_date).getDate() ==
        new Date(dateValue).getDate() &&
        new Date(element.event_date).getMonth() ==
        this.months.indexOf(this.currentActiveMonth) &&
        new Date(element.event_date).getFullYear() == this.currentActiveYear
      );
    });
    this.noAnalytics = this.jsonData[0].events.length == 0;
    this.resetTemasDropDown();
    this.initializeGraph();
  }

  teamMenuClick() {
    this.TeamOptionsTab = !this.TeamOptionsTab;
  }

  teamSelected(event) {
    event.preventDefault();
    let filterList = [];
    let targetName = event.target.dataset.name;
    if (targetName == "All") {
      this.TeamOptions.forEach((element) => {
        element.Value = element.Label == "All";
        filterList.push(element.Label);
      });
    } else {
      this.TeamOptions.forEach((element) => {
        element.Label == "All"
          ? (element.Value = false)
          : element.Label == targetName
            ? (element.Value = !element.Value)
            : (element.Value = element.Value);
        filterList.push(element.Label);
      });
      let check = false;
      let TempList = [];
      this.TeamOptions.forEach((element) => {
        if (element.Label != "All" && element.Value == true) {
          check = true;
          TempList.push(element.Label);
        }
      });
      if (!check) {
        this.TeamOptions[0].Value = true;
      } else {
        filterList = TempList;
      }
    }
    this.teamMenuClick();
    this.jsonData[0].events = this.apiData[0].events.filter((element) => {
      return (
        new Date(element.event_date).getMonth() ==
        this.months.indexOf(this.currentActiveMonth) &&
        new Date(element.event_date).getFullYear() == this.currentActiveYear &&
        filterList.includes(element.event_team)
      );
    });
    this.noAnalytics = this.jsonData[0].events.length == 0;
    this.initializeGraph();
  }

  initializeGraph() {
    this.positionsData = [];
    this.TimeStamps = [];
    this.visibleTimeStamps = [];
    this.DayStamps = [];
    this.TimeStampsCount = 1;
    this.jsonData[0].events.forEach((element) => {
      if (!this.TimeStamps.includes(element.event_time)) {
        this.TimeStamps.push(element.event_time);
      }
    });
    this.TimeStamps.sort(function (a, b) {
      return parseFloat(a) - parseFloat(b);
    });
    let timeCount = 0;
    this.TimeStamps.forEach((element) => {
      if (timeCount <= 3) {
        this.visibleTimeStamps.push(element);
        timeCount++;
      }
    });

    this.manageVisibleTimeStamps();
    this.visibleTimeStamps.reverse();
    this.assignPositions();
  }

  assignPositions() {
    this.DayStamps.forEach((elm) => {
      elm.Images = [];
    });

    let todayDateFound = false;
    this.jsonData[0].events.forEach((element) => {
      let hasData = false;
      this.DayStamps.forEach((elm) => {
        if (elm.Date == new Date(element.event_date).getDate()) {
          //&& elm.Time == element.event_time && elm.Day == this.weekDays[new Date(element.event_date).getDay()]
          hasData = true;
          // if (elm.Images.length < 2) {
          elm.Images.push({
            Img: this.imageIcons[
              "" + element.event_interaction_source.toLowerCase() + ""
            ],
            Time: element.event_time,
            Team: element.event_team,
            Name: element.event_name,
            Description: element.event_description,
            Action: element.action_needed,
            Source: "" + element.event_interaction_source.toLowerCase() + "",
            //DateFormatted: "Tuesday, July 4th, 2023 10:00 - 11:30",
            DateFormatted: this.getFormattedDate(element.event_date, element.event_time),
            Date: element.event_date,
            Id: ""+element.event_time+element.event_date+element.event_name,
            showTooltip: false

          });
          // } else {
          //     elm.ImagesExtra.push({ Img: this.imageIcons["" + element.event_interaction_source.toLowerCase() + ""],Time: element.event_time,  Team: element.event_team, Name: element.event_name, Description: element.event_description, Action: element.action_needed });
          // }
        }
      });
      if (!hasData) {
        this.DayStamps.push({
          Date: new Date(element.event_date).getDate(),
          ShowDate:
            new Date(element.event_date) == new Date()
              ? (todayDateFound = true)
              : false,
          Day: this.weekDays[new Date(element.event_date).getDay()],
          Images: [
            {
              Img: this.imageIcons[
                "" + element.event_interaction_source.toLowerCase() + ""
              ],
              Time: element.event_time,
              Team: element.event_team,
              Name: element.event_name,
              Description: element.event_description,
              Source: "" + element.event_interaction_source.toLowerCase() + "",
              Action: element.action_needed,
              DateFormatted: this.getFormattedDate(element.event_date, element.event_time),
              Date: element.event_date
            }
          ],
          Source: "" + element.event_interaction_source.toLowerCase() + "",
          ImagesExtra: [],
          Classes:
            new Date(element.event_date) <= new Date()
              ? "imgCover"
              : "imgCover inactive"
        });
      }
    });

    if (
      !todayDateFound &&
      this.currentActiveYear == new Date().getFullYear() &&
      this.currentActiveMonth == this.months[new Date().getMonth()]
    ) {
      this.DayStamps.push({
        Date: new Date().getDate(),
        ShowDate: true,
        Time: "12:00",
        Day: this.weekDays[new Date(new Date()).getDay()],
        Images: [],
        ImagesExtra: [],
        Classes: "imgCover"
      });
    }

    this.DayStamps.sort(function (a, b) {
      return new Date(a.Date) - new Date(b.Date);
    });

    console.log(
      "this.DayStamps : ",
      JSON.parse(JSON.stringify(this.DayStamps))
    );

    this.DayStamps.forEach((element) => {
      let positions = [];
      this.visibleTimeStamps.forEach((elm) => {
        let TempPosition = [];
        let TempPositionSecondary = [];
        let count = 0;
        element.Images.forEach((ele) => {
          if (ele.Time == elm) {
            if (count < 2) {
              TempPosition.push(ele);
            } else {
              TempPositionSecondary.push(ele);
            }
            count++;
          }
        });
        if (TempPositionSecondary.length > 0) {
          positions.push({
            primary: TempPosition,
            secondary: [...TempPosition, ...TempPositionSecondary],
            Classes: element.Classes
          });
        } else {
          positions.push({ primary: TempPosition, Classes: element.Classes });
        }
      });

      this.positionsData.push(positions);
    });
    console.log('Position Date :: ' + JSON.stringify(this.positionsData));

    if (this.noAnalytics) {
      this.visibleTimeStamps = ["22:00", "19:00", "15:00", "13:00"];
      this.DayStamps = [
        { Day: "TU" },
        { Day: "WE" },
        { Day: "FR" },
        { Day: "TH" },
        { Day: "SA" },
        { Day: "MO" },
        { Day: "TU" },
        { Day: "TH" }
      ];
    }
  }

  manageVisibleTimeStamps() {
    let count = 0;
    let LoopLenght = 4 - this.visibleTimeStamps.length;
    for (let i = 0; i < LoopLenght; i++) {
      this.visibleTimeStamps.push("");
      count++;
    }
  }

  getFormattedDate(dateVal, timeVal){
    const dt = new Date(dateVal);
    return this.weekDaysFull[dt.getDay()] + ", "+this.months[dt.getMonth()]+" "+dt.getDate()+", "+dt.getFullYear()+" "+timeVal;
  }
  timeStampController(event) {
    switch (event.target.dataset.name) {
      case "Add":
        if (this.TimeStamps.length > this.TimeStampsCount * 4) {
          this.visibleTimeStamps = [];
          let count = 1;
          let secondaryCount = 0;
          this.TimeStamps.forEach((element) => {
            if (count > this.TimeStampsCount * 4) {
              if (secondaryCount <= 4) {
                this.visibleTimeStamps.push(element);
                secondaryCount++;
              }
            }
            count++;
          });
          this.TimeStampsCount++;
          this.positionsData = [];
          this.manageVisibleTimeStamps();
          this.visibleTimeStamps.reverse();
          this.assignPositions();
        }
        break;
      case "Remove":
        if (this.TimeStampsCount > 1) {
          this.TimeStampsCount--;

          this.visibleTimeStamps = [];
          let count = 1;
          let secondaryCount = 0;
          this.TimeStamps.forEach((element) => {
            if (
              count > (this.TimeStampsCount - 1) * 4 &&
              count <= this.TimeStampsCount * 4
            ) {
              if (secondaryCount <= 4) {
                this.visibleTimeStamps.push(element);
                secondaryCount++;
              }
            }
            count++;
          });

          this.positionsData = [];
          this.manageVisibleTimeStamps();
          this.visibleTimeStamps.reverse();
          this.assignPositions();
        }
        break;
    }
  }

  calenderController(event) {
    this.resetTemasDropDown();
    switch (event.target.dataset.name) {
      case "Past":
        if (this.currentActiveMonth == "Jan") {
          this.currentActiveMonth = "Dec";
          this.currentActiveYear = this.currentActiveYear - 1;
        } else {
          this.currentActiveMonth =
            this.months[this.months.indexOf(this.currentActiveMonth) - 1];
        }
        break;
      case "Future":
        if (this.currentActiveMonth == "Dec") {
          this.currentActiveMonth = "Jan";
          this.currentActiveYear = this.currentActiveYear + 1;
        } else {
          this.currentActiveMonth =
            this.months[this.months.indexOf(this.currentActiveMonth) + 1];
        }
        break;
    }
    this.jsonData[0].events = this.apiData[0].events.filter((element) => {
      return (
        new Date(element.event_date).getMonth() ==
        this.months.indexOf(this.currentActiveMonth) &&
        new Date(element.event_date).getFullYear() == this.currentActiveYear
      );
    });

    this.noAnalytics = this.jsonData[0].events.length == 0;
    this.initializeGraph();
  }

  handleClick(event) {
    if (event.currentTarget.querySelector(".secondaryIconsList") != null) {
      if (
        event.currentTarget.querySelector(".secondaryIconsList").style
          .display == "flex"
      ) {
        event.currentTarget.querySelector(".secondaryIconsList").style.display =
          "none";
      } else {
        event.currentTarget.querySelector(".secondaryIconsList").style.display =
          "flex";
      }
    }
  }

  scrolled(event) {
    this.template.querySelector(".graphBottom").scrollLeft =
      parseFloat(event.currentTarget.scrollLeft) + 12.800003051757812;
  }
}