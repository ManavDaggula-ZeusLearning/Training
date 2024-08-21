import { Sheet } from "./Sheet.js";
export class Excel{
    /**
     * holds all the array of sheets
     * @type {Array<Sheet>}*/
    sheets = [];
    /**
     * Search object to store the search params and the result of the search
     * @type {{
     * text:String,
     * resultArray: Array<[Number,Number]>,
     * currentIndex: Number}}
     */
    searchObject = {
        text:"",
        resultArray:[],
        currentIndex:null
    };
    /**
     * Array of menu to be added to the top menu tab bar
     * @type {String[]}
     */
    menuTabsArray = ["File", "Text","Data","Graph"]
    /**
     * menu div that holds entire menu
     * @type {HTMLDivElement}
     */
    menuDiv;
    /**
     * Sheet container in which sheet will be displayed
     * @type {HTMLDivElement}
     */
    sheetContainer;
    /**
     * Sheet tab buttons container
     * @type {HTMLDivElement}
     */
    sheetTabContainer;
    /**
     * Menu tab container
     * @type {HTMLDivElement}
     */
    menuTabDiv;
    /**
     * Span element to display minimum of selected range
     * @type {HTMLSpanElement}
     */
    minSpan;
    /**
     * Span element to display maximum of selected range
     * @type {HTMLSpanElement}
     */
    maxSpan;
    /**
     * Span element to display average of selected range
     * @type {HTMLSpanElement}
     */
    avgSpan;
    /**
     * Popup div overlay container for all popups
     * @type {HTMLDivElement}
     */
    popupDiv;
    /**
     * Find and replace form container
     * @type {HTMLFormElement}
     */
    findAndReplaceForm;
    /**
     * Index of sheet currently being displayed
     * @type {Number}
     */
    currentSheetIndex;


    /**
     * @param {HTMLElement} excelContainer - parent element to which the excel component will be apended
     */
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
        // let firstSheet = document.createElement("input")
        // firstSheet.classList.add("sheetTab")
        // firstSheet.value="Sheet 1";
        // firstSheet.setAttribute("readonly","")
        // firstSheet.setAttribute("data-current","")
        // firstSheet.setAttribute("data-index","0")
        // this.sheetTabContainer.appendChild(firstSheet)
        // let secondSheet = document.createElement("input")
        // secondSheet.classList.add("sheetTab")
        // secondSheet.value="Sheet 2";
        // secondSheet.setAttribute("readonly","")
        // secondSheet.setAttribute("data-index","1")
        // this.sheetTabContainer.appendChild(secondSheet)
        sheetArrayChanger.appendChild(this.sheetTabContainer)
        // firstSheet.addEventListener("click",e=>this.sheetTabClickHandler(e))
        // firstSheet.addEventListener("dblclick",e=>this.sheetTabDoubleClickHandler(e))
        // firstSheet.addEventListener("keydown",e=>this.sheetTabKeyHandler(e))
        // secondSheet.addEventListener("click",e=>this.sheetTabClickHandler(e))
        // secondSheet.addEventListener("dblclick",e=>this.sheetTabDoubleClickHandler(e))
        // secondSheet.addEventListener("keydown",e=>this.sheetTabKeyHandler(e))

        // let searchDiv = document.createElement("div")
        // searchDiv.classList.add("searchDiv")
        // let searchInput = document.createElement("input")
        // searchInput.placeholder = "Search text here.."
        // searchInput.addEventListener("keypress",(e)=>{
        //     this.searchInputKeyHandler(e)
        // })
        
        // searchDiv.appendChild(findAndReplaceBtn);
        
        
        
        excelContainer.appendChild(sheetArrayChanger)
        // this.menuDiv.appendChild(searchDiv)

        this.menuTabDiv = document.createElement("div")
        this.menuTabDiv.classList.add("menuTabDiv")
        this.menuDiv.appendChild(this.menuTabDiv)

        let menuTabsContainer = document.createElement("div")
        menuTabsContainer.classList.add("menu-tabs-container")
        this.menuDiv.appendChild(menuTabsContainer)
        this.prepareMenuTabs(menuTabsContainer);


        this.menuTabsArray.forEach((x,i)=>{
            let label = document.createElement("label")
            label.classList.add("menu-tab-selector")
            let inputRadio = document.createElement("input");
            inputRadio.type = "radio";
            inputRadio.name="menu-tab"
            inputRadio.value = x;
            if(i==0){inputRadio.setAttribute("checked","")}
            label.appendChild(inputRadio)
            label.append(x)
            this.menuTabDiv.appendChild(label)
        })

        this.popupDiv = document.createElement("div")
        this.popupDiv.classList.add("popup")
        document.body.prepend(this.popupDiv)

        this.findAndReplaceForm = this.createFindReplacePopup()



