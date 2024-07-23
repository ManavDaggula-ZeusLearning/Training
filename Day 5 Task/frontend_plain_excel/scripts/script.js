// import { Sheet } from "./Sheet.js";
import { Excel } from "./Excel.js";

let excelContainer = document.getElementById("excelContainer")
let excel = new Excel(excelContainer);
window.excel = excel
// sheet_1.containerDiv.style.width = (window.innerWidth-20) + "px"
// window.addEventListener("resize",(e)=>{
//     sheet_1.containerDiv.style.width = (e.target.innerWidth-20) + "px"
// })