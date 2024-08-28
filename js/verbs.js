function buildTableRow(dataRow){
  var row = Object.values(dataRow);
  var cellHTML = '<tr>\n';
  row.forEach((cellData) => {
    cellHTML+= '<td>'+cellData+'</td>\n';
  });
  cellHTML += '</tr>\n';
  return cellHTML;
}


function buildTableForTense(verbTense, thisTenseForms){
  if (thisTenseForms.length == 0){
    return;
  }
  var locus = document.getElementById('tenseDetailsContainer');
  console.log(thisTenseForms);
  var headers = Object.keys(thisTenseForms[0]);
  var tableHTML = '<tr>\n';
  headers.forEach((thisHeader) => {
    thisHeader = thisHeader.charAt(0).toUpperCase() + thisHeader.slice(1);
    tableHTML += '<th>'+thisHeader+'</th>\n';
  });
  tableHTML += '</tr>\n';

  thisTenseForms.forEach((dataRow) => {
    tableHTML += buildTableRow(dataRow);
  });
  tableHTML = '<table class="academia">' + tableHTML + '</table>';
  tableHTML = '<summary>' + verbTense + '</summary>' + tableHTML;
  var verbTable = document.createElement('div');
  verbTable.classList.add('verb-table-container');
  verbTable.innerHTML = tableHTML;
  locus.appendChild(verbTable);
}


function buildTenseDetails(resp){
  var tenses = Object.keys(resp);
  tenses.forEach((item) => {
    buildTableForTense(item, resp[item]);
  });
}

function searchVerb(term){
  showVerbDialog();
  var files = [(term + '_MOODS.json'), (term + '_TENSES.json')];
  var locus = document.getElementById('tenseDetailsContainer');
  locus.innerHTML = '';
  files.forEach((file) => {
    getVerb(file);
  });
  setTimeout(function () {
    changeIrishFont(document.querySelector("#fontStyle").value);
  }, 10);
  document.querySelector(".loader-box").style.display = "none";
}

function getVerb(verbname) {
  fetch(URL + "/preload/json_verbs/" + verbname).then(response => console.log(response.status) || response) // output the status and return response
    .then(response => response.text()) // send response body to next then chain
    .then(body => {
      //Define the response object
      var resp;
      if (("{" == body[0])|("[" == body[0])) {
        resp = JSON.parse(body); //If its a valid json response like we expect
      } else {
        resp = nullresult; //Use the null response if it's not json
      }
      console.log(resp);
      //Now pass resp into the next function that will create the details divs and html tables etc
      buildTenseDetails(resp);
    });
}

function showVerbDialog() {
  document.getElementById('verbDialog').showModal();
}

function hideVerbDialog() {
  document.getElementById('verbDialog').close();
}

function hightlightVerbs(){
  document.querySelectorAll(".sentence").forEach((item) => {
    var sentence = item.innerHTML.split(" ");
    console.log(sentence);
    verbs.forEach((verb) => {
      console.log(sentence.indexOf(verb));
    });
  });

}
