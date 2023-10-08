import { LightningElement ,track} from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import CanvasJS from '@salesforce/resourceUrl/CanvasJS';
export default class KnowledgeUnit extends LightningElement {
      @track chartInitialized = false;
      @track calendar;
datas= [
        {"customer_booklet":"Strategic explanation not only shows who she currently works with but also shows other potential customers within the org that share the same needs as the current customer she is talking too. she gave an example with a customer she has in coca cola north America (a market researcher) and mentioned there is an equivalent position in the sprite, that might be interested in her solution. however, since the org is big there is no direct connection between the two positions, and if she could draw an organizational path to get there that would help her.",
        "customer_champion_postion":"VP of customer Scuess ",
        "customer_champoion_name":"Mike",
        "customer_name":"Centrical",
        "entities":["Mike .","Nathalie Chu (#Champion, #DecsionMaker).","James Norrington (#DecsionMaker)."],
        "events":[
          {"event_date":"2023-06-02","event_description":"Launch of new product at the trade show","event_interaction_source":"Salesforce","event_name":"Product Launch","event_team":"Customer Support","event_time":"13:00","url":"https://noledgeloss2-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0158d000001jGmd&oid=00D8d00000AW0CS&lastMod=1687261089000"},
          {"event_date":"2023-06-01","event_description":"Launch of new product at the trade show","event_interaction_source":"Salesforce","event_name":"Product Launch","event_team":"Customer Support","event_time":"12:00","url":"https://noledgeloss2-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0158d000001jGmd&oid=00D8d00000AW0CS&lastMod=1687261089000"},
          {"event_date":"2022-05-03","event_description":"Launch of new product at the trade show","event_interaction_source":"Googledrive","event_name":"Product Launch","event_team":"Customer Support","event_time":"13:00","url":"https://noledgeloss2-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0158d000001jGmY&oid=00D8d00000AW0CS&lastMod=1687261063000"},
          {"event_date":"2023-05-03","event_description":"Launch of new product at the trade show","event_interaction_source":"google spreadsheet","event_name":"Product Launch","event_team":"SaLes","event_time":"13:00","url": "https://noledgeloss2-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0158d000001jGmi&oid=00D8d00000AW0CS&lastMod=1687261117000"},
          {"event_date":"2023-01-31","event_description":"Launch of new product at the trade show","event_interaction_source":"Jira","event_name":"Product Launch","event_team":"Customer Support","event_time":"13:00","url": "https://cyntexa-17e-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0155i000000251S&oid=00D5i00000EUxC3&lastMod=1687154260000"},
          {"event_date":"2023-04-01","event_description":"Celebrating my friend's birthday","event_interaction_source":"zoom","event_name":"Birthday Party","event_team":"Customer Support.","event_time":"21:00","url": "https://noledgeloss2-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0158d000001jGnR&oid=00D8d00000AW0CS&lastMod=1687261385000"},
          {"event_date":"2023-05-02","event_description":"Celebrating my friend's birthday","event_interaction_source":"zoom","event_name":"Birthday Party","event_team":"Customer Support.","event_time":"22:00","url": "https://noledgeloss2-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0158d000001jGnR&oid=00D8d00000AW0CS&lastMod=1687261385000"},
          {"event_date":"2023-06-03","event_description":"Launch of new product at the trade show","event_interaction_source":"Jira","event_name":"Product Launch","event_team":"Customer Support","event_time":"14:00","url":"https://cyntexa-17e-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0155i000000251S&oid=00D5i00000EUxC3&lastMod=1687154260000"}
          ],
          "intention":["Mike able to renew.","Reach out to all at-risk account.","James Norrington is a influncer."],
          "sentimant_summarry":["The customer expressed dissatisfaction with the latest features.","The latest features failed to meet the customer's expectations.","The customer was disappointed by the latest features.",
          "The customer voiced concerns about the latest features.","The customer was not satisfied with the latest features."]}]
    @track datacord=[];
    year;
    monthno;
    day=[];
    min=10;
    max=16;
    images = [];
  connectedCallback() {
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const d = new Date();
      this.year=d.getFullYear();
      this.monthno=d.getMonth();
      this.months = month[d.getMonth()];
      this.calendar=this.months+' '+this.year;
      let dataevent= this.datas[0].events;
       // console.log('dataset',JSON.stringify(dataevent));
        const weekday=['SUN','MON','TUE','WED','THU','FRI','SAT'];
       let datasetlist =[];
        for(let i=0;i<dataevent.length;i++){
            
              const d=new Date(dataevent[i].event_date);
              let x=d.getDay(d);
              console.log('x',x);
              let dataMonth=d.getMonth();
              console.log('dataMonth',dataMonth);
              let dataYear=d.getFullYear();
              console.log('dataYear',dataYear);
            /* days.push(x);
             if(i>weekday.length){
                   console.log()
             }
             else{*/
             
              console.log('xxx',weekday[x]);
             
              let text=dataevent[i].event_time;
          //   const myArray = text.split(":");
             // let word=myArray[0];
              let yaxis=parseInt(text);
              console.log('yyy',yaxis);
              if( dataYear == this.year && dataMonth == this.monthno ){
              let dataset ={ label:weekday[x], y: yaxis , eventName:dataevent[i].event_name ,eventTeam: dataevent[i].event_team, eventDesc:dataevent[i].event_description } 
              let dataImage={url: dataevent[i].url};
             
               this.images.push(dataImage);
              this.datacord.push(dataset);
              }
              else{
                console.log('No data added');
              }
         }
        
         console.log('datacord',this.datacord);
        
    if (this.chartInitialized) {
      return;
    }
    this.chartInitialized = true;

    Promise.all([loadScript(this, CanvasJS)]).then(() => {
      this.initializeChart();
    })
    .catch((error) =>{
            console.log('Error'+ error);
    })
   
  }
  decreaseMonth(){
     this.chartInitialized=false;
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
     console.log('this.monthno',this.monthno);

     let currentMonth;
     let currentyear;
     if(this.monthno==0){
       let count=this.monthno+11;
       currentMonth = month[count];
       currentyear =  this.year-1;
       this.year=currentyear;
       this.monthno=count;
       this.calendar = currentMonth +' '+currentyear;
       
     }
     else{
          let count=this.monthno-1;
          currentMonth = month[count];
          this.monthno=count;
          this.calendar = currentMonth +' '+this.year;
          console.log('currentMonth',currentMonth);
          console.log('year',this.year);
          console.log('in decrease',this.calendar);
     }
      this.images=[];
      this.datacord=[];
         let dataevent= this.datas[0].events;
       // console.log('dataset',JSON.stringify(dataevent));
        const weekday=['SUN','MON','TUE','WED','THU','FRI','SAT'];
       let datasetlist =[];
        for(let i=0;i<dataevent.length;i++){
            
              const d=new Date(dataevent[i].event_date);
              let x=d.getDay(d);
              let dataMonth=d.getMonth();
              console.log('dataMonth',dataMonth);
              let dataYear=d.getFullYear();

            /* days.push(x);
             if(i>weekday.length){
                   console.log()
             }
             else{*/
             
              console.log('xxx',weekday[x]);
             
              let text=dataevent[i].event_time;
          //   const myArray = text.split(":");
             // let word=myArray[0];
              let yaxis=parseInt(text);
              console.log('yyy',yaxis);
              if( dataYear == this.year && dataMonth == this.monthno ){
              let dataset ={ label:weekday[x], y: yaxis, eventName:dataevent[i].event_name ,eventTeam: dataevent[i].event_team, eventDesc:dataevent[i].event_description };
             let dataImage={url: dataevent[i].url};
             
               this.images.push(dataImage);
              this.datacord.push(dataset);
              }
              else{
                console.log('no data Added')
              }
         }
        
         console.log('datacord',this.datacord);
    if (this.chartInitialized) {
      console.log('in initial');
      return;
    }
    this.chartInitialized = true;

    Promise.all([loadScript(this, CanvasJS)]).then(() => {
      this.initializeChart();
    })
    .catch((error) =>{
            console.log('Error'+ error);
    })
  }
  increaseMonth(){
      this.chartInitialized=false;
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    let currentMonth;
    let currentyear;
     if(this.monthno==11){
        let count=this.monthno-11;
       currentMonth = month[count];
       currentyear =  this.year+1;
       this.year=currentyear;
       this.monthno=count;
       this.calendar = currentMonth +' '+currentyear;
       
     }
     else{
          let count= this.monthno+1;
          currentMonth = month[count];
           this.monthno=count;
          this.calendar = currentMonth +' '+this.year;
     }
       let dataevent= this.datas[0].events;
       // console.log('dataset',JSON.stringify(dataevent));
        const weekday=['SUN','MON','TUE','WED','THU','FRI','SAT'];
       let datasetlist =[];
        for(let i=0;i<dataevent.length;i++){
            
              const d=new Date(dataevent[i].event_date);
              let x=d.getDay(d);
              let dataMonth=d.getMonth();
              console.log('dataMonth',dataMonth);
              let dataYear=d.getFullYear();

            /* days.push(x);
             if(i>weekday.length){
                   console.log()
             }
             else{*/
             
              console.log('xxx',weekday[x]);
             
              let text=dataevent[i].event_time;
          //   const myArray = text.split(":");
             // let word=myArray[0];
              let yaxis=parseInt(text);
              console.log('yyy',yaxis);
              if( dataYear == this.year && dataMonth == this.monthno ){
              let dataset ={ label:weekday[x], y: yaxis, eventName:dataevent[i].event_name ,eventTeam: dataevent[i].event_team, eventDesc:dataevent[i].event_description }          
             let dataImage={url: dataevent[i].url};
             
               this.images.push(dataImage);
              this.datacord.push(dataset);
              }
              else{
                console.log('no data Added')
              }
         }
     if (this.chartInitialized) {
      console.log('in initial');
      return;
    }
    this.chartInitialized = true;

    Promise.all([loadScript(this, CanvasJS)]).then(() => {
      this.initializeChart();
    })
    .catch((error) =>{
            console.log('Error'+ error);
    })
  }
  initializeChart() {
    console.log('in chart');
    let chartid= this.template.querySelector(".chartContainer");
   
    var chart = new window.CanvasJS.Chart(chartid, {
      theme: "",
     
      title: {
        text: "",
      },
      toolTip: {
			backgroundColor: "#417bab",
      fontStyle:"normal",
      cornerRadius: 4,
      fontSize:14
	   	},
      data: [
        {  

          type: "scatter",
          toolTipContent: "<div style='\"'padding:5px;min-height:90px; max-height: 128px; color:white;gap:5px;'\"'><p style='\"'padding-top:2px;padding-bottom:2px;margin-top:2px;fontSize:18'\"'> {eventName} </p><p style='\"'padding-bottom:2px'\"'> {eventTeam}</p><p style='\"'padding-bottom:2px'\"'> {eventDesc}</p></div>",
          dataPoints:this.datacord,
        },
      ],
       axisY:{
             maximum:this.max,
             minimum:this.min, 
             labelFontColor: "#66a0ff",
             interval:2,
            tickLength: 0,
            lineThickness: 2,
            lineColor:"#808080",
            labelFontSize: 18,
           suffix: ":00"
       }  ,
       axisX:{
              lineThickness: 2,
              lineColor:"#808080",
               labelFontSize: 18,
             tickLength: 0
          
       }  ,
     
     
       
    });
    console.log('After in chart');
    chart.render();

    
    var fruits = [];

    // images.push({
    //   url: "https://noledgeloss2-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0158d000001jGmd&oid=00D8d00000AW0CS&lastMod=1687261089000",
    // });
    // images.push({
    //   url: "https://noledgeloss2-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0158d000001jGmd&oid=00D8d00000AW0CS&lastMod=1687261089000",
    // });
    // images.push({
    //   url: "https://noledgeloss2-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0158d000001jGmY&oid=00D8d00000AW0CS&lastMod=1687261063000",
    // });
    // images.push({
    //   url: "https://noledgeloss2-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0158d000001jGmi&oid=00D8d00000AW0CS&lastMod=1687261117000",
    // });
    // images.push({
    //   url: "https://cyntexa-17e-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0155i000000251S&oid=00D5i00000EUxC3&lastMod=1687154260000",
    // });
    //  images.push({
    //   url: "https://noledgeloss2-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0158d000001jGnR&oid=00D8d00000AW0CS&lastMod=1687261385000",
    // });
    // images.push({
    //   url: "https://noledgeloss2-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0158d000001jGnR&oid=00D8d00000AW0CS&lastMod=1687261385000",
    // });
    //  images.push({
    //   url: "https://cyntexa-17e-dev-ed.develop.file.force.com/servlet/servlet.ImageServer?id=0155i000000251S&oid=00D5i00000EUxC3&lastMod=1687154260000",
    // });
   
 console.log('images',this.images);
    this.addImages(chart, this.images, fruits);
    console.log('after add Image')
    this.positionImages(chart, this.images, fruits);
    console.log('after add positionImage')

    window.addEventListener("resize", () => {
      this.positionImages(chart, this.images, fruits);
    });
    chart.render();
  }
 increasey(){
     if(this.max == 22){
       console.log('in 22');
          this.max=24;
          this.min=22;
     }
     else{
     this.min=this.max;
     this.max+=6;
    
     }
      Promise.all([loadScript(this, CanvasJS)]).then(() => {
      this.initializeChart();
    })
    .catch((error) =>{
            console.log('Error'+ error);
    })
   }
   decreasex(){
     this.chartInitialized=false;
     if(this.min == 10){

     }
     else{
      
       this.max= this.min;
       this.min-=6;
       if (this.chartInitialized) {
        console.log('in initial');
        return;
      }
    
    this.chartInitialized = true;

    Promise.all([loadScript(this, CanvasJS)]).then(() => {
      this.initializeChart();
    })
    .catch((error) =>{
            console.log('Error'+ error);
    })
     }
   }
  addImages(chart, images, fruits) {
    console.log('in add Image');
    const chartContainer = this.template.querySelector(".chartContainer");
   console.log('chartContainer',chartContainer);
   console.log('chart.data[0].dataPoints.length',chart.data[0].dataPoints.length);
    for (let i = 0; i < chart.data[0].dataPoints.length; i++) {
      console.log('i')
      const x = chart.data[0].dataPoints[i].x;
      const y = chart.data[0].dataPoints[i].y;
      console.log('image[i]',images[i].url);
      const fruit = document.createElement("img");
      fruit.src = images[i].url;
      fruit.classList.add("fruit");
      fruit.style.display = "none";
      chartContainer.querySelector(".canvasjs-chart-container").appendChild(fruit);

      fruits.push(fruit);

    }
  }

