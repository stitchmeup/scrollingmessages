// Ajax, returns list of plays
function playsList(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      buildForm(JSON.parse(this.responseText));
    }
  };

  xhttp.open("GET", '/playsList', true);
  xhttp.send();
}

function buildForm(playsList) {
  var playsHTML = '';
  playsList.forEach(play => {
    playsHTML += `<option value=${play.nameHash}>${play.title} / ${play.name}</option>`
  });
  var selectPlays = document.getElementById('playsList')
  selectPlays.innerHTML = playsHTML;

  buildSelectEquipes(0, playsList);

  selectPlays.onchange = () => {
    var selectPlays = document.getElementById('playsList');
    var playIndex = selectPlays.selectedIndex;
    buildSelectEquipes(playIndex, playsList);
  }

  function buildSelectEquipes(playIndex, playsList) {
    var equipesHTML = '';
    if (playsList[playIndex].hasOwnProperty('equipes')) {
        playsList[playIndex].equipes.forEach(equipe => {
          equipesHTML += `<option value=${equipe}>${equipe}</option>`
        });
      }
    document.getElementById('equipes').innerHTML = equipesHTML;
  }
}

window.onload = () => {
  playsList()
}
