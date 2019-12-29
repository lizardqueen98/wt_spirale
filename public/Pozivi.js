let Pozivi = (function(){
    //
    //ovdje idu privatni atributi
    //
    var nizSlika = [];
    var nizSlikaNovi = [];
    var pomNizSlika = [];
    var kraj = false;
    const godina = new Date().getFullYear();
    function z1Impl(){
    //implementacija ide ovdje
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {// Anonimna funkcija
	if (ajax.readyState == 4 && ajax.status == 200){
        var objekat = JSON.parse(ajax.responseText);
        Kalendar.ucitajPodatke(objekat.periodicna, objekat.vanredna);
        }
    }
    ajax.open("GET", "zauzeca.json", true);
    ajax.send();
    }
    function z2Impl(naziv, dan, mjesec, pocetak, kraj, periodicno){
    //implementacija ide ovdje
    var mjeseci = {Januar:1, Februar:2, Mart:3, April:4, Maj:5, Juni:6, Juli:7, August:8, Septembar:9, Oktobar:10, Novembar:11, Decembar:12};
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {// Anonimna funkcija
        if (ajax.readyState == 4 && ajax.status == 200){
            var objekat = JSON.parse(ajax.responseText);
            if(objekat.alert){
                delete objekat.alert;
                var datumAlert = dan + '.' + mjeseci[mjesec] + '.' + godina;
                alert("Nije moguće rezervisati salu " +  naziv + " za navedeni datum " + datumAlert + " i termin od " +  pocetak + " do " +  kraj);
            }
            Kalendar.ucitajPodatke(objekat.periodicna, objekat.vanredna);
            //isto funkcija iz kalendara
            promjenaVrijednosti();
        }
    }
    ajax.open("POST", "rezervacija.html", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    var objekat = {};
    if(periodicno){
        var month = mjeseci[mjesec] - 1;
        var day = new Date(godina, month, dan).getDay();
        if(day === 0) day = 7;
        var sem = "";
        if(month === 9 || month === 10 || month === 11 || month === 0) sem = "zimski";
        else if(month === 1 || month === 2 || month === 3 || month === 4 || month === 5) sem = "ljetni";
        else{
            alert("Nije moguce napraviti periodicnu rezervaciju ako ne pripada niti jednom od semestara!");
            return;
        } 
        //u slucaju da se klikne da neki mj koji nije ni u jednom sem ne rezervise se nista, to moze samo vanredno
        objekat = {
            dan: day - 1,
            semestar: sem,
            pocetak: pocetak,
            kraj: kraj,
            naziv: naziv,
            predavac: "NB"
        }
    }
    else{
        var date = dan + '.' + mjeseci[mjesec] + '.' + godina;
        objekat = {
            datum: date,
            pocetak: pocetak,
            kraj: kraj,
            naziv: naziv,
            predavac: "NB"
        }
    }
    ajax.send(JSON.stringify(objekat));
    }
    function z3UcitavanjeImp(){
    //implementacija ide ovdje
    if(pomNizSlika.length < nizSlika.length){
        console.log("Bez Ajax-a");
        //znaci isli smo nazad, sad ne treba ajax poziv jer imamo vec ucitane slike u glavni niz
        var htmlBezAjaxa = "";
        var odIndexa = pomNizSlika.length;
        var doIndexa = 3;
        if(nizSlika.length-pomNizSlika.length < 3){
            doIndexa = nizSlika.length - pomNizSlika.length;
            document.getElementById("sljedeci").disabled = true;
        }
        for(var i=odIndexa; i<odIndexa + doIndexa; i++){
            htmlBezAjaxa += '<img src=/slike/' + nizSlika[i] + ' alt="morisson">';
        }
        //sad se ubacuju u pom da se moze dalje ajax pozivati ako ima jos slika na serveru
        for(var i=odIndexa; i<odIndexa + doIndexa; i++){
            pomNizSlika.push(nizSlika[i]);
        }
        document.getElementById("slike").innerHTML = htmlBezAjaxa;
        if(pomNizSlika.length == nizSlika.length && kraj) document.getElementById("sljedeci").disabled = true;
        return;
    }
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {// Anonimna funkcija
    if (ajax.readyState == 4 && ajax.status == 200){
        console.log(ajax.responseText);
        nizSlikaNovi = JSON.parse(ajax.responseText);
        if(nizSlikaNovi.includes("disabled")){
            kraj = true;
            var index = nizSlikaNovi.indexOf("disabled");
            if (index > -1) {
            nizSlikaNovi.splice(index, 1);
            }
            document.getElementById("sljedeci").disabled = true;
        }
        nizSlikaNovi.forEach(element => {
            nizSlika.push(element);
            pomNizSlika.push(element);
        });
        var unutrasnjiHtml = "";
        nizSlikaNovi.forEach(element => {
            unutrasnjiHtml += '<img src=/slike/' + element + ' alt="morisson">'
        });
        document.getElementById("slike").innerHTML = unutrasnjiHtml;
    }
	if (ajax.readyState == 4 && ajax.status == 404)
		alert("Nepoznat url!");
    }
    ajax.open("POST", "slike", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify(nizSlika));
    }
    function z3KesiranjeImp(){
        if(document.getElementById("sljedeci").disabled) document.getElementById("sljedeci").disabled = false;
        //da je 3 disableovalo bi tek na narednom kliku i u ovom koraku bi se skinule tri i pristupilo jos tri slike pa bi bilo undefined
        if(pomNizSlika.length == 6) document.getElementById("prethodni").disabled = true;
        var brojZaSkinuti = pomNizSlika.length%3;
        if(brojZaSkinuti==0) brojZaSkinuti = 3;
        for(var i=0;i<brojZaSkinuti;i++){
            pomNizSlika.pop();
        }
        var unutrasnjiHtml = "";
        for(var i=pomNizSlika.length-3;i<pomNizSlika.length;i++){
            console.log(pomNizSlika[i] + " kesirana slika");
            unutrasnjiHtml += '<img src=/slike/' + pomNizSlika[i] + ' alt="morisson">'
        }
        document.getElementById("slike").innerHTML = unutrasnjiHtml;
    }
    return {
    z1: z1Impl,
    z2: z2Impl,
    z3Ucitavanje: z3UcitavanjeImp,
    z3Kesiranje: z3KesiranjeImp
    }
    }());
    