  positionImages(chart, images, fruits) {
    const chartContainer = this.template.querySelector(".chartContainer");
    const chartOffset = chartContainer.getBoundingClientRect();
    console.log('chartOffset',chartOffset);
    const chartHeight = chartContainer.offsetHeight;
    console.log('chartHeight',chartHeight);
    for (let i = 0; i < chart.data[0].dataPoints.length; i++) {
      const x =  chart.data[0].dataPoints[i].x;
    //const x=i+1;
     const y = chart.data[0].dataPoints[i].y;
     // const y=14+i;
      console.log('x cord',x);
      console.log('y cord',y);
      const fruit = fruits[i];

      const imageCenterX = chart.axisX[0].convertValueToPixel(x);
      console.log('x',imageCenterX);
      const imageCenterY = chart.axisY[0].convertValueToPixel(y);
      console.log('y',imageCenterY);

      fruit.style.width = "30px"; // Adjust the width as needed
      fruit.style.height = "30px"; // Adjust the height as needed
      fruit.style.position = "absolute";
      fruit.style.display = "block";
     

      fruit.style.top=`${imageCenterY-10}px`;
     fruit.style.left=`${imageCenterX-10}px`;
     console.log('fruit.offsetHeight',fruit.offsetHeight);
     console.log('fruit.offsetWidth',fruit.offsetWidth);
    // fruit.style.top = `${chartOffset.top + chartHeight - imageCenterY - fruit.offsetHeight}px`;
   // fruit.style.left = `${chartOffset.left + imageCenterX - fruit.offsetWidth / 2}px`;

    }
    chart.render();
  }
}