function createCourse(c) {
  // let card = `<div class="card" ${c.favourite ? "data-starred" : ""} ${c.preview ? "data-visible" : ""} ${c.manage ? "data-calendar" : ""} ${c.grade : "data-shop" : ""}  ${ c.report ? "data-chart" : ""}>`;
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
  // subjectGradeSpan.innerHtml = subjectGradeSpan.innerHtml + c.subject
  // subjectGradeSpan.innerHTML = subjectGradeSpan.innerHTML + "<span>&#124;</span>"
  // subjectGradeSpan.innerHTML = subjectGradeSpan.innerHTML + `Grade ${c.classGrade}`
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

let announcements = [
  {
    name: "Wilson Kumar",
    content: "No Classes will be held on 21st Nov",
    attachments: 2,
    course: "Mathematics",
    timestamp: "15-sept-2018 at 07:21pm",
    new: true,
  },
];

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

  return container;
}

// console.log(createAnnouncementCard(announcements[0]))
document.body.innerHTML =
  document.body.innerHTML + createAnnouncementCard(announcements[0]);
