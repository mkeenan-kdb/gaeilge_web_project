const URL = window.location.href;
console.log(URL);
var sentences = [];
var allowed = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","á","é","í","ó","ú"];
var nullresult;

sentences = [{
  "eng": "English translation will show here!",
  "ga": "Irish result will <span class=\"underline_word\">show</span> here",
  "orig": "Irish results will show here",
  "html": "<div class=\"sentence tooltip\" id=0>Irish results will <span class=\"underline_word\">show</span> here<span class=\"soundicon\"></span><span class=\"tooltiptext\">English translation will show here!</span></div>",
  "ponchtml": "<div class=\"sentence tooltip\" id=0>Irish results can have ponc like: '<span class=\"underline_word\">Ḟ</span>ear'. <span class=\"soundicon\"></span><span class=\"tooltiptext\">English translation will show here!</span></div>"
}]
var words = [];
//#searchTerm#langSelect

function sendData(findfile) {
  document.querySelector(".loader-box").style.display = "flex";
  console.log("Finding file: ", findfile);
  fetch(URL+'/preload/'+findfile).then(response => console.log(response.status) || response) // output the status and return response
    .then(response => response.text()) // send response body to next then chain
    .then(body => {
      var resp;
      if(body.includes("File not found")){
        resp = nullresult;
      }else{
        resp = JSON.parse(body);
      }
      const handler = resp.called;
      document.querySelector(".loader-box").style.display = "none";
      if (resp.resp == false) {
        console.log("Error on server side!");
        return;
      };
      console.log("Results from server: ", resp);
      switch (handler) {
        case 'searchWord':
          sentences = resp.resp.result;
          words = resp.resp.forms;
          var container = document.getElementById("sentenceContainer");
          container.innerHTML = '';
          sentences.forEach((item, i) => {
            container.innerHTML += item['html'];
          });
          var html = '';
          if(!(("exact"==resp.payl[1])&&("match"==document.querySelector("#searchOpt").value))){
            console.log("Rendering!!!");
            words.forEach((item) => {
              html += item;
            });
            document.getElementById("wordItems").innerHTML = html;
          }
          var poncv = document.querySelector("#poncCheck");
          if (poncv.checked == true) {
            changeChlo(poncv);
          } else {
            changeChlo(document.querySelector("#noponcCheck"));
          }
          var containerWidth = document.querySelector("#sentenceContainer").offsetWidth + "px";
          document.querySelector("#wordItems").style.width = containerWidth;
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

function cleanIrishWord(word){
  var lcw = word.toLowerCase();
  var cleaned = '';
  for(i=0;i<lcw.length;i++){
    if(allowed.includes(lcw[i])){
      cleaned+=lcw[i]
    }
  }
  return cleaned;
}

function searchWord() {
  var searchterm = document.getElementById("searchTerm").value;
  var opt = document.getElementById("searchOpt").value;
  var word = cleanIrishWord(searchterm);
  var findfile = opt+"_"+word+"_sentences.json";
  console.log("Cleaned word, finding file; ",findfile);
  sendData(findfile);
  window.scrollTo(0, 0);
}

function searchForm(word) {
  var orig = document.getElementById("searchOpt").value;
  var origword = document.getElementById("searchTerm").value;
  document.getElementById("searchTerm").value = word;
  document.getElementById("searchOpt").value = 'exact';
  document.getElementById("searchButton").click();
  setTimeout(() => {
    document.getElementById("searchOpt").value = orig;
    document.getElementById("searchTerm").value = origword;
    window.scrollTo(0, 0);
  }, 50);
}

//Document ready
(function() {
  document.querySelector(".loader-box").style.display = "flex";
  document.querySelector("#wordItems").style.marginTop = document.querySelector(".web-title").offsetHeight + 20 + "px";
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
  var containerWidth = document.querySelector("#sentenceContainer").offsetWidth + "px";
  document.querySelector("#wordItems").style.width = containerWidth;
  fetch(URL+'/preload/match_NORESULT_sentences.json').then(response => console.log(response.status) || response) // output the status and return response
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
  setTimeout(() => {
    window.scrollTo(0, 0);
    document.querySelector(".loader-box").style.display = "none";
  }, 200);
})();
