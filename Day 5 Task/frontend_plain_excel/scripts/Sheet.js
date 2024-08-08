// 'use strict';

// let data = await fetch("./tempData.json")
// data = await data.json();
import {data} from "../tempData.js"
import { Graph } from "./Graph.js"
// console.log(data);

export class Sheet{

    /**
     * Array of all column widths
     * @type {Number[]}
     */
    colSizes = Array(20).fill(100)
    /**
     * Array of all row heights
     * @type {Number[]}
     */
    rowSizes;
    /**
     * Row limit set to limit range of sheet
     * @type {Number}
     */
    rowLimit = 1048576
    /**
     * Column limit set to limit range of sheet
     * @type {Number}
     */
    colLimit = 16384
    /**
     * Static Array of all copied cells shared with all sheet instances
     * @type {[Number, Number, Object]}
     */
    static cellsCopiedArray = [];
    
    /**
     * Default configuration object to set the default config parameters
     */
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

    /**
     * Object to store selected cell details - row index, column index, pixel offset from left and top called colStart and rowStart respectively
     * @type {{row:number, col:number, rowStart: number, colStart: number}} */
    selectedCell;
    /**
     * Object to store selected range start details - row index, column index, pixel offset from left and top called colStart and rowStart respectively
     * @type {{row:number, col:number, rowStart: number, colStart: number}} */
    selectedRangeStart;
    /**
     * Object to store selected range ending details - row index, column index, pixel offset from left and top called colStart and rowStart respectively
     * @type {{row:number, col:number, rowStart: number, colStart: number}} */
    selectedRangeEnd;
    /**
     * stores the offset for drawing marching ants lines
     * @type {(null|Number)}
     */
    lineDashOffset = null
    /**
     * Stores id returned by draw loop from window.requestAnimationFrame
     * @type {(null|Number)}
     */
    drawLoopId = null;
    /**
     * Sheet data
     * @type {Object}
     */
    data;
    /**
     * Top level container for the sheet elements
     * @type {HTMLDivElement}
     */
    containerDiv;
    /**
     * Header canvas element
     * @type {HTMLCanvasElement}
     */
    headerRef;
    /**
     * Row canvas element
     * @type {HTMLCanvasElement}
     */
    rowRef;
    /**
     * Table canvas element
     * @type {HTMLCanvasElement}
     */
    tableRef;
    /**
     * table div container
     * @type {HTMLDivElement}
     */
    tableDiv;
    /**
     * Scroll container
     * @type {HTMLDivElement}
     */
    sizeDiv;
    /**
     * Top left select all button
     * @type {HTMLElement}
     */
    selectButton;
    /**
     * Input editor div having the input box
     * @type {HTMLDivElement}
     */
    inputEditor;
    /**
     * Header canvas context
     * @type {CanvasRenderingContext2D}
     */
    headerContext;
    /**
     * Row canvas context
     * @type {CanvasRenderingContext2D}
     */
    rowContext;
    /**
     * Table canvas context
     * @type {CanvasRenderingContext2D}
     */
    tableContext;

    /** 
     * Previous cell value that is currently being edited
     * @type {Object}
    */
    cellPreviousvalue;
    
    
    
    constructor(){
        // creating canvas elements and contexts
        // this.data = window.localStorage.getItem('data') ? JSON.parse(window.localStorage.getItem('data')) : data;
        this.data = JSON.parse(JSON.stringify(data));
        let rows = Object.keys(this.data)
        // this.rowSizes = Array(Math.max(rows[rows.length-1],40)).fill(this.defaultConfig.rowHeight)
        this.rowSizes = Array(Math.max(rows[rows.length-1],1e5)).fill(this.defaultConfig.rowHeight)
        let numOfColumns = Math.max(...rows.map(x=>{
            let cols = Object.keys(this.data[x])
            return cols[cols.length-1]
        }))
        this.colSizes = Array(Math.max(numOfColumns,26)).fill(this.defaultConfig.columnWidth)
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
        this.cellPreviousvalue = null;

        this.fixCanvasSize();
        this.drawHeader();
        this.drawRowIndices();
        this.draw();
        this.updateFirstCellCache();

        // console.log(this)
        this.tableDiv.addEventListener("scroll", ()=>{
            this.updateFirstCellCache()
            this.checkIfReachedEndOfColumns();
            this.checkIfReachedEndOfRows();
            this.drawHeader();
            this.drawRowIndices();
            if(this.drawLoopId){window.cancelAnimationFrame(this.drawLoopId);this.drawLoopId=null;}
            this.draw();
            // if(!this.drawLoopId) this.draw();
        });

        // this.tableDiv.addEventListener("scroll",()=>{
        //     this.drawHeader();
        //     this.drawRowIndices();
        //     // this.resizeBasedOnViewPort();
        //     if(this.drawLoopId){window.cancelAnimationFrame(this.drawLoopId);this.drawLoopId=null;}
        //     this.draw();
        //     // window.requestAnimationFrame(()=>this.draw())
        // })
        this.tableRef.addEventListener("dblclick",(e)=>{
            // console.log(e);
            // this.canvasPointerDown(e)
            this.canvasDoubleClickHandler(e)
        })
        window.addEventListener("resize",()=>{
            this.fixCanvasSize();
            this.updateFirstCellCache();
            this.drawHeader();
            this.drawRowIndices();
            if(this.drawLoopId){window.cancelAnimationFrame(this.drawLoopId);this.drawLoopId=null;}
            this.draw();
        })
        this.inputEditor.querySelector("input").addEventListener("keyup",(e)=>{
            this.inputEditorKeyHandler(e)
        })
        // this.inputEditor.querySelector("input").addEventListener("focus",(e)=>{
        //     console.log("focused at cell", e.target.value)
        // })

        this.tableRef.addEventListener("pointerdown",(e)=>{
            this.canvasPointerDown(e);
        })
        window.addEventListener("keydown",(e)=>{
            if(e.target.nodeName!="BODY"){return;}
            if(!this.containerDiv.parentElement){return;}
            this.canvasKeyHandler(e)
        })
        this.headerRef.addEventListener("pointermove",this.colResizeCursorMove)
        this.rowRef.addEventListener("pointermove",this.rowResizeCursorMove)
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
        // Object.keys(this).forEach(x=>console.log(x))
    }

