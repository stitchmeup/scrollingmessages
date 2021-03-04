// Ajax, returns list of plays
function playsList(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      buildPlaysListForm(JSON.parse(this.responseText));
    }
  };

  xhttp.open("GET", '/playsList', true);
  xhttp.send();
}

function buildPlaysListForm(playsList) {
  var playsHTML = '';
  playsList.forEach(play => {
    playsHTML += `<option value=${play.nameHash}>${play.title} / ${play.name}</option>`
  });
  var selectPlays = document.getElementById('playsList');
  selectPlays.innerHTML = playsHTML;
  selectPlays.onchange = function buildPlayConfForm() {
    var selectPlays = document.getElementById('playsList')
    nameHash = selectPlays.options[selectPlays.selectedIndex].value
    console.log(playsList)
    let form = `
    <form class="d-flex flex-column border-top m-2" id="getmessages" action="/messages" method="GET">
      <div class="form-group row">
          <div class="col-6">
            <label for="equipes">Equipes</label>
            <select class="form-control" id="equipe" multiple="" name="equipe">
            </select>
          </div>
          <div class="col-3">
            <label for="start">Sc&egrave;ne de d&eacute;but</label>
            <input class="form-control" id="start" type="number" name="start" placeholder="1" value="1" size="16" />
          </div>
          <div class="col-3">
            <label for="end">Sc&egrave;ne de fin</label>
            <input class="form-control" id="end" type="number" name="end" placeholder="100" value="100" size="16" />
          </div>
      </div>
      <div class="form-group">
          <div class="form-check">
            <input class="form-check-input" id="sync" type="radio" name="text" value="sync" checked="" />
            <label class="form-check-label" for="sync">Afficher uniquement le texte qui correspond &agrave; un message pour une &eacute;quipe. (d&eacute;faut)</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" id="full" type="radio" name="text" value="full" />
            <label class="form-check-label" for="full">Afficher tout le texte.</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" id="aucun" type="radio" name="text" value="none" />
            <label class="form-check-label" for="full">Afficher aucun texte.</label>
          </div>
      </div>
      <button class="btn btn-primary m-2 mx-auto" type="submit">Afficher les messages</button>
  </form>
   `;
 };
}

window.onload = () => {
  playsList()
}
