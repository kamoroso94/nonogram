var mouseBtn = false;
var keyLegend = {top: [], left: []};
var playColor = "black";
var domain = "abcdefghijklmnopqrst";

var dim, keyPuzzle, userPuzzle, nonogram;

window.onload = init;
document.onmousedown = () => {mouseBtn = true};
document.onmouseup = () => {mouseBtn = false};

function init() {
  var dimTag = document.getElementById("dimensions");
  var difTag = document.getElementById("difficulty");
  nonogram = document.getElementById("nonogram");

  dim = parseInt(dimTag.value);
  var dif = parseFloat(difTag.value)

  keyPuzzle = matrix(dim, dim);
  userPuzzle = matrix(dim, dim);

  for(var i = 0; i < dim; i++) {
    for(var j = 0; j < dim; j++) {
      // make key puzzle random and user puzzle empty
      keyPuzzle[i][j] = Math.random() < dif ? 1 : 0;
      userPuzzle[i][j] = -1;
    }
  }

  // recreate nonogram
  while(nonogram.firstChild) {
    nonogram.removeChild(nonogram.firstChild);
  }

  var fragment = document.createDocumentFragment();

  for(var i = 0; i < dim + 1; i++) {
    var tr = document.createElement("tr");

    for(var j = 0; j < dim + 1; j++) {
      var td, th;

      if(i == 0) {
        if(j == 0) {
          td = document.createElement("td");
          td.className = "empty";
          tr.appendChild(td);
        } else {
          th = document.createElement("th");
          th.title = "C" + j;
          tr.appendChild(th);
        }
      } else {
        if(j == 0) {
          th = document.createElement("th");
          th.title = "R" + i;
          tr.appendChild(th);
        } else {
          td = document.createElement("td");
          td.id = domain.charAt(i - 1) + domain.charAt(j - 1);
          td.appendChild(document.createElement("div"));
          tr.appendChild(td);
        }
      }
    }

    fragment.appendChild(tr);
  }
  nonogram.appendChild(fragment);

  var tdTags = nonogram.getElementsByTagName("td");

  // create nonogram interactivity
  for(var i = 1; i < tdTags.length; i++) {
    var elem = tdTags[i].firstElementChild;

    elem.addEventListener("mouseover", function() {
      if(mouseBtn) {
        toggleSqr(this);
      }
    }, false);
    elem.addEventListener("mousedown", function() {toggleSqr(this)},false);
  }

  dimTag.addEventListener("change", init, false);
  difTag.addEventListener("change", init, false);

  var colors = document.querySelectorAll("label[for|=color]");

  for(var i = 0; i < colors.length; i++) {
    if(colors[i].htmlFor.indexOf("color") == 0) {
      colors[i].addEventListener("click", function() {
        playColor = document.getElementById(this.htmlFor).value;
        document.getElementById("reset1").innerHTML = "Clear " + this.firstElementChild.title;
      }, false);
    }
  }

  document.getElementById("hints").addEventListener("change", function() {gameHints(this.checked)}, false);
  document.getElementById("reset1").addEventListener("click", function() {gameReset(false)}, false);
  document.getElementById("reset2").addEventListener("click", function() {gameReset(true)}, false);
  document.getElementById("play").addEventListener("click", init, false);
  document.getElementById("submit").addEventListener("click", checkPuzzle, false);

  gameSetup();
}

function gameSetup() {
  var allRows = nonogram.getElementsByTagName("tr");
  var firstRow = allRows[0].getElementsByTagName("th");

  keyLegend = {top: [], left: []};
  userLegend = {top: [], left: []};

  // column hints
  for(var i = 0; i < dim; i++) {
    var sum = [];
    var count = 0;

    // get column hints
    for(var j = 0; j < dim; j++) {
      count += keyPuzzle[j][i];
      if(count > 0 && (keyPuzzle[j][i] == 0 || j == dim - 1)) {
        sum.push(count);
        count = 0;
      }
    }
    if(sum.length == 0) {
      sum.push(0);
    }

    keyLegend.top.push(sum);
    while(firstRow[i].firstChild) {
      firstRow[i].removeChild(firstRow[i].firstChild);
    }

    // put column hints
    firstRow[i].appendChild(document.createTextNode(sum[0]));
    for(var j = 1; j < sum.length; j++) {
      firstRow[i].appendChild(document.createElement("br"));
      firstRow[i].appendChild(document.createTextNode(sum[j]));
    }
  }

  // row hints
  for(var i = 0; i < dim; i++) {
    var thTag = allRows[i + 1].firstElementChild;
    var sum = [];
    var count = 0;

    // get row hints
    for(var j = 0; j < dim; j++) {
      count += keyPuzzle[i][j];
      if(count > 0 && (keyPuzzle[i][j] == 0 || j == dim - 1)) {
        sum.push(count);
        count = 0;
      }
    }
    if(sum.length == 0) {
      sum.push(0);
    }

    keyLegend.left.push(sum);
    while(thTag.firstChild) {
      thTag.removeChild(thTag.firstChild);
    }

    // put row hints
    var rowHint = sum[0];
    for(var j = 1; j < sum.length; j++) {
      rowHint += " ";
      rowHint += sum[j];
    }
    thTag.appendChild(document.createTextNode(rowHint));
  }

  document.getElementById("hints").checked = false;
  var hintBox = document.getElementById("hintBox");
  while(hintBox.firstChild) {
    hintBox.removeChild(hintBox.firstChild);
  }
  var em = document.createElement("em");
  em.appendChild(document.createTextNode("Hints disabled."));
  hintBox.appendChild(em);
  resetColor();
}

