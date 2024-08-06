await import("https://cdn.jsdelivr.net/npm/chart.js")
export class Graph{


    /**
     * Graph container div element
     * @type {HTMLDivElement}
     */
    graphContainer;
    /**
     * canvas of the component onto which charts are drawn
     * @type {HTMLCanvasElement} 
     */
    canvas;
    /**
     * Chart Instance
     * @type {Chart}
     */
    graphId;

    /**
     * @param {HTMLElement} parentElement - Parent element into which the component will be appended
     * @param {Number} x - x position or the left offset to place the component at within the parentElement
     * @param {Number} y - y position or the top offset to place the component at within the parentElement
     * @param {Array<String>} labels - the labels for the dataArray to be drawn
     * @param {Array<Number>} dataArray - array of data that is drawn on the chart
     * @param {String} type - type of chart to be drawn
     */
    constructor(parentElement,labels,dataArray,x,y,type="pie"){
        this.init();
        this.attachTo(parentElement,x,y);
        this.drawGraph(labels, dataArray,type);
        this.attachDraggerFunction();
    }

    /**
     * Initializer to make all divs and canvases
     */
    init(){
        this.graphContainer = document.createElement("div")
        this.graphContainer.classList.add("graphDiv")
        this.canvas = document.createElement("canvas")
        let moverSpan = document.createElement("span")
        moverSpan.textContent = "⠛"
        let closeBtn = document.createElement("button")
        closeBtn.textContent = "x"
        let controlDiv = document.createElement("div")
        controlDiv.appendChild(moverSpan)
        controlDiv.appendChild(closeBtn)
        let canvasDiv = document.createElement("div")
        canvasDiv.appendChild(this.canvas)
        closeBtn.addEventListener("click",()=>{
            this.close();
        })

        
        this.graphContainer.appendChild(controlDiv)
        this.graphContainer.appendChild(canvasDiv)
        
    }

    /**
     * This function appends the component within the parent element with the specified positions
     * @param {HTMLElement} parentElement - Parent element into which the component will be appended
     * @param {Number} x - x position or the left offset to place the component at within the parentElement
     * @param {Number} y - y position or the top offset to place the component at within the parentElement
     */
    attachTo(parentElement,x,y){
        parentElement.appendChild(this.graphContainer)
        this.graphContainer.style.left = `${x}px`
        this.graphContainer.style.top = `${y}px`
    }

    /**
     * This function is responsible to draw the graph based on passed data array
     * @param {Array<String>} labels - the labels for the dataArray to be drawn
     * @param {Array<Number>} dataArray - array of data that is drawn on the chart
     * @param {String} type - type of chart to be drawn
     */
    drawGraph(labels, dataArray, type="bar"){
        this.graphId = new window.Chart(this.canvas, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                data: dataArray,
                borderWidth: 1
                }]
            },
            options: {
                responsive:true,
                maintainAspectRatio:false,
                scales: {
                    y: {
                    beginAtZero: true,
                    }
                },
                plugins:{
                    legend:{
                        display:["pie","doughnut"].includes(type)?true:false,
                    }
                }
            },
            
          });
    }

    /**
     * This function destroys the Chart instance and removes the component from the parent
     */
    close(){
        this.graphId?.destroy();
        this.graphContainer.remove();
    }

    /**
     * This function adds the dragger functionality to the component making it movable with the cursor by the user.
     */
    attachDraggerFunction(){
        this.graphContainer.querySelectorAll("canvas,span").forEach(x=>{
            x.addEventListener("pointerdown",(eDown)=>{
                eDown.preventDefault();
                let posDownX = eDown.pageX;
                let posDownY = eDown.pageY;
                let currX = this.graphContainer.style.left ? Number(this.graphContainer.style.left.slice(0,this.graphContainer.style.left.length-2)) : 0;
                let currY = this.graphContainer.style.top ? Number(this.graphContainer.style.top.slice(0,this.graphContainer.style.top.length-2)) : 0;
    
                let pointerMoveHandler = (eMove)=>{
                    let posMoveX = eMove.pageX;
                    let posMoveY = eMove.pageY;
                    this.graphContainer.style.left = `${currX + posMoveX-posDownX}px`;
                    this.graphContainer.style.top = `${currY + posMoveY-posDownY}px`;
                }
    
                
                let pointerUpHandler = () =>{
                    let currBounds = this.graphContainer.getBoundingClientRect();
                    let parentBounds = this.graphContainer.parentElement.getBoundingClientRect();
                    if(currBounds.top <= parentBounds.top){
                        this.graphContainer.style.top = `${Number(this.graphContainer.style.top.slice(0,this.graphContainer.style.top.length-2)) + (parentBounds.top - currBounds.top)}px`;
                    };
                    if(currBounds.left <= parentBounds.left){
                        this.graphContainer.style.left = `${Number(this.graphContainer.style.left.slice(0,this.graphContainer.style.left.length-2)) + (parentBounds.left - currBounds.left)}px`;
                    };
                    if(currBounds.right >= parentBounds.right){
                        this.graphContainer.style.left = `${Number(this.graphContainer.style.left.slice(0,this.graphContainer.style.left.length-2)) + (parentBounds.right - currBounds.right)}px`;
                    };
                    if(currBounds.bottom >= parentBounds.bottom){
                        this.graphContainer.style.top = `${Number(this.graphContainer.style.top.slice(0,this.graphContainer.style.top.length-2)) + (parentBounds.bottom - currBounds.bottom)}px`;
                    };
                    window.removeEventListener("pointermove", pointerMoveHandler);
                    window.removeEventListener("pointerup", pointerUpHandler);
                }
                window.addEventListener("pointermove", pointerMoveHandler);
                window.addEventListener("pointerup", pointerUpHandler);
            })
        })
    }

}