'use strict';

let data = await fetch("./tempData.json")
data = await data.json();
// console.log(data);

export class Sheet{

    colSizes = Array(40).fill(100)
    rowSizes = Array(100).fill(40)
    dataColumns = ["Email ID","Name","Country","State","City","Telephone number","Address line 1","Address line 2","Date of Birth","FY2019-20","FY2020-21","FY2021-22","FY2022-23","FY2023-24"];
    fontSize = 16;
    font = "Titillium Web";
    fontColor = "#222";
    fontSelectedColor = "#444";
    fontSelectedBackgroundColor = "#88d1b144";
    cellBackgroundColor = "#fff"
    fontPadding = 6;
    columnWidth = 100 ;
    rowHeight = 30
    colWidth = 50
    columnGutterColor = "#8f8f8f66"
    
    // dom elements : 1 header canvas, 1 row canvas, 1 table canvas
    constructor(divRef){
        // creating canvas elements and contexts
        this.containerDiv = document.createElement("div")
        this.headerRef = document.createElement("canvas")
        this.rowRef = document.createElement("canvas")
        this.tableRef = document.createElement("canvas")
        this.tableDiv = document.createElement("div")
        this.selectButton = document.createElement("div")
        this.headerContext = this.headerRef.getContext("2d")
        this.rowContext = this.rowRef.getContext("2d")
        this.tableContext = this.tableRef.getContext("2d")
        this.containerDiv.classList.add("tableContainer")
        this.headerRef.classList.add("headerRef")
        this.rowRef.classList.add("rowRef")
        this.tableRef.classList.add("tableRef")
        this.tableDiv.classList.add("tableDiv")
        this.selectButton.classList.add("selectAllButton")

        // this.headerRef.style.display = "block"
        // this.rowRef.style.display = "block"
        // this.tableRef.style.display = "block"
        // this.headerRef.style.position = "absolute"
        // this.rowRef.style.position = "absolute"
        // this.tableRef.style.position = "absolute"
        // this.headerRef.style.top = "0px"
        // this.headerRef.style.left = "30px"
        // this.rowRef.style.left = "0px"
        // this.rowRef.style.top = "30px"
        // this.tableRef.style.top = "30px"
        // this.tableRef.style.left = "30px"

        this.rowRef.width = 30
        this.headerRef.height = 30
        // this.tableRef.top = 30;
        // this.tableRef.left = 30;

        //appending to the div
        this.containerDiv.appendChild(this.selectButton)
        this.containerDiv.appendChild(this.headerRef)
        this.containerDiv.appendChild(this.rowRef)
        this.tableDiv.appendChild(this.tableRef)
        this.containerDiv.appendChild(this.tableDiv)
        divRef.appendChild(this.containerDiv)

        this.fixCanvasSize();
        this.drawHeader();
        this.drawRowIndices();
        this.draw();

        console.log(this)
        this.containerDiv.addEventListener("scrollend", (e)=>{
            this.checkIfReachedEndOfColumns();
            this.checkIfReachedEndOfRows();
        });
    }

    drawHeader() {
        this.headerContext.clearRect(0,0,this.headerRef.width,this.headerRef.height);
        this.colSizes.reduce((prev,curr,currIndex)=>{
            this.headerContext.save();
            this.headerContext.beginPath();
            this.headerContext.rect(prev,0, curr, this.rowHeight);
            this.headerContext.strokeStyle = this.columnGutterColor;
            this.headerContext.stroke();
            this.headerContext.clip();
            this.headerContext.font = `bold ${this.fontSize}px ${this.font}`;
            this.headerContext.fillStyle = `${this.fontColor}`;
            this.headerContext.fillText(Sheet.numToBase26ForHeader(currIndex), prev+this.fontPadding, this.rowHeight-this.fontPadding)
            // this.headerContext.moveTo(prev+curr, 0);
            // this.headerContext.lineTo(prev+curr, this.rowHeight);
            this.headerContext.restore();
            return prev+curr;
        },0)
    }