// reset user puzzle and nonogram
function gameReset(allColors) {
  var tdTags = nonogram.getElementsByTagName("td");

  for(var i = 0; i < dim; i++) {
    for(var j = 0; j < dim; j++) {
      if(allColors || document.getElementById(domain.charAt(i) + domain.charAt(j)).firstElementChild.style.color == playColor) {
        userPuzzle[i][j] = -1;
      }
    }
  }

  for(var i = 1; i < tdTags.length; i++) {
    var elem = tdTags[i].firstElementChild;

    if(allColors || elem.style.color == playColor) {
      elem.style.backgroundColor = "";
      elem.innerHTML = "";
    }
  }

  if(allColors) {
    resetColor();
  }
}

function checkPuzzle() {
  var arr = matrix(dim, dim);
  var userLegend = {top: [], left: []};
  var isWin = {top: true, left: true};

  for(var i = 0; i < dim; i++) {
    for(var j = 0; j < dim; j++) {
      arr[i][j] = Math.floor(Math.abs(userPuzzle[i][j] / 2));
    }
  }

  // check top legends
  for(var i = 0; i < dim; i++) {
    var sum = [];
    var a = 0;

    for(var j = 0; j < dim; j++) {
      a += arr[j][i];
      if(((arr[j][i] == 0 || j == dim - 1) && a > 0) || (j == dim - 1 && sum.length < 1 && a < 1)) {
        sum.push(a);
        a = 0;
      }
    }

    userLegend.top.push(sum);
  }

  // check left legends
  for(var i = 0; i < dim; i++) {
    var sum = [];
    var a = 0;

    for(var j = 0; j < dim; j++) {
      a += arr[i][j];
      if((a > 0 && (arr[i][j] == 0 || j == dim - 1)) || (a < 1 && j == dim - 1 && sum.length < 1)) {
        sum.push(a);
        a = 0;
      }
    }

    userLegend.left.push(sum);
  }

  // compare top legends
  for(var i = 0; i < dim; i++) {
    if(keyLegend.top[i].length == userLegend.top[i].length) {
      for(var j = 0; j < userLegend.top[i].length; j++) {
        if(keyLegend.top[i][j] != userLegend.top[i][j]) {
          isWin.top = false;
          break;
        }
      }

      if(!isWin.top) {
        break;
      }
    } else {
      isWin.top = false;
      break;
    }
  }

  if(isWin.top) {
    // compare left legends
    for(var i = 0; i < dim; i++) {
      if(keyLegend.left[i].length == userLegend.left[i].length) {
        for(var j = 0; j < userLegend.left[i].length; j++) {
          if(keyLegend.left[i][j] != userLegend.left[i][j]) {
            isWin.left = false;
            break;
          }
        }

        if(!isWin.left) {
          break;
        }
      } else {
        isWin.left = false;
        break;
      }
    }
  }

  // replace with dialog
  if(isWin.top && isWin.left) {
    if(confirm("You won!  Click OK to play a new game.")) {
      init();
    }
  } else {
    alert("You lose!");
    gameReset(true);
  }
}

function toggleSqr(box) {
  var a = domain.indexOf(box.parentNode.id.charAt(0));
  var b = domain.indexOf(box.parentNode.id.charAt(1));

  userPuzzle[a][b] = 1 - 1 / userPuzzle[a][b];

  switch(userPuzzle[a][b]) {
    case 0.5:  // 0.5 crossed
      box.style.backgroundColor = "";
      box.style.color = playColor;
      box.innerHTML = "&times;";
      break;

    case -1:  // -1 empty
      box.innerHTML = "";
      break;

    case 2:    // 2 filled
      box.style.backgroundColor = playColor;
      box.style.color = playColor;
  }
}

// change innerHTML to appendChild
function gameHints(isEnabled) {
  var box = document.getElementById("hintBox");

  if(isEnabled) {
    var msg = "<b>Rows:</b> ";

    for(var i = 0; i < keyLegend.left.length; i++) {
      var sum = 0;
      var max = 0;

      for(var j = 0; j < keyLegend.left[i].length; j++) {
        sum += keyLegend.left[i][j];
        max = Math.max(keyLegend.left[i][j], max);
      }

      if(sum + keyLegend.left[i].length - 1 + max - 1 >= dim || keyLegend.left[i] == 0) {
        msg += (i + 1) + ", ";
      }
    }

    if(msg.substr(msg.length - 2, 2) == "> ") {
      msg += "<i>None.</i>";
    }
    else {
      msg = msg.substr(0, msg.length - 2) + ".";
    }

    msg += "<br /><b>Columns:</b> ";

    for(var i = 0; i < keyLegend.top.length; i++) {
      var sum = 0;
      var max = 0;

      for(var j = 0; j < keyLegend.top[i].length; j++) {
        sum += keyLegend.top[i][j];
        max = Math.max(keyLegend.top[i][j], max);
      }

      if(sum + keyLegend.top[i].length - 1 + max - 1 >= dim || keyLegend.top[i] == 0) {
        msg += (i + 1) + ", ";
      }
    }

    if(msg.substr(msg.length - 2, 2) == "> ") {
      msg += "<i>None.</i>";
    } else {
      msg = msg.substr(0, msg.length - 2) + ".";
    }

    box.innerHTML = msg;
  } else {
    box.innerHTML = "<i>Hints disabled.</i>";
  }
}

function resetColor() {
  document.getElementById("color-0").checked = true;
  playColor = "black";
  document.getElementById("reset1").innerHTML = "Clear Black";
}

function matrix(x, y) {
  var arr2D = new Array(x);

  for(var i = 0; i < x; i++) {
    arr2D[i] = new Array(y);
  }

  return arr2D;
}
