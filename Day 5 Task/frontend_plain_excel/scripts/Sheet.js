// 'use strict';

// let data = await fetch("./tempData.json")
// data = await data.json();
import {data} from "../tempData.js"
import { Graph } from "./Graph.js"
// console.log(data);

export class Sheet{

    colSizes = Array(20).fill(100)
    rowSizes = Array(50).fill(30)
    rowLimit = 1048576
    colLimit = 16384

    static cellsCopiedArray = [];
    // fontSize = 16;
    // font = "Titillium Web";
    // fontColor = "#222";
    // fontSelectedColor = "#444";
    // fontSelectedBackgroundColor = "#88d1b144";
    // cellBackgroundColor = "#fff"
    // fontPadding = 6;
    // columnWidth = 100 ;
    // rowHeight = 30
    // colWidth = 50
    // columnGutterColor = "#cbd5d0"
    defaultConfig = {
        "fontSize":16,
        "font": "Segoe UI",
        "fontColor":"#222",
        "fontSelectedColor":"#444",
        "fontSelectedBackgroundColor": "#88d1b144",
        "cellBackgroundColor": "#fff",
        "fontPadding": 6,
        "columnWidth": 100,
        "rowHeight": 30,
        "colWidth": 50,
        "columnGutterColor": "#cbd5d0",
    }
    /**@type {(null|{row:number, col:number, rowStart: number, colStart: number})} */
    selectedCell = null
    /**@type {(null|{row:number, col:number, rowStart: number, colStart: number})} */
    selectedRangeStart = null
    /**@type {(null|{row:number, col:number, rowStart: number, colStart: number})} */
    selectedRangeEnd = null
    lineDashOffset = null
    drawLoopId = null;
    drawnGraph = null
    
    // dom elements : 1 header canvas, 1 row canvas, 1 table canvas
    constructor(divRef){
        // creating canvas elements and contexts
        // this.data = window.localStorage.getItem('data') ? JSON.parse(window.localStorage.getItem('data')) : data;
        this.data = JSON.parse(JSON.stringify(data));
        // this.colSizes = window.localStorage.getItem('colSizes') ? JSON.parse(window.localStorage.getItem('colSizes')) : Array(20).fill(100);
        // this.rowSizes = window.localStorage.getItem('rowSizes') ? JSON.parse(window.localStorage.getItem('rowSizes')) : Array(100).fill(40);
        // this.data = data;
        this.containerDiv = document.createElement("div")
        this.headerRef = document.createElement("canvas")
        this.rowRef = document.createElement("canvas")
        this.tableRef = document.createElement("canvas")
        this.tableDiv = document.createElement("div")
        this.sizeDiv = document.createElement("div")
        this.selectButton = document.createElement("div")
        this.inputEditor = document.createElement("div");
        this.inputEditor.innerHTML = "<input type='text'>"
        this.headerContext = this.headerRef.getContext("2d")
        this.rowContext = this.rowRef.getContext("2d")
        this.tableContext = this.tableRef.getContext("2d")
        this.containerDiv.classList.add("tableContainer")
        this.headerRef.classList.add("headerRef")
        this.rowRef.classList.add("rowRef")
        this.tableRef.classList.add("tableRef")
        this.sizeDiv.classList.add("sizeDiv")
        this.inputEditor.classList.add("inputEditor")
        this.tableDiv.classList.add("tableDiv")
        this.selectButton.classList.add("selectAllButton")
        this.selectButton.setAttribute("data-showdot","")


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
        this.sizeDiv.appendChild(this.tableRef)
        this.sizeDiv.appendChild(this.inputEditor)
        this.tableDiv.appendChild(this.sizeDiv)
        this.containerDiv.appendChild(this.tableDiv)
        // divRef.appendChild(this.containerDiv)

        this.selectedCell = {row: 0, col: 0, rowStart: 0, colStart: 0}
        this.selectedRangeStart = {row: 0, col: 0, rowStart: 0, colStart: 0}
        this.selectedRangeEnd = {row: 0, col: 0, rowStart: 0, colStart: 0}

        this.fixCanvasSize();
        this.drawHeader();
        this.drawRowIndices();
        this.draw();

        // console.log(this)
        this.tableDiv.addEventListener("scroll", (e)=>{
            this.checkIfReachedEndOfColumns();
            this.checkIfReachedEndOfRows();
            // if(!this.drawLoopId) this.draw();
        });

        this.tableDiv.addEventListener("scroll",(e)=>{
            this.drawHeader();
            this.drawRowIndices();
            // this.resizeBasedOnViewPort();
            if(this.drawLoopId){window.cancelAnimationFrame(this.drawLoopId)}
            this.draw();
        })
        this.tableRef.addEventListener("dblclick",(e)=>{
            // console.log(e);
            // this.canvasPointerDown(e)
            this.canvasDoubleClickHandler(e)
        })
        window.addEventListener("resize",()=>{
            this.fixCanvasSize();
            this.drawHeader();
            this.drawRowIndices();
            if(!this.drawLoopId) this.draw();
        })
        this.inputEditor.querySelector("input").addEventListener("keyup",(e)=>{
            this.inputEditorKeyHandler(e)
            
        })
        this.tableRef.addEventListener("pointerdown",(e)=>{
            this.canvasPointerDown(e);
        })
        window.addEventListener("keydown",(e)=>{
            if(e.target.nodeName!="BODY"){return;}
            if(!this.containerDiv.parentElement){return;}
            this.canvasKeyHandler(e)
        })
        this.headerRef.addEventListener("pointermove",(e)=>{
            this.colResizeCursorMove(e)
        })
        this.rowRef.addEventListener("pointermove",(e)=>{
            this.rowResizeCursorMove(e);
        })
        this.headerRef.addEventListener("pointerdown", (e)=>{
            this.colResizePointerDown(e);
        })
        this.rowRef.addEventListener("pointerdown",(e)=>{
            this.rowResizePointerDown(e);
        })
        this.headerRef.addEventListener("dblclick",(e)=>{
            this.colAutoResize(e)
        })
        // this.find("dummy")
    }

