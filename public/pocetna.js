var sadrzaj = document.querySelector(".sadrzaj");
//kopirala css dugmad sa prosle spirale
var noviHtml = 
'<div id="slike"></div>' + 
'<div class="dugmad">' + 
'<button type="button" id="prethodni" onclick="ucitajSlikePrethodni()">Prethodni</button>' +
'<button type="button" id="sljedeci" onclick="ucitajSlikeSljedeci()">Sljedeći</button>' + 
'</div>';
sadrzaj.innerHTML = noviHtml;
function ucitajSlikeSljedeci(){
    if(document.getElementById("prethodni").disabled) document.getElementById("prethodni").disabled = false;
    Pozivi.z3Ucitavanje();
}
function ucitajSlikePrethodni(){
    Pozivi.z3Kesiranje();
}
document.getElementById("prethodni").disabled = true;
Pozivi.z3Ucitavanje();
