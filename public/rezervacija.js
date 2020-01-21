//prvi z
Pozivi.z1();
// drugi z
function klik(){
    var dani = document.querySelectorAll(".grid-item"); 
dani.forEach(element => {
    if(element.querySelector("div")){
        element.onclick = function(){
            if(element.querySelector("div").classList.contains("slobodna")){
                var result = confirm("Da li želite da rezervišete ovaj termin?"); 
                if (result == true) { 
                    //pritisnuto ok
                    var dan = element.textContent;
                    var mjesec = document.getElementById("mjesec").textContent;
                    var naziv = document.getElementById("select").value;
                    var pocetak = document.getElementById("pocetak").value;
                    var kraj = document.getElementById("kraj").value;
                    //treba li checkbox?
                    var periodicno = document.getElementById("checkbox").checked;
                    var predavac = document.getElementById("osoblje").value;
                    if(provjeraIntervala(pocetak, kraj))
                    Pozivi.z2(naziv, dan, mjesec, pocetak, kraj, periodicno, predavac);
                    else alert("Pogresan vremenski interval!");
                } else { 
                    //pritisnuto cancel
                } 
            }
            else {
                alert("Rezervacija nemoguca!");
                return false;
            }
        }
    }
});
}
klik();
function provjeraIntervala(poc, kraj)
	{
        if(poc === "" || kraj === "") return false;
        var regexVrijeme = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/;

        if(!(regexVrijeme.test(poc) && regexVrijeme.test(kraj))){
            return false;
        }

        //isti ko zadatak sa rpr-a
        poc = poc.split(":");
        kraj = kraj.split(":");

        //sve u minute
		poc = poc[0]*60 + poc[1];
		kraj = kraj[0]*60 + kraj[1];
        
		poc = parseInt(poc);
		kraj = parseInt(kraj);

        if(poc >= kraj){
            return false;
        }
        return true;
    }
    Pozivi.ucitajOsoblje();
    Pozivi.ucitajSale();