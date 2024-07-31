const URL = "https://mkeenan-kdb.github.io/gaeilge_web_project";
//const URL = "http://" + window.location.host;
var sentences = [];
var allowed = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "á", "é", "í", "ó", "ú"];
var nullresult;
var vibes = ["gaeilge.css", "gaeilge_v2.css"];
var pageWidth;

sentences = [{
  "eng": "English translation will show here!",
  "ga": "Irish result will <span class=\"underline_word\">show</span> here",
  "orig": "Irish results will show here",
  "html": "<div class=\"sentence tooltip\" id=0>Irish results will <span class=\"underline_word\">show</span> here<span class=\"soundicon\"></span><span class=\"tooltiptext\">English translation will show here!</span></div>",
  "ponchtml": "<div class=\"sentence tooltip\" id=0>Irish results can have ponc like: '<span class=\"underline_word\">Ḟ</span>ear'. <span class=\"soundicon\"></span><span class=\"tooltiptext\">English translation will show here!</span></div>"
}]


function sendData(findfile) {
  document.querySelector(".loader-box").style.display = "flex";
  console.log("Finding file: ", findfile);
  fetch(findfile).then(response => console.log(response.status) || response) // output the status and return response
    .then(response => response.text()) // send response body to next then chain
    .then(body => {
      //Define the response object
      var resp;
      if ("{" == body[0]) {
        resp = JSON.parse(body); //If its a valid json response like we expect
      } else {
        resp = nullresult; //Use the null response if it's not json
      }
      const handler = resp.called;
      document.querySelector(".loader-box").style.display = "none";
      if (resp.resp == false) {
        console.log("Error on server side!");
        return;
      };
      switch (handler) {
        case 'searchWord':
          sentences = resp.resp.result;
          var container = document.getElementById("sentenceContainer");
          container.innerHTML = '';
          sentences.forEach((item, i) => {
            container.innerHTML += item['html'];
          });
          var html = '';
          var resultopt = resp.payl[1];
          var pageopt = document.querySelector("#searchOpt").value;
          var forms = resp.resp.forms;
          //If this is the result of clicking a form - don't replace forms
          if (!(("match" == pageopt) && ("exact" == resultopt))) {
            forms.forEach((item) => {
              html += item;
            });
            document.getElementById("wordItems").innerHTML = html;
          } else {
            var domforms = document.querySelectorAll(".wordItem");
            domforms.forEach((item, i) => {
              if (!item.style.textShadow == '') return;
              if (item.innerText == resp.payl[0]) {
                domforms[i].style.backgroundColor = "#2fa60d";
              } else {
                domforms[i].style.backgroundColor = "";
              }
            });
          }
          //If seanchló is enabled
          var poncv = document.querySelector("#poncCheck");
          if (poncv.checked == true) {
            changeChlo(poncv);
          } else {
            changeChlo(document.querySelector("#noponcCheck"));
          }
          break;
        default:
          console.log("No handler for response");
      }
    });
}

function changeChlo(elem) {
  console.log("triggered changeChlo", elem.value);
  if (0 == sentences.length) return;
  var container = document.querySelector("#sentenceContainer");
  if (elem.value == "ponc") {
    container.innerHTML = '';
    sentences.forEach((item, i) => {
      container.innerHTML += item['ponchtml'];
    });
  } else if (elem.value == "noponc") {
    container.innerHTML = '';
    sentences.forEach((item, i) => {
      container.innerHTML += item['html'];
    });
  }
  changeIrishFont(document.querySelector("#fontStyle").value);
}

function changeIrishFont(font) {
  console.log("Changing font to:", font);
  var words = document.querySelectorAll(".wordItem");
  var sentences = document.querySelectorAll(".sentence");
  words.forEach((item, i) => {
    item.style.fontFamily = font;
  });
  sentences.forEach((item, i) => {
    item.style.fontFamily = font;
  });
}

