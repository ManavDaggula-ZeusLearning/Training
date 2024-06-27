var menuPanel = document.querySelector("#menu-panel")
var menuBtn = document.querySelector(".menu-btn")
// console.log(menuBtn)
menuBtn.addEventListener("click", (e)=>{
    menuPanel.dataset["state"] = menuPanel.dataset["state"]!=="clicked" ? "clicked" : "closed"
})

menuBtn.addEventListener("mouseover", (e)=>{
    if(menuPanel.dataset["state"]==="closed"){
        menuPanel.dataset["state"] = "open";
    }
})

menuBtn.addEventListener("mouseleave", (e)=>{
    if(menuPanel.dataset["state"]==="open"){
        menuPanel.dataset["state"] = "closed";
    }
})



// var menuItems = document.querySelectorAll(".menu-items")
// console.log(menuItems);

// menuItems.forEach(element => {
    
//     // console.log(element)
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

let menuItems = document.querySelector(".menu-items")
let liLists = menuItems.querySelectorAll("&>li")
// console.log(liLists)
liLists.forEach(l => {
    l.addEventListener("click", ()=>{
        liLists.forEach(x => x.removeAttribute("data-current"))
        l.setAttribute("data-current","");
    })
})


let smallMenuContainer = document.querySelector("nav .menu .menu-items")
console.log(smallMenuContainer)
let subMenus = smallMenuContainer.querySelectorAll("ul")
subMenus.forEach(sm=>{
    console.log(sm, sm.scrollHeight)
})

let smallLis = smallMenuContainer.querySelectorAll("&>li")
// console.log(smallLis)
smallLis.forEach(li => {
    li.addEventListener("click", (e) => {
        if(e.target.dataset["current"]){
            // e.target.removeAttribute("data-current");
            // e.target.querySelector("ul")?.style.height = "0px";
            return;
        }
        // console.log(e.target)
        smallLis.forEach(x => {
            x.removeAttribute("data-current");
            // console.log("removed datacurrent")
            let y = x.querySelector("ul")
            if(y){
                y.style.height = "0px";
                // console.log("ul collapsed")
            }
        })
        let child = e.target.querySelector("ul");
        if(child){
            // console.log(e.target.dataset["current"]);
            child.style.height = (child.scrollHeight * 2) + "px";
        }
        e.target.setAttribute("data-current","true");
    })
})