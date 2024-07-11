var form = document.querySelector(".fileUploadForm")
var inputFileElement = form.querySelector("input[type='file']")

// form.addEventListener("click",(e)=>{
//     inputFileElement.click();
// })

inputFileElement.addEventListener("change",(e)=>{
    if(e.target.files.length == 0){
        // form.removeAttribute("data-file")
        // form.querySelector("span").textContent = "";
    }
    else{
        // console.log(e.target.files[0]);
        // form.dataset["file"] = e.target.files[0].name
        // form.querySelector("span").textContent = `Selected file : ${e.target.files[0].name}`;
        console.log(rows);
        console.log(rowsDummy);
        rows = rowsDummy;
        console.log(rows);
        fixCanvasSize();
        draw();
        drawHeader();
    }
})

// form.addEventListener("dragenter",(e)=>{
//     e.preventDefault();
//     e.target.classList.add("draggedover")
//     console.log(e.dataTransfer.files.length)
//     console.log("got dragged over");
// })

// form.addEventListener("dragleave",(e)=>{
//     e.preventDefault();
//     e.target.classList.remove("draggedover")
//     console.log("left drag");
//     console.log(e.dataTransfer.files.length)
// })

// form.addEventListener("drop",(e)=>{
//     e.preventDefault();
//     e.target.classList.remove("draggedover")
//     console.log(e.dataTransfer.files)
//     inputFileElement.files = e.dataTransfer.files;
//     // form.querySelector("span").textContent = `Selected file : ${e.dataTransfer.files[0].name}`;
// })

form.addEventListener("submit",(e)=>{
    e.preventDefault();
})