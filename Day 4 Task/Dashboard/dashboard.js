var menuPanel = document.querySelector("#menu-panel")
var menuBtn = document.querySelector(".menu-btn")
console.log(menuBtn)
menuBtn.addEventListener("click", (e)=>{
    // e.target.parentElement.dataset["state"] = e.target.parentElement.dataset["state"]==="open" ? "closed" : "open"
    menuPanel.dataset["state"] = menuPanel.dataset["state"]==="open" ? "closed" : "open"
})

// var menuItems = document.querySelectorAll(".menu-items")
// console.log(menuItems);
// menuItems.forEach(element => {
    
//     console.log(element)
//     let elementListItems = element.querySelectorAll("li");
//     elementListItems.forEach(x => {
//         // console.log(x)
//         x.addEventListener("click",(e)=>{
//             // elementListItems.forEach(l=>l.removeAttribute("data-current"))
//             element.querySelector("[data-current]").removeAttribute("data-current")
//             x.setAttribute("data-current","")
//         })
//     })
// });