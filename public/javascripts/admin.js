// Ajax, returns list of plays
function playsList(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      buildPlayDeletionForm(JSON.parse(this.responseText));
    }
  };

  xhttp.open("GET", '/playsList', true);
  xhttp.send();
}

function buildPlayDeletionForm(playsList) {
  var playsHTML = '';
  playsList.forEach(play => {
    playsHTML += `<option value=${play.nameHash}>${play.title} / ${play.name}</option>`
  });
  var selectPlays = document.getElementById('playsList');
  selectPlays.innerHTML = playsHTML;
}

window.onload = () => {
  playsList()
}