    drawRowIndices(){
        this.rowContext.clearRect(0,0,this.rowRef.width, this.rowRef.height)
        this.rowSizes.reduce((prev,curr,currIndex)=>{
            this.rowContext.save();
            this.rowContext.beginPath();
            this.rowContext.rect(0,prev, this.colWidth, curr);
            this.rowContext.strokeStyle = this.columnGutterColor;
            this.rowContext.stroke();
            this.rowContext.clip();
            this.rowContext.font = `bold ${this.fontSize}px ${this.font}`;
            this.rowContext.fillStyle = `${this.fontColor}`;
            this.rowContext.textAlign = "right"
            this.rowContext.fillText(currIndex, this.colWidth-this.fontPadding, prev+curr-this.fontPadding)
            // this.rowContext.moveTo(0,prev+curr);
            // this.rowContext.lineTo(this.colWidth,prev+curr);
            this.rowContext.restore();
            return prev+curr;
        },0)
    }

    static numToBase26ForHeader(n){
        let s = "";
        do {
          if(s.length>0){
            // console.log(Math.floor((n-1)/26))
            s = String.fromCharCode(65 + Math.floor((n-1)%26)) + s
            n = Math.floor((n-1)/26)
          }
          else{
            s = String.fromCharCode(65 + Math.floor(n%26)) + s
            n = Math.floor(n/26)
          }
        } while (n > 0);
        return s;
    }

    draw(){
        this.tableContext.clearRect(0, 0, this.tableRef.width, this.tableRef.height);
        
        this.colSizes.reduce((prev,curr)=>{
            this.tableContext.beginPath();
            this.tableContext.save();
            this.tableContext.moveTo(prev + curr, 0);
            this.tableContext.lineTo(prev + curr, this.tableRef.height);
            this.tableContext.strokeStyle = this.columnGutterColor;
            this.tableContext.stroke();
            this.tableContext.restore();
            return prev + curr;
        },0)

        this.rowSizes.reduce((prev,curr)=>{
            this.tableContext.beginPath();
            this.tableContext.save();
            this.tableContext.moveTo(0, prev + curr);
            this.tableContext.lineTo(this.tableRef.width, prev + curr);
            this.tableContext.strokeStyle = this.columnGutterColor;
            this.tableContext.stroke();
            this.tableContext.restore();
            return prev + curr;
        },0)

        // for (let j = 0; j < data.length; j++) {
        //     let sum = 0;
        //     for (let i = 0; i < this.dataColumns.length; i++) {
        //         this.tableContext.beginPath();
        //         this.tableContext.save();
        //         this.tableContext.rect(sum,(j) * this.rowHeight,this.colSizes[i],this.rowHeight);
        //         this.tableContext.clip();
        //         this.tableContext.font = `${this.fontSize}px ${this.font}`;
        //         this.tableContext.fillStyle = `${this.fontColor}`;
        //         this.tableContext.fillText(data[j][this.dataColumns[i]], sum+this.fontPadding, (j+1)*this.rowHeight-this.fontPadding)
        //         // this.tableContext.stroke();
        //         this.tableContext.restore();
        //         sum+=this.colSizes[i]
        //     }
        // }
    }


    fixCanvasSize(){
        this.tableRef.width = this.colSizes.reduce((prev,curr)=>prev+curr,0);
        this.tableRef.height = this.rowSizes.reduce((prev,curr)=>prev+curr,0);
        
        this.headerRef.width = this.tableRef.width;
        this.headerRef.height = this.rowHeight

        this.rowRef.width = this.colWidth
        this.rowRef.height = this.tableRef.height
    }

    checkIfReachedEndOfColumns(e){
        let status =  this.containerDiv.scrollWidth - this.containerDiv.clientWidth - this.containerDiv.scrollLeft > 50 ? false : true;
        if(status){
            this.colSizes = [...this.colSizes, ...Array(50).fill(100)]
            this.fixCanvasSize();
            this.draw();
            this.drawHeader();
            this.drawRowIndices();
        }
        // return status;
    }
    checkIfReachedEndOfRows(e){
        let status = this.containerDiv.scrollHeight - this.containerDiv.clientHeight - this.containerDiv.scrollTop > 50 ? false : true;
        if(status){
            this.rowSizes = [...this.rowSizes, ...Array(50).fill(50)]
            this.fixCanvasSize();
            this.draw();
            this.drawHeader();
            this.drawRowIndices();
        }
    }
}


// collastpos = [180, 300, 420, 540, 660, 834, 954, 1074, 1194, 1314, 1414, 1514, 1614, 1714]