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

let smallLis = smallMenuContainer.querySelectorAll("&>li")

smallLis.forEach(li => {
    li.addEventListener("click", (e) => {
        // console.log(li)
        if(li.dataset["current"]){
            
            li.removeAttribute("data-current");
            let innerUl = li.querySelector("&>ul")
            if(innerUl){
                innerUl.style.height = "0px"
            }
            return;
        }
        // console.log(e.target)
        smallLis.forEach(x => {
            x.removeAttribute("data-current");
            let y = x.querySelector("ul")
            if(y){
                y.style.height = "0px";
            }
        })
        let child = li.querySelector("ul");
        if(child){
            child.style.height = (child.scrollHeight) + "px";
        }
        li.setAttribute("data-current","true");
    })

    // console.log(li)
    // li.addEventListener("focusout",()=>{console.log("lost focus");})
})


// console.log(smallMenuContainer.parentElement);
smallMenuContainer.parentElement.addEventListener("blur",(e)=>{
    // console.log("lost focus from",e.target)
    console.log(e.target);
    smallLis.forEach(l => {
        if(l.dataset["current"]){
            console.log(l)
            l.removeAttribute("data-current")
            let childUl = l.querySelector("ul")
            if(childUl){
                childUl.style.height = "0px";
            }
        }
    })
    e.target.parentElement.dataset["state"] = "closed";
})