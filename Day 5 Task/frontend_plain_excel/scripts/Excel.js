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
        this.sheetTabContainer = document.createElement("div")
        this.sheetTabContainer.classList.add("sheetTabs")
        let firstSheet = document.createElement("input")
        firstSheet.classList.add("sheetTab")
        firstSheet.value="Sheet 1";
        firstSheet.setAttribute("readonly","")
        firstSheet.setAttribute("data-current","")
        firstSheet.setAttribute("data-index","0")
        this.sheetTabContainer.appendChild(firstSheet)
        let secondSheet = document.createElement("input")
        secondSheet.classList.add("sheetTab")
        secondSheet.value="Sheet 2";
        secondSheet.setAttribute("readonly","")
        secondSheet.setAttribute("data-index","1")
        this.sheetTabContainer.appendChild(secondSheet)
        sheetArrayChanger.appendChild(this.sheetTabContainer)
        firstSheet.addEventListener("click",e=>this.sheetTabClickHandler(e))
        firstSheet.addEventListener("dblclick",e=>this.sheetTabDoubleClickHandler(e))
        firstSheet.addEventListener("keydown",e=>this.sheetTabKeyHandler(e))
        secondSheet.addEventListener("click",e=>this.sheetTabClickHandler(e))
        secondSheet.addEventListener("dblclick",e=>this.sheetTabDoubleClickHandler(e))
        secondSheet.addEventListener("keydown",e=>this.sheetTabKeyHandler(e))
        
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
        window.s = sheet_1;
        this.sheets.push(sheet_1);
        this.currentSheetIndex = 0;
        this.loadSheet(0);
        let sheet_2 = new Sheet(this.sheetContainer);
        this.sheets.push(sheet_2);
    }
    
    loadSheet(index){
        if(index>=this.sheets.length || index<0){
            throw new Error(`Cannot load sheet at index ${index}, index out of bounds.`)
        }
        // console.log(`Removing sheet ${this.currentSheetIndex}\nAttaching sheet ${index}`);
        this.sheets[this.currentSheetIndex].containerDiv.remove();
        this.sheetContainer.appendChild(this.sheets[index].containerDiv)
        this.sheets[index].fixCanvasSize();
        this.sheets[index].draw();
        this.sheets[index].drawRowIndices();
        this.sheets[index].drawHeader();
        this.currentSheetIndex = index;
        console.log("Loading sheet at "+index);

    }
    newSheet(){
        let newSheet = new Sheet(this.sheetContainer)
        this.sheets.push(newSheet);
        // this.loadSheet(this.sheets.length - 1)
        let newSheetTab = document.createElement("input")
        newSheetTab.classList.add("sheetTab")
        newSheetTab.value=`Sheet ${this.sheets.length}`;
        newSheetTab.setAttribute("readonly","")
        newSheetTab.setAttribute("data-index",this.sheets.length-1)
        newSheetTab.addEventListener("click",e=>this.sheetTabClickHandler(e))
        newSheetTab.addEventListener("dblclick",e=>this.sheetTabDoubleClickHandler(e))
        newSheetTab.addEventListener("keydown",e=>this.sheetTabKeyHandler(e))
        this.sheetTabContainer.appendChild(newSheetTab)
    }
    goToPrevSheet(){
        let tabs = this.sheetTabContainer.querySelectorAll("input")
        tabs[this.currentSheetIndex].removeAttribute("data-current")
        if(this.currentSheetIndex>0){
            this.loadSheet(this.currentSheetIndex-1)
        }
        else{
            this.loadSheet(this.sheets.length-1)
        }
        tabs[this.currentSheetIndex].setAttribute("data-current","")
    }
    goToNextSheet(){
        let tabs = this.sheetTabContainer.querySelectorAll("input")
        tabs[this.currentSheetIndex].removeAttribute("data-current")
        if(this.currentSheetIndex<this.sheets.length-1){
            this.loadSheet(this.currentSheetIndex+1)
        }
        else{
            this.loadSheet(0)
        }
        tabs[this.currentSheetIndex].setAttribute("data-current","")
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
    sheetTabClickHandler(e){
        e.target.parentElement.querySelectorAll("input").forEach(t1=>{
            t1.removeAttribute("data-current")
            t1.setAttribute("readonly","")
          })
        e.target.setAttribute("data-current","true")
        this.loadSheet(e.target.dataset["index"])
    }
    sheetTabDoubleClickHandler(e){
        e.target.focus();
        e.target.removeAttribute("readonly")
    }
    sheetTabKeyHandler(e){
        if(e.key==="Enter"){
              e.target.setAttribute("readonly","")
        }
    }

}