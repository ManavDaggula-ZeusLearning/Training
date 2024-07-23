import { Sheet } from "./Sheet.js";
export class Excel{
    /**
     * @type {Array.<Sheet>}
     */
    sheets = [];
    constructor(excelContainer){
        // console.log(excelContainer);
        this.menuDiv = document.createElement("div")
        this.menuDiv.classList.add("menuDiv")
        excelContainer.appendChild(this.menuDiv)
        this.sheetContainer = document.createElement("div")
        this.sheetContainer.classList.add("sheetContainer")
        excelContainer.appendChild(this.sheetContainer)

        /* Preparing menu panel */
        let sheetArrayChanger = document.createElement("div")
        sheetArrayChanger.classList.add("sheetArrayChanger")
        let newSheetBtn = document.createElement("button")
        newSheetBtn.textContent = "+"
        newSheetBtn.title = "New Sheet"
        newSheetBtn.addEventListener("click",()=>this.newSheet())
        sheetArrayChanger.appendChild(newSheetBtn)
        let prevSheetBtn = document.createElement("button")
        prevSheetBtn.textContent = "←"
        prevSheetBtn.title = "Previous Sheet"
        prevSheetBtn.addEventListener("click",()=>this.goToPrevSheet())
        sheetArrayChanger.appendChild(prevSheetBtn)
        let nextSheetBtn = document.createElement("button")
        nextSheetBtn.textContent = "→"
        nextSheetBtn.title = "Next Sheet"
        nextSheetBtn.addEventListener("click",()=>this.goToNextSheet())
        sheetArrayChanger.appendChild(nextSheetBtn)
        let textWrapperControl = document.createElement("div")
        textWrapperControl.classList.add("textWrapControl")
        let wrapBtn = document.createElement("button")
        wrapBtn.textContent = "Wrap Text"
        wrapBtn.addEventListener("click",()=>this.wrapText())
        textWrapperControl.appendChild(wrapBtn)
        let aggregateDiv = document.createElement("div")
        aggregateDiv.classList.add("aggregates")
        this.minSpan = document.createElement("span");
        this.minSpan.textContent = "Min: NA"
        this.maxSpan = document.createElement("span");
        this.maxSpan.textContent = "Max: NA"
        this.avgSpan = document.createElement("span");
        this.avgSpan.textContent = "Avg: NA"
        let recalculateAggregateBtn = document.createElement("button")
        recalculateAggregateBtn.textContent = "Recalculate"
        recalculateAggregateBtn.addEventListener("click",()=>this.recalculateAggregates())
        aggregateDiv.appendChild(this.minSpan)
        aggregateDiv.appendChild(this.maxSpan)
        aggregateDiv.appendChild(this.avgSpan)
        aggregateDiv.appendChild(recalculateAggregateBtn)
        this.menuDiv.appendChild(sheetArrayChanger)
        this.menuDiv.appendChild(textWrapperControl)
        this.menuDiv.appendChild(aggregateDiv)



        let sheet_1 = new Sheet(this.sheetContainer);
        this.sheets.push(sheet_1);
        this.currentSheetIndex = 0;
        this.loadSheet(0);
    }
    
    loadSheet(index){
        if(index>=this.sheets.length || index<0){
            throw new Error(`Cannot load sheet at index ${index}, index out of bounds.`)
        }
        console.log(`Removing sheet ${this.currentSheetIndex}\nAttaching sheet ${index}`);
        this.sheets[this.currentSheetIndex].containerDiv.remove();
        this.sheetContainer.appendChild(this.sheets[index].containerDiv)
        this.sheets[index].fixCanvasSize();
        this.sheets[index].draw();
        this.sheets[index].drawRowIndices();
        this.sheets[index].drawHeader();
        this.currentSheetIndex = index;

    }
    newSheet(){
        let newSheet = new Sheet(this.sheetContainer)
        this.sheets.push(newSheet);
        this.loadSheet(this.sheets.length - 1)
        console.log(this.sheets);
    }
    goToPrevSheet(){
        if(this.currentSheetIndex>0){
            this.loadSheet(this.currentSheetIndex-1)
        }
        else{
            this.loadSheet(this.sheets.length-1)
        }
    }
    goToNextSheet(){
        if(this.currentSheetIndex<this.sheets.length-1){
            this.loadSheet(this.currentSheetIndex+1)
        }
        else{
            this.loadSheet(0)
        }
    }
    wrapText(){
        this.sheets[this.currentSheetIndex].wrapRangeSelection();
    }
    recalculateAggregates(){
        let aggValues = this.sheets[this.currentSheetIndex].calculateAggregates()
        // console.log(aggValues);
        this.minSpan.textContent = `Min : ${aggValues[0]}`
        this.avgSpan.textContent = `Avg : ${aggValues[1]}`
        this.maxSpan.textContent = `Max : ${aggValues[2]}`
    }

}