    /**
     * Header canvas renderer
     */
    drawHeader() {
        // let tempArr = [];
        this.headerContext.setTransform(1, 0, 0, 1, 0, 0);
        this.headerContext.clearRect(0,0,this.headerRef.width,this.headerRef.height);
        this.headerContext.scale(window.devicePixelRatio, window.devicePixelRatio)
        this.headerContext.translate(-this.tableDiv.scrollLeft, 0);
        
        // let tempArr = [];
        let {startPosCol, colIndex} = this.firstCellInViewCache || this.getCellClickIndex({offsetX:0, offsetY:0});
        let sumColSizes = startPosCol;
        // console.log(colIndex)
        for(let i=colIndex; sumColSizes<=(this.tableDiv.scrollLeft+this.tableDiv.clientWidth) && i<this.colSizes.length; i++){
            this.headerContext.save();
            this.headerContext.beginPath();
            this.headerContext.rect(sumColSizes-0.5,0, this.colSizes[i], this.defaultConfig.rowHeight);
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
                // this.headerContext.moveTo(sumColSizes, this.defaultConfig.rowHeight-0.5);
                // this.headerContext.lineTo(sumColSizes+this.colSizes[i], this.defaultConfig.rowHeight-0.5)
                // this.headerContext.strokeStyle = "#107c41"
                // this.headerContext.lineWidth = 5;
                // this.headerContext.stroke();
                this.headerContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`;
                this.headerContext.fillText(Sheet.numToBase26ForHeader(i), (sumColSizes+(this.colSizes[i]/2)), this.defaultConfig.rowHeight-this.defaultConfig.fontPadding)
            }
            else{
                this.headerContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`;
                this.headerContext.fillStyle = `${this.defaultConfig.fontColor}`;
                this.headerContext.fillText(Sheet.numToBase26ForHeader(i), (sumColSizes+(this.colSizes[i]/2)), this.defaultConfig.rowHeight-this.defaultConfig.fontPadding)
            }
            // tempArr.push(i)
            // this.headerContext.moveTo(prev+curr, 0);
            // this.headerContext.lineTo(prev+curr, this.defaultConfig.rowHeight);
            this.headerContext.restore();
            sumColSizes+=this.colSizes[i]
        }

        // this.colSizes.reduce((prev,curr)=>{
        //     if(prev+curr >= this.tableDiv.scrollLeft && prev-curr<=(this.tableDiv.scrollLeft+this.tableDiv.clientWidth)){
        //     this.headerContext.save();
        //     this.headerContext.beginPath();
        //     this.headerContext.moveTo(prev+curr-0.5,0);
        //     this.headerContext.lineTo(prev+curr-0.5,this.defaultConfig.rowHeight)
        //     this.headerContext.strokeStyle = this.defaultConfig.columnGutterColor;
        //     this.headerContext.stroke();
        //     // tempArr.push(curr)
        //     // this.headerContext.moveTo(prev+curr, 0);
        //     // this.headerContext.lineTo(prev+curr, this.defaultConfig.rowHeight);
        //     this.headerContext.restore();
        //     }
        //     return prev+curr;
        // },0)

        sumColSizes=startPosCol;
        for(let c=colIndex; sumColSizes<=(this.tableDiv.scrollLeft+this.tableDiv.clientWidth) && c<this.colSizes.length; c++){
            // colCount++;
            this.headerContext.beginPath();
            this.headerContext.save();
            this.headerContext.moveTo(sumColSizes+this.colSizes[c] - 0.5,0);
            this.headerContext.lineTo(sumColSizes+this.colSizes[c] - 0.5, this.defaultConfig.rowHeight);
            this.headerContext.strokeStyle = this.defaultConfig.columnGutterColor;
            this.headerContext.stroke();
            this.headerContext.restore();
            sumColSizes+=this.colSizes[c];
        }

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

