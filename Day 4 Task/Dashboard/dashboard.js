var menuPanel = document.querySelector("#menu-panel");
var menuBtn = document.querySelector(".menu-btn");
let menuItems = document.querySelector(".menu-items");
let liLists = menuItems.querySelectorAll("&>li");
let smallMenuContainer = document.querySelector("nav .menu .menu-items");
let smallLis = smallMenuContainer.querySelectorAll("&>li");
let campaignBtn = document.querySelector("#campaign-icon");
let notificationBtn = document.querySelector("#notification-icon")
// console.log(menuBtn)
menuBtn.addEventListener("click", (e) => {
  menuPanel.dataset["state"] =
    menuPanel.dataset["state"] !== "clicked" ? "clicked" : "closed";
});

menuBtn.addEventListener("mouseover", (e) => {
  if (menuPanel.dataset["state"] === "closed") {
    menuPanel.dataset["state"] = "open";
    // console.log(smallMenuContainer.parentElement)
    // smallMenuContainer.parentElement.focus();
  }
});

menuBtn.addEventListener("mouseleave", (e) => {
  if (menuPanel.dataset["state"] === "open") {
    menuPanel.dataset["state"] = "closed";
  }
});

liLists.forEach((l) => {
  l.addEventListener("click", () => {
    liLists.forEach((x) => x.removeAttribute("data-current"));
    l.setAttribute("data-current", "");
  });
});

smallLis.forEach((li) => {
  li.addEventListener("click", (e) => {
    if (li.dataset["current"]) {
      li.removeAttribute("data-current");
      let innerUl = li.querySelector("&>ul");
      if (innerUl) {
        innerUl.style.height = "0px";
      }
      return;
    }
    
    smallLis.forEach((x) => {
      x.removeAttribute("data-current");
      let y = x.querySelector("ul");
      if (y) {
        y.style.height = "0px";
      }
    });
    let child = li.querySelector("ul");
    if (child) {
      child.style.height = child.scrollHeight + "px";
    }
    li.setAttribute("data-current", "true");
  });

});


smallMenuContainer.parentElement.addEventListener("blur", (e) => {
  console.log(e.target);
  e.target.parentElement.dataset["state"] = "closed";
});

campaignBtn.addEventListener("click", () => {
  campaignBtn.parentElement.dataset["campaignState"] =
    campaignBtn.parentElement.dataset["campaignState"] !== "clicked"
      ? "clicked"
      : "closed";
});
campaignBtn.addEventListener("mouseover", () => {
  if (campaignBtn.parentElement.dataset["campaignState"] === "closed") {
    campaignBtn.parentElement.dataset["campaignState"] = "open";
  }
});
campaignBtn.addEventListener("mouseleave", () => {
  if (campaignBtn.parentElement.dataset["campaignState"] === "open") {
    campaignBtn.parentElement.dataset["campaignState"] = "closed";
  }
});

notificationBtn.addEventListener("click",()=>{
  notificationBtn.parentElement.dataset["notificationState"] =
    notificationBtn.parentElement.dataset["notificationState"] !== "clicked"
      ? "clicked"
      : "closed";
})
notificationBtn.addEventListener("mouseover", () => {
  if (notificationBtn.parentElement.dataset["notificationState"] === "closed") {
    notificationBtn.parentElement.dataset["notificationState"] = "open";
  }
});
notificationBtn.addEventListener("mouseleave", () => {
  if (notificationBtn.parentElement.dataset["notificationState"] === "open") {
    notificationBtn.parentElement.dataset["notificationState"] = "closed";
  }
});

