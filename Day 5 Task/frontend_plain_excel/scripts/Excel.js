import { Sheet } from "./Sheet.js";
export class Excel{
    /**
     * @type {Array.<Sheet>}
     */
    sheets = [];
    searchObject = {
        text:"",
        resultArray:[],
        currentIndex:null
    };
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
        let deleteSheetBtn = document.createElement("button")
        deleteSheetBtn.textContent = "-"
        deleteSheetBtn.title = "Delete Sheet"
        deleteSheetBtn.addEventListener("click",()=>this.deleteSheet())
        sheetArrayChanger.appendChild(deleteSheetBtn)
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

        let searchDiv = document.createElement("div")
        searchDiv.classList.add("searchDiv")
        // let searchInput = document.createElement("input")
        // searchInput.placeholder = "Search text here.."
        // searchInput.addEventListener("keypress",(e)=>{
        //     this.searchInputKeyHandler(e)
        // })
        let findAndReplaceBtn = document.createElement("button")
        findAndReplaceBtn.textContent = "Find And Replace";
        findAndReplaceBtn.addEventListener("click",(e)=>{
            this.popupDiv.style.display = "grid";
            this.popupDiv.appendChild(this.findAndReplaceForm)
            this.findAndReplaceForm["find"].focus();
        })
        searchDiv.appendChild(findAndReplaceBtn);
        
        
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
        this.menuDiv.appendChild(searchDiv)
        this.menuDiv.appendChild(aggregateDiv)

        this.popupDiv = document.createElement("div")
        this.popupDiv.classList.add("popup")
        document.body.prepend(this.popupDiv)

        this.findAndReplaceForm = this.createFindReplacePopup()



        let sheet_1 = new Sheet(this.sheetContainer);
        window.s = sheet_1;
        this.sheets.push(sheet_1);
        this.currentSheetIndex = 0;
        this.loadSheet(0);
        let sheet_2 = new Sheet(this.sheetContainer);
        this.sheets.push(sheet_2);