    /**
     * Row canvas renderer
     */
    drawRowIndices(){
        // let tempArr=[];
        this.rowContext.setTransform(1, 0, 0, 1, 0, 0);
        this.rowContext.clearRect(0,0,this.rowRef.width, this.rowRef.height)
        this.rowContext.scale(window.devicePixelRatio, window.devicePixelRatio)
        this.rowContext.translate(0,-this.tableDiv.scrollTop)
        
        let {startPosRow, rowIndex} = this.firstCellInViewCache || this.getCellClickIndex({offsetX:0, offsetY:0})
        let sumRowSizes = startPosRow
        // console.log(startPosRow, rowIndex)
        for(let i=rowIndex; sumRowSizes<=(this.tableDiv.scrollTop+this.tableDiv.clientHeight) && i<this.rowSizes.length; i++){
            this.rowContext.save();
            this.rowContext.beginPath();
            this.rowContext.rect(0,sumRowSizes-0.5, this.defaultConfig.colWidth, this.rowSizes[i]);
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
                this.rowContext.fillText(i, this.defaultConfig.colWidth-this.defaultConfig.fontPadding, sumRowSizes+this.rowSizes[i]/2)
                // this.rowContext.beginPath()
                // this.rowContext.moveTo(this.defaultConfig.colWidth-0.5, sumRowSizes);
                // this.rowContext.lineTo(this.defaultConfig.colWidth-0.5, sumRowSizes+this.rowSizes[i])
                // this.rowContext.strokeStyle = "#107c41"
                // this.rowContext.lineWidth = 5;
                // this.rowContext.stroke();
            }
            else{
                this.rowContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`;
                this.rowContext.fillStyle = `${this.defaultConfig.fontColor}`;
                this.rowContext.textAlign = "right"
                this.rowContext.fillText(i, this.defaultConfig.colWidth-this.defaultConfig.fontPadding, sumRowSizes+this.rowSizes[i]/2)
            }
            sumRowSizes+=this.rowSizes[i];
            this.rowContext.restore();
            }

            

        // this.rowSizes.reduce((prev,curr)=>{
        //     if(prev+curr >= this.tableDiv.scrollTop && prev-curr<=(this.tableDiv.scrollTop+this.tableDiv.clientHeight)){
        //     this.rowContext.save();
        //     this.rowContext.beginPath();
        //     this.rowContext.moveTo(0,prev+curr - 0.5);
        //     this.rowContext.lineTo(this.defaultConfig.colWidth, prev+curr-0.5)
        //     this.rowContext.strokeStyle = this.defaultConfig.columnGutterColor;
        //     this.rowContext.stroke();
        //     // this.rowContext.clip();
        //     // tempArr.push(curr)
        //     // this.rowContext.moveTo(0,prev+curr);
        //     // this.rowContext.lineTo(this.defaultConfig.colWidth,prev+curr);
        //     this.rowContext.restore();
        //     }
        //     return prev+curr;
        // },0)

        sumRowSizes=startPosRow;
        for(let r=rowIndex; sumRowSizes<=(this.tableDiv.scrollTop+this.tableDiv.clientHeight) && r<this.rowSizes.length;r++){
            // rowCount++;
            this.rowContext.beginPath();
            this.rowContext.save();
            this.rowContext.moveTo(0, sumRowSizes+this.rowSizes[r] - 0.5);
            this.rowContext.lineTo(this.defaultConfig.colWidth, sumRowSizes+this.rowSizes[r] - 0.5);
            this.rowContext.strokeStyle = this.defaultConfig.columnGutterColor;
            this.rowContext.stroke();
            this.rowContext.restore();
            sumRowSizes+=this.rowSizes[r];
        }

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

    /**
     * Funtion to convert given column index to String header
     * @param {Number} n 
     * @returns {String}
     */
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

    /**
     * Draw function renderer to repaint sheet canvas
     * @param {(null|Number)} prevTime 
     */
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
        let {startPosRow, startPosCol, rowIndex, colIndex} = this.firstCellInViewCache ? this.firstCellInViewCache : this.getCellClickIndex({offsetX:0, offsetY:0})
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
                    if(!this.selectedCell || c!=this.selectedCell.col || r!=this.selectedCell.row){
                        this.tableContext.fillStyle = "#e7f1ec"
                        this.tableContext.fill();
                    }
                    // else{
                    // }
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
        
        // this.colSizes.reduce((prev,curr)=>{
        //     this.tableContext.beginPath();
        //     this.tableContext.save();
        //     this.tableContext.moveTo(prev + curr - 0.5, this.tableDiv.scrollTop);
        //     this.tableContext.lineTo(prev + curr - 0.5, this.tableRef.height/window.devicePixelRatio+this.tableDiv.scrollTop);
        //     this.tableContext.strokeStyle = this.defaultConfig.columnGutterColor;
        //     this.tableContext.stroke();
        //     this.tableContext.restore();
        //     return prev + curr;
        // },0)
        sumColSizes=startPosCol;
        for(let c=colIndex; sumColSizes<=(this.tableDiv.scrollLeft+this.tableDiv.clientWidth) && c<this.colSizes.length; c++){
            // colCount++;
            this.tableContext.beginPath();
            this.tableContext.save();
            this.tableContext.moveTo(sumColSizes+this.colSizes[c] - 0.5, this.tableDiv.scrollTop);
            this.tableContext.lineTo(sumColSizes+this.colSizes[c] - 0.5, this.tableRef.height/window.devicePixelRatio+this.tableDiv.scrollTop);
            this.tableContext.strokeStyle = this.defaultConfig.columnGutterColor;
            this.tableContext.stroke();
            this.tableContext.restore();
            sumColSizes+=this.colSizes[c];
        }

        // this.rowSizes.reduce((prev,curr)=>{
        //     this.tableContext.beginPath();
        //     this.tableContext.save();
        //     this.tableContext.moveTo(this.tableDiv.scrollLeft, prev + curr - 0.5);
        //     this.tableContext.lineTo(this.tableRef.width/window.devicePixelRatio + this.tableDiv.scrollLeft, prev + curr - 0.5);
        //     this.tableContext.strokeStyle = this.defaultConfig.columnGutterColor;
        //     this.tableContext.stroke();
        //     this.tableContext.restore();
        //     return prev + curr;
        // },0)
        sumRowsizes=startPosRow;
        for(let r=rowIndex; sumRowsizes<=(this.tableDiv.scrollTop+this.tableDiv.clientHeight) && r<this.rowSizes.length;r++){
            // rowCount++;
            this.tableContext.beginPath();
            this.tableContext.save();
            this.tableContext.moveTo(this.tableDiv.scrollLeft, sumRowsizes+this.rowSizes[r] - 0.5);
            this.tableContext.lineTo(this.tableRef.width/window.devicePixelRatio + this.tableDiv.scrollLeft, sumRowsizes+this.rowSizes[r] - 0.5);
            this.tableContext.strokeStyle = this.defaultConfig.columnGutterColor;
            this.tableContext.stroke();
            this.tableContext.restore();
            sumRowsizes+=this.rowSizes[r];
        }

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
            // console.log(rectStartX, rectEndX, rectStartY, rectEndY, `draw:${rectStartX!=rectEndX && rectStartY!=rectEndY}`);
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


    /**
     * Function to recompute all canvases size
     */
    fixCanvasSize(){
        // console.log(this.colSizes.reduce((prev,curr)=>prev+curr,0));
        // console.log("fixing canvas size");
        if(this.firstCellInViewCache?.rowIndex>=90000){
            this.defaultConfig.colWidth = 70;
        }
        else{
            this.defaultConfig.colWidth = 50;
        }

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
        // console.log("changed canvas size");
    }

    /**
     * Function to check if we reach end of columns and adds more rows
     */
    checkIfReachedEndOfColumns(){
        let status =  this.tableDiv.scrollWidth - this.tableDiv.clientWidth - this.tableDiv.scrollLeft > 50 ? false : true;
        if(status){
            // this.colSizes = [...this.colSizes, ...Array(20).fill(this.defaultConfig.colWidth)]
            this.colSizes = this.colSizes.concat(Array(20).fill(this.defaultConfig.columnWidth))
            this.fixCanvasSize();
            if(!this.drawLoopId) this.draw();
            this.drawHeader();
            this.drawRowIndices();
        }
        // return status;
    }
    /**
     * Function to check if we reach end of rows and adds more rows
     */
    checkIfReachedEndOfRows(){
        let status = this.tableDiv.scrollHeight - this.tableDiv.clientHeight - this.tableDiv.scrollTop > 50 ? false : true;
        if(status){
            // this.rowSizes = [...this.rowSizes, ...Array(50).fill(this.defaultConfig.rowHeight)]
            this.rowSizes = this.rowSizes.concat(Array(50).fill(this.defaultConfig.rowHeight))
            this.fixCanvasSize();
            if(!this.drawLoopId) this.draw();
            this.drawHeader();
            this.drawRowIndices();
        }
    }

    /**
     * Funtion to get clicked cell
     * @param {(PointerEvent | {offsetX:Number, offsetY:Number})} e 
     * @returns {{startPosRow:Number, startPosCol:Number, rowIndex:Number,colIndex: Number}}
     */
    getCellClickIndex(e){
        // console.log("function called to calc");
        // console.log(e.offsetX, e.offsetY);
        // console.clear();
        let startPosRow=0, startPosCol=0, rowIndex=0, colIndex=0;
        for(rowIndex=0; rowIndex<this.rowSizes.length; rowIndex++){
            // console.log("row");
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

    /**
     * Funtion to get clicked cell from cached firstCell values
     * @param {(PointerEvent|{offsetX:Number,offsetY:Number})} e - pointer object or custom object of cliced mouse positions
     */
    getCellClickIndexFromCache(e){
        
        // console.clear()
        // console.log(e);
        let startPosRow=this.firstCellInViewCache.startPosRow, startPosCol=this.firstCellInViewCache.startPosCol, rowIndex=this.firstCellInViewCache.rowIndex, colIndex=this.firstCellInViewCache.colIndex;
        for(rowIndex; rowIndex<this.rowSizes.length; rowIndex++){
            // console.log("row");
            if(e.offsetY+this.tableDiv.scrollTop <= startPosRow+this.rowSizes[rowIndex]){
                break;
            }
            startPosRow+=this.rowSizes[rowIndex]
        }
        for(colIndex; colIndex<this.colSizes.length; colIndex++){
            if(e.offsetX+this.tableDiv.scrollLeft <= startPosCol+this.colSizes[colIndex]){
                break;
            }
            startPosCol+=this.colSizes[colIndex]
        }

        return {startPosRow: startPosRow, startPosCol: startPosCol, rowIndex: rowIndex, colIndex: colIndex};

    }

    /**
     * Function to cache the properties of first cell in view i.e. its column and row index and the column-start and row-start pixel positions
     */
    updateFirstCellCache(){
        // console.log("updating first cell cached")
        let startPosRow=0, startPosCol=0, rowIndex=0, colIndex=0;
        for(rowIndex=0; rowIndex<this.rowSizes.length; rowIndex++){
            if(this.tableDiv.scrollTop <= startPosRow+this.rowSizes[rowIndex]){
                break;
            }
            startPosRow+=this.rowSizes[rowIndex]
        }
        for(colIndex=0; colIndex<this.colSizes.length; colIndex++){
            if(this.tableDiv.scrollLeft <= startPosCol+this.colSizes[colIndex]){
                break;
            }
            startPosCol+=this.colSizes[colIndex]
        }

        this.firstCellInViewCache = {rowIndex:rowIndex, colIndex:colIndex, startPosRow:startPosRow, startPosCol:startPosCol};
    }

    /**
     * Pointer down handler for range selection on canvas sheet
     * @param {PointerEvent} e 
     */
    canvasPointerDown(e){
        if(e.pointerType=="mouse" && e.button==0){e.preventDefault();}
        this.lineDashOffset = null;
        if(this.drawLoopId) window.cancelAnimationFrame(this.drawLoopId)
        this.drawLoopId = null
        let {startPosRow : startPosRowDown, startPosCol:startPosColDown, rowIndex:rowIndexDown, colIndex:colIndexDown} = this.getCellClickIndexFromCache(e);
        // let {startPosRow : startPosRowDown, startPosCol:startPosColDown, rowIndex:rowIndexDown, colIndex:colIndexDown} = {startPosRow:5*30, startPosCol:5*100,rowIndex:5,colIndex:5}
        // this.getCellClickIndexFromCache({offsetX:e.offsetX, offsetY:e.offsetY});
        // console.log(startPosRowDown, startPosColDown)
        if(e.shiftKey){
            if(this.selectedRangeStart){
                this.selectedRangeEnd = {row: rowIndexDown, col: colIndexDown, rowStart: startPosRowDown, colStart: startPosColDown};
                this.dispatchAggregateEvent()
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

        // let redrawId;
        // let redraw = () => {
        //     redrawId = window.requestAnimationFrame(()=>{
        //         this.draw();
        //         this.drawHeader();
        //         this.drawRowIndices();
        //         redraw();
        //     })
        // }
        // redraw();

        /**
         * Pointer up handler for range selection in canvas
         * @param {PointerEvent} eUp 
         */
        let canvasPointerUp = (eUp)=>{
            // window.cancelAnimationFrame(redrawId);
            let newX = (e.offsetX + eUp.clientX - e.clientX)
            let newY = (e.offsetY + eUp.clientY - e.clientY)
            // let {startPosRow : startPosRowDown, startPosCol:startPosColDown, rowIndex:rowIndexDown, colIndex:colIndexDown} = this.getCellClickIndex({offsetX:newX, offsetY:newY});
            let {startPosRow : startPosRowDown, startPosCol:startPosColDown, rowIndex:rowIndexDown, colIndex:colIndexDown} = this.getCellClickIndexFromCache({offsetX:newX, offsetY:newY});
            this.selectedRangeEnd = {row: rowIndexDown, col: colIndexDown, rowStart: startPosRowDown, colStart: startPosColDown}

            // console.log(this.selectedRangeEnd);
            // calculate event dispatch here
            this.dispatchAggregateEvent()
            window.removeEventListener("pointermove", canvasPointerMove);
            window.removeEventListener("pointerup", canvasPointerUp);
            this.drawRowIndices();
            this.drawHeader();
            if(!this.drawLoopId) this.draw();
        }
        /**
         * Pointer move handler for range selection in canvas
         * @param {PointerEvent} eMove 
         */
        let canvasPointerMove = (eMove)=>{
            eMove.preventDefault();
            let newX = (e.offsetX + eMove.clientX - e.clientX)
            let newY = (e.offsetY + eMove.clientY - e.clientY)
            // console.log(eMove.offsetX, this.tableDiv.clientWidth)
            // let {startPosRow : startPosRowMove, startPosCol:startPosColMove, rowIndex:rowIndexMove, colIndex:colIndexMove} = this.getCellClickIndex({offsetX:newX, offsetY:newY});
            let {startPosRow : startPosRowMove, startPosCol:startPosColMove, rowIndex:rowIndexMove, colIndex:colIndexMove} = this.getCellClickIndexFromCache({offsetX:newX, offsetY:newY});
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
            if(this.selectedRangeEnd || (rowIndexMove!=this.selectedRangeEnd.row || colIndexMove!=this.selectedRangeEnd.col)){
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
        /**
         * Pointer leave handler for range selection in canvas
         */
        // let canvasPointerLeave = ()=>{
        //     // console.log(eLeave);
        //     window.removeEventListener("pointermove", canvasPointerMove);
        //     window.removeEventListener("pointerup", canvasPointerUp);
        //     // window.removeEventListener("pointerleave", canvasPointerLeave);
        // }
        // let pointerUp = canvasPointerUp
        window.addEventListener("pointerup", canvasPointerUp);
        window.addEventListener("pointermove",canvasPointerMove);
        // window.addEventListener("pointerleave", canvasPointerLeave);

        
    }

    /**
     * Double click handler on sheet canvas
     * @param {PointerEvent} e 
     */
    canvasDoubleClickHandler(e){
        // this.selectedRangeStart = null;
        // this.selectedRangeEnd = null;
        let {startPosRow, startPosCol, rowIndex, colIndex} = this.getCellClickIndex(e);
        // console.log(startPosRow, startPosCol)
        this.selectedCell = {row:rowIndex, col:colIndex, rowStart:startPosRow, colStart: startPosCol}
        // this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
        // this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
        // console.log(this.selectedCell);
        this.inputEditor.style.display="grid";
        this.inputEditor.style.left = (startPosCol) + "px"
        this.inputEditor.style.top = (startPosRow) + "px"
        this.inputEditor.style.width = (this.colSizes[colIndex]) + "px";
        this.inputEditor.style.height = (this.rowSizes[rowIndex])+"px"
        let inputRef = this.inputEditor.querySelector("input")
        inputRef.value = this.data[this.selectedCell.row] && this.data[this.selectedCell.row][this.selectedCell.col] ? this.data[this.selectedCell.row][this.selectedCell.col]['text'] : ""
        this.cellPreviousvalue = this.data?.[this.selectedCell.row]?.[this.selectedCell.col] ? JSON.parse(JSON.stringify(this.data?.[this.selectedCell.row]?.[this.selectedCell.col])) : null;
        // console.log(this.cellPreviousvalue)
        // console.log(this.data[this.selectedCell.row] && this.data[this.selectedCell.row][this.selectedCell.col] ? this.data[this.selectedCell.row][this.selectedCell.col]['text'] : "nope")
        inputRef.focus();
        
        this.drawHeader();
        this.drawRowIndices();
        if(!this.drawLoopId) this.draw();
    }

    /**
     * key handler for input box 
     * @param {KeyboardEvent} e 
     */
    inputEditorKeyHandler(e){
        // console.log("input",e)
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
            if(this.cellPreviousvalue==null){
                if(this.data[this.selectedCell.row]){delete this.data[this.selectedCell.row][this.selectedCell.col]}
                else{delete this.data[this.selectedCell.row]}
            }
            // if(this.data?.[this.selectedCell.row]?.[this.selectedCell.col]){
            else{
                this.data[this.selectedCell.row][this.selectedCell.col] = this.cellPreviousvalue;
                this.cellPreviousvalue = null;
            }
            this.inputEditor.style.display = "none";
        }
        else{
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
        }
        if(!this.drawLoopId) this.draw();
    }

    /**
     * Input editor focus lost event
     * @param {FocusEvent} e 
     */
    inputBlurHandler(e){
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
    }

    /**
     * Key Handler for the sheet omponent to perform editing and other selection functions from keyboard
     * @param {KeyboardEvent} e 
     */
    canvasKeyHandler(e){
        // if(e.target===this.inputEditor.querySelector("input")){return;}
        if(e.key=="ArrowLeft" && this.selectedCell){
            this.lineDashOffset = null;
            if(this.drawLoopId) window.cancelAnimationFrame(this.drawLoopId)
            this.drawLoopId = null
            if(!e.shiftKey && this.selectedCell.col==0){return;}
            if(e.shiftKey){
                if(this.selectedRangeEnd.col==0){return;}
                this.selectedRangeEnd.col = this.selectedRangeEnd.col-1;
                this.selectedRangeEnd.colStart = this.selectedRangeEnd.colStart - this.colSizes[this.selectedRangeEnd.col]
                if(this.selectedRangeEnd.colStart<this.tableDiv.scrollLeft ||
                    this.selectedRangeEnd.colStart+this.colSizes[this.selectedRangeEnd.col]>this.tableDiv.scrollLeft+this.tableDiv.clientWidth
                ){
                    this.tableDiv.scrollTo(this.selectedRangeEnd.colStart, this.tableDiv.scrollTop)
                }
            }
            else{
                // console.log("unshifted");
                this.selectedCell.col = this.selectedCell.col-1
                this.selectedCell.colStart = this.selectedCell.colStart - this.colSizes[this.selectedCell.col]
                this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
                this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
                if(this.selectedCell.colStart<this.tableDiv.scrollLeft ||
                    this.selectedCell.colStart+this.colSizes[this.selectedCell.col]>this.tableDiv.scrollLeft+this.tableDiv.clientWidth
                ){
                    this.tableDiv.scrollTo(this.selectedCell.colStart, this.tableDiv.scrollTop)
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
            if(this.selectedCell.col == this.colSizes.length-1 || this.selectedRangeEnd.col==this.colSizes.length-1){return}
            if(e.shiftKey){
                this.selectedRangeEnd.colStart = this.selectedRangeEnd.colStart + this.colSizes[this.selectedRangeEnd.col]
                this.selectedRangeEnd.col = this.selectedRangeEnd.col+1;
                if(this.selectedRangeEnd.colStart<this.tableDiv.scrollLeft ||
                    this.selectedRangeEnd.colStart+this.colSizes[this.selectedRangeEnd.col]>this.tableDiv.scrollLeft+this.tableDiv.clientWidth
                ){
                    this.tableDiv.scrollTo(this.selectedRangeEnd.colStart+this.colSizes[this.selectedRangeEnd.col]-this.tableDiv.clientWidth, this.tableDiv.scrollTop)
                }
            }
            else{
                this.selectedCell.colStart = this.selectedCell.colStart + this.colSizes[this.selectedCell.col]
                this.selectedCell.col = this.selectedCell.col+1
                this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
                this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
                if(this.selectedCell.colStart<this.tableDiv.scrollLeft ||
                    this.selectedCell.colStart+this.colSizes[this.selectedCell.col]>this.tableDiv.scrollLeft+this.tableDiv.clientWidth
                ){
                    this.tableDiv.scrollTo(this.selectedCell.colStart+this.colSizes[this.selectedCell.col]-this.tableDiv.clientWidth, this.tableDiv.scrollTop)
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
            if(!e.shiftKey && this.selectedCell.row==0){return;}
            if(e.shiftKey){
                if(this.selectedRangeEnd.row==0){return;}
                this.selectedRangeEnd.row = this.selectedRangeEnd.row-1;
                this.selectedRangeEnd.rowStart = this.selectedRangeEnd.rowStart - this.rowSizes[this.selectedRangeEnd.row]
                if(this.selectedRangeEnd.rowStart<this.tableDiv.scrollTop ||
                    this.selectedRangeEnd.rowStart+this.rowSizes[this.selectedRangeEnd.row]>this.tableDiv.scrollTop + this.tableDiv.clientHeight
                ){
                    this.tableDiv.scrollTo(this.tableDiv.scrollLeft,this.selectedRangeEnd.rowStart)
                }
            }
            else{
                this.selectedCell.row = this.selectedCell.row-1
                this.selectedCell.rowStart = this.selectedCell.rowStart - this.rowSizes[this.selectedCell.row]
                this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
                this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
                if(this.selectedCell.rowStart<this.tableDiv.scrollTop ||
                    this.selectedCell.rowStart+this.rowSizes[this.selectedCell.row]>this.tableDiv.scrollTop + this.tableDiv.clientHeight
                ){
                    this.tableDiv.scrollTo(this.tableDiv.scrollLeft,this.selectedCell.rowStart)
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
            if(this.selectedCell.row == this.rowSizes.length-1 || this.selectedRangeEnd.row==this.rowSizes.length-1){return}
            if(e.shiftKey){
                this.selectedRangeEnd.rowStart = this.selectedRangeEnd.rowStart + this.rowSizes[this.selectedRangeEnd.row]
                this.selectedRangeEnd.row = this.selectedRangeEnd.row+1;
                if(this.selectedRangeEnd.rowStart<this.tableDiv.scrollTop ||
                    this.selectedRangeEnd.rowStart+this.rowSizes[this.selectedRangeEnd.row]>this.tableDiv.scrollTop + this.tableDiv.clientHeight
                ){
                    this.tableDiv.scrollTo(this.tableDiv.scrollLeft,this.selectedRangeEnd.rowStart+this.rowSizes[this.selectedRangeEnd.row]-this.tableDiv.clientHeight)
                }
            }
            else{
                this.selectedCell.rowStart = this.selectedCell.rowStart + this.rowSizes[this.selectedCell.row]
                this.selectedCell.row = this.selectedCell.row+1
                this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
                this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
                if(this.selectedCell.rowStart<this.tableDiv.scrollTop ||
                    this.selectedCell.rowStart+this.rowSizes[this.selectedCell.row]>this.tableDiv.scrollTop + this.tableDiv.clientHeight
                ){
                    this.tableDiv.scrollTo(this.tableDiv.scrollLeft,this.selectedCell.rowStart+this.rowSizes[this.selectedCell.row]-this.tableDiv.clientHeight)
                }
            }
            e.preventDefault();
            this.drawHeader();
            this.drawRowIndices();
            if(!this.drawLoopId) this.draw();
        }
        else if(e.key.toLowerCase()==="c" && e.ctrlKey){
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
        else if(e.key.toLowerCase()==="v" && e.ctrlKey){
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
        else if(`abcdefghijklmnopqrstuvwxyz0123456789\`~!@#$%^&*()-_=+[{]}'"|\\;:'",<.>/?`.includes(e.key.toLowerCase()) && !e.ctrlKey){
        // else if(e.key.charCodeAt()>=33 && e.key.charCodeAt()<=126 && !e.ctrlKey){
        // else{
            // console.log(e.key, e.key.charCodeAt())
            this.lineDashOffset = null;
            if(this.drawLoopId) window.cancelAnimationFrame(this.drawLoopId)
            this.drawLoopId = null
        // else if(e.keyCode>=48 && e.keyCode<=90){
            // if user types directly
            this.cellPreviousvalue = this.data?.[this.selectedCell.row]?.[this.selectedCell.col] ? JSON.parse(JSON.stringify(this.data?.[this.selectedCell.row]?.[this.selectedCell.col])) : null;
            this.inputEditor.style.display="grid";
            this.inputEditor.style.left = (this.selectedCell.colStart) + "px"
            this.inputEditor.style.top = (this.selectedCell.rowStart) + "px"
            this.inputEditor.style.width = (this.colSizes[this.selectedCell.col]-1) + "px";
            this.inputEditor.style.height = (this.rowSizes[this.selectedCell.row]-1)+"px"
            let inputRef = this.inputEditor.querySelector("input")
            inputRef.value = "";
            inputRef.focus();
        }

        this.dispatchAggregateEvent();
        if(0>=Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col) || 0>=Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row)){
            this.selectButton.setAttribute("data-showdot","")
        }
        else{
            this.selectButton.removeAttribute("data-showdot")
        }
    }

    /**
     * Function to detect if pointer is near column boundaries and changes cursor type
     * @param {PointerEvent} e 
     */
    colResizeCursorMove = (e)=>{

        let firstCellInView = this.getCellClickIndex({offsetX:0, offsetY:0});
        let currPosX = e.offsetX + this.tableDiv.scrollLeft
        let boundary = firstCellInView.startPosCol + this.colSizes[firstCellInView.colIndex];
        for(var i=firstCellInView.colIndex; boundary<this.tableDiv.scrollLeft+this.tableDiv.clientWidth && i<this.colSizes.length ; i++,boundary+=this.colSizes[i]){
            if(Math.abs(currPosX-boundary)<=3){
                e.target.style.cursor = "col-resize";
                // console.log(`near boundary of cell ${i}`);
                break;
            }
            e.target.style.cursor = "url('./assets/columnselect.cur'),default";   
        }
    }

    /**
     * Function to detect if pointer is near row boundaries and changes cursor type
     * @param {PointerEvent} e 
     */
    rowResizeCursorMove = (e)=>{
        let firstCellInView = this.getCellClickIndex({offsetX:0, offsetY:0});
        let currPosY = e.offsetY + this.tableDiv.scrollTop
        let boundary = firstCellInView.startPosRow + this.rowSizes[firstCellInView.rowIndex];
        for(var i=firstCellInView.rowIndex; boundary<this.tableDiv.scrollTop+this.tableDiv.clientHeight && i<this.rowSizes.length; i++,boundary+=this.rowSizes[i]){
            if(Math.abs(currPosY-boundary)<=3){
                e.target.style.cursor = "row-resize";
                break;
            }
            e.target.style.cursor = "url('./assets/rowselect.cur'),default";   
        }
    }

    /**
     * Pointer down handler for column canvas,
     * can perform resize or column selection based on pointer position
     * @param {PointerEvent} e 
     */
    colResizePointerDown(e){
        e.preventDefault();
        this.headerRef.removeEventListener("pointermove",this.colResizeCursorMove)
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
             * pointer move handler for multiple column selection
             * @param {PointerEvent} eMove 
             */
            let multipleColumnPointerMoveHandler = (eMove)=>{
                eMove.preventDefault();
                // console.log("move while multi col select")
                let newX = (e.offsetX + eMove.clientX - e.clientX)
                // console.log(newX);
                let {startPosCol, colIndex} = this.getCellClickIndex({offsetX:newX, offsetY:0});
                // console.log(startPosCol, colIndex);
                this.selectedRangeEnd.col = colIndex
                this.selectedRangeEnd.colStart=startPosCol
                if(this.selectedRangeEnd.colStart+this.colSizes[this.selectedRangeEnd.col] +50 > this.tableDiv.scrollLeft+this.tableDiv.clientWidth){
                    this.tableDiv.scrollBy(+50, 0)
                }
                if(this.selectedRangeEnd.colStart < this.tableDiv.scrollLeft + 50){
                    this.tableDiv.scrollBy(-50, 0)
                }
                this.drawHeader();
                this.drawRowIndices();
                if(!this.drawLoopId) this.draw();

                // let newY = (e.offsetY + eMove.clientY - e.clientY)
            }
            /**
             * Pointer up handler for multiple column selection
             * @param {PointerEvent} eUp 
             */
            let multipleColumnPointerUpHandler = (eUp)=>{
                eUp.preventDefault();
                this.headerRef.addEventListener("pointermove",this.colResizeCursorMove)
                // console.log("upped while multi col select")
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
         * pointer move handler for column resize
         * @param {PointerEvent} eMove 
         */
        let colResizePointerMove = (eMove)=>{
            eMove.preventDefault();
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
        /**
         * Pointer up handler for column resize
         * @param {PointerEvent} eUp 
         */
        let colResizePointerUp = (eUp)=>{
            eUp.preventDefault();
            this.headerRef.addEventListener("pointermove",this.colResizeCursorMove)
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
                
                
            }
            // console.log(eUp);
            this.wrapTextForColumn(i);
            this.drawHeader()
            if(!this.drawLoopId){this.draw()}
            // this.draw();
            this.drawRowIndices();
            // if(!this.drawLoopId) {this.drawLoopId = window.requestAnimationFrame(()=>this.draw())}
            // window.localStorage.setItem("colSizes",JSON.stringify(this.colSizes))
            window.removeEventListener("pointermove",colResizePointerMove);
            window.removeEventListener("pointerup",colResizePointerUp);    
        }
        /**
         * Pointer leave handler for header canvas
         */
        // let colResizePointerLeave = () =>{
        //     this.wrapTextForColumn(i);
        //     this.draw();
        //     this.drawRowIndices();
        //     // window.localStorage.setItem("colSizes",JSON.stringify(this.colSizes))
        //     window.removeEventListener("pointermove",colResizePointerMove);
        //     window.removeEventListener("pointerup",colResizePointerUp);
        //     window.removeEventListener("pointerleave",colResizePointerLeave);
        // }
        window.addEventListener("pointermove",colResizePointerMove);
        window.addEventListener("pointerup",colResizePointerUp);
        // window.addEventListener("pointerleave",colResizePointerLeave);
        
    }

    /**
     * Pointer down handler on row canvas,
     * can perform resize or row selection based on pointer position
     * @param {PointerEvent} e 
     */
    rowResizePointerDown(e){
        e.preventDefault();
        this.rowRef.removeEventListener("pointermove", this.rowResizeCursorMove);
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

            /**
             * Pointer move handler to select multiple rows
             * @param {PointerEvent} eMove 
             */
            let multipleRowPointerMoveHandler = (eMove)=>{
                eMove.preventDefault();
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
            /**
             * Pointer up handler for multiple rows selection
             */
            let multipleRowPointerUpHandler = ()=>{
                this.rowRef.addEventListener("pointermove", this.rowResizeCursorMove);

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
         * Pointer move handler for row resize
         * @param {PointerEvent} eMove 
         */
        let rowResizePointerMove = (eMove)=>{
            eMove.preventDefault();
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
        /**
         * Pointer up handler for row resize
         */
        let rowResizePointerUp = ()=>{
            this.rowRef.addEventListener("pointermove", this.rowResizeCursorMove);

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
        /**
         * Pointer leace handler for row canvas
         */
        // let rowResizePointerLeave = () =>{
        //     // window.localStorage.setItem("rowSizes", JSON.stringify(this.rowSizes))
        //     window.removeEventListener("pointermove",rowResizePointerMove);
        //     window.removeEventListener("pointerup",rowResizePointerUp);
        //     window.removeEventListener("pointerleave",rowResizePointerLeave);
        // }
        window.addEventListener("pointermove",rowResizePointerMove);
        window.addEventListener("pointerup",rowResizePointerUp);
        // window.addEventListener("pointerleave",rowResizePointerLeave);
    }

    /**
     * Function to copy cells data to the static cellsCopiedArray
     */
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
        navigator.clipboard.writeText(text)
        // console.log(Sheet.cellsCopiedArray);
    }

    /**
     * Function to paste copied cells data to the sheet
     */
    pasteRangeToClipboard(){
        if(Sheet.cellsCopiedArray.length==0){return}
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
            this.selectedRangeEnd.rowStart += (this.rowSizes[firstRow+i] || this.defaultConfig.rowHeight)
            // console.log("added to row",this.rowSizes[firstRow+i])
        }
        for(let i=0; i<Sheet.cellsCopiedArray[Sheet.cellsCopiedArray.length - 1][1]; i++){
            this.selectedRangeEnd.col +=1;
            this.selectedRangeEnd.colStart += (this.colSizes[firstCol+i] || this.defaultConfig.colWidth)
        }
    }

    /**
     * Function to get aggregate values (minimum, average, maximum) for the selected range
     * @returns {[Number, Number, Number]}
     */
    calculateAggregates(){
        let arr=[];
        // if(this.selectedRangeStart.col != this.selectedRangeEnd.col){return [null,null,null];}
        // let start = Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row);
        // let end = Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row);
        // for(let i=start; i<=end;i++){
        //     if(this.data[i] && this.data[i][this.selectedRangeStart.col] && !isNaN(Number(this.data[i][this.selectedRangeStart.col].text))){
        //         arr.push(Number(this.data[i][this.selectedRangeStart.col].text))
        //     }
        // }
        let startRow = Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row);
        let endRow = Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row);
        let startCol = Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col);
        let endCol = Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col);
        for(let i=startRow; i<=endRow; i++){
            if(this.data[i]){
                for(let j=startCol; j<=endCol; j++){
                    if(this.data[i][j]?.text && !isNaN(Number(this.data[i][j].text))){
                        arr.push(Number(this.data[i][j].text))
                    }
                }
            }
        }
        let min = Math.min(...arr)
        let max = Math.max(...arr)
        let sum = arr.reduce((a,b)=>a+b,0)
        let mean = sum/arr.length
        return [min==Infinity ? 0 : min,isNaN(mean) ? 0 : mean,max==-Infinity ? 0 : max, sum];
    }

    /**
     * Function to auto-resize column based on text length
     * @param {PointerEvent} e 
     */
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

    /**
     * Function to wrap text entered in the input box and write it to the cells data
     * @param {String} textContent - text content of input box on which wrapping is performent
     */
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

    /**
     * Function to wrap a specific cell
     * @param {Number} row - row Index of cell to be wrapped
     * @param {Number} col - column index of cell to be wrapped
     * @returns 
     */
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
     * Function to rewrap all wrapped cells for a specific column
     * @param {Number} colIndex 
     */
    async wrapTextForColumn(colIndex){
        let rows = Object.keys(this.data).filter(x=>this.data[x][colIndex]?.textWrap)
        rows.forEach(r=>{
            let w=2*this.defaultConfig.fontPadding, s1="";
            let wrappedText = [];
            this.tableContext.save();
            this.tableContext.font = `${this.defaultConfig.fontSize}px ${this.defaultConfig.font}`
            for(let x of (this.data[r][colIndex].text || "")){
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

    /**
     * Funtion to wrap cells within the selected range
     */
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

    /**
     * Function to draw graph for the selected range
     * @param {String} type - type of chart to be drawn
     */
    getGraphData(type="bar"){
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
    /**
     * Function to find the specified text within the sheet
     * @param {String} textContent - string to search within the sheet data
     * @returns {[Number, Number]}
     */
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
     * Scrolls the cell with specified row and column into view
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
            this.selectedCell = {col:col, row:row, rowStart:yPos, colStart:xPos}
            this.selectedRangeStart = JSON.parse(JSON.stringify(this.selectedCell))
            this.selectedRangeEnd = JSON.parse(JSON.stringify(this.selectedCell))
            // console.log(xPos,yPos);
            if(xPos >= this.tableDiv.scrollLeft && xPos+this.colSizes[col] <= this.tableDiv.scrollLeft+this.tableDiv.clientWidth){
                xPos = this.tableDiv.scrollLeft;
            }
            if(yPos >= this.tableDiv.scrollTop && yPos+this.rowSizes[row] <= this.tableDiv.scrollTop+this.tableDiv.clientHeight){
                yPos = this.tableDiv.scrollTop;
            }
            this.tableDiv.scrollTo({left:xPos, top:yPos,behavior:"smooth"});
            this.drawHeader();
            this.drawRowIndices();
            if(!this.drawLoopId){this.draw();}
        }
    }

    /**
     * Replaces each occurence of partText from the cell at specified row and column with newText
     * @param {Number} row 
     * @param {Number} col 
     * @param {String} newText 
     * @param {String|null} partText 
     */
    replaceCellText(row, col, newText, partText){
        // if(!newText){newText=""}
        // console.log(row,col,newText, partText)
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

    /**
     * Funtion to dispatch event with aggregate details
     */
    dispatchAggregateEvent(){
        let e = new CustomEvent("aggregateValues",{detail:this.calculateAggregates()})
        window.dispatchEvent(e)
    }

    storeTempCellDataBeforeEditing(){

    }

}

// var debugDiv = document.querySelector("#debugDiv")