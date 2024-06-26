document.getElementById("eye").addEventListener("mousedown",(e)=>{
    e.target.parentElement.querySelector("input").type="text"
})
document.getElementById("eye").addEventListener("mouseup",(e)=>{
    e.target.parentElement.querySelector("input").type="password"
})