        window.addEventListener("keydown",(e)=>{
            this.excelKeyHandler(e)
        })
    }

    createFindReplacePopup(){
        let f = document.createElement("form")
        f.classList.add("find-and-replace")
        f.setAttribute("autocomplete","off")
        f.innerHTML = `<h3>Find and Replace</h3>
            <div class="option-tab">
                <label><input type="radio" name="find-and-replace" id="find-radio" value="find" checked>Find</label>
                <label><input type="radio" name="find-and-replace" id="replace-radio" value="replace">Replace</label>
            </div>
            <div class="find-bar">
                <p>Find</p>
                <input type="text" placeholder="Insert text to search" name="find">
            </div>
            <div class="replace-bar">
                <p>Replace</p>
                <input type="text" placeholder="Insert text to replace with" name="replace">
            </div>`
        let closeBtn = document.createElement("button")
        closeBtn.classList.add("close-btn")
        closeBtn.textContent = "x"
        f.appendChild(closeBtn)
        let btnDiv = document.createElement("div")
        btnDiv.classList.add("btn-div")
        let findBtn = document.createElement("button")
        findBtn.classList.add("find-btn")
        findBtn.textContent = "Find Next"
        btnDiv.appendChild(findBtn)
        let replaceBtn = document.createElement("button")
        replaceBtn.classList.add("replace-btn")
        replaceBtn.textContent = "Replace Next"
        btnDiv.appendChild(replaceBtn)
        f.appendChild(btnDiv)

        f.addEventListener("submit",(e)=>{
            e.preventDefault()
        })

        closeBtn.addEventListener("click",(e)=>{
            e.preventDefault();
            this.popupDiv.style.display = "none";
            f.style.top = "0px"
            f.style.left = "0px"
            f.remove();
        })

        findBtn.addEventListener("click",(e)=>{
            // console.log(findBtn.form.find.value)
            if(this.searchObject.text!=findBtn.form.find.value){
                // console.log(findBtn.form.find.value, this.searchObject)
                this.searchObject.text = findBtn.form.find.value;
                this.searchObject.resultArray = this.sheets[this.currentSheetIndex].find(findBtn.form.find.value)
                if(!this.searchObject.resultArray.length){
                    window.alert("Search not found.")    
                    return;
                }
                this.sheets[this.currentSheetIndex].scrollCellInView(this.searchObject.resultArray[0][0],this.searchObject.resultArray[0][1])
                this.searchObject.currentIndex = 0;
            }
            else{
                if(!this.searchObject.resultArray.length){
                    window.alert("Search not found.")    
                    return;
                }
                // if(e.shiftKey){
                //     this.searchObject.currentIndex = (this.searchObject.currentIndex-1)>=0 ? (this.searchObject.currentIndex-1) : this.searchObject.resultArray.length-1;
                // }else{
                //     this.searchObject.currentIndex = (this.searchObject.currentIndex+1)%this.searchObject.resultArray.length;
                // }
                this.searchObject.currentIndex = (this.searchObject.currentIndex+1)%this.searchObject.resultArray.length;
                this.sheets[this.currentSheetIndex].scrollCellInView(this.searchObject.resultArray[this.searchObject.currentIndex][0],this.searchObject.resultArray[this.searchObject.currentIndex][1])
            }
        })

        replaceBtn.addEventListener("click",(e)=>{
            if(this.searchObject?.resultArray?.length > 0 && this.searchObject?.text === replaceBtn.form.find.value){
                // console.log("should replace")
                let r = this.searchObject.resultArray[this.searchObject.currentIndex][0], c = this.searchObject.resultArray[this.searchObject.currentIndex][1];
                this.sheets[this.currentSheetIndex].replaceCellText(r,c,replaceBtn.form.replace.value, this.searchObject.text)
                this.searchObject.resultArray = this.searchObject.resultArray.slice(0,this.searchObject.currentIndex).concat(this.searchObject.resultArray.slice(this.searchObject.currentIndex+1))
                if(this.searchObject.resultArray.length){
                    this.searchObject.currentIndex %= this.searchObject.resultArray.length
                    this.sheets[this.currentSheetIndex].scrollCellInView(this.searchObject.resultArray[this.searchObject.currentIndex][0],this.searchObject.resultArray[this.searchObject.currentIndex][1])
                }
            }
            else{
                window.alert("cannot replace (did not find)")
            }
        })
        f.addEventListener("keydown",(e)=>{
            // console.log(e)
            if(e.key==="Escape"){
                this.popupDiv.style.display = "none";
                f.remove();
            }
        })
        f.querySelector("h3").addEventListener("pointerdown",(eDown)=>{
            eDown.preventDefault();
            let posDownX = eDown.pageX;
            let posDownY = eDown.pageY;
            let currX = f.style.left ? Number(f.style.left.slice(0,f.style.left.length-2)) : 0;
            let currY = f.style.top ? Number(f.style.top.slice(0,f.style.top.length-2)) : 0;

            let pointerMoveHandler = (eMove)=>{
                let posMoveX = eMove.pageX;
                let posMoveY = eMove.pageY;
                f.style.left = `${currX + posMoveX-posDownX}px`;
                f.style.top = `${currY + posMoveY-posDownY}px`;
            }

            
            let pointerUpHandler = () =>{
                let currBounds = f.getBoundingClientRect();
                let parentBounds = f.parentElement.getBoundingClientRect();
                if(currBounds.top <= parentBounds.top){
                    f.style.top = `${Number(f.style.top.slice(0,f.style.top.length-2)) + (parentBounds.top - currBounds.top)}px`;
                };
                if(currBounds.left <= parentBounds.left){
                    f.style.left = `${Number(f.style.left.slice(0,f.style.left.length-2)) + (parentBounds.left - currBounds.left)}px`;
                };
                if(currBounds.right >= parentBounds.right){
                    f.style.left = `${Number(f.style.left.slice(0,f.style.left.length-2)) + (parentBounds.right - currBounds.right)}px`;
                };
                if(currBounds.bottom >= parentBounds.bottom){
                    f.style.top = `${Number(f.style.top.slice(0,f.style.top.length-2)) + (parentBounds.bottom - currBounds.bottom)}px`;
                };
                window.removeEventListener("pointermove", pointerMoveHandler);
                window.removeEventListener("pointerup", pointerUpHandler);
            }
            window.addEventListener("pointermove", pointerMoveHandler);
            window.addEventListener("pointerup", pointerUpHandler);
        })

        return f;
    }
    
    loadSheet(index){
        if(index>=this.sheets.length || index<0){
            throw new Error(`Cannot load sheet at index ${index}, index out of bounds.`)
        }
        // console.log(`Removing sheet ${this.currentSheetIndex}\nAttaching sheet ${index}`);
        this.sheetContainer.children?.[0]?.remove();
        this.sheetContainer.appendChild(this.sheets[index].containerDiv)
        this.sheets[index].fixCanvasSize();
        this.sheets[index].draw();
        this.sheets[index].drawRowIndices();
        this.sheets[index].drawHeader();
        this.currentSheetIndex = index;
        // console.log("Loading sheet at "+index);

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
            this.loadSheet(Number(this.currentSheetIndex)-1)
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
            this.loadSheet(Number(this.currentSheetIndex)+1)
        }
        else{
            this.loadSheet(0)
        }
        tabs[this.currentSheetIndex].setAttribute("data-current","")
    }
    deleteSheet(){
        if(this.sheets.length<=1){
            window.alert("Cannot delete all sheets");
            // throw new Error("Cannot delete all sheets");
            return;
        }
        this.sheets = this.sheets.slice(0,Number(this.currentSheetIndex)).concat(this.sheets.slice(Number(this.currentSheetIndex)+1,this.sheets.length))
        this.sheetTabContainer.children[this.currentSheetIndex].remove();
        Array(...this.sheetTabContainer.children).forEach((x,i)=>{
            x.setAttribute("data-index", i);
        })
        // console.log(this.sheets);
        this.loadSheet((Number(this.currentSheetIndex)+1)%this.sheets.length);
        this.sheetTabContainer.children[this.currentSheetIndex].setAttribute("data-current","");

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
    excelKeyHandler(e){
        // console.log(e)
        if(e.key=="f" && e.ctrlKey){
            e.preventDefault();
            this.popupDiv.style.display = "grid";
            this.findAndReplaceForm["find-and-replace"].value = "find"
            this.popupDiv.appendChild(this.findAndReplaceForm)
            this.findAndReplaceForm["find"].focus();
        }
        else if(e.key=="h" && e.ctrlKey){
            e.preventDefault();
            this.popupDiv.style.display = "grid";
            this.findAndReplaceForm["find-and-replace"].value = "replace"
            this.popupDiv.appendChild(this.findAndReplaceForm)
            this.findAndReplaceForm["find"].focus();

        }
        // else if()
    }
    // searchInputKeyHandler(e){
    //     if(e.key!="Enter"){
    //         return;
    //     }
    //     // if(!e.target.value.trim()){return;}
    //     if(this.searchObject.text!=e.target.value){
    //         // console.log(e.target.value, this.searchObject)
    //         this.searchObject.text = e.target.value;
    //         this.searchObject.resultArray = this.sheets[this.currentSheetIndex].find(e.target.value)
    //         if(!this.searchObject.resultArray.length){return;}
    //         this.sheets[this.currentSheetIndex].scrollCellInView(this.searchObject.resultArray[0][0],this.searchObject.resultArray[0][1])
    //         this.searchObject.currentIndex = 0;
    //     }
    //     else{
    //         if(!this.searchObject.resultArray.length){return;}
    //         if(e.shiftKey){
    //             this.searchObject.currentIndex = (this.searchObject.currentIndex-1)>=0 ? (this.searchObject.currentIndex-1) : this.searchObject.resultArray.length-1;
    //         }else{
    //             this.searchObject.currentIndex = (this.searchObject.currentIndex+1)%this.searchObject.resultArray.length;
    //         }
    //         this.sheets[this.currentSheetIndex].scrollCellInView(this.searchObject.resultArray[this.searchObject.currentIndex][0],this.searchObject.resultArray[this.searchObject.currentIndex][1])
    //     }
    // }

}