'use strict';

// let data = await fetch("./tempData.json")
// data = await data.json();
import {data} from "./tempData.js"
console.log(data);

export class Sheet{

    colSizes = Array(40).fill(100)
    rowSizes = Array(100).fill(40)
    // dataColumns = ["Email ID","Name","Country","State","City","Telephone number","Address line 1","Address line 2","Date of Birth","FY2019-20","FY2020-21","FY2021-22","FY2022-23","FY2023-24"];
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
    columnGutterColor = "black"
    // rowDrawStart = {position: 0, index:0}
    // rowDrawEnd = {position: 0, index:0}
    // colDrawStart = {position: 0, index:0}
    // colDrawEnd = {position: 0, index:0}
    /**@type {(null|{row:number, col:number, rowStart: number, colStart: number})} */
    selectedCell = null
    /**@type {(null|{row:number, col:number, rowStart: number, colStart: number})} */
    selectedRangeStart = null
    /**@type {(null|{row:number, col:number, rowStart: number, colStart: number})} */
    selectedRangeEnd = null
    
    // dom elements : 1 header canvas, 1 row canvas, 1 table canvas
    constructor(divRef){
        // creating canvas elements and contexts
        this.data = window.localStorage.getItem('data') ? JSON.parse(window.localStorage.getItem('data')) : data;
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
        divRef.appendChild(this.containerDiv)

        this.fixCanvasSize();
        this.drawHeader();
        this.drawRowIndices();
        this.draw();

        // console.log(this)
        this.tableDiv.addEventListener("scrollend", (e)=>{
            this.checkIfReachedEndOfColumns();
            this.checkIfReachedEndOfRows();
            // this.draw();
        });

        this.tableDiv.addEventListener("scroll",(e)=>{
            this.drawHeader();
            this.drawRowIndices();
            // this.resizeBasedOnViewPort();
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
            this.draw();
        })
        this.inputEditor.querySelector("input").addEventListener("keyup",(e)=>{
            this.inputEditorKeyHandler(e)
            
        })
        this.tableRef.addEventListener("pointerdown",(e)=>{
            this.canvasPointerDown(e);
        })
        window.addEventListener("keydown",(e)=>{
            this.canvasKeyHandler(e)
        })
    }

