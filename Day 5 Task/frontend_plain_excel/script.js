import { Sheet } from "./Sheet.js";

let mainDiv = document.getElementById("canvasDiv")
let sheet_1 = new Sheet(mainDiv);
// sheet_1.containerDiv.style.width = (window.innerWidth-20) + "px"
window.s = sheet_1

// window.addEventListener("resize",(e)=>{
//     sheet_1.containerDiv.style.width = (e.target.innerWidth-20) + "px"
// })