    drawHeader() {
        // let tempArr = [];
        this.headerContext.setTransform(1, 0, 0, 1, 0, 0);
        this.headerContext.clearRect(0,0,this.headerRef.width,this.headerRef.height);
        this.headerContext.scale(window.devicePixelRatio, window.devicePixelRatio)
        this.headerContext.translate(-this.tableDiv.scrollLeft, 0);
        
        // let tempArr = [];
        let {startPosCol, colIndex} = this.getCellClickIndex({offsetX:0, offsetY:0});
        // console.log(colIndex)
        for(let i=colIndex; startPosCol<=(this.tableDiv.scrollLeft+this.tableDiv.clientWidth) && i<this.colSizes.length; i++){
            this.headerContext.save();
            this.headerContext.beginPath();
            this.headerContext.rect(startPosCol-0.5,0, this.colSizes[i], this.defaultConfig.rowHeight);
            // this.headerContext.strokeStyle = this.defaultConfig.columnGutterColor;
            // this.headerContext.lineWidth = 1
            // this.headerContext.stroke();
            this.headerContext.clip();
            this.headerContext.textAlign = "center"
            if(this.selectedRangeStart && this.selectedRangeEnd && i<=Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col) && i>=Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col)){
                if(this.selectedRangeEnd.rowStart==Infinity){
                    this.headerContext.fillStyle = "#107c41"
                    this.headerContext.fill();
                    this.headerContext.fillStyle = `#fff`;
                }else{
                    this.headerContext.fillStyle = "#caead8"
                    this.headerContext.fill();
                    this.headerContext.fillStyle = `${this.defaultConfig.fontColor}`;
                }
                // this.headerContext.beginPath();
                // this.headerContext.moveTo(startPosCol, this.defaultConfig.rowHeight-0.5);
                // this.headerContext.lineTo(startPosCol+this.colSizes[i], this.defaultConfig.rowHeight-0.5)
                // this.headerContext.strokeStyle = "#107c41"
                // this.headerContext.lineWidth = 5;
                // this.headerContext.stroke();
                this.headerContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`;
                this.headerContext.fillText(Sheet.numToBase26ForHeader(i), (startPosCol+(this.colSizes[i]/2)), this.defaultConfig.rowHeight-this.defaultConfig.fontPadding)
            }
            else{
                this.headerContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`;
                this.headerContext.fillStyle = `${this.defaultConfig.fontColor}`;
                this.headerContext.fillText(Sheet.numToBase26ForHeader(i), (startPosCol+(this.colSizes[i]/2)), this.defaultConfig.rowHeight-this.defaultConfig.fontPadding)
            }
            // tempArr.push(i)
            // this.headerContext.moveTo(prev+curr, 0);
            // this.headerContext.lineTo(prev+curr, this.defaultConfig.rowHeight);
            this.headerContext.restore();
            startPosCol+=this.colSizes[i]
        }

        this.colSizes.reduce((prev,curr,currIndex)=>{
            if(prev+curr >= this.tableDiv.scrollLeft && prev-curr<=(this.tableDiv.scrollLeft+this.tableDiv.clientWidth)){
            this.headerContext.save();
            this.headerContext.beginPath();
            this.headerContext.moveTo(prev+curr-0.5,0);
            this.headerContext.lineTo(prev+curr-0.5,this.defaultConfig.rowHeight)
            this.headerContext.strokeStyle = this.defaultConfig.columnGutterColor;
            this.headerContext.stroke();
            // tempArr.push(curr)
            // this.headerContext.moveTo(prev+curr, 0);
            // this.headerContext.lineTo(prev+curr, this.defaultConfig.rowHeight);
            this.headerContext.restore();
            }
            return prev+curr;
        },0)

        if(this.selectedRangeStart && this.selectedRangeEnd){
            let rectStartX = Math.max(this.tableDiv.scrollLeft, Math.min(this.selectedRangeStart.colStart, this.selectedRangeEnd.colStart))
            let rectEndX = Math.max(rectStartX,Math.min(this.tableDiv.scrollLeft+this.tableDiv.clientWidth, this.colSizes[Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col)] ? Math.max(this.selectedRangeStart.colStart, this.selectedRangeEnd.colStart)+this.colSizes[Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col)] : this.tableDiv.clientWidth+rectStartX))
            // console.log(rectEndX-rectStartX);
            if(rectStartX!=rectEndX){
                this.headerContext.save();
                this.headerContext.beginPath();
                this.headerContext.moveTo(rectStartX-2, this.defaultConfig.rowHeight-0.5);
                if(this.selectedRangeEnd.rowStart==Infinity){
                    this.headerContext.lineTo(rectEndX, this.defaultConfig.rowHeight-0.5);
                    this.headerContext.lineTo(rectEndX, 0.5);
                    this.headerContext.lineTo(rectStartX, 0.5);
                    this.headerContext.lineTo(rectStartX, this.defaultConfig.rowHeight-0.5);
                }
                else{
                    this.headerContext.lineTo(rectEndX+2, this.defaultConfig.rowHeight-0.5);
                }
                this.headerContext.strokeStyle = "#107c41"
                this.headerContext.lineWidth = 5;
                this.headerContext.stroke();
                this.headerContext.restore();
            }
        }
        // console.log("Columns drawn in header: "+tempArr.length);
    }

    drawRowIndices(){
        // let tempArr=[];
        this.rowContext.setTransform(1, 0, 0, 1, 0, 0);
        this.rowContext.clearRect(0,0,this.rowRef.width, this.rowRef.height)
        this.rowContext.scale(window.devicePixelRatio, window.devicePixelRatio)
        this.rowContext.translate(0,-this.tableDiv.scrollTop)
        
        let {startPosRow, rowIndex} = this.getCellClickIndex({offsetX:0, offsetY:0})
        // console.log(startPosRow, rowIndex)
        for(let i=rowIndex; startPosRow<=(this.tableDiv.scrollTop+this.tableDiv.clientHeight) && i<this.rowSizes.length; i++){
            this.rowContext.save();
            this.rowContext.beginPath();
            this.rowContext.rect(0,startPosRow-0.5, this.defaultConfig.colWidth, this.rowSizes[i]);
            // this.rowContext.strokeStyle = this.defaultConfig.columnGutterColor;
            // this.rowContext.stroke();
            this.rowContext.clip();
            this.rowContext.textBaseline = "middle"
            // tempArr.push(i)
            if(this.selectedRangeStart && this.selectedRangeEnd && i<=Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row) && i>=Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row)){
                if(this.selectedRangeEnd.colStart==Infinity){
                    this.rowContext.fillStyle = "#107c41"
                    this.rowContext.fill();
                    this.rowContext.fillStyle = "#fff"
                }
                else{
                    this.rowContext.fillStyle = "#caead8"
                    this.rowContext.fill();
                    this.rowContext.fillStyle = `${this.defaultConfig.fontColor}`;
                }
                this.rowContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`;
                // this.rowContext.fillStyle = `${this.defaultConfig.fontColor}`;
                this.rowContext.textAlign = "right"
                this.rowContext.fillText(i, this.defaultConfig.colWidth-this.defaultConfig.fontPadding, startPosRow+this.rowSizes[i]/2)
                // this.rowContext.beginPath()
                // this.rowContext.moveTo(this.defaultConfig.colWidth-0.5, startPosRow);
                // this.rowContext.lineTo(this.defaultConfig.colWidth-0.5, startPosRow+this.rowSizes[i])
                // this.rowContext.strokeStyle = "#107c41"
                // this.rowContext.lineWidth = 5;
                // this.rowContext.stroke();
            }
            else{
                this.rowContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`;
                this.rowContext.fillStyle = `${this.defaultConfig.fontColor}`;
                this.rowContext.textAlign = "right"
                this.rowContext.fillText(i, this.defaultConfig.colWidth-this.defaultConfig.fontPadding, startPosRow+this.rowSizes[i]/2)
            }
            startPosRow+=this.rowSizes[i];
            this.rowContext.restore();
            }

        this.rowSizes.reduce((prev,curr,currIndex)=>{
            if(prev+curr >= this.tableDiv.scrollTop && prev-curr<=(this.tableDiv.scrollTop+this.tableDiv.clientHeight)){
            this.rowContext.save();
            this.rowContext.beginPath();
            this.rowContext.moveTo(0,prev+curr - 0.5);
            this.rowContext.lineTo(this.defaultConfig.colWidth, prev+curr-0.5)
            this.rowContext.strokeStyle = this.defaultConfig.columnGutterColor;
            this.rowContext.stroke();
            // this.rowContext.clip();
            // tempArr.push(curr)
            // this.rowContext.moveTo(0,prev+curr);
            // this.rowContext.lineTo(this.defaultConfig.colWidth,prev+curr);
            this.rowContext.restore();
            }
            return prev+curr;
        },0)

        if(this.selectedRangeStart && this.selectedRangeEnd){
            let rectStartY = Math.max(this.tableDiv.scrollTop, Math.min(this.selectedRangeStart.rowStart, this.selectedRangeEnd.rowStart))
            let rectEndY = Math.max(rectStartY,Math.min(this.tableDiv.scrollTop+this.tableDiv.clientHeight, this.rowSizes[Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row)] ? Math.max(this.selectedRangeStart.rowStart, this.selectedRangeEnd.rowStart)+this.rowSizes[Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row)] : this.tableDiv.clientHeight+rectStartY))
            // console.log(rectEndY-rectStartY);
            if(rectStartY!=rectEndY){
                this.rowContext.save();
                this.rowContext.beginPath();
                this.rowContext.moveTo(this.defaultConfig.colWidth-0.5,rectStartY-2);
                if(this.selectedRangeEnd.colStart==Infinity){
                    this.rowContext.lineTo(this.defaultConfig.colWidth-0.5,rectEndY);
                    this.rowContext.lineTo(0.5,rectEndY);
                    this.rowContext.lineTo(0.5,rectStartY);
                    this.rowContext.lineTo(this.defaultConfig.colWidth-0.5,rectStartY);
                }
                else{
                    this.rowContext.lineTo(this.defaultConfig.colWidth-0.5,rectEndY+2);
                }
                this.rowContext.strokeStyle = "#107c41"
                this.rowContext.lineWidth = 5;
                this.rowContext.stroke();
                this.rowContext.restore();
            }
            
        }
        // console.log("Rows drawn in rows: "+tempArr.length);
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

    draw(prevTime=null){
        // console.log("redrawing...")
        // this.tableContext.translate()
        // console.log(this.tableContext)
        this.tableContext.setTransform(1, 0, 0, 1, 0, 0);
        this.tableContext.clearRect(0, 0, this.tableRef.width, this.tableRef.height);
        this.tableContext.scale(window.devicePixelRatio, window.devicePixelRatio)
        this.tableContext.translate(-this.tableDiv.scrollLeft, -this.tableDiv.scrollTop)
        // this.tableContext.translate(-this.tableDiv.scrollLeft*window.devicePixelRatio, -this.tableDiv.scrollTop*window.devicePixelRatio)
        // this.tableContext.scale(window.devicePixelRatio,window.devicePixelRatio)
        

        // for (let j = 0; j < data.length; j++) {
        //     let sum = 0;
        //     for (let i = 0; i < this.dataColumns.length; i++) {
        //         this.tableContext.beginPath();
        //         this.tableContext.save();
        //         this.tableContext.rect(sum,(j) * this.defaultConfig.rowHeight,this.colSizes[i],this.defaultConfig.rowHeight);
        //         this.tableContext.clip();
        //         this.tableContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`;
        //         this.tableContext.fillStyle = `${this.defaultConfig.fontColor}`;
        //         this.tableContext.fillText(data[j][this.dataColumns[i]], sum+this.defaultConfig.fontPadding, (j+1)*this.defaultConfig.rowHeight-this.defaultConfig.fontPadding)
        //         // this.tableContext.stroke();
        //         this.tableContext.restore();
        //         sum+=this.colSizes[i]
        //     }
        // }
        // var sumRowSizes=0;
        // var sumColSizes=0;
        // let rowCount = 0;
        // let colCount = 0
        // for(let r = 0; r<this.rowSizes.length; r++){
        //     // console.log(sumRowSizes-this.rowSizes[r]>this.tableDiv.scrollTop+this.tableDiv.clientHeight);
        //     if(sumRowSizes+this.rowSizes[r]>=this.tableDiv.scrollTop && sumRowSizes-this.rowSizes[r]<=this.tableDiv.scrollTop+this.tableDiv.clientHeight){
        //         sumColSizes = 0;
        //         // colCount=0;
        //         for(let c=0; c<this.colSizes.length; c++){
        //             // console.log(sumColSizes);
        //             if(sumColSizes+this.colSizes[c]>=this.tableDiv.scrollLeft && sumColSizes-this.colSizes[c]<=this.tableDiv.scrollLeft+this.tableDiv.clientWidth){
        //                 // console.log("printing : ", c);
        //                 this.tableContext.beginPath();
        //                 this.tableContext.save();
        //                 this.tableContext.rect(sumColSizes, sumRowSizes, this.colSizes[c], this.rowSizes[r]);
        //                 this.tableContext.clip();
        //                 this.tableContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`
        //                 // this.tableContext.fillText(`R${r},C${c}`, sumColSizes+this.defaultConfig.fontPadding, sumRowSizes + this.rowSizes[r] - this.defaultConfig.fontPadding)
        //                 this.tableContext.fillText(!this.data[r] || !this.data[r][c] ? "" : this.data[r][c].text, sumColSizes+this.defaultConfig.fontPadding, sumRowSizes + this.rowSizes[r] - this.defaultConfig.fontPadding)
        //                 this.tableContext.stroke();
        //                 this.tableContext.restore();
        //                 // colCount++;
        //             }
        //             sumColSizes+=this.colSizes[c]
        //         }
        //         // rowCount++;
        //     }
        //     sumRowSizes+=this.rowSizes[r]
        // }
        let {startPosRow, startPosCol, rowIndex, colIndex} = this.getCellClickIndex({offsetX:0, offsetY:0})
        let sumColSizes;
        let sumRowsizes = startPosRow;
        for(let r=rowIndex; sumRowsizes<=(this.tableDiv.scrollTop+this.tableDiv.clientHeight) && r<this.rowSizes.length;r++){
            // rowCount++;
            sumColSizes=startPosCol;
            for(let c=colIndex; sumColSizes<=(this.tableDiv.scrollLeft+this.tableDiv.clientWidth) && c<this.colSizes.length; c++){
                this.tableContext.save();
                this.tableContext.beginPath();
                this.tableContext.rect(sumColSizes-0.5, sumRowsizes-0.5, this.colSizes[c], this.rowSizes[r]);
                this.tableContext.clip();
                // this.tableContext.lineWidth=1
                // if(this.selectedCell?.row==r && this.selectedCell?.col==c){
                //     this.tableContext.lineWidth = 3;
                //     this.tableContext.strokeStyle = "#107c41";
                // }
                // else{
                //     this.tableContext.strokeStyle = this.defaultConfig.columnGutterColor;
                // }
                if(this.selectedRangeStart && this.selectedRangeEnd && 
                    c>=Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col) && c<=Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col) &&
                    r>=Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row) && r<=Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row)
                ){
                    if(this.selectedCell && c==this.selectedCell.col && r==this.selectedCell.row){}
                    else{
                        this.tableContext.fillStyle = "#e7f1ec"
                        this.tableContext.fill();
                    }
                }
                // this.tableContext.lineWidth = 1
                // this.tableContext.strokeStyle = this.defaultConfig.columnGutterColor
                // this.tableContext.stroke();
                this.tableContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`
                // this.tableContext.fillText(`R${r},C${c}`, sumColSizes+this.defaultConfig.fontPadding, sumRowsizes + this.rowSizes[r] - this.defaultConfig.fontPadding)
                this.tableContext.fillStyle = "black"
                if(this.data[r] && this.data[r][c] && this.data[r][c].text){
                    if(this.data[r][c].textWrap){
                        this.tableContext.textBaseline = "bottom"
                        let base = this.defaultConfig.fontPadding;
                        let textPartitions = this.data[r][c].wrappedTextContent.slice().reverse();

                        for(let partitionText of textPartitions){
                            this.tableContext.fillText(partitionText, sumColSizes+this.defaultConfig.fontPadding, sumRowsizes+this.rowSizes[r]-base)
                            base+=this.defaultConfig.fontSize
                        }
                    }
                    else{
                        this.tableContext.fillText(this.data[r][c].text, sumColSizes+this.defaultConfig.fontPadding, sumRowsizes + this.rowSizes[r] - this.defaultConfig.fontPadding)
                    }
                }
                // this.tableContext.fillText(!this.data[r] || !this.data[r][c] ? "" : this.data[r][c].text, sumColSizes+this.defaultConfig.fontPadding, sumRowsizes + this.defaultConfig.fontPadding)
                // await new Promise(r=>setTimeout(r,100))
                // this.tableContext.closePath();
                this.tableContext.restore();
                sumColSizes+=this.colSizes[c]
                // console.log("drawing col")
            }

            sumRowsizes+=this.rowSizes[r]
        }
        
        this.colSizes.reduce((prev,curr)=>{
            this.tableContext.beginPath();
            this.tableContext.save();
            this.tableContext.moveTo(prev + curr - 0.5, this.tableDiv.scrollTop);
            this.tableContext.lineTo(prev + curr - 0.5, this.tableRef.height/window.devicePixelRatio+this.tableDiv.scrollTop);
            this.tableContext.strokeStyle = this.defaultConfig.columnGutterColor;
            this.tableContext.stroke();
            this.tableContext.restore();
            return prev + curr;
        },0)

        this.rowSizes.reduce((prev,curr)=>{
            this.tableContext.beginPath();
            this.tableContext.save();
            this.tableContext.moveTo(this.tableDiv.scrollLeft, prev + curr - 0.5);
            this.tableContext.lineTo(this.tableRef.width/window.devicePixelRatio + this.tableDiv.scrollLeft, prev + curr - 0.5);
            this.tableContext.strokeStyle = this.defaultConfig.columnGutterColor;
            this.tableContext.stroke();
            this.tableContext.restore();
            return prev + curr;
        },0)

        if(this.selectedRangeStart && this.selectedRangeEnd){
            // console.log(this.selectedRangeStart);
            // console.log(this.selectedRangeEnd);
            let rectStartX = Math.min(this.selectedRangeStart.colStart, this.selectedRangeEnd.colStart)
            let rectStartY = Math.min(this.selectedRangeStart.rowStart, this.selectedRangeEnd.rowStart)
            let rectEndX = Math.max(this.selectedRangeStart.colStart, this.selectedRangeEnd.colStart) + 
            this.colSizes[(Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col))<=this.colSizes.length ? Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col) : 0]
            let rectEndY = Math.max(this.selectedRangeStart.rowStart, this.selectedRangeEnd.rowStart) + 
            this.rowSizes[(Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row))<=this.rowSizes.length ? Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row) : 0]
            // rectEndY = isNaN(rectEndY) ? this.tableDiv.scrollTop+this.tableDiv.clientHeight : rectEndY
            rectStartX = Math.max(this.tableDiv.scrollLeft, rectStartX)
            rectStartY = Math.max(this.tableDiv.scrollTop, rectStartY)
            rectEndX = Math.max(Math.min(this.tableDiv.scrollLeft+this.tableDiv.clientWidth,rectEndX), rectStartX)
            rectEndY = Math.max(Math.min(this.tableDiv.scrollTop+this.tableDiv.clientHeight, rectEndY), rectStartY)
            // console.log(rectEndY, rectStartY);
            if(rectStartX!=rectEndX && rectStartY!=rectEndY){
                // console.log(rectEndX-rectStartX, rectEndY-rectStartY);
                this.tableContext.save();
                this.tableContext.beginPath();
                this.tableContext.strokeStyle = "#107c41"
                this.tableContext.lineWidth = 3
                this.tableContext.rect(rectStartX-0.5, rectStartY-0.5, (rectEndX-rectStartX)+1, (rectEndY-rectStartY)+1)
                if(this.lineDashOffset!=null){
                    this.tableContext.setLineDash([5,5])
                    this.tableContext.lineDashOffset = this.lineDashOffset;
                    this.drawLoopId = window.requestAnimationFrame((animationTime)=>{
                        this.lineDashOffset += (1*(animationTime-prevTime)/50);
                        // if(this.lineDashOffset>12) this.lineDashOffset=0
                        this.lineDashOffset %= 10;
                        // console.log(animationTime, prevTime);
                        this.draw(animationTime)
                    })
                }
                this.tableContext.stroke();
                // this.tableContext.fill();
                this.tableContext.restore();
            }
        }
        // if(this.selectedCell){
        //     this.tableContext.save();
        //     this.tableContext.beginPath();
        //     this.tableContext.strokeStyle = "#107c41"
        //     this.tableContext.lineWidth = 3
        //     this.tableContext.fillStyle = "#fff"
        //     this.tableContext.rect(this.selectedCell.colStart+0.5, this.selectedCell.rowStart+0.5, this.colSizes[this.selectedCell.col]-1, this.rowSizes[this.selectedCell.row]-1)
        //     // this.tableContext.stroke();
        //     this.tableContext.fill();
        //     this.tableContext.restore();
        // }

        // console.log(`Rows drawn : ${rowCount}`)
        // console.log(`Cols drawn : ${colCount}`);
    }


    fixCanvasSize(){
        // console.log(this.colSizes.reduce((prev,curr)=>prev+curr,0));
        this.sizeDiv.style.width = this.colSizes.reduce((prev,curr)=>prev+curr,0) + "px";
        this.sizeDiv.style.height = this.rowSizes.reduce((prev,curr)=>prev+curr,0) + "px";
        // console.log(this.sizeDiv);
        // console.log(this.tableDiv.clientWidth, this.tableDiv.clientHeight)
        this.tableRef.width = (this.tableDiv.clientWidth)*window.devicePixelRatio
        this.tableRef.height = (this.tableDiv.clientHeight)*window.devicePixelRatio
        // this.tableRef.width = (this.tableDiv.parentElement.clientWidth - this.defaultConfig.colWidth - 18)
        // this.tableRef.height = (this.tableDiv.parentElement.clientHeight - this.defaultConfig.rowHeight - 18)
        this.headerRef.width = (this.tableDiv.offsetWidth)*window.devicePixelRatio;
        this.headerRef.height = this.defaultConfig.rowHeight*window.devicePixelRatio

        this.rowRef.width = this.defaultConfig.colWidth*window.devicePixelRatio
        this.rowRef.height = (this.tableDiv.offsetHeight)*window.devicePixelRatio;

        // let {width} = this.headerRef.getBoundingClientRect()
        // let {height} = this.rowRef.getBoundingClientRect()
        // console.log(width,height);
        this.headerRef.style.width = `${this.tableDiv.offsetWidth}px`
        this.rowRef.style.height = `${this.tableDiv.offsetHeight}px`
        this.tableRef.style.width = `${this.tableDiv.clientWidth}px`
        this.tableRef.style.height = `${this.tableDiv.clientHeight}px`
    }

    checkIfReachedEndOfColumns(e){
        let status =  this.tableDiv.scrollWidth - this.tableDiv.clientWidth - this.tableDiv.scrollLeft > 50 ? false : true;
        if(status){
            this.colSizes = [...this.colSizes, ...Array(20).fill(100)]
            this.fixCanvasSize();
            if(!this.drawLoopId) this.draw();
            this.drawHeader();
            this.drawRowIndices();
        }
        // return status;
    }
    checkIfReachedEndOfRows(e){
        let status = this.tableDiv.scrollHeight - this.tableDiv.clientHeight - this.tableDiv.scrollTop > 50 ? false : true;
        if(status){
            this.rowSizes = [...this.rowSizes, ...Array(50).fill(30)]
            this.fixCanvasSize();
            if(!this.drawLoopId) this.draw();
            this.drawHeader();
            this.drawRowIndices();
        }
    }

    /**
     * 
     * @param {PointerEvent} e 
     */
    getCellClickIndex(e){
        // console.log(e.offsetX, e.offsetY);
        let startPosRow=0, startPosCol=0, rowIndex=0, colIndex=0;
        for(rowIndex=0; rowIndex<this.rowSizes.length; rowIndex++){
            if(e.offsetY+this.tableDiv.scrollTop <= startPosRow+this.rowSizes[rowIndex]){
                break;
            }
            startPosRow+=this.rowSizes[rowIndex]
        }
        for(colIndex=0; colIndex<this.colSizes.length; colIndex++){
            if(e.offsetX+this.tableDiv.scrollLeft <= startPosCol+this.colSizes[colIndex]){
                break;
            }
            startPosCol+=this.colSizes[colIndex]
        }

        return {startPosRow: startPosRow, startPosCol: startPosCol, rowIndex: rowIndex, colIndex: colIndex}
    }

    canvasPointerDown(e){
        this.lineDashOffset = null;
        if(this.drawLoopId) window.cancelAnimationFrame(this.drawLoopId)
        this.drawLoopId = null
        let {startPosRow : startPosRowDown, startPosCol:startPosColDown, rowIndex:rowIndexDown, colIndex:colIndexDown} = this.getCellClickIndex(e);
        // console.log(startPosRowDown, startPosColDown)
        if(e.shiftKey){
            if(this.selectedRangeStart){
                this.selectedRangeEnd = {row: rowIndexDown, col: colIndexDown, rowStart: startPosRowDown, colStart: startPosColDown};
                if(!this.drawLoopId) this.draw();
                this.drawHeader()
                this.drawRowIndices()
                return;
            }
        }
        // console.log("not shifted")
        this.selectedRangeStart = {row: rowIndexDown, col: colIndexDown, rowStart: startPosRowDown, colStart: startPosColDown}
        this.selectedRangeEnd = {row: rowIndexDown, col: colIndexDown, rowStart: startPosRowDown, colStart: startPosColDown}
        this.selectedCell = {row: rowIndexDown, col: colIndexDown, rowStart: startPosRowDown, colStart: startPosColDown}
        this.inputEditor.style.display = "none"
        this.drawHeader();
        this.drawRowIndices();
        if(!this.drawLoopId) this.draw();
        if(0>=Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col) || 0>=Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row)){
            this.selectButton.setAttribute("data-showdot","")
        }
        else{
            this.selectButton.removeAttribute("data-showdot")
        }
        // console.log(this.selectedRangeStart);
        // if(this.selectedCell && rowIndexDown!=this.selectedCell.row && colIndexDown!=this.selectedCell.col){
            //     this.tableContext.clearRect()
            // }
        let canvasPointerUp = (eUp)=>{
            let newX = (e.offsetX + eUp.clientX - e.clientX)
            let newY = (e.offsetY + eUp.clientY - e.clientY)
            let {startPosRow : startPosRowDown, startPosCol:startPosColDown, rowIndex:rowIndexDown, colIndex:colIndexDown} = this.getCellClickIndex({offsetX:newX, offsetY:newY});
            this.selectedRangeEnd = {row: rowIndexDown, col: colIndexDown, rowStart: startPosRowDown, colStart: startPosColDown}

            // console.log(this.selectedRangeEnd);
            window.removeEventListener("pointermove", canvasPointerMove);
            window.removeEventListener("pointerup", canvasPointerUp);
            this.drawRowIndices();
            this.drawHeader();
            if(!this.drawLoopId) this.draw();
        }
        let canvasPointerMove = (eMove)=>{
            let newX = (e.offsetX + eMove.clientX - e.clientX)
            let newY = (e.offsetY + eMove.clientY - e.clientY)
            // console.log(eMove.offsetX, this.tableDiv.clientWidth)
            let {startPosRow : startPosRowMove, startPosCol:startPosColMove, rowIndex:rowIndexMove, colIndex:colIndexMove} = this.getCellClickIndex({offsetX:newX, offsetY:newY});
            if(eMove.offsetX >= this.tableDiv.clientWidth-50){
                this.tableDiv.scrollBy(50,0)
            }
            if(eMove.offsetX <= 50){
                this.tableDiv.scrollBy(-50,0)
            }
            if(eMove.offsetY >= this.tableDiv.clientHeight-50){
                this.tableDiv.scrollBy(0,50)
            }
            if(eMove.offsetY <= 50){
                this.tableDiv.scrollBy(0,-50)
            }
            if(this.selectedRangeEnd && (rowIndexMove!=this.selectedRangeEnd.row || colIndexMove!=this.selectedRangeEnd.col)){
                this.selectedRangeEnd = {row: rowIndexMove, col: colIndexMove, rowStart: startPosRowMove, colStart: startPosColMove}
                // if(this.selectedRangeEnd.colStart+this.colSizes[this.selectedRangeEnd.col]>this.tableDiv.scrollLeft+this.tableDiv.clientWidth){
                //     this.tableDiv.scrollBy(this.colSizes[this.selectedRangeEnd.col],0)
                // }
                // console.log(this.selectedRangeEnd);
                this.drawHeader();
                this.drawRowIndices();
                if(!this.drawLoopId) this.draw();
            }
            if(0>=Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col) || 0>=Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row)){
                this.selectButton.setAttribute("data-showdot","")
            }
            else{
                this.selectButton.removeAttribute("data-showdot")
            }
        }
        let canvasPointerLeave = (eLeave)=>{
            // console.log(eLeave);
            window.removeEventListener("pointermove", canvasPointerMove);
            window.removeEventListener("pointerup", canvasPointerUp);
            window.removeEventListener("pointerleave", canvasPointerLeave);
        }
        // let pointerUp = canvasPointerUp
        window.addEventListener("pointerup", canvasPointerUp);
        window.addEventListener("pointermove",canvasPointerMove);
        window.addEventListener("pointerleave", canvasPointerLeave);

        
    }

    canvasDoubleClickHandler(e){
        // this.selectedRangeStart = null;
        // this.selectedRangeEnd = null;
        let {startPosRow, startPosCol, rowIndex, colIndex} = this.getCellClickIndex(e);
        // console.log(startPosRow, startPosCol)
        this.selectedCell = {row:rowIndex, col:colIndex, rowStart:startPosRow, colStart: startPosCol}
        this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
        this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
        // console.log(this.selectedCell);
        this.inputEditor.style.display="grid";
        this.inputEditor.style.left = (startPosCol) + "px"
        this.inputEditor.style.top = (startPosRow) + "px"
        this.inputEditor.style.width = (this.colSizes[colIndex]) + "px";
        this.inputEditor.style.height = (this.rowSizes[rowIndex])+"px"
        let inputRef = this.inputEditor.querySelector("input")
        inputRef.value = this.data[this.selectedCell.row] && this.data[this.selectedCell.row][this.selectedCell.col] ? this.data[this.selectedCell.row][this.selectedCell.col]['text'] : ""
        // console.log(this.data[this.selectedCell.row] && this.data[this.selectedCell.row][this.selectedCell.col] ? this.data[this.selectedCell.row][this.selectedCell.col]['text'] : "nope")
        inputRef.focus();
        
        if(!this.drawLoopId) this.draw();
    }

    /**
     * 
     * @param {KeyboardEvent} e 
     */
    inputEditorKeyHandler(e){
        if(e.key=="Enter"){
            let tempCellData = {text: e.target.value}
            // console.log(data[this.selectedCell.row]);
            if(this.data[this.selectedCell.row]){
                if(this.data[this.selectedCell.row][this.selectedCell.col]){
                    this.data[this.selectedCell.row][this.selectedCell.col]['text'] = e.target.value;
                }
                else{
                    this.data[this.selectedCell.row][this.selectedCell.col] = tempCellData;
                }
            }
            else{
                let tempRowData = {};
                tempRowData[this.selectedCell.col] = tempCellData
                this.data[this.selectedCell.row] = tempRowData
            }
            // data[this.selectedCell.row][this.selectedCell.col]['text'] = e.target.value;
            // console.log(this.data);
            this.inputEditor.style.display = "none"
            this.wrapText(e.target.value)
            this.selectedCell.rowStart = this.selectedCell.rowStart + this.rowSizes[this.selectedCell.row]
            this.selectedCell.row = this.selectedCell.row+1
            this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
            this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
            if(this.selectedCell.rowStart+this.rowSizes[this.selectedCell.row]>this.tableDiv.scrollTop+this.tableDiv.clientHeight){
                this.tableDiv.scrollBy(0,this.rowSizes[this.selectedCell.row])
            }
            this.drawHeader();
            this.drawRowIndices();
            if(!this.drawLoopId) this.draw();

            // this.selectedCell = null;
            // window.localStorage.setItem('data',JSON.stringify(this.data));
        }
        else if(e.key=="Escape"){
            this.inputEditor.style.display = "none";
        }
        if(!this.drawLoopId) this.draw();
    }

    /**
    * @param {KeyboardEvent} e 
    */
    canvasKeyHandler(e){
        // console.log(e.key, e.shiftKey)
        // if(e.target===this.inputEditor.querySelector("input")){return;}
        if(e.key=="ArrowLeft" && this.selectedCell){
            this.lineDashOffset = null;
            if(this.drawLoopId) window.cancelAnimationFrame(this.drawLoopId)
            this.drawLoopId = null
            if(this.selectedCell.col==0){return;}
            if(e.shiftKey){
                if(this.selectedRangeEnd.col==0){return;}
                this.selectedRangeEnd.col = this.selectedRangeEnd.col-1;
                this.selectedRangeEnd.colStart = this.selectedRangeEnd.colStart - this.colSizes[this.selectedRangeEnd.col]
                if(this.selectedRangeEnd.colStart<this.tableDiv.scrollLeft){
                    this.tableDiv.scrollBy(-this.colSizes[this.selectedRangeEnd.col],0)
                }
            }
            else{
                // console.log("unshifted");
                this.selectedCell.col = this.selectedCell.col-1
                this.selectedCell.colStart = this.selectedCell.colStart - this.colSizes[this.selectedCell.col]
                this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
                this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
                if(this.selectedCell.colStart<this.tableDiv.scrollLeft){
                    this.tableDiv.scrollBy(-this.colSizes[this.selectedCell.col],0)
                }
            }
            this.drawHeader();
            this.drawRowIndices();
            if(!this.drawLoopId) this.draw();
            e.preventDefault();
        }
        else if(e.key=="ArrowRight" && this.selectedCell){
            this.lineDashOffset = null;
            if(this.drawLoopId) window.cancelAnimationFrame(this.drawLoopId)
            this.drawLoopId = null
            if(e.shiftKey){
                this.selectedRangeEnd.colStart = this.selectedRangeEnd.colStart + this.colSizes[this.selectedRangeEnd.col]
                this.selectedRangeEnd.col = this.selectedRangeEnd.col+1;
                if(this.selectedRangeEnd.colStart+this.colSizes[this.selectedRangeEnd.col]>this.tableDiv.scrollLeft+this.tableDiv.clientWidth){
                    this.tableDiv.scrollBy(this.colSizes[this.selectedRangeEnd.col],0)
                }
            }
            else{
                this.selectedCell.colStart = this.selectedCell.colStart + this.colSizes[this.selectedCell.col]
                this.selectedCell.col = this.selectedCell.col+1
                this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
                this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
                if(this.selectedCell.colStart+this.colSizes[this.selectedCell.col]>this.tableDiv.scrollLeft+this.tableDiv.clientWidth){
                    this.tableDiv.scrollBy(this.colSizes[this.selectedCell.col],0)
                }
            }
            e.preventDefault();
            this.drawHeader();
            this.drawRowIndices();
            if(!this.drawLoopId) this.draw();
        }
        else if(e.key=="ArrowUp" && this.selectedCell){
            this.lineDashOffset = null;
            if(this.drawLoopId) window.cancelAnimationFrame(this.drawLoopId)
            this.drawLoopId = null
            if(this.selectedCell.row==0){return;}
            if(e.shiftKey){
                if(this.selectedRangeEnd.row==0){return;}
                this.selectedRangeEnd.row = this.selectedRangeEnd.row-1;
                this.selectedRangeEnd.rowStart = this.selectedRangeEnd.rowStart - this.rowSizes[this.selectedRangeEnd.row]
                if(this.selectedRangeEnd.rowStart<this.tableDiv.scrollTop){
                    this.tableDiv.scrollBy(0,-this.rowSizes[this.selectedRangeEnd.row])
                }
            }
            else{
                this.selectedCell.row = this.selectedCell.row-1
                this.selectedCell.rowStart = this.selectedCell.rowStart - this.rowSizes[this.selectedCell.row]
                this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
                this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
                if(this.selectedCell.rowStart<this.tableDiv.scrollTop){
                    this.tableDiv.scrollBy(0,-this.rowSizes[this.selectedCell.row])
                }
            }
            e.preventDefault();
            this.drawHeader();
            this.drawRowIndices();
            if(!this.drawLoopId) this.draw();
        }
        else if(e.key=="ArrowDown" && this.selectedCell){
            this.lineDashOffset = null;
            if(this.drawLoopId) window.cancelAnimationFrame(this.drawLoopId)
            this.drawLoopId = null
            if(e.shiftKey){
                this.selectedRangeEnd.rowStart = this.selectedRangeEnd.rowStart + this.rowSizes[this.selectedRangeEnd.row]
                this.selectedRangeEnd.row = this.selectedRangeEnd.row+1;
                if(this.selectedRangeEnd.rowStart+this.rowSizes[this.selectedRangeEnd.row]>this.tableDiv.scrollTop+this.tableDiv.clientHeight){
                    this.tableDiv.scrollBy(0,this.rowSizes[this.selectedRangeEnd.row])
                }
            }
            else{
                this.selectedCell.rowStart = this.selectedCell.rowStart + this.rowSizes[this.selectedCell.row]
                this.selectedCell.row = this.selectedCell.row+1
                this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
                this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
                if(this.selectedCell.rowStart+this.rowSizes[this.selectedCell.row]>this.tableDiv.scrollTop+this.tableDiv.clientHeight){
                    this.tableDiv.scrollBy(0,this.rowSizes[this.selectedCell.row])
                }
            }
            e.preventDefault();
            this.drawHeader();
            this.drawRowIndices();
            if(!this.drawLoopId) this.draw();
        }
        else if(e.key==="c" && e.ctrlKey){
            this.lineDashOffset = 0;
            if(this.drawLoopId) window.cancelAnimationFrame(this.drawLoopId)
            this.drawLoopId = null
            if(this.selectedRangeEnd.colStart==Infinity  || this.selectedRangeEnd.rowStart==Infinity){
                window.alert("Cannot copy infnite cells")
                return;
            }
            this.copyRangeToClipboard();
            if(!this.drawLoopId) this.draw();
        }
        else if(e.key==="v" && e.ctrlKey){
            if(this.drawLoopId) {window.cancelAnimationFrame(this.drawLoopId)}
            this.drawLoopId = null
            this.lineDashOffset = null;
            this.pasteRangeToClipboard();
            if(this.drawLoopId){window.cancelAnimationFrame(this.drawLoopId)}
            this.drawLoopId = null
            this.draw();
            this.drawHeader();
            this.drawRowIndices();
        }
        else if(e.key==="Escape"){
            this.lineDashOffset = null;
            if(this.drawLoopId) window.cancelAnimationFrame(this.drawLoopId);
            this.drawLoopId = null;
            if(!this.drawLoopId){this.draw()}
        }
        else if(e.key==="Enter"){
            this.lineDashOffset = null;
            if(this.drawLoopId) window.cancelAnimationFrame(this.drawLoopId)
            this.drawLoopId = null
            if(e.shiftKey){
                if(this.selectedCell.row==0){return;}
                this.selectedCell.row = this.selectedCell.row-1
                this.selectedCell.rowStart = this.selectedCell.rowStart - this.rowSizes[this.selectedCell.row]
                this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
                this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
                if(this.selectedCell.rowStart<this.tableDiv.scrollTop){
                    this.tableDiv.scrollBy(0,-this.rowSizes[this.selectedCell.row])
                }
            }
            else{
                this.selectedCell.rowStart = this.selectedCell.rowStart + this.rowSizes[this.selectedCell.row]
                this.selectedCell.row = this.selectedCell.row+1
                this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
                this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
                if(this.selectedCell.rowStart+this.rowSizes[this.selectedCell.row]>this.tableDiv.scrollTop+this.tableDiv.clientHeight){
                    this.tableDiv.scrollBy(0,this.rowSizes[this.selectedCell.row])
                }
            }
            e.preventDefault();
            this.drawHeader();
            this.drawRowIndices();
            if(!this.drawLoopId) this.draw();
        }
        else if(e.key==="Delete"){
            let rowsInSelection = Object.keys(this.data).filter(r=> r<=Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row) && r>=Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row))
            rowsInSelection.forEach(r=>{
                let colsInSelectionInRow = Object.keys(this.data[r]).filter(c=> c<=Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col) && c>=Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col))
                colsInSelectionInRow.forEach(c=>{
                    // console.log(r,c)
                    delete this.data[r][c].text;
                    if(Object.keys(this.data[r][c]).length==0){delete this.data[r][c]}
                    if(Object.keys(this.data[r]).length==0){delete this.data[r]}
                })
            })
            e.preventDefault();
            this.drawHeader();
            this.drawRowIndices();
            if(!this.drawLoopId) this.draw();
        }
        else if("abcdefghijklmnopqrstuvwxyz0123456789".includes(e.key.toLowerCase()) && !e.ctrlKey){
            this.lineDashOffset = null;
            if(this.drawLoopId) window.cancelAnimationFrame(this.drawLoopId)
            this.drawLoopId = null
        // else if(e.keyCode>=48 && e.keyCode<=90){
            // if user types directly
            this.inputEditor.style.display="grid";
            this.inputEditor.style.left = (this.selectedCell.colStart) + "px"
            this.inputEditor.style.top = (this.selectedCell.rowStart) + "px"
            this.inputEditor.style.width = (this.colSizes[this.selectedCell.col]-1) + "px";
            this.inputEditor.style.height = (this.rowSizes[this.selectedCell.row]-1)+"px"
            let inputRef = this.inputEditor.querySelector("input")
            inputRef.value = "";
            inputRef.focus();
        }

        if(0>=Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col) || 0>=Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row)){
            this.selectButton.setAttribute("data-showdot","")
        }
        else{
            this.selectButton.removeAttribute("data-showdot")
        }
    }

    /**
     * 
     * @param {PointerEvent} e 
     */
    colResizeCursorMove(e){

        let firstCellInView = this.getCellClickIndex({offsetX:0, offsetY:0});
        let currPosX = e.offsetX + this.tableDiv.scrollLeft
        let boundary = firstCellInView.startPosCol + this.colSizes[firstCellInView.colIndex];
        let shouldResize = false;
        for(var i=firstCellInView.colIndex; boundary<this.tableDiv.scrollLeft+this.tableDiv.clientWidth && i<this.colSizes.length && (boundary<currPosX || Math.abs(boundary-currPosX)<=5); i++,boundary+=this.colSizes[i]){
            if(Math.abs(currPosX-boundary)<=3){
                e.target.style.cursor = "col-resize";
                // console.log(`near boundary of cell ${i}`);
                shouldResize = true;
                break;
            }
            e.target.style.cursor = "default";   
        }
    }
    rowResizeCursorMove(e){
        let firstCellInView = this.getCellClickIndex({offsetX:0, offsetY:0});
        let currPosY = e.offsetY + this.tableDiv.scrollTop
        let boundary = firstCellInView.startPosRow + this.rowSizes[firstCellInView.rowIndex];
        let shouldResize = false;
        for(var i=firstCellInView.rowIndex; boundary<this.tableDiv.scrollTop+this.tableDiv.clientHeight && i<this.rowSizes.length && (boundary<currPosY || Math.abs(boundary-currPosY)<=5); i++,boundary+=this.rowSizes[i]){
            if(Math.abs(currPosY-boundary)<=3){
                e.target.style.cursor = "row-resize";
                shouldResize = true;
                break;
            }
            e.target.style.cursor = "default";   
        }
    }

    /**
     * 
     * @param {PointerEvent} e 
     */
    colResizePointerDown(e){
        let firstCellInView = this.getCellClickIndex({offsetX:0, offsetY:0});
        let currPosX = e.offsetX + this.tableDiv.scrollLeft
        let boundary = firstCellInView.startPosCol + this.colSizes[firstCellInView.colIndex];
        let shouldResize = false;
        for(var i=firstCellInView.colIndex; boundary<this.tableDiv.scrollLeft+this.tableDiv.clientWidth && i<this.colSizes.length && (boundary<currPosX || Math.abs(boundary-currPosX)<=5); i++,boundary+=this.colSizes[i]){
            if(Math.abs(currPosX-boundary)<=3){
                e.target.style.cursor = "col-resize";
                // console.log(`near boundary of cell ${i}`);
                shouldResize = true;
                break;
            }
            e.target.style.cursor = "default";   
        }
        if(!shouldResize){
            // console.log(currPosX, boundary-this.colSizes[i]);
            this.lineDashOffset = null;
            window.cancelAnimationFrame(this.drawLoopId)
            this.drawLoopId = null;
            // console.log(`${i} to be clicked`);
            if(e.shiftKey){
                this.selectedRangeStart.row = 0;
                this.selectedRangeEnd.row = this.rowLimit;
                this.selectedRangeStart.rowStart = 0;
                this.selectedRangeEnd.rowStart = Infinity;
                this.selectedRangeEnd.col = i;
                this.selectedRangeEnd.colStart = boundary-this.colSizes[i];
                this.selectedCell = JSON.parse(JSON.stringify(this.selectedRangeStart))
                this.drawHeader();
                this.drawRowIndices();
                if(!this.drawLoopId) this.draw();
                return;
            }
            this.selectedRangeStart.row = 0;
            this.selectedRangeEnd.row = this.rowLimit;
            this.selectedRangeStart.rowStart = 0;
            this.selectedRangeEnd.rowStart = Infinity;
            this.selectedRangeStart.col = i;
            this.selectedRangeEnd.colStart = boundary-this.colSizes[i];
            this.selectedRangeStart.colStart = boundary-this.colSizes[i];
            this.selectedCell = JSON.parse(JSON.stringify(this.selectedRangeStart))
            this.selectedRangeEnd.col = i;
            this.selectButton.setAttribute("data-showdot","")
            this.drawHeader();
            this.drawRowIndices();
            if(!this.drawLoopId) this.draw();
            
            // write infinity multiple column selection functions here
            /**
             * 
             * @param {PointerEvent} eMove 
             */
            let multipleColumnPointerMoveHandler = (eMove)=>{
                let newX = (e.offsetX + eMove.clientX - e.clientX)
                // console.log(newX);
                let {startPosCol, colIndex} = this.getCellClickIndex({offsetX:newX, offsetY:0});
                // console.log(startPosCol, colIndex);
                this.selectedRangeEnd.col = colIndex
                this.selectedRangeEnd.colStart=startPosCol
                if(this.selectedRangeEnd.colStart+this.colSizes[this.selectedRangeEnd.col] +50 > this.tableDiv.scrollLeft+this.tableDiv.clientWidth){
                    this.tableDiv.scrollBy(50, 0)
                }
                if(this.selectedRangeEnd.colStart < this.tableDiv.scrollLeft + 50){
                    this.tableDiv.scrollBy(-50, 0)
                }
                this.drawHeader();
                this.drawRowIndices();
                if(!this.drawLoopId) this.draw();

                // let newY = (e.offsetY + eMove.clientY - e.clientY)
            }
            let multipleColumnPointerUpHandler = (eUp)=>{
                window.removeEventListener("pointermove",multipleColumnPointerMoveHandler)
                window.removeEventListener("pointerup",multipleColumnPointerUpHandler)
            }

            window.addEventListener("pointermove",multipleColumnPointerMoveHandler)
            window.addEventListener("pointerup",multipleColumnPointerUpHandler)

            return;
        }
        
        let minPosX = boundary-this.colSizes[i];
        let prevColSize = this.colSizes[i]
        let prevStartColStart = this.selectedRangeStart.colStart;
        let prevCellColStart = this.selectedCell.colStart;
        let prevEndColStart = this.selectedRangeEnd.colStart;
        // console.log(minPosX);
        /**
         * 
         * @param {PointerEvent} eMove 
         */
        let colResizePointerMove = (eMove)=>{
            let deltaX = eMove.clientX - e.clientX;
            if((prevColSize + (deltaX) >= 10) && (eMove.offsetX+this.tableDiv.scrollLeft >= minPosX)){
                if(i < this.selectedCell.col){
                    this.selectedCell.colStart = prevCellColStart+(deltaX);
                    this.selectedRangeStart.colStart= prevStartColStart+(deltaX);
                }
                if(i < this.selectedRangeEnd.col){
                    this.selectedRangeEnd.colStart= prevEndColStart+((deltaX));
                }
                this.colSizes[i] = prevColSize + deltaX
                this.drawHeader();
                if(!this.drawLoopId) this.draw();
            }
        }
        let colResizePointerUp = (eUp)=>{
            // console.log(this.selectedCell, this.selectedRangeStart, this.selectedRangeEnd)
            if(this.selectedRangeEnd.rowStart==Infinity && i>=Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col) && i<=Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col)){
                for(let j=Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col); j<=Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col);j++){
                    // if(j==i){continue;}
                    // console.log(`should resize ${j}`);
                    let deltaX = this.colSizes[j]-this.colSizes[i];
                    // console.log(deltaX);
                    if(j<this.selectedRangeStart.col){
                            this.selectedRangeStart.colStart -= deltaX
                            this.selectedCell.colStart -= deltaX   
                    }
                    if(j<this.selectedRangeEnd.col){
                        this.selectedRangeEnd.colStart -= deltaX
                    }
                    this.colSizes[j] = this.colSizes[i]
                }
                // console.log(this.colSizes);
                // console.log(`cols before start : ${Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col) - this.selectedRangeStart.col}`);
                
                this.drawHeader()
                if(!this.drawLoopId){this.draw()}
            }
            // console.log(eUp);
            this.wrapTextForColumn(i);
            // this.draw();
            this.drawRowIndices();
            // if(!this.drawLoopId) {this.drawLoopId = window.requestAnimationFrame(()=>this.draw())}
            // window.localStorage.setItem("colSizes",JSON.stringify(this.colSizes))
            window.removeEventListener("pointermove",colResizePointerMove);
            window.removeEventListener("pointerup",colResizePointerUp);    
        }
        let colResizePointerLeave = (eLeave) =>{
            this.wrapTextForColumn(i);
            this.draw();
            this.drawRowIndices();
            // window.localStorage.setItem("colSizes",JSON.stringify(this.colSizes))
            window.removeEventListener("pointermove",colResizePointerMove);
            window.removeEventListener("pointerup",colResizePointerUp);
            window.removeEventListener("pointerleave",colResizePointerLeave);
        }
        window.addEventListener("pointermove",colResizePointerMove);
        window.addEventListener("pointerup",colResizePointerUp);
        window.addEventListener("pointerleave",colResizePointerLeave);
    }

    /**
     * 
     * @param {PointerEvent} e 
     */
    rowResizePointerDown(e){
        let firstCellInView = this.getCellClickIndex({offsetX:0, offsetY:0});
        let currPosY = e.offsetY + this.tableDiv.scrollTop
        let boundary = firstCellInView.startPosRow + this.rowSizes[firstCellInView.rowIndex];
        let shouldResize = false;
        for(var i=firstCellInView.rowIndex; boundary<this.tableDiv.scrollTop+this.tableDiv.clientHeight && i<this.rowSizes.length && (boundary<currPosY || Math.abs(boundary-currPosY)<=5); i++,boundary+=this.rowSizes[i]){
            if(Math.abs(currPosY-boundary)<=3){
                e.target.style.cursor = "row-resize";
                shouldResize = true;
                break;
            }
            e.target.style.cursor = "default";   
        }
        if(!shouldResize){
            // console.log(currPosX, boundary-this.colSizes[i]);
            this.lineDashOffset = null;
            window.cancelAnimationFrame(this.drawLoopId)
            this.drawLoopId = null;
            if(e.shiftKey){
                this.selectedRangeStart.col = 0;
                this.selectedRangeEnd.col = this.colLimit;
                this.selectedRangeStart.colStart = 0;
                this.selectedRangeEnd.colStart = Infinity;
                this.selectedRangeEnd.row = i;
                this.selectedRangeEnd.rowStart = boundary-this.rowSizes[i];
                this.selectedCell = JSON.parse(JSON.stringify(this.selectedRangeStart))
                this.drawHeader();
                this.drawRowIndices();
                if(!this.drawLoopId) this.draw();        
                return;
            }
            // console.log(`${i} to be clicked`);
            this.selectedRangeStart.col = 0;
            this.selectedRangeEnd.col = this.colLimit;
            this.selectedRangeStart.colStart = 0;
            this.selectedRangeEnd.colStart = Infinity;
            this.selectedRangeStart.row = i;
            this.selectedRangeEnd.row = i;
            this.selectedRangeStart.rowStart = boundary-this.rowSizes[i];
            this.selectedRangeEnd.rowStart = boundary-this.rowSizes[i];
            this.selectedCell = JSON.parse(JSON.stringify(this.selectedRangeStart))
            this.selectButton.setAttribute("data-showdot","")
            this.drawHeader();
            this.drawRowIndices();
            if(!this.drawLoopId) this.draw();

            // write infinity multiple row selection functions here
            /**
             * 
             * @param {PointerEvent} eMove 
             */
            let multipleRowPointerMoveHandler = (eMove)=>{
                let newY = (e.offsetY + eMove.clientY - e.clientY)
                // console.log(newX);
                let {startPosRow, rowIndex} = this.getCellClickIndex({offsetX:0, offsetY:newY});
                // console.log(startPosRow, rowIndex);
                this.selectedRangeEnd.row = rowIndex
                this.selectedRangeEnd.rowStart=startPosRow
                if(this.selectedRangeEnd.rowStart+this.rowSizes[this.selectedRangeEnd.row] +50 > this.tableDiv.scrollTop+this.tableDiv.clientHeight){
                    this.tableDiv.scrollBy(0, 50)
                }
                if(this.selectedRangeEnd.rowStart < this.tableDiv.scrollTop + 50){
                    this.tableDiv.scrollBy(0, -50)
                }
                this.drawHeader();
                this.drawRowIndices();
                if(!this.drawLoopId) this.draw();
            }
            let multipleRowPointerUpHandler = (eUp)=>{
                window.removeEventListener("pointermove",multipleRowPointerMoveHandler)
                window.removeEventListener("pointerup",multipleRowPointerUpHandler)
            }

            window.addEventListener("pointermove",multipleRowPointerMoveHandler)
            window.addEventListener("pointerup",multipleRowPointerUpHandler)

            return;
        }
        
        let minPosY = boundary-this.rowSizes[i];
        let prevRowSize = this.rowSizes[i]
        let prevStartRowStart = this.selectedRangeStart.rowStart;
        let prevCellRowStart = this.selectedCell.rowStart;
        let prevEndRowStart = this.selectedRangeEnd.rowStart;
        /**
         * @param {PointerEvent} eMove 
         */
        let rowResizePointerMove = (eMove)=>{
            let deltaY = eMove.clientY - e.clientY;
            if((prevRowSize+deltaY >= 10) && (eMove.offsetY+this.tableDiv.scrollTop >= minPosY)){
                if(i < this.selectedCell.row){
                    this.selectedCell.rowStart= prevCellRowStart+deltaY;
                    this.selectedRangeStart.rowStart=prevStartRowStart+(deltaY);
                }
                if(i < this.selectedRangeEnd.row){
                    this.selectedRangeEnd.rowStart=prevEndRowStart+(deltaY);
                }
                this.rowSizes[i] = prevRowSize+(deltaY)
                this.drawRowIndices();
                if(!this.drawLoopId) this.draw();
            }
        }
        let rowResizePointerUp = (eDown)=>{
            if(this.selectedRangeEnd.colStart==Infinity && i>=Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row) && i<=Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row)){
                for(let j=Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row); j<=Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row);j++){
                    // if(j==i){continue;}
                    // console.log(`should resize ${j}`);
                    let deltaX = this.rowSizes[j]-this.rowSizes[i];
                    // console.log(deltaX);
                    if(j<this.selectedRangeStart.row){
                            this.selectedRangeStart.rowStart -= deltaX
                            this.selectedCell.rowStart -= deltaX   
                    }
                    if(j<this.selectedRangeEnd.row){
                        this.selectedRangeEnd.rowStart -= deltaX
                    }
                    this.rowSizes[j] = this.rowSizes[i]
                }
                // console.log(this.colSizes);
                // console.log(`cols before start : ${Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col) - this.selectedRangeStart.col}`);
                
                this.drawRowIndices()
                if(!this.drawLoopId){this.draw()}
            }
            // console.log(eDown);
            // window.localStorage.setItem("rowSizes", JSON.stringify(this.rowSizes))
            window.removeEventListener("pointermove",rowResizePointerMove);
            window.removeEventListener("pointerup",rowResizePointerUp);    
        }
        let rowResizePointerLeave = (eLeave) =>{
            // window.localStorage.setItem("rowSizes", JSON.stringify(this.rowSizes))
            window.removeEventListener("pointermove",rowResizePointerMove);
            window.removeEventListener("pointerup",rowResizePointerUp);
            window.removeEventListener("pointerleave",rowResizePointerLeave);
        }
        window.addEventListener("pointermove",rowResizePointerMove);
        window.addEventListener("pointerup",rowResizePointerUp);
        window.addEventListener("pointerleave",rowResizePointerLeave);
    }

    copyRangeToClipboard(){
        let text = "";
        Sheet.cellsCopiedArray = [];
        let firstCol = Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col);
        let firstRow = Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row);
        for(let i=firstRow; i<=Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row); i++){
            for(var j=firstCol; j<Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col); j++){
                if(this.data?.[i]?.[j]){
                    Sheet.cellsCopiedArray.push([i-firstRow,j-firstCol,JSON.parse(JSON.stringify(this.data[i][j]))])
                    text += (this.data[i] && this.data[i][j] ? this.data[i][j].text+"\t" : "\t")
                }
                else{
                    text+="\t";
                    Sheet.cellsCopiedArray.push([i-firstRow,j-firstCol,null])
                }
            }
            if(this.data?.[i]?.[j]) {
                text+= this.data[i][j].text
                Sheet.cellsCopiedArray.push([i-firstRow,j-firstCol,JSON.parse(JSON.stringify(this.data[i][j]))])
            }
            else{
                Sheet.cellsCopiedArray.push([i-firstRow,j-firstCol,null])
            }
            // text = text.trimEnd()
            text+="\n"
        }
        // console.log(text);
        navigator.clipboard.writeText(text.trimEnd())
        // console.log(Sheet.cellsCopiedArray);
    }

    pasteRangeToClipboard(){
        let firstCol = Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col);
        let firstRow = Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row);
        for(let cellData of Sheet.cellsCopiedArray){
            if(cellData[2]==null){
                if(this.data[firstRow+cellData[0]]){
                    delete this.data[firstRow+cellData[0]][firstCol+cellData[1]]
                }
            }
            else{
                if(this.data[firstRow+cellData[0]]){
                    this.data[firstRow+cellData[0]][firstCol+cellData[1]] = cellData[2]
                }
                else{
                    this.data[firstRow+cellData[0]] = {}
                    this.data[firstRow+cellData[0]][firstCol+cellData[1]] = cellData[2]
                }
            }
        }
        this.selectedRangeStart.row = firstRow;
        this.selectedRangeStart.col = firstCol;
        this.selectedRangeStart.rowStart = Math.min(this.selectedRangeStart.rowStart, this.selectedRangeEnd.rowStart);
        this.selectedRangeStart.colStart = Math.min(this.selectedRangeStart.colStart, this.selectedRangeEnd.colStart);
        this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedRangeStart))
        // console.log(this.selectedRangeStart)
        for(let i=0; i<Sheet.cellsCopiedArray[Sheet.cellsCopiedArray.length - 1][0]; i++){
            this.selectedRangeEnd.row +=1;
            this.selectedRangeEnd.rowStart += this.rowSizes[firstRow+i]
            console.log("added to row",this.rowSizes[firstRow+i])
        }
        for(let i=0; i<Sheet.cellsCopiedArray[Sheet.cellsCopiedArray.length - 1][1]; i++){
            this.selectedRangeEnd.col +=1;
            this.selectedRangeEnd.colStart += this.colSizes[firstCol+i]
        }
    }

    calculateAggregates(){
        let arr=[];
        if(this.selectedRangeStart.col != this.selectedRangeEnd.col){return [null,null,null];}
        let start = Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row);
        let end = Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row);
        for(let i=start; i<=end;i++){
            if(this.data[i] && this.data[i][this.selectedRangeStart.col] && !isNaN(Number(this.data[i][this.selectedRangeStart.col].text))){
                arr.push(Number(this.data[i][this.selectedRangeStart.col].text))
            }
        }
        let min = Math.min(...arr)
        let max = Math.max(...arr)
        let mean = arr.reduce((a,b)=>a+b,0)/arr.length
        return [min==Infinity ? 0 : min,isNaN(mean) ? 0 : mean,max==-Infinity ? 0 : max];
    }

    colAutoResize(e){
        let firstCellInView = this.getCellClickIndex({offsetX:0, offsetY:0});
        let currPosX = e.offsetX + this.tableDiv.scrollLeft
        let boundary = firstCellInView.startPosCol + this.colSizes[firstCellInView.colIndex];
        let shouldResize = false;
        for(var i=firstCellInView.colIndex; boundary<this.tableDiv.scrollLeft+this.tableDiv.clientWidth && i<this.colSizes.length; i++,boundary+=this.colSizes[i]){
            if(Math.abs(currPosX-boundary)<=10){
                e.target.style.cursor = "col-resize";
                // console.log(`near boundary of cell ${i}`);
                shouldResize = true;
                break;
            }
            e.target.style.cursor = "default";   
        }
        if(!shouldResize){return;}
        this.tableContext.save();
        this.tableContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`
        // console.log(`lets resize ${i}`);
        let temp = Object.keys(this.data)
                    .filter(x=>this.data[x][i] && !this.data[x][i].textWrap)
                    .map(x=>Math.ceil(this.tableContext.measureText(this.data[x][i].text).width))
        this.tableContext.restore();
        if(temp.length==0){return}
        let oldColSize = this.colSizes[i]
        this.colSizes[i] = Math.max(...temp) + 2*this.defaultConfig.fontPadding
        if(i < this.selectedCell.col){
            this.selectedCell.colStart+=(this.colSizes[i]-oldColSize);
            this.selectedRangeStart.colStart+=(this.colSizes[i]-oldColSize);
        }
        if(i < this.selectedRangeEnd.col){
            this.selectedRangeEnd.colStart+=(this.colSizes[i]-oldColSize);
        }
        this.wrapTextForColumn(i);
        if(!this.drawLoopId) this.draw()
        this.drawHeader();
        this.drawRowIndices()
    }

    wrapText(textContent){
        if(!this.data[this.selectedCell.row][this.selectedCell.col].textWrap){
            // console.log("no need to wrap");    
            return;
        }
        // this.data[this.selectedCell.row][this.selectedCell.col]["textWrap"] = true
        let w=2*this.defaultConfig.fontPadding, s1="";
        let wrappedText = [];
        this.tableContext.save();
        this.tableContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`
        for(let x of textContent){
            w+=this.tableContext.measureText(x).width
            if(w > this.colSizes[this.selectedCell.col]-this.defaultConfig.fontPadding){
                // console.log(s1)
                wrappedText.push(s1)
                s1="";
                // console.log(w)
                w=2*this.defaultConfig.fontPadding;
            }
            s1+=x;
        }
        wrappedText.push(s1)
        this.tableContext.restore();
        this.data[this.selectedCell.row][this.selectedCell.col].wrappedTextContent = wrappedText
        let lineCount = wrappedText.length;
        this.rowSizes[this.selectedCell.row] = Math.max(this.rowSizes[this.selectedCell.row], lineCount*this.defaultConfig.fontSize + 2*this.defaultConfig.fontPadding)
        // window.localStorage.setItem("rowSizes", JSON.stringify(this.rowSizes))
        this.drawRowIndices();
    }
    wrapCell(row,col){
        if(!this.data[row][col].textWrap){
            // console.log("no need to wrap");    
            return;
        }
        // this.data[row][col]["textWrap"] = true
        let w=2*this.defaultConfig.fontPadding, s1="";
        let wrappedText = [];
        this.tableContext.save();
        this.tableContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`
        for(let x of this.data[row][col].text){
            w+=this.tableContext.measureText(x).width
            if(w > this.colSizes[col]-this.defaultConfig.fontPadding){
                // console.log(s1)
                wrappedText.push(s1)
                s1="";
                // console.log(w)
                w=2*this.defaultConfig.fontPadding;
            }
            s1+=x;
        }
        wrappedText.push(s1)
        this.tableContext.restore();
        this.data[row][col].wrappedTextContent = wrappedText
        let lineCount = wrappedText.length;
        this.rowSizes[row] = Math.max(this.rowSizes[row], lineCount*this.defaultConfig.fontSize + 2*this.defaultConfig.fontPadding)
    }
    /**
     * 
     * @param {Number} colIndex 
     */
    wrapTextForColumn(colIndex){
        let rows = Object.keys(this.data).filter(x=>this.data[x][colIndex]?.textWrap)
        rows.forEach(r=>{
            let w=2*this.defaultConfig.fontPadding, s1="";
            let wrappedText = [];
            this.tableContext.save();
            this.tableContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`
            for(let x of this.data[r][colIndex].text){
                w+=this.tableContext.measureText(x).width
                if(w > this.colSizes[colIndex]-this.defaultConfig.fontPadding){
                    // console.log(s1)
                    wrappedText.push(s1)
                    s1="";
                    // console.log(w)
                    w=2*this.defaultConfig.fontPadding;
                }
                s1+=x;
            }
            wrappedText.push(s1)
            this.tableContext.restore();
            this.data[r][colIndex].wrappedTextContent = wrappedText
            let lineCount = wrappedText.length;
            let oldRowSize = this.rowSizes[r];
            this.rowSizes[r] = Math.max(this.rowSizes[r], lineCount*this.defaultConfig.fontSize + 2*this.defaultConfig.fontPadding)
            if(r < this.selectedCell.row){
                this.selectedCell.rowStart+=this.rowSizes[r]-oldRowSize;
                this.selectedRangeStart.rowStart+=this.rowSizes[r]-oldRowSize;
            }
            if(r < this.selectedRangeEnd.row){
                this.selectedRangeEnd.rowStart+=this.rowSizes[r]-oldRowSize;
            }
            // window.localStorage.setItem("rowSizes", JSON.stringify(this.rowSizes))
        })
        // this.drawRowIndices();
        // this.draw();
        
    }

    wrapRangeSelection(){
        // console.log(this.selectedRangeStart, this.selectedRangeEnd)
        for(let i=Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row); i<=Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row);i++){
            if(this.data[i]){
                for(let j=Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col); j<=Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col);j++){
                    if(this.data[i][j]){
                        this.data[i][j].textWrap = true;
                    }
                }
            }
        }
        for(let j=Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col); j<=Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col);j++){
            this.wrapTextForColumn(j)
        }
        this.draw();
        this.drawRowIndices();
    }

    getGraphData(type="bar"){
        if(this.drawnGraph){this.drawnGraph.destroy();}
        let minRow = Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row)
        let maxRow = Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row)
        let minCol = Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col)
        let maxCol = Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col)
        let dataArr = Array(maxCol-minCol+1).fill(0)
        let sumArr = Array(maxCol-minCol+1).fill(0)
        let rowsWithData = new Set();
        let allCellData = [];
        for(var i=minRow; i<=maxRow; i++){
            for(var j=minCol; j<=maxCol; j++){
                if(this.data[i] && this.data[i][j] && this.data[i][j].text){
                    // console.log("found data");
                    if(!isNaN(Number(this.data[i][j].text))){
                        dataArr[j-minCol] = dataArr[j-minCol] + Number(this.data[i][j].text);
                        sumArr[j-minCol]++;
                        rowsWithData.add(i)
                        allCellData.push(Number(this.data[i][j].text))
                    }
                }
            }
        }
        let labels = dataArr.map((x,i)=>Sheet.numToBase26ForHeader(minCol+i))
        let avgArr = dataArr.map((x,i)=>x/sumArr[i])
        // console.log("unfiltered")
        // console.log(labels, dataArr, sumArr, avgArr);
        let filteredLabel = labels.filter((x,i)=>!isNaN(avgArr[i]));
        let filteredAverage = avgArr.filter(x=>!isNaN(x));
        if(filteredLabel.length>1){
            new Graph(this.sizeDiv, filteredLabel, filteredAverage,this.tableDiv.scrollLeft, this.tableDiv.scrollTop,type)
        }
        else{
            new Graph(this.sizeDiv, [...rowsWithData], allCellData,this.tableDiv.scrollLeft, this.tableDiv.scrollTop,type)
        }


        // this.drawnGraph = new Chart(document.getElementById("tempGraphCanvas"), {
        //     type: 'pie',
        //     data: {
        //       labels: filteredLabel,
        //       datasets: [{
        //         data: filteredAverage,
        //         borderWidth: 1
        //       }]
        //     },
        //     options: {
        //       scales: {
        //         y: {
        //           beginAtZero: true
        //         }
        //       }
        //     }
        //   });

    }

    // find(textContent){
    //     console.clear();
    //     let start = new Date();
    //     let arrOfRows = Object.entries(this.data)
    //     .map(x=>[x[0],Object.entries(x[1])]);
    //     console.log(arrOfRows);
    //     let ans = arrOfRows.map(x=>{
    //         let tempArr = x[1].filter(y=>JSON.stringify(y[1]).replaceAll("\\n","").includes(textContent));
    //         // console.log(tempArr.map(x=>x[0]));
    //         return [x[0],tempArr.map(x=>x[0])]
    //     })
    //     .filter(x=>x[1].length)
    //     console.log(ans);
    //     // console.log("delay: ",new Date()-start);
        
    // }
    find(textContent){
        if(!textContent){return []}
        // console.clear();
        let arr = [];
        for(let r of Object.keys(this.data)){
            // console.log(r);
            for(let c of Object.keys(this.data[r])){
                // console.log(r,c);
                if(JSON.stringify(this.data[r][c].text).includes(textContent)){
                    arr.push([r,c])
                }
            }
        }
        // console.log(arr);
        return arr;
    }

    /**
     * @param {Number} row 
     * @param {Number} col 
     */
    scrollCellInView(row,col){
        if(row<this.rowSizes.length && col<this.colSizes.length){
            let xPos = 0, yPos=0;
            for(let i=0; i<col; i++){
                xPos+=this.colSizes[i]
            }
            for(let i=0; i<row; i++){
                yPos+=this.rowSizes[i]
            }
            // console.log(xPos,yPos);
            if(xPos < this.tableDiv.scrollLeft || xPos+this.colSizes[col] > this.tableDiv.scrollLeft+this.tableDiv.clientWidth){
                this.tableDiv.scrollTo(xPos,this.tableDiv.scrollTop);
            }
            if(yPos < this.tableDiv.scrollTop || yPos+this.rowSizes[row] > this.tableDiv.scrollTop+this.tableDiv.clientHeight){
                this.tableDiv.scrollTo(this.tableDiv.scrollLeft, yPos);
            }
            this.selectedCell = {col:col, row:row, rowStart:yPos, colStart:xPos}
            this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
            this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
            this.drawHeader();
            this.drawRowIndices();
            if(!this.drawLoopId){this.draw();}
        }
    }

    /**
     * @param {Number} row 
     * @param {Number} col 
     * @param {String} newText 
     * @param {String|null} partText 
     */
    replaceCellText(row, col, newText, partText){
        // if(!newText){newText=""}
        // console.log(row,col,newText, partText)
        /**
         * @type {String}
         */
        let text = this.data[row][col].text
        // console.log(text);
        text = text.replaceAll(partText, newText)
        // console.log(text);
        this.data[row][col].text = text
        this.wrapCell(row,col)
        
        // window.localStorage.setItem("rowSizes", JSON.stringify(this.rowSizes))
        this.drawRowIndices();

        if(this.drawLoopId){
            window.cancelAnimationFrame(this.drawLoopId);
        }
        this.draw();
    }

    // resizeBasedOnViewPort(e){
    //     console.log("resizing..")
    //     this.fixCanvasSize();
    //     this.drawHeader();
    //     this.drawRowIndices();
    // }
}


// collastpos = [180, 300, 420, 540, 660, 834, 954, 1074, 1194, 1314, 1414, 1514, 1614, 1714]

// var debugDiv = document.querySelector("#debugDiv")