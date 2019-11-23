let Kalendar = (function(){
    
    var redovnaZauzeca = [];
    var vanrednaZauzeca = [];
    const godina = 2019;
    const sedmica = 7;
    
    function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj){
    
    var zauzeti = document.querySelectorAll(".zauzeta");
    //ne moze sa getElmentsByClassName jer to vraca live htmlcollection
    for(var i = 0; i < zauzeti.length; i++){
        zauzeti[i].classList.remove("zauzeta");
        zauzeti[i].classList.add("slobodna");
    }
    var dani = kalendarRef.getElementsByClassName("grid-item");
    var dan = prviDanUMjesecu(mjesec, godina);
    redovnaZauzeca.forEach(redovnoZauzece => {
        if(sala === redovnoZauzece.naziv && poklapanjeIntervala(pocetak, kraj, redovnoZauzece.pocetak, redovnoZauzece.kraj)){
            switch(redovnoZauzece.semestar){
                case "zimski":
                    if((mjesec === 9 || mjesec === 10 || mjesec === 11 || mjesec === 0) && (redovnoZauzece.dan >= 0 && redovnoZauzece.dan <= 6)){
                        var poc;
                        //+1 se dodaje jer fja prviDanUMjesecu vraca broj dana racunavsi od 1
                        if(redovnoZauzece.dan + 1 < dan) poc = 2*sedmica - dan + redovnoZauzece.dan + 1;
                        else poc = sedmica - dan + redovnoZauzece.dan + 1;
                        for(var i = poc; i<dani.length; i+=7){
                            dani[i].querySelector("div").classList.remove("slobodna");
                            dani[i].querySelector("div").classList.add("zauzeta");
                        }
                    }
                    break;
                case "ljetni":
                    if((mjesec === 1 || mjesec === 2 || mjesec === 3 || mjesec === 4 || mjesec === 5) && (redovnoZauzece.dan >= 0 && redovnoZauzece.dan <= 6)){
                        var poc;
                        //+1 se dodaje jer fja prviDanUMjesecu vraca broj dana racunavsi od 1
                        if(redovnoZauzece.dan + 1 < dan) poc = 2*sedmica - dan + redovnoZauzece.dan + 1;
                        else poc = sedmica - dan + redovnoZauzece.dan + 1;
                        for(var i = poc; i<dani.length; i+=7){
                            dani[i].querySelector("div").classList.remove("slobodna");
                            dani[i].querySelector("div").classList.add("zauzeta");
                        }
                    }
                    break;
            }
        }
    });
    vanrednaZauzeca.forEach(vanrednoZauzece => {
        if(sala === vanrednoZauzece.naziv && poklapanjeIntervala(pocetak, kraj, vanrednoZauzece.pocetak, vanrednoZauzece.kraj)){
            var regexDatum = /^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:19|20)\d{2})\s*$/;
            if(regexDatum.test(vanrednoZauzece.datum)){
            var danMjesecGodina = vanrednoZauzece.datum.split(".");
            if(mjesec === parseInt(danMjesecGodina[1]) - 1)
            {
            var index = sedmica + parseInt(danMjesecGodina[0]) - 1;
            //dani[i].querySelector("div").classList.remove("slobodna");
            dani[index].querySelector("div").classList.add("zauzeta");
            }
            }
        }
    });
    }
    function ucitajPodatkeImpl(redovna, vanredna){
    redovnaZauzeca = redovna;
    vanrednaZauzeca = vanredna;
    }
    function daniUMjesecu (mjesec, godina) { 
        //posljednji dan proslog mjeseca
        return new Date(godina, mjesec + 1, 0).getDate(); 
    }
    function prviDanUMjesecu(mjesec, godina){
        //dani pocinju od nedjelje, nedjelja je 0!!!
        var dan = new Date(godina, mjesec, 1).getDay();
        if(dan === 0) return 7;
        else return dan; 
    }
    function poklapanjeIntervala(poc1, kraj1, poc2, kraj2)
	{
        if(poc1 === "" || poc2 === "" || kraj1 === "" || kraj2 === "") return false;
        var regexVrijeme = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/;

        if(!(regexVrijeme.test(poc2) && regexVrijeme.test(kraj2) && regexVrijeme.test(poc1) && regexVrijeme.test(kraj1))){
            console.log("vrijeme nije validno");
            return false;
        }

        //isti ko zadatak sa rpr-a
        poc1 = poc1.split(":");
        poc2 = poc2.split(":");
        kraj1 = kraj1.split(":");
        kraj2 = kraj2.split(":");

        //sve u minute
		poc1 = poc1[0]*60 + poc1[1];
		poc2 = poc2[0]*60 + poc2[1];
		kraj1 = kraj1[0]*60 + kraj1[1];
        kraj2 = kraj2[0]*60 + kraj2[1];
        
		poc1 = parseInt(poc1);
		poc2 = parseInt(poc2);
		kraj1 = parseInt(kraj1);
        kraj2 = parseInt(kraj2);

        if(poc1 >= kraj1 || poc2 >= kraj2){
            //alert("Pogresan vremenski interval.");
            return false;
        } 
        
        //uneseni pocetak se ne smije nalaziti izmedju pocetka iz liste i kraja iz liste niti smije biti jednak pocetku iz liste
        //uneseni kraj se ne smije nalaziti izmedju pocetka iz liste i kraja iz liste niti smije biti jednak kraju iz liste
		return((kraj1 > poc2 && kraj1 <= kraj2) || (poc1 >= poc2 && poc1 < kraj2) || (poc1 <= poc2 && kraj1 >= kraj2) || (poc2 <= poc1 && kraj2 >= kraj1));
	}
    function iscrtajKalendarImpl(kalendarRef, mjesec){
    var brojDana = daniUMjesecu(mjesec, godina);
    var prviDan = prviDanUMjesecu(mjesec, godina);
    const imenaMjeseci = ["Januar", "Februar", "Mart", "April", "Maj", "Juni", "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"];
    var noviKalendar = "";
    noviKalendar+='<div class="mjesec" id="mjesec">';
    noviKalendar+=imenaMjeseci[mjesec];
    noviKalendar+="</div>";
    noviKalendar+='<div class="grid-item dani">PON</div>' + 
    '<div class="grid-item dani">UTO</div>' + 
    '<div class="grid-item dani">SRI</div>' +
    '<div class="grid-item dani">CET</div>' + 
    '<div class="grid-item dani">PET</div>' + 
    '<div class="grid-item dani">SUB</div>' +
    '<div class="grid-item dani">NED</div>';
    for(var i = 1; i<prviDan; i++){
        noviKalendar+="<div></div>";
    }
    for(var i = 1; i<=brojDana; i++){
        noviKalendar+='<div class="grid-item">' + i + '<div class="slobodna"></div></div>';
    }
    kalendarRef.innerHTML = noviKalendar;
    }
    return {
    obojiZauzeca: obojiZauzecaImpl,
    ucitajPodatke: ucitajPodatkeImpl,
    iscrtajKalendar: iscrtajKalendarImpl
    }
    }());
    
    
    Kalendar.ucitajPodatke([{dan: 2,
        semestar: "zimski",
        pocetak: "12:00",
        kraj: "13:30",
        naziv: "0-01",
        predavac: "NB"}, {dan: 4,
        semestar: "ljetni",
        pocetak: "16:00",
        kraj: "17:00",
        naziv: "VA1",
        predavac: "NB"}], [{datum: "21.11.2019",
        pocetak: "12:00",
        kraj: "13:30",
        naziv: "1-01",
        predavac: "nadija"}, {datum: "5.7.2019",
        pocetak: "12:00",
        kraj: "14:00",
        naziv: "MA",
        predavac: "nadija"}]);
    var trenutniMjesec = new Date().getMonth();
    Kalendar.iscrtajKalendar(document.getElementById("kalendar"), trenutniMjesec);
    var mjeseci = {Januar:0, Februar:1, Mart:2, April:3, Maj:4, Juni:5, Juli:6, August:7, Septembar:8, Oktobar:9, Novembar:10, Decembar:11};
    function promjenaVrijednosti(){
        var mjesec = document.getElementById("mjesec").textContent;
        var sala = document.getElementById("select").value;
        var pocetak = document.getElementById("pocetak").value;
        var kraj = document.getElementById("kraj").value;
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), mjeseci[mjesec], sala, pocetak, kraj);
    }
    function prethodniMjesec(){
        if(trenutniMjesec !== 0)
        trenutniMjesec--;
        if(trenutniMjesec === 0)
        document.getElementById("prethodni").disabled = true;
        document.getElementById("sljedeci").disabled = false;
        Kalendar.iscrtajKalendar(document.getElementById("kalendar"), trenutniMjesec);
        promjenaVrijednosti();
    }
    function sljedeciMjesec(){
        if(trenutniMjesec !== 11)
        trenutniMjesec++;
        if(trenutniMjesec === 11)
        document.getElementById("sljedeci").disabled = true;
        document.getElementById("prethodni").disabled = false;
        Kalendar.iscrtajKalendar(document.getElementById("kalendar"), trenutniMjesec);
        promjenaVrijednosti();
    }