var form = document.querySelector(".fileUploadForm")
var inputFileElement = form.querySelector("input[type='file']")

// console.log(form)
// console.log(inputFileElement)

form.addEventListener("click",(e)=>{
    // console.log(e.target)
    if(e.target == form.querySelector("button")){return;}
    inputFileElement.click();
})

form.addEventListener("submit",(e)=>{
    e.preventDefault();
    e.stopImmediatePropagation();
    console.log("trying to submit")
    if(inputFileElement.files.length ==0){
        window.alert("please upload a file first.")
        return;
    }
    console.log(window.location.pathname = "/frontend_plain/Canvas/canvas.html")
    console.log(e)
})

inputFileElement.addEventListener("change",(e)=>{
    if(e.target.files.length == 0){
        // form.removeAttribute("data-file")
        form.querySelector("span").textContent = "";
    }
    else{
        // console.log(e.target.files[0]);
        // form.dataset["file"] = e.target.files[0].name
        form.querySelector("span").textContent = `Selected file : ${e.target.files[0].name}`;
    }
})

form.addEventListener("dragover",(e)=>{
    e.preventDefault();
    e.target.classList.add("draggedover")
    // console.log(e)
})

form.addEventListener("dragleave",(e)=>{
    e.preventDefault();
    e.target.classList.remove("draggedover")
    // console.log(e)
})

form.addEventListener("drop",(e)=>{
    e.preventDefault();
    e.target.classList.remove("draggedover")
    console.log(e.dataTransfer.files)
    inputFileElement.files = e.dataTransfer.files;
    form.querySelector("span").textContent = `Selected file : ${e.dataTransfer.files[0].name}`;
})