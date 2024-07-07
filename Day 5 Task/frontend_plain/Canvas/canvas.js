var canvasElement = document.querySelector("#sheet");
var canvasContext = canvasElement.getContext("2d");
var inputElement = document.querySelector(".canvasContainer input");

const fontSize = 18;
const font = "Arial";
const fontColor = "#222";
const fontSelectedColor = "red";
const fontSelectedBackgroundColor = "yellow";
const fontPadding = 6;
const columnWidth = 100 + 2 * fontPadding;
const rowHeight = 50 + 2 * fontPadding;

var selectedCell = null;
var selectedRangeStart = null;
var selectedRangeEnd = null;

const dataColumns = [
  "Email ID",
  "Name",
  "Country",
  "State",
  "City",
  "Telephone number",
  "Address line 1",
  "Address line 2",
  "Date of Birth",
  "FY2019-20",
  "FY2020-21",
  "FY2021-22",
  "FY2022-23",
  "FY2023-24",
];
const rows = [
  {
    "Email ID": "user1@example.com",
    Name: "John Doe",
    Country: "USA",
    State: "California",
    City: "Los Angeles",
    "Telephone number": "+1-123-456-7890",
    "Address line 1": "123 Main St",
    "Address line 2": "Apt 101",
    "Date of Birth": "1990-01-01",
    "FY2019-20": 1500,
    "FY2020-21": 2500,
    "FY2021-22": 3500,
    "FY2022-23": 4500,
    "FY2023-24": 5500,
  },
  {
    "Email ID": "user1@example.com",
    Name: "John Doe",
    Country: "USA",
    State: "California",
    City: "Los Angeles",
    "Telephone number": "+1-123-456-7890",
    "Address line 1": "123 Main St",
    "Address line 2": "Apt 101",
    "Date of Birth": "1990-01-01",
    "FY2019-20": 1500,
    "FY2020-21": 2500,
    "FY2021-22": 3500,
    "FY2022-23": 4500,
    "FY2023-24": 5500,
  },
  {
    "Email ID": "user2@example.com",
    Name: "Jane Smith",
    Country: "Canada",
    State: "Ontario",
    City: "Toronto",
    "Telephone number": "+1-987-654-3210",
    "Address line 1": "456 Elm St",
    "Address line 2": "Unit 202",
    "Date of Birth": "1985-05-15",
    "FY2019-20": 1700,
    "FY2020-21": 2700,
    "FY2021-22": 3700,
    "FY2022-23": 4700,
    "FY2023-24": 5700,
  },
  {
    "Email ID": "user3@example.com",
    Name: "Alice Johnson",
    Country: "UK",
    State: "England",
    City: "London",
    "Telephone number": "+44-20-1234-5678",
    "Address line 1": "789 Oak St",
    "Address line 2": "Flat 3",
    "Date of Birth": "1982-11-30",
    "FY2019-20": 1900,
    "FY2020-21": 2900,
    "FY2021-22": 3900,
    "FY2022-23": 4900,
    "FY2023-24": 5900,
  },
  {
    "Email ID": "user1@example.com",
    Name: "John Doe",
    Country: "India",
    State: "Maharashtra",
    City: "Mumbai",
    "Telephone number": "+1-123-456-7890",
    "Address line 1": "123 Main St",
    "Address line 2": "Apt 101",
    "Date of Birth": "1990-01-01",
    "FY2019-20": 1500,
    "FY2020-21": 2500,
    "FY2021-22": 3500,
    "FY2022-23": 4500,
    "FY2023-24": 5500,
  },
  {
    "Email ID": "user2@example.com",
    Name: "Jane Smith",
    Country: "Canada",
    State: "Ontario",
    City: "Toronto",
    "Telephone number": "+1-987-654-3210",
    "Address line 1": "456 Elm St",
    "Address line 2": "Unit 202",
    "Date of Birth": "1985-05-15",
    "FY2019-20": 1700,
    "FY2020-21": 2700,
    "FY2021-22": 3700,
    "FY2022-23": 4700,
    "FY2023-24": 5700,
  },
  {
    "Email ID": "user3@example.com",
    Name: "Last Human",
    Country: "UK",
    State: "England",
    City: "London",
    "Telephone number": "+44-20-1234-5678",
    "Address line 1": "789 Oak St",
    "Address line 2": "Flat 3",
    "Date of Birth": "1982-11-30",
    "FY2019-20": 1900,
    "FY2020-21": 2900,
    "FY2021-22": 3900,
    "FY2022-23": 4900,
    "FY2023-24": 5900,
  },
];