function speakIrish(elem) {
  console.log(elem);
  var txt = sentences[Number(elem.parentElement.id)].orig;
  if ('' == txt) return;
  var voice = document.getElementById("voiceSelect").value;
  document.querySelector(".loader-box").style.display = "flex";
  console.log("Speaking: ", txt);
  fetch("https://synthesis.abair.ie/api/synthesise", {
    method: "POST",
    body: JSON.stringify({
      "synthinput": {
        "text": txt,
        "normalise": true
      },
      "voiceparams": {
        "languageCode": "ga-IE",
        "name": voice
      },
      "audioconfig": {
        "audioEncoding": "LINEAR16",
        "speakingRate": "1",
        "pitch": "1",
        "htsParams": "string"
      },
      "outputType": "JSON",
      "timing": "BOTH"
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  }).then((response) => {
    return response.json();
  }).then((json) => {
    var aud = json.audioContent;
    var snd = new Audio("data:audio/mp3;base64," + aud);
    snd.play();
    setTimeout(() => {
      document.querySelector(".loader-box").style.display = "none";
    }, 2000);
  });

}

function cleanIrishWord(word) {
  var lcw = word.toLowerCase();
  var cleaned = '';
  for (i = 0; i < lcw.length; i++) {
    if (allowed.includes(lcw[i])) {
      cleaned += lcw[i]
    }
  }
  return cleaned;
}

function searchWord() {
  var searchterm = document.getElementById("searchTerm").value;
  var opt = document.getElementById("searchOpt").value;
  var word = cleanIrishWord(searchterm);
  var findfile = opt + "_" + word + "_sentences.json";
  findfile = URL + "/preload/" + findfile;
  console.log("Cleaned word, finding file; ", findfile);
  sendData(findfile);
  window.scrollTo(0, 0);
}

function searchForm(word) {
  console.log("Searching form: ", word);
  var orig = document.getElementById("searchOpt").value;
  var origword = document.getElementById("searchTerm").value;
  document.getElementById("searchTerm").value = word;
  document.getElementById("searchOpt").value = 'exact';
  searchWord();
  document.getElementById("searchOpt").value = orig;
  document.getElementById("searchTerm").value = origword;
}

function insertSpecialChar(char) {
  var st = document.getElementById("searchTerm");
  st.value += char;
  st.focus();
}

function scaleContent() {
  var newWidth = document.body.offsetWidth;
  if (pageWidth == newWidth) {
    return;
  } else {
    pageWidth = newWidth;
    document.querySelector("#wordItems").style.marginTop = document.querySelector(".web-title").offsetHeight + 10 + "px";
    window.scrollTo(0, 0);
  }
}

function changeTheme(sheet) {
  var sheets = document.getElementsByTagName("link");
  for (i = 0; i < sheets.length; i++) {
    var ref = sheets[i].href;
    if (ref.includes("gaeilge") && ref.includes(".css")) {
      sheets[i].href = sheet;
    }
  }
  setTimeout(function () {
    window.scrollTo(0, 0);
    document.querySelector("#wordItems").style.marginTop = document.querySelector(".web-title").offsetHeight + 10 + "px";
  }, 100);
}

//#d3c0949e
//Document ready
(function() {
  document.querySelector(".loader-box").style.display = "flex";
  // Get the input field
  var input = document.getElementById("searchTerm");
  // Execute a function when the user presses a key on the keyboard
  input.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      document.getElementById("searchButton").click();
      document.activeElement.blur();
    }
  });

  fetch(URL + '/preload/match_NORESULT_sentences.json').then(response => console.log(response.status) || response) // output the status and return response
    .then(response => response.text()) // send response body to next then chain
    .then(body => {
      let resp = JSON.parse(body);
      const handler = resp.called;
      document.querySelector(".loader-box").style.display = "none";
      if (resp.resp == false) {
        console.log("Error on server side!");
        return;
      };
      nullresult = resp;
    });
  pageWidth = document.getElementsByTagName("body")[0].offsetWidth;
  window.scrollTo(0, 0);
  document.querySelector("#wordItems").style.marginTop = document.querySelector(".web-title").offsetHeight + 10 + "px";
  setTimeout(() => {
    document.querySelector(".loader-box").style.display = "none";
  }, 200);
  window.onresize = scaleContent;
})();