    drawHeader() {
        // let tempArr = [];
        this.headerContext.setTransform(1, 0, 0, 1, 0, 0);
        this.headerContext.clearRect(0,0,this.headerRef.width,this.headerRef.height);
        this.headerContext.translate(-this.tableDiv.scrollLeft, 0);
        // this.colSizes.reduce((prev,curr,currIndex)=>{
        //     if(prev+curr >= this.tableDiv.scrollLeft && prev-curr<=(this.tableDiv.scrollLeft+this.tableDiv.clientWidth)){
        //     this.headerContext.save();
        //     this.headerContext.beginPath();
        //     this.headerContext.rect(prev,0, curr, this.rowHeight);
        //     this.headerContext.strokeStyle = this.columnGutterColor;
        //     this.headerContext.stroke();
        //     this.headerContext.clip();
        //     this.headerContext.font = `bold ${this.fontSize}px ${this.font}`;
        //     this.headerContext.fillStyle = `${this.fontColor}`;
        //     this.headerContext.fillText(Sheet.numToBase26ForHeader(currIndex), prev+this.fontPadding, this.rowHeight-this.fontPadding)
        //     // tempArr.push(curr)
        //     // this.headerContext.moveTo(prev+curr, 0);
        //     // this.headerContext.lineTo(prev+curr, this.rowHeight);
        //     this.headerContext.restore();
        //     }
        //     return prev+curr;
        // },0)
        // let tempArr = [];
        let {startPosCol, colIndex} = this.getCellClickIndex({offsetX:0, offsetY:0});
        // console.log(colIndex)
        for(let i=colIndex; startPosCol<=(this.tableDiv.scrollLeft+this.tableDiv.clientWidth); i++){
            this.headerContext.save();
            this.headerContext.beginPath();
            this.headerContext.rect(startPosCol,0, this.colSizes[i], this.rowHeight);
            // this.headerContext.strokeStyle = this.columnGutterColor;
            this.headerContext.stroke();
            this.headerContext.clip();
            this.headerContext.font = `bold ${this.fontSize}px ${this.font}`;
            this.headerContext.fillStyle = `${this.fontColor}`;
            this.headerContext.fillText(Sheet.numToBase26ForHeader(i), startPosCol+this.fontPadding, this.rowHeight-this.fontPadding)
            if(this.selectedRangeStart && this.selectedRangeEnd && i<=Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col) && i>=Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col)){
                this.headerContext.beginPath();
                this.headerContext.moveTo(startPosCol, this.rowHeight-0.5);
                this.headerContext.lineTo(startPosCol+this.colSizes[i], this.rowHeight-0.5)
                this.headerContext.strokeStyle = "green"
                this.headerContext.lineWidth = 5;
                this.headerContext.stroke();
            }
            // tempArr.push(i)
            // this.headerContext.moveTo(prev+curr, 0);
            // this.headerContext.lineTo(prev+curr, this.rowHeight);
            this.headerContext.restore();
            startPosCol+=this.colSizes[i]
        }
        // console.log("Columns drawn in header: "+tempArr.length);
    }

    drawRowIndices(){
        // let tempArr=[];
        this.rowContext.setTransform(1, 0, 0, 1, 0, 0);
        this.rowContext.clearRect(0,0,this.rowRef.width, this.rowRef.height)
        this.rowContext.translate(0,-this.tableDiv.scrollTop)
        // this.rowSizes.reduce((prev,curr,currIndex)=>{
        //     if(prev+curr >= this.tableDiv.scrollTop && prev-curr<=(this.tableDiv.scrollTop+this.tableDiv.clientHeight)){
        //     this.rowContext.save();
        //     this.rowContext.beginPath();
        //     this.rowContext.rect(0,prev, this.colWidth, curr);
        //     this.rowContext.strokeStyle = this.columnGutterColor;
        //     this.rowContext.stroke();
        //     this.rowContext.clip();
        //     this.rowContext.font = `bold ${this.fontSize}px ${this.font}`;
        //     this.rowContext.fillStyle = `${this.fontColor}`;
        //     this.rowContext.textAlign = "right"
        //     this.rowContext.fillText(currIndex, this.colWidth-this.fontPadding, prev+curr-this.fontPadding)
        //     // tempArr.push(curr)
        //     // this.rowContext.moveTo(0,prev+curr);
        //     // this.rowContext.lineTo(this.colWidth,prev+curr);
        //     this.rowContext.restore();
        //     }
        //     return prev+curr;
        // },0)
        let {startPosRow, rowIndex} = this.getCellClickIndex({offsetX:0, offsetY:0})
        // console.log(startPosRow, rowIndex)
        for(let i=rowIndex; startPosRow<=(this.tableDiv.scrollTop+this.tableDiv.clientHeight); i++){
            this.rowContext.save();
            this.rowContext.rect(0,startPosRow, this.colWidth, this.rowSizes[i]);
            // this.rowContext.strokeStyle = this.columnGutterColor;
            this.rowContext.clip();
            this.rowContext.stroke();
            this.rowContext.font = `bold ${this.fontSize}px ${this.font}`;
            this.rowContext.fillStyle = `${this.fontColor}`;
            this.rowContext.textAlign = "right"
            this.rowContext.fillText(i, this.colWidth-this.fontPadding, startPosRow+this.rowSizes[i]-this.fontPadding)
            // tempArr.push(i)
            this.rowContext.beginPath();
            if(this.selectedRangeStart && this.selectedRangeEnd && i<=Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row) && i>=Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row))
            this.rowContext.moveTo(this.colWidth-0.5, startPosRow);
            this.rowContext.lineTo(this.colWidth-0.5, startPosRow+this.rowSizes[i])
            this.rowContext.strokeStyle = "green"
            this.rowContext.lineWidth = 5;
            this.rowContext.stroke();
            startPosRow+=this.rowSizes[i];
            this.rowContext.restore();
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

    draw(){
        // console.log("redrawing...")
        // this.tableContext.translate()
        // console.log(this.tableContext)
        this.tableContext.setTransform(1, 0, 0, 1, 0, 0);
        this.tableContext.clearRect(0, 0, this.tableRef.width, this.tableRef.height);
        this.tableContext.translate(-this.tableDiv.scrollLeft, -this.tableDiv.scrollTop)
        
        // this.colSizes.reduce((prev,curr)=>{
        //     this.tableContext.beginPath();
        //     this.tableContext.save();
        //     this.tableContext.moveTo(prev + curr, this.tableDiv.scrollTop);
        //     this.tableContext.lineTo(prev + curr, this.tableRef.height+this.tableDiv.scrollTop);
        //     this.tableContext.strokeStyle = this.columnGutterColor;
        //     this.tableContext.stroke();
        //     this.tableContext.restore();
        //     return prev + curr;
        // },0)

        // this.rowSizes.reduce((prev,curr)=>{
        //     this.tableContext.beginPath();
        //     this.tableContext.save();
        //     this.tableContext.moveTo(this.tableDiv.scrollLeft, prev + curr);
        //     this.tableContext.lineTo(this.tableRef.width + this.tableDiv.scrollLeft, prev + curr);
        //     this.tableContext.strokeStyle = this.columnGutterColor;
        //     this.tableContext.stroke();
        //     this.tableContext.restore();
        //     return prev + curr;
        // },0)

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
        //                 this.tableContext.font = `${this.fontSize}px ${this.font}`
        //                 // this.tableContext.fillText(`R${r},C${c}`, sumColSizes+this.fontPadding, sumRowSizes + this.rowSizes[r] - this.fontPadding)
        //                 this.tableContext.fillText(!this.data[r] || !this.data[r][c] ? "" : this.data[r][c].text, sumColSizes+this.fontPadding, sumRowSizes + this.rowSizes[r] - this.fontPadding)
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
        for(let r=rowIndex; sumRowsizes<=(this.tableDiv.scrollTop+this.tableDiv.clientHeight);r++){
            // rowCount++;
            sumColSizes=startPosCol;
            for(let c=colIndex; sumColSizes<=(this.tableDiv.scrollLeft+this.tableDiv.clientWidth); c++){
                this.tableContext.save();
                this.tableContext.beginPath();
                this.tableContext.rect(sumColSizes, sumRowsizes, this.colSizes[c], this.rowSizes[r]);
                this.tableContext.clip();
                // this.tableContext.lineWidth=1
                // if(this.selectedCell?.row==r && this.selectedCell?.col==c){
                //     this.tableContext.lineWidth = 3;
                //     this.tableContext.strokeStyle = "green";
                // }
                // else{
                //     this.tableContext.strokeStyle = this.columnGutterColor;
                // }
                if(this.selectedRangeStart && this.selectedRangeEnd && 
                    c>=Math.min(this.selectedRangeStart.col, this.selectedRangeEnd.col) && c<=Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col) &&
                    r>=Math.min(this.selectedRangeStart.row, this.selectedRangeEnd.row) && r<=Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row)
                ){
                    if(this.selectedCell && c==this.selectedCell.col && r==this.selectedCell.row){}
                    else{
                        this.tableContext.fillStyle = "#00800060"
                        this.tableContext.fill();
                    }
                }
                this.tableContext.lineWidth = 1.5
                this.tableContext.strokeStyle = "#000f"
                this.tableContext.stroke();
                this.tableContext.font = `${this.fontSize}px ${this.font}`
                // this.tableContext.fillText(`R${r},C${c}`, sumColSizes+this.fontPadding, sumRowsizes + this.rowSizes[r] - this.fontPadding)
                this.tableContext.fillStyle = "black"
                this.tableContext.fillText(!this.data[r] || !this.data[r][c] ? "" : this.data[r][c].text, sumColSizes+this.fontPadding, sumRowsizes + this.rowSizes[r] - this.fontPadding)
                // await new Promise(r=>setTimeout(r,100))
                this.tableContext.restore();
                sumColSizes+=this.colSizes[c]
                // console.log("drawing col")
            }

            sumRowsizes+=this.rowSizes[r]
        }
        if(this.selectedRangeStart && this.selectedRangeEnd){
            // console.log(this.selectedRangeStart);
            // console.log(this.selectedRangeEnd);
            let rectStartX = Math.min(this.selectedRangeStart.colStart, this.selectedRangeEnd.colStart)
            let rectStartY = Math.min(this.selectedRangeStart.rowStart, this.selectedRangeEnd.rowStart)
            let rectWidth =  Math.max(this.selectedRangeStart.colStart, this.selectedRangeEnd.colStart) + this.colSizes[Math.max(this.selectedRangeStart.col, this.selectedRangeEnd.col)] - rectStartX
            let rectHeight = Math.max(this.selectedRangeStart.rowStart, this.selectedRangeEnd.rowStart) + this.rowSizes[Math.max(this.selectedRangeStart.row, this.selectedRangeEnd.row)] - rectStartY
            // console.log(rectStartX, rectStartY, rectWidth, rectHeight);
            this.tableContext.save();
            this.tableContext.beginPath();
            this.tableContext.strokeStyle = "#008000"
            this.tableContext.lineWidth = 3
            this.tableContext.rect(rectStartX+0.5, rectStartY+0.5, rectWidth-1, rectHeight-1)
            this.tableContext.stroke();
            // this.tableContext.fill();
            this.tableContext.restore();
        }
        // if(this.selectedCell){
        //     this.tableContext.save();
        //     this.tableContext.beginPath();
        //     this.tableContext.strokeStyle = "#008000"
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
        this.tableRef.width = this.tableDiv.parentElement.clientWidth - this.colWidth - 18
        this.tableRef.height = this.tableDiv.parentElement.clientHeight - this.rowHeight - 18
        
        this.headerRef.width = this.tableRef.width + 18;
        this.headerRef.height = this.rowHeight

        this.rowRef.width = this.colWidth
        this.rowRef.height = this.tableRef.height + 18
    }

    checkIfReachedEndOfColumns(e){
        let status =  this.tableDiv.scrollWidth - this.tableDiv.clientWidth - this.tableDiv.scrollLeft > 50 ? false : true;
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
        let status = this.tableDiv.scrollHeight - this.tableDiv.clientHeight - this.tableDiv.scrollTop > 50 ? false : true;
        if(status){
            this.rowSizes = [...this.rowSizes, ...Array(50).fill(50)]
            this.fixCanvasSize();
            this.draw();
            this.drawHeader();
            this.drawRowIndices();
        }
    }

    /**
     * 
     * @param {MouseEvent} e 
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
        let {startPosRow : startPosRowDown, startPosCol:startPosColDown, rowIndex:rowIndexDown, colIndex:colIndexDown} = this.getCellClickIndex(e);
        if(e.shiftKey){
            if(this.selectedRangeStart){
                this.selectedRangeEnd = {row: rowIndexDown, col: colIndexDown, rowStart: startPosRowDown, colStart: startPosColDown};
                this.draw();
                return;
            }
        }
        console.log("not shifted")
        this.selectedRangeStart = {row: rowIndexDown, col: colIndexDown, rowStart: startPosRowDown, colStart: startPosColDown}
        this.selectedRangeEnd = {row: rowIndexDown, col: colIndexDown, rowStart: startPosRowDown, colStart: startPosColDown}
        this.selectedCell = {row: rowIndexDown, col: colIndexDown, rowStart: startPosRowDown, colStart: startPosColDown}
        this.inputEditor.style.display = "none"
        this.draw();
        // console.log(this.selectedRangeStart);
        // if(this.selectedCell && rowIndexDown!=this.selectedCell.row && colIndexDown!=this.selectedCell.col){
            //     this.tableContext.clearRect()
            // }
        let canvasPointerUp = (eUp)=>{
            let {startPosRow : startPosRowDown, startPosCol:startPosColDown, rowIndex:rowIndexDown, colIndex:colIndexDown} = this.getCellClickIndex(eUp);
            this.selectedRangeEnd = {row: rowIndexDown, col: colIndexDown, rowStart: startPosRowDown, colStart: startPosColDown}

            // console.log(this.selectedRangeEnd);
            this.tableRef.removeEventListener("pointermove", canvasPointerMove);
            this.tableRef.removeEventListener("pointerup", canvasPointerUp);
            this.drawRowIndices();
            this.drawHeader();
            this.draw();
        }
        let canvasPointerMove = (eMove)=>{
            let {startPosRow : startPosRowMove, startPosCol:startPosColMove, rowIndex:rowIndexMove, colIndex:colIndexMove} = this.getCellClickIndex(eMove);
            if(this.selectedRangeEnd && (rowIndexMove!=this.selectedRangeEnd.row || colIndexMove!=this.selectedRangeEnd.col)){
                this.selectedRangeEnd = {row: rowIndexMove, col: colIndexMove, rowStart: startPosRowMove, colStart: startPosColMove}
                // console.log(this.selectedRangeEnd);
                this.drawHeader();
                this.drawRowIndices();
                this.draw();
            }
        }
        let canvasPointerLeave = (eLeave)=>{
            this.tableRef.removeEventListener("pointermove", canvasPointerMove);
            this.tableRef.removeEventListener("pointerup", canvasPointerUp);
            this.tableRef.removeEventListener("pointerleave", canvasPointerLeave);
        }
        // let pointerUp = canvasPointerUp
        this.tableRef.addEventListener("pointerup", canvasPointerUp);
        this.tableRef.addEventListener("pointermove",canvasPointerMove);
        this.tableRef.addEventListener("pointerleave", canvasPointerLeave);

        
    }

    canvasDoubleClickHandler(e){
        this.selectedRangeStart = null;
        this.selectedRangeEnd = null;
        let {startPosRow, startPosCol, rowIndex, colIndex} = this.getCellClickIndex(e);
        this.selectedCell = {row:rowIndex, col:colIndex, rowStart:startPosRow, colStart: startPosCol}
        // console.log(this.selectedCell);
        this.inputEditor.style.display="grid";
        this.inputEditor.style.left = (startPosCol-1) + "px"
        this.inputEditor.style.top = (startPosRow-1) + "px"
        this.inputEditor.style.width = (this.colSizes[colIndex]+2) + "px";
        this.inputEditor.style.height = (this.rowSizes[rowIndex]+2)+"px"
        let inputRef = this.inputEditor.querySelector("input")
        inputRef.value = this.data[this.selectedCell.row] && this.data[this.selectedCell.row][this.selectedCell.col] ? this.data[this.selectedCell.row][this.selectedCell.col]['text'] : ""
        // console.log(this.data[this.selectedCell.row] && this.data[this.selectedCell.row][this.selectedCell.col] ? this.data[this.selectedCell.row][this.selectedCell.col]['text'] : "nope")
        inputRef.focus();
        this.draw();
    }

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
            // this.selectedCell = null;
            window.localStorage.setItem('data',JSON.stringify(this.data));
        }
        else if(e.key=="Escape"){
            this.inputEditor.style.display = "none";
        }
        this.draw();
    }

    canvasKeyHandler(e){
        // console.log(e);
        if(e.key=="ArrowLeft" && this.selectedCell){
            // this.selectedRangeEnd = null;
            // this.selectedRangeStart = null;
            if(this.selectedCell.col!=0){
                this.selectedCell.col = this.selectedCell.col-1
                this.selectedCell.colStart = this.selectedCell.colStart - this.colSizes[this.selectedCell.col]
                // console.log(this.selectedCell);
                this.selectedRangeStart = this.selectedCell
                this.selectedRangeEnd = this.selectedCell
                if(this.selectedCell.colStart<this.tableDiv.scrollLeft){
                    this.tableDiv.scrollBy(-this.colSizes[this.selectedCell.col],0)
                }
                this.draw();
                e.preventDefault();
            }
        }
        else if(e.key=="ArrowRight" && this.selectedCell){
            // this.selectedRangeEnd = null;
            // this.selectedRangeStart = null;
            this.selectedCell.colStart = this.selectedCell.colStart + this.colSizes[this.selectedCell.col]
            this.selectedCell.col = this.selectedCell.col+1
            // console.log(this.selectedCell);
            this.selectedRangeStart = this.selectedCell
            this.selectedRangeEnd = this.selectedCell
            // console.log(this.selectedCell.colStart+this.colSizes[this.selectedCell.col], this.tableDiv.scrollLeft+this.tableDiv.clientWidth)
            if(this.selectedCell.colStart+this.colSizes[this.selectedCell.col]>this.tableDiv.scrollLeft+this.tableDiv.clientWidth){
                this.tableDiv.scrollBy(this.colSizes[this.selectedCell.col],0)
            }
            e.preventDefault();
            this.draw();
        }
        else if(e.key=="ArrowUp" && this.selectedCell){
            // this.selectedRangeEnd = null;
            // this.selectedRangeStart = null;
            if(this.selectedCell.row!=0){
                this.selectedCell.row = this.selectedCell.row-1
                this.selectedCell.rowStart = this.selectedCell.rowStart - this.rowSizes[this.selectedCell.row]
                // console.log(this.selectedCell);
                this.selectedRangeStart = this.selectedCell
                this.selectedRangeEnd = this.selectedCell
                if(this.selectedCell.rowStart<this.tableDiv.scrollTop){
                    this.tableDiv.scrollBy(0,-this.rowSizes[this.selectedCell.row])
                }
                e.preventDefault();
                this.draw();
            }
        }
        else if(e.key=="ArrowDown" && this.selectedCell){
            // console.log("going down")
            // this.selectedRangeEnd = null;
            // this.selectedRangeStart = null;
            this.selectedCell.rowStart = this.selectedCell.rowStart + this.rowSizes[this.selectedCell.row]
            this.selectedCell.row = this.selectedCell.row+1
            // console.log(this.selectedCell);
            this.selectedRangeStart = this.selectedCell
            this.selectedRangeEnd = this.selectedCell
            if(this.selectedCell.rowStart+this.rowSizes[this.selectedCell.row]>this.tableDiv.scrollTop+this.tableDiv.clientHeight){
                this.tableDiv.scrollBy(0,this.rowSizes[this.selectedCell.row])
            }
            e.preventDefault();
            this.draw();
        }
    }

    colResizePointerDown(e){

    }

    // resizeBasedOnViewPort(e){
    //     console.log("resizing..")
    //     this.fixCanvasSize();
    //     this.drawHeader();
    //     this.drawRowIndices();
    // }
}


// collastpos = [180, 300, 420, 540, 660, 834, 954, 1074, 1194, 1314, 1414, 1514, 1614, 1714]