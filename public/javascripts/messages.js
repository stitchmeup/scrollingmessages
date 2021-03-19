// Ajax
function ajaxRequest(url, callback){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      callback(this);
    }
  };

  xhttp.open("GET", url, true);
  xhttp.send();
}

// auto scroll
function pageScroll() {
  let prevScroll = window.scrollY;
  function scroll() {
    window.scrollBy(0,1);
    if (prevScroll == window.scrollY) {
      setTimeout(goTop, 3000);
    } else {
      prevScroll = window.scrollY;
      scrolldelay = setTimeout(scroll,40);
    }
  }
  function goTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    setTimeout(scroll, 3000);
  }
  scroll();
}

// Génére thead du tableau
function genThead(equipes) {
  let thead = '<thead><tr><th scope="row">Timing</th>';
  equipes.forEach(equipe => {
    thead += '<th>' + equipe + '</th>'
  });
  thead += '</tr></thead>';
  return thead
}

// Construit le tableau HTML d'une scene
function buildTableScene(scene, equipes) {
  let num = scene.getElementsByTagName("numero")[0].childNodes[0].nodeValue

  let table = '<table class="table table-bordered table-striped text-center" id="scene' + num + '">'
  + '<caption class="text-center">Scene ' + num + '</caption>'
  + genThead(equipes);
  + '<tbody>';
  let timings = scene.getElementsByTagName("timing");
  for (let i = 0; i < timings.length; i++) {
    table += '<tr>';
    table += '<th scope="row">'
    + timings[i].getElementsByTagName("time")[0].childNodes[0].nodeValue
    + '</th>';

    let equipesInXML = timings[i].getElementsByTagName("equipe");
    let message = {};
    for (let j = 0; j < equipesInXML.length; j++) {
      let id = equipesInXML[j].getElementsByTagName("id")[0].childNodes[0].nodeValue;
      message[id] = equipesInXML[j].getElementsByTagName("message")[0].childNodes[0].nodeValue;
    }
    let tableWidth = document.getElementById("tables").clientWidth;
    let marqueeWidth = tableWidth / (equipes.length + 1);
    equipes.forEach(equipe => {
      let mes = message[equipe] || "Aucun";
      table += '<td align="center">'
      + '<marquee  width="' + marqueeWidth + '" scrollamount="4">'
      + mes
      + '</marquee></td>';
    });
  }
  table += '</tbody></table>'
  return table
}

// Rotation d'une scene
function rotateScene(scene, scenes, equipes) {
  let num = scenes[scene].getElementsByTagName("numero")[0].childNodes[0].nodeValue;
  let sceneToRemove = 'scene' + (num - 3);
  let time = scenes[num - 3].getElementsByTagName("timing")[0].getElementsByTagName("time")[0].childNodes[0].nodeValue.split(':');
  let delay = (parseInt(time[0])*60 + parseInt(time[1])) * 1000;
  setTimeout(() => {
    document.getElementById("tables").innerHTML += buildTableScene(scenes[scene], equipes)
    document.getElementById(sceneToRemove).remove();
  }, delay);


}

// Liste les équipes
function listeEquipes(urlParams, xmlDoc) {
  let equipes = [];
  // Si equipe dans param
  if ( urlParams.has('equipe')) {
    equipes = urlParams.getAll('equipe')
    // Sinon recupère la liste des équipes dans le XML
  } else {
    let listeEquipes = xmlDoc.getElementsByTagName('listeEquipes')[0].getElementsByTagName('id');
    for (let i = 0; i < listeEquipes.length; i++) {
      equipes.push(listeEquipes[i].childNodes[0].nodeValue);
    }
  }
  return equipes
}

// Parse le XML reçue avec AJAX
function parseXML(xml) {
    // XML -> Objet JS
    let xmlDoc = xml.responseXML;

    // Récupère paramètre de la requête
    const urlParams = new URLSearchParams(queryString);

    // ListeEquipes
    let equipes = listeEquipes(urlParams, xmlDoc);

    // Insère le titre
    document.getElementById("titrePiece").innerText += xmlDoc.getElementsByTagName('piece')[0].getElementsByTagName('titre')[0].childNodes[0].nodeValue;

    // Recupère partie scene dans le XML
    let scenes = xmlDoc.getElementsByTagName("scene");

    // Affiche les 3 premières scènes
    let scene = 0
    for (; scene < 3; scene++) {
      document.getElementById("tables").innerHTML += buildTableScene(scenes[scene], equipes)
    }

    // Création de tempo asynchrone pour effectuer la rotation des équipes
    while ( scene < scenes.length ) {
      rotateScene(scene, scenes, equipes);
      scene++;
    }

    // démarre le scroll auto après que la page ait été générée.
    setTimeout(pageScroll, 3000);
}

function showUrg(response) {
  let msgUrg = JSON.parse(response.responseText);

  document.getElementById('msgUrg').innerHTML = msgUrg.items[0].message;
}

function getUrg() {
  ajaxRequest('/urgent', showUrg)
  setTimeout(getUrg, 20000);
}

// Main
const queryString = window.location.search;
const url = "playData" + queryString;
window.onload = () => {
  ajaxRequest(url, parseXML);
  chronoStart();
  getUrg();
};