// dynamically adding courses
function createCourse(c) {
  let card = document.createElement("div");
  card.classList.add("card");
  if (c.favourite) {
    card.dataset["starred"] = true;
  }
  if (c.preview) {
    card.dataset["visible"] = true;
  }
  if (c.manage) {
    card.dataset["calendar"] = true;
  }
  if (c.grade) {
    card.dataset["shop"] = true;
  }
  if (c.report) {
    card.dataset["chart"] = true;
  }
  if (c.expired) {
    card.dataset["expired"] = true;
  }

  let imgSpan = document.createElement("span");
  imgSpan.classList.add("card-img");
  let img = document.createElement("img");
  img.src = c.courseImg;
  img.alt = c.courseTitle;
  imgSpan.appendChild(img);
  card.appendChild(imgSpan);

  let cardContent = document.createElement("div");
  cardContent.classList.add("card-content");

  let h = document.createElement("h2");
  h.textContent = c.courseTitle;
  cardContent.appendChild(h);

  let starSpan = document.createElement("span");
  starSpan.classList.add("material-symbols-outlined");
  let imgStar = document.createElement("img");
  imgStar.src = "./../assets/icons/favourite.svg";
  imgStar.alt = "favourite";
  starSpan.appendChild(imgStar);
  cardContent.appendChild(starSpan);

  let subjectGradeSpan = document.createElement("span");
  subjectGradeSpan.classList.add("subject-grade");
  subjectGradeSpan.innerHTML = `${c.subject}<span>&#124;</span>Grade ${c.classGrade}<span class="special">+${c.specialGrade}</span>`;
  cardContent.appendChild(subjectGradeSpan);
  if (c.units || c.lessons || c.topics) {
    let indexSpan = document.createElement("span");
    indexSpan.classList.add("index");
    if (c.units) {
      indexSpan.innerHTML =
        indexSpan.innerHTML + `<span><b>${c.units}</b>Units</span>`;
    }
    if (c.lessons) {
      indexSpan.innerHTML =
        indexSpan.innerHTML + `<span><b>${c.lessons}</b>Lessons</span>`;
    }
    if (c.topics) {
      indexSpan.innerHTML =
        indexSpan.innerHTML + `<span><b>${c.topics}</b>Topics</span>`;
    }
    cardContent.appendChild(indexSpan);
  }

  let selection = document.createElement("select");
  selection.name = "class-selection";
  selection.classList.add("class-selection");
  if (c.class) {
    selection.innerHTML = `<option value="${c.class}">${c.class}</option>`;
  } else {
    selection.disabled = true;
    selection.innerHTML = `<option value="">No Classes</option>`;
  }
  cardContent.appendChild(selection);

  if (c.numberOfStudents || c.time) {
    let studentsSchedule = document.createElement("span");
    studentsSchedule.classList.add("students-schedule");
    if (c.numberOfStudents) {
      studentsSchedule.innerHTML =
        studentsSchedule.innerHTML + `${c.numberOfStudents} students`;
    }
    if (c.numberOfStudents && c.time) {
      studentsSchedule.innerHTML =
        studentsSchedule.innerHTML + `<span>&#124;</span>`;
    }
    if (c.time) {
      studentsSchedule.innerHTML =
        studentsSchedule.innerHTML + `${c.time.startDate} - ${c.time.endDate}`;
    }

    cardContent.appendChild(studentsSchedule);
  }
  card.appendChild(cardContent);

  card.appendChild(document.createElement("hr"));

  let interactables = document.createElement("div");
  interactables.classList.add("interactables");
  interactables.innerHTML = `<span class="material-symbols-outlined visibility-icon"><img src="./../assets/icons/preview.svg" alt="preview"></span><span class="material-symbols-outlined calendar-icon"><img src="./../assets/icons/manage course.svg" alt="manage courses"></span><span class="material-symbols-outlined shop-icon"><img src="./../assets/icons/grade submissions.svg" alt="grades"></span><span class="material-symbols-outlined chart-icon"><img src="./../assets/icons/reports.svg" alt="reports"></span>`;
  card.appendChild(interactables);
  return card;
}

function createAnnouncementCard(c) {
  let container = `
    <div class="announcement" ${c.new ? "data-new" : ""}><div><span>${
    c.name
  }</span><span></span></div><p>${c.content}</p>`;
  if (c.course) {
    container = container + `<span>Course: ${c.course}</span>`;
  }
  container = container + `<div>`;
  if (c.attachments) {
    container =
      container +
      `<span class="attachments">${c.attachments} files attached</span>`;
  }
  container =
    container + `<span class="timestamp">${c.timestamp}</span></div></div>`;

  let temp = document.createElement("div");
  temp.innerHTML = container;
  return temp.querySelector("div");
}

function createAlertElement(a){
  var alert = `<div class="notification" ${a.new ? "data-new" : ""}><div><p>${a.message}</p><span class="icon"></span></div>${a.course ? "<span class='course'>Course: <span>Advanced Mathematics</span></span>" : ""}<div><span class="timestamp">${a.timestamp}</span></div></div>`
  let alertElement = document.createElement("div")
  alertElement.innerHTML = alert;
  return alertElement.querySelector(".notification")
}

fetch("./../data.json")
  .then((d) => d.json())
  .then((response) => {
    let courses = response.courses;
    let cardsContainer = document.querySelector(".cards-container");
    courses.forEach((c) => {
      cardsContainer.appendChild(createCourse(c));
    });

    let announcements = response.announcements;
    let announcementList = campaignBtn.parentElement.querySelector(
      ".announcement-list .announcements"
    );
    announcements.forEach((a) => {
      announcementList.appendChild(createAnnouncementCard(a));
    });
    let alerts = response.alerts;
    let alertsList = notificationBtn.parentElement.querySelector(".notification-list")
    alerts.forEach(a=>{
      console.log(a)
      alertsList.appendChild(createAlertElement(a))
    })
  })
  .catch((err) => {
    window.alert("An error occurred whil fetching courses.");
  });