function canvasKeyHandler(e) {
  // console.log(e.key)
  if (e.key == "Escape") {
    selectedCell = null;
    selectedRangeStart = null;
    selectedRangeEnd = null;
    draw();
  }
}

function mouseDownHandler(e) {
  // e = e.nativeEvent;
  // console.log("mouse downed")
  let i = Math.floor(e.offsetX / columnWidth);
  let j = Math.floor(e.offsetY / rowHeight);
  if (j <= 0) {
    j = 1;
  }
  j--;
  // console.log(j,i)

  if (!e.shiftKey) {
    // selectedCell = {row:j, col:i};
    selectedRangeStart = { row: j, col: i };
    selectedCell = null;
    selectedRangeEnd = null;

    function mouseMoveHandler(eMove) {
      let iMove = Math.floor(eMove.offsetX / columnWidth);
      let jMove = Math.floor(eMove.offsetY / rowHeight);
      if (jMove <= 0) {
        jMove = 1;
      }
      jMove--;
      selectedRangeEnd = { row: jMove, col: iMove };
      draw();
    }

    e.target.addEventListener("mousemove", mouseMoveHandler);

    e.target.addEventListener("mouseup", function mouseUpHandler(eUp){
      // console.log("mouseUp")

      e.target.removeEventListener("mousemove", mouseMoveHandler);

      let iUp = Math.floor(eUp.offsetX / columnWidth);
      let jUp = Math.floor(eUp.offsetY / rowHeight);
      if (jUp <= 0) {
        jUp = 1;
      }
      jUp--;
      if (selectedRangeStart.col == iUp && selectedRangeStart.row == jUp) {
        selectedRangeEnd = null;
        // selectedRangeStart = {row: j, col: i};
        selectedCell = { row: j, col: i };
        console.log("clicked");
        draw();
      }
      e.target.removeEventListener("mouseup",mouseUpHandler);
    });
  } else {
    console.log("clicked with shift");
    if (selectedRangeStart) {
      selectedRangeEnd = { row: j, col: i };
      selectedCell = null;
    } else {
      selectedRangeEnd = null;
      selectedRangeStart = { row: j, col: i };
      selectedCell = { row: j, col: i };
    }
    draw();
    //   console.log(selectedCell, selectedRangeStart, selectedRangeEnd)
  }
}

function handleKeyInputEnter(e) {
  // console.log(e.target, e.key);
  if (e.key == "Enter") {
    // console.log("entering new data")
    let newValue = e.target.value;
    rows[selectedCell.row][dataColumns[selectedCell.col]] = newValue;
    e.target.style.display = "none";
    selectedCell = null;
    draw();
  } else if (e.key == "Escape") {
    inputElement.style.display = "none";
  }
}

