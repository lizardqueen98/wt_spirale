let assert = chai.assert;
describe('Kalendar', function() {
 describe('iscrtajKalendar()', function() {
   it('Mjesec sa 30 dana.', function() {
     Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 10);
     let brojDana = document.getElementsByClassName("slobodna");
     assert.equal(brojDana.length, 30,"Broj dana treba biti 30");
   });
   it('Mjesec sa 31 dan.', function() {
    Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 7);
    let brojDana = document.getElementsByClassName("slobodna");
    assert.equal(brojDana.length, 31,"Broj dana treba biti 31");
   });
   it('Trenutni mjesec pocinje u petak.', function() {
    Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 10);
    //racuna broj divova koji se generisu na mjestima na kojima nema dana
    var divs = document.getElementById("kalendar").getElementsByTagName("div");
    //1 jer je prvi u mjesecu na n+1 mjestu
    var petak = 1;
    for(var i = 0; i < divs.length; i++) if(divs[i].innerHTML === "" && divs[i].classList.length === 0){
        petak++;
    }
    assert.equal(petak, 5,"Mjesec treba poceti u petak.");
   });
   it('Trenutni mjesec zavrsava u subotu.', function() {
    Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 10);
    var divs = document.getElementById("kalendar").getElementsByTagName("div");
    var poc = 0;
    for(var i = 0; i < divs.length; i++) if(divs[i].innerHTML === "" && divs[i].classList.length === 0){
        poc++;
    }
    //+ poc da dobijemo ukupan broj elemenata grida, a % 7 jer ima sedam kolona
    var subota = (document.getElementById("kalendar").getElementsByClassName("grid-item").length + poc) % 7;
    assert.equal(subota, 6,"Mjesec treba zavrsiti u subotu.");
   });
   it('Januar pocinje u utorak.', function() {
    Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 0);
    //racuna broj divova koji se generisu na mjestima na kojima nema dana
    var divs = document.getElementById("kalendar").getElementsByTagName("div");
    //1 jer je prvi u mjesecu na n+1 mjestu
    var utorak = 1;
    for(var i = 0; i < divs.length; i++) if(divs[i].innerHTML === "" && divs[i].classList.length === 0){
        utorak++;
    }
    assert.equal(utorak, 2,"Januar treba poceti u utorak.");
   });
   it('Brojevi dana u januaru idu od 1-31.', function() {
    Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 0);
    let dani = document.getElementsByClassName("grid-item");
    var tacno = 1;
    for(var i = 1; i<31; i++){
        //jer su na pozicijama od nula do sest nazivi dana
        if(dani[6+i].textContent != i) tacno = 0;
    }
    assert.equal(tacno, 1,"Treba biti tacno.");
   });
   it('Februar ove godine ima 28 dana.', function() {
    Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 1);
    let brojDana = document.getElementsByClassName("slobodna");
    assert.equal(brojDana.length, 28,"Broj dana treba biti 28");
   });
   it('Septembar zavrsava u ponedjeljak.', function() {
    Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 8);
    var divs = document.getElementById("kalendar").getElementsByTagName("div");
    var poc = 0;
    for(var i = 0; i < divs.length; i++) if(divs[i].innerHTML === "" && divs[i].classList.length === 0){
        poc++;
    }
    //+ poc da dobijemo ukupan broj elemenata grida, a % 7 jer ima sedam kolona
    var pon = (document.getElementById("kalendar").getElementsByClassName("grid-item").length + poc) % 7;
    assert.equal(pon, 1,"Mjesec treba zavrsiti u ponedjeljak.");
   });
  });
  describe('obojiZauzeca()', function(){
    it('Ništa se ne oboji ako podaci nisu ucitani.(ako su ucitani kroz kalendar.js padace logicno)', function(){
     var now = new Date();
     //Kalendar.ucitajPodatke([], []);
     Kalendar.iscrtajKalendar(document.getElementById("kalendar"), now.getMonth());
     Kalendar.obojiZauzeca(document.getElementById("kalendar"), now.getMonth(), "0-01", "12:00", "13:00");
     let brojDana = document.getElementsByClassName("slobodna").length;
     assert.equal(brojDana, new Date(now.getFullYear(), now.getMonth()+1, 0).getDate(),"Nije se nista obojilo.");
    });
    it('Sve korektno iako imaju dupli podaci.', function(){
        //var now = new Date();
        Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 11);
        Kalendar.ucitajPodatke([{dan: 2,
            semestar: "zimski",
            pocetak: "12:00",
            kraj: "13:00",
            naziv: "0-01",
            predavac: "NB"}, {dan: 2,
            semestar: "zimski",
            pocetak: "12:00",
            kraj: "13:00",
            naziv: "0-01",
            predavac: "NB"}], []);
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), 11, "0-01", "12:00", "13:00");
        let brojDanaDuplo = document.getElementsByClassName("zauzeta").length;
        Kalendar.ucitajPodatke([{dan: 2,
            semestar: "zimski",
            pocetak: "12:00",
            kraj: "13:00",
            naziv: "0-01",
            predavac: "NB"}], []);
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), 11, "0-01", "12:00", "13:00");
        let brojDanaJednostruko = document.getElementsByClassName("zauzeta").length;
        assert.equal(brojDanaDuplo, brojDanaJednostruko,"Isti broj dana zauzeti.");
    });
    it('Tacni podaci, pogresan semestar.', function(){
        Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 5);
        Kalendar.ucitajPodatke([{dan: 2,
            semestar: "zimski",
            pocetak: "12:00",
            kraj: "13:00",
            naziv: "0-01",
            predavac: "NB"}], []);
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), 5, "0-01", "12:00", "13:00");
        let brojDana = document.getElementsByClassName("zauzeta").length;
        assert.equal(brojDana, 0,"Nije se nista obojilo.");
    });
    it('Tacni podaci, pogresan mjesec.', function(){
        Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 3);
        Kalendar.ucitajPodatke([], [
        {datum: "21.11.2019",
        pocetak: "12:00",
        kraj: "13:00",
        naziv: "0-01",
        predavac: "nadija"}]);
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), 3, "0-01", "12:00", "13:00");
        let brojDana = document.getElementsByClassName("zauzeta").length;
        assert.equal(brojDana, 0,"Nije se nista obojilo.");
    });
    it('Svi termini zauzeti.', function(){
        Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 0);
        Kalendar.ucitajPodatke([{dan: 0,
            semestar: "zimski",
            pocetak: "12:00",
            kraj: "13:00",
            naziv: "0-01",
            predavac: "NB"},
            {dan: 1,
            semestar: "zimski",
            pocetak: "12:00",
            kraj: "13:00",
            naziv: "0-01",
            predavac: "NB"},
            {dan: 2,
            semestar: "zimski",
            pocetak: "12:00",
            kraj: "13:00",
            naziv: "0-01",
            predavac: "NB"}, 
            {dan: 3,
            semestar: "zimski",
            pocetak: "12:00",
            kraj: "13:00",
            naziv: "0-01",
            predavac: "NB"},
            {dan: 4,
            semestar: "zimski",
            pocetak: "12:00",
            kraj: "13:00",
            naziv: "0-01",
            predavac: "NB"}, 
            {dan: 5,
            semestar: "zimski",
            pocetak: "12:00",
            kraj: "13:00",
            naziv: "0-01",
            predavac: "NB"},
            {dan: 6,
            semestar: "zimski",
            pocetak: "12:00",
            kraj: "13:00",
            naziv: "0-01",
            predavac: "NB"}], []);
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), 0, "0-01", "12:00", "13:00");
        let brojDana = document.getElementsByClassName("slobodna").length;
        assert.equal(brojDana, 0,"Sve obojeno.");
    });
    it('Dva puta uzastopno se poziva obojiZauzeca().', function(){
        Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 3);
        //4. jer mjeseci pocinju od nula, pa je 3 ustvari cetvrti mjesec
        Kalendar.ucitajPodatke([], [
        {datum: "21.4.2019",
        pocetak: "12:00",
        kraj: "13:00",
        naziv: "0-01",
        predavac: "nadija"}]);
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), 3, "0-01", "12:00", "13:00");
        var prviPut = document.getElementsByClassName("zauzeta").length;
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), 3, "0-01", "12:00", "13:00");
        var drugiPut = document.getElementsByClassName("zauzeta").length;
        assert.equal(prviPut, drugiPut,"Isti broj zauzeca.");
    });
    it('Drugo pozivanje ucitajPodatke().', function(){
        Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 3);
        //4. jer mjeseci pocinju od nula, pa je 3 ustvari cetvrti mjesec
        Kalendar.ucitajPodatke([{dan: 3,
        semestar: "ljetni",
        pocetak: "12:00",
        kraj: "13:00",
        naziv: "0-01",
        predavac: "NB"}], [
        {datum: "21.4.2019",
        pocetak: "12:00",
        kraj: "13:00",
        naziv: "0-01",
        predavac: "nadija"}]);
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), 3, "0-01", "12:00", "13:00");
        Kalendar.ucitajPodatke([],[]);
        //sada ništa ne bi trebalo biti obojeno
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), 3, "0-01", "12:00", "13:00");
        var obojeno = document.getElementsByClassName("zauzeta").length;
        assert.equal(obojeno, 0,"Drugi podaci su ucitani.");
    });
    it('Zauzet prvi dan u mjesecu.', function(){
        Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 3);
        Kalendar.ucitajPodatke([], [
        {datum: "1.4.2019",
        pocetak: "12:00",
        kraj: "13:00",
        naziv: "0-01",
        predavac: "nadija"}]);
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), 3, "0-01", "12:00", "13:00");
        var prvi = document.getElementsByClassName("zauzeta").item(0).parentNode.textContent;
        assert.equal(prvi, "1","1.");
    });
    it('Intervali se preklapaju.', function(){
        Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 3);
        Kalendar.ucitajPodatke([], [
        {datum: "1.4.2019",
        pocetak: "12:30",
        kraj: "13:00",
        naziv: "0-01",
        predavac: "nadija"}]);
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), 3, "0-01", "12:00", "13:00");
        var obojeno = document.getElementsByClassName("zauzeta").length;
        assert.equal(obojeno, 1,"Nije obojeno.");
    });
 });
});