        // let sheet_1 = new Sheet(this.sheetContainer);
        // window.s = sheet_1;
        // this.sheets.push(sheet_1);
        // this.currentSheetIndex = 0;
        // this.loadSheet(0);
        // let sheet_2 = new Sheet(this.sheetContainer);
        // this.sheets.push(sheet_2);
        this.newSheet()

        window.addEventListener("keydown",(e)=>{
            this.excelKeyHandler(e)
        })
        window.addEventListener("aggregateValues",(e)=>{
            this.recalculateAggregates(e.detail)
        })
    }

    /**
     * Function that creates the find and replace form and sets the event listeners
     * @returns {HTMLFormElement}
     */
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
                this.searchObject.currentIndex = !e.shiftKey ? (this.searchObject.currentIndex+1)%this.searchObject.resultArray.length : (this.searchObject.currentIndex>0 ? this.searchObject.currentIndex-1 : this.searchObject.resultArray.length-1);
                this.sheets[this.currentSheetIndex].scrollCellInView(this.searchObject.resultArray[this.searchObject.currentIndex][0],this.searchObject.resultArray[this.searchObject.currentIndex][1])
            }
        })

        replaceBtn.addEventListener("click",()=>{
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

    /**
     * Funtion to create and append tabs to the menu tab container
     * @param {HTMLElement} menuTabsContainer - container to which the prepared menu tabs will be appended
     */
    prepareMenuTabs(menuTabsContainer){
        /* File menu tab*/
        let fileMenuPanel = document.createElement("div");
        fileMenuPanel.classList.add("menu-tab-container", "file")
        let fileUploadForm = document.createElement("form")
        // fileUploadForm.formAction = "http://localhost:5003/api/Sheets/uploadFile"
        // fileUploadForm.formMethod="POST"
        let fileInput = document.createElement("input")
        fileInput.type = "file"
        fileInput.accept = ".csv"
        fileInput.name = "fileInput"
        let uploadButton = document.createElement("button")
        uploadButton.textContent = "Upload"
        fileUploadForm.appendChild(fileInput)
        fileUploadForm.appendChild(uploadButton)

        fileUploadForm.addEventListener("submit",(e)=>{
            e.preventDefault();
            let file = e.target.fileInput.files?.[0]
            if(file!=null){
                let formData = new FormData();
                formData.append("file",file);
                console.log(formData);
                fetch('/api/Sheets/uploadFile', {
                    method: 'POST',
                    body: formData
                  })
                  .then(response => {
                    if (response.ok) {
                      return response.json();
                    } else {
                      throw new Error('File upload failed');
                    }
                  })
                  .then(data => {
                    console.log('Server response:', data);
                  })
                  .catch(error => {
                    console.error('Error uploading file:', error);
                  });
            }
            else{
                window.alert("Upload a file");
            }
        })
        
        fileMenuPanel.appendChild(fileUploadForm)
        menuTabsContainer.appendChild(fileMenuPanel)

        /* Text menu tab */
        let textWrapperControl = document.createElement("div")
        textWrapperControl.classList.add("menu-tab-container", "text")
        let wrapBtn = document.createElement("button")
        wrapBtn.textContent = "Wrap Text"
        wrapBtn.addEventListener("click",()=>this.wrapText())
        textWrapperControl.appendChild(wrapBtn)
        menuTabsContainer.appendChild(textWrapperControl)
        
        /* Data menu tab */
        let dataTab = document.createElement("div")
        dataTab.classList.add("menu-tab-container", "data")
        let findAndReplaceBtn = document.createElement("button")
        findAndReplaceBtn.textContent = "Find And Replace";
        findAndReplaceBtn.addEventListener("click",()=>{
            this.popupDiv.style.display = "grid";
            this.popupDiv.appendChild(this.findAndReplaceForm)
            this.findAndReplaceForm["find"].focus();
        })
        dataTab.appendChild(findAndReplaceBtn)
        
        let dataAggregateDiv = document.createElement("div")
        dataAggregateDiv.classList.add("aggregates")
        this.minSpan = document.createElement("span");
        this.minSpan.textContent = "Min: NA"
        this.maxSpan = document.createElement("span");
        this.maxSpan.textContent = "Max: NA"
        this.sumSpan = document.createElement("span");
        this.sumSpan.textContent = "Sum: NA"
        this.avgSpan = document.createElement("span");
        this.avgSpan.textContent = "Avg: NA"
        let recalculateAggregateBtn = document.createElement("button")
        recalculateAggregateBtn.textContent = "Recalculate"
        recalculateAggregateBtn.addEventListener("click",()=>this.recalculateAggregates())
        dataAggregateDiv.appendChild(this.minSpan)
        dataAggregateDiv.appendChild(this.maxSpan)
        dataAggregateDiv.appendChild(this.avgSpan)
        dataAggregateDiv.appendChild(this.sumSpan)
        dataAggregateDiv.appendChild(recalculateAggregateBtn)
        dataTab.appendChild(dataAggregateDiv)
        menuTabsContainer.appendChild(dataTab)
        
        let graphTab = document.createElement("div")
        graphTab.classList.add("menu-tab-container", "graph")
        let graphBtnArray = ["Bar","Pie","Doughnut","Line"]
        graphBtnArray.forEach(x=>{
            let btn = document.createElement("button")
            btn.textContent = x;
            btn.addEventListener("click",()=>{
                this.sheets[this.currentSheetIndex].getGraphData(x.toLowerCase())
            })
            graphTab.appendChild(btn)
        })
        menuTabsContainer.appendChild(graphTab)

    }
    
    /**
     * Loads the sheet with specified index
     * @param {Number} index - index of the sheet to be loaded into the component
     */
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

    /**
     * Creates a new sheet and loads it to the component
     */
    newSheet(){
        let newSheet = new Sheet()
        this.sheets.push(newSheet);
        this.loadSheet(this.sheets.length - 1)
        let newSheetTab = document.createElement("input")
        newSheetTab.classList.add("sheetTab")
        newSheetTab.setAttribute("readonly","")
        newSheetTab.setAttribute("data-index",this.sheets.length-1)
        newSheetTab.addEventListener("click",e=>this.sheetTabClickHandler(e))
        newSheetTab.addEventListener("dblclick",e=>this.sheetTabDoubleClickHandler(e))
        newSheetTab.addEventListener("keydown",e=>this.sheetTabKeyHandler(e))
        this.sheetTabContainer.appendChild(newSheetTab)
        let tabs=this.sheetTabContainer.querySelectorAll("input")
        tabs[this.currentSheetIndex].click();
        for(var i=0; i<this.sheets.length;i++){
            if(![...tabs].map(x=>x.value).includes(`Sheet ${i+1}`)){break;}
        }
        newSheetTab.value=`Sheet ${i+1}`;
        this.sheetTabContainer.scrollTo(this.sheetTabContainer.scrollWidth,0)
    }

    /**
     * Load the previous sheet to the current loaded sheet
     */
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
    /**
     * Load the next sheet to the current loaded sheet
     */
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
    /**
     * Delete the loaded sheet
     */
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
        this.loadSheet(this.currentSheetIndex-1>0 ? this.currentSheetIndex-1 : 0);
        this.sheetTabContainer.children[this.currentSheetIndex].setAttribute("data-current","");

    }
    /**
     * Wraps cells in the current selection range of the sheet
     */
    wrapText(){
        this.sheets[this.currentSheetIndex].wrapRangeSelection();
    }
    /**
     * Function to change the displayed aggregates of the selected range
     * @param {[Number,Number,Number,Number]} aggValues  - array of numbers(min, avg, max, sum) that by default calculates the sheet aggregate values
     */
    recalculateAggregates(aggValues=this.sheets[this.currentSheetIndex].calculateAggregates()){
        // let aggValues = this.sheets[this.currentSheetIndex].calculateAggregates()
        // console.log(aggValues);
        this.minSpan.textContent = `Min : ${aggValues[0]}`
        this.avgSpan.textContent = `Avg : ${aggValues[1]}`
        this.maxSpan.textContent = `Max : ${aggValues[2]}`
        this.sumSpan.textContent = `Sum : ${aggValues[3]}`
    }

    /**
     * Click function handler for the sheet tab that loads the clicked sheet
     * @param {PointerEvent} e 
     */
    sheetTabClickHandler(e){
        e.target.parentElement.querySelectorAll("input").forEach(t1=>{
            t1.removeAttribute("data-current")
            t1.setAttribute("readonly","")
          })
        e.target.setAttribute("data-current","true")
        this.loadSheet(e.target.dataset["index"])
    }
    /**
     * Function to make tab text editable
     * @param {PointerEvent} e 
     */
    sheetTabDoubleClickHandler(e){
        e.target.focus();
        e.target.removeAttribute("readonly")
    }
    /**
     * Function to handle key events in the sheet tab input boxes
     * @param {KeyboardEvent} e 
     */
    sheetTabKeyHandler(e){
        if(e.key==="Enter"){
              e.target.setAttribute("readonly","")
        }
    }

    /**
     * Key handler for the component
     * @param {KeyboardEvent} e 
     */
    excelKeyHandler(e){
        // console.log(e)
        if(e.key.toLowerCase()=="f" && e.ctrlKey){
            e.preventDefault();
            this.popupDiv.style.display = "grid";
            this.findAndReplaceForm["find-and-replace"].value = "find"
            this.popupDiv.appendChild(this.findAndReplaceForm)
            this.findAndReplaceForm["find"].focus();
        }
        else if(e.key.toLowerCase()=="h" && e.ctrlKey){
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