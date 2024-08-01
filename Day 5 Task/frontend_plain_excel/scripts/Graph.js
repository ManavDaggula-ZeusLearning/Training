export class Graph{

    graphContainer = null;
    canvas = null
    graphId = null;

    constructor(parentElement,labels,dataArray,x,y,type="pie"){
        this.init();
        this.attachTo(parentElement,x,y);
        this.drawGraph(labels, dataArray,type);
        this.attachDraggerFunction();
    }

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

    attachTo(parentElement,x,y){
        parentElement.appendChild(this.graphContainer)
        this.graphContainer.style.left = `${x}px`
        this.graphContainer.style.top = `${y}px`
    }

    drawGraph(labels, dataArray, type="bar"){
        console.log(labels);
        this.graphId = new Chart(this.canvas, {
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
                        display:type=="pie"?true:false,
                    }
                }
            },
            
          });
    }
    close(){
        this.graphId?.destroy();
        this.graphContainer.remove();
    }

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