async function draw() {
  // console.log("Started painting");
  // let startTime = new Date();

  //clearing the canvas
  canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
  // await new Promise(r => setTimeout(r, 2000));
  // console.log("timed out")

  // for drawing column gutters
  for (let i = 0; i < dataColumns.length; i++) {
    canvasContext.save();
    canvasContext.moveTo(i * columnWidth, 0);
    canvasContext.lineTo(i * columnWidth, canvasElement.height);
    canvasContext.stroke();
    canvasContext.restore();
  }

  // for drawing row gutters
  for (let i = 0; i < rows.length + 1; i++) {
    canvasContext.save();
    canvasContext.moveTo(0, i * rowHeight);
    canvasContext.lineTo(canvasElement.width, i * rowHeight);
    canvasContext.stroke();
    canvasContext.restore();
  }

  //drawing headers
  for (let i = 0; i < dataColumns.length; i++) {
    canvasContext.beginPath();
    canvasContext.save();
    canvasContext.rect(i * columnWidth, 0, columnWidth, rowHeight);
    canvasContext.clip();
    canvasContext.font = `bold ${fontSize}px ${font}`;
    canvasContext.fillStyle = `${fontColor}`;
    canvasContext.fillText(
      dataColumns[i].toUpperCase(),
      i * columnWidth + fontPadding,
      rowHeight - fontPadding
    );
    canvasContext.restore();
    //   await new Promise(r => setTimeout(r, 100));
  }

  // for data cells
  for (let j = 0; j < rows.length; j++) {
    for (let i = 0; i < dataColumns.length; i++) {
      // console.log(i,j,rows[j][dataColumns[i]]);
      canvasContext.beginPath();
      canvasContext.save();
      canvasContext.rect(
        i * columnWidth,
        (j + 1) * rowHeight,
        columnWidth,
        rowHeight
      );
      canvasContext.clip();

      canvasContext.font = `${fontSize}px ${font}`;
      canvasContext.fillStyle = `${fontColor}`;

      if (
        selectedRangeStart &&
        selectedRangeEnd &&
        Math.min(selectedRangeStart.row, selectedRangeEnd.row) <= j &&
        j <= Math.max(selectedRangeStart.row, selectedRangeEnd.row) &&
        Math.min(selectedRangeStart.col, selectedRangeEnd.col) <= i &&
        i <= Math.max(selectedRangeStart.col, selectedRangeEnd.col)
      ) {
        // enters here when there is a range of selection
        canvasContext.fillStyle = `${"#12126737"}`;
        canvasContext.fillRect(
          i * columnWidth,
          (j + 1) * rowHeight,
          columnWidth,
          rowHeight
        );
        canvasContext.fillStyle = `${fontSelectedColor}`;
        canvasContext.fillText(
          rows[j][dataColumns[i]],
          // `R${j},C${i}`,
          i * columnWidth + fontPadding,
          (j + 2) * rowHeight - fontPadding
        );
      } else if (
        selectedCell &&
        selectedCell.row === j &&
        selectedCell.col === i
      ) {
        // console.log(selectedCell)
        // console.log(rows[selectedCell.row][dataColumns[selectedCell.col]])
        // canvasContext.fillStyle = `${fontSelectedColor}`
        canvasContext.fillText(
          rows[j][dataColumns[i]],
          // `R${j},C${i}`,
          i * columnWidth + fontPadding,
          (j + 2) * rowHeight - fontPadding
        );
        inputElement.style.display = "inline-block";
        inputElement.style.left = `${i * columnWidth}px`;
        inputElement.style.top = `${(j + 1) * rowHeight}px`;
        inputElement.value = rows[j][dataColumns[i]];
        inputElement.style.height = `${rowHeight}px`;
        inputElement.style.width = `${columnWidth}px`;
        inputElement.focus();
      } else {
        canvasContext.fillText(
          rows[j][dataColumns[i]],
          // `R${j},C${i}`,
          i * columnWidth + fontPadding,
          (j + 2) * rowHeight - fontPadding
        );
      }
      canvasContext.restore();
      // await new Promise(r => setTimeout(r, 100));
    }
  }

  // window.requestAnimationFrame(() => {
  //   draw();
  // });
  // console.log("Finished painting");
  // console.log("Took : " + (new Date() - startTime));
}

canvasElement.width = dataColumns.length * columnWidth;
canvasElement.height = (rows.length + 1) * rowHeight;

window.addEventListener("keydown", canvasKeyHandler);
canvasElement.addEventListener("mousedown", mouseDownHandler);
inputElement.addEventListener("keydown", handleKeyInputEnter);
inputElement.addEventListener("blur", (e) => (e.target.style.display = "none"));

draw();
