const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
// za bazu
const db = require('./db.js')
const { Op } = require("sequelize");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
//__dirname tells you the absolute path of the directory containing the currently executing file.

const priprema = require("./priprema.js");
priprema.inicijalizacijaZbogTestova(
    ()=>{ 
            app.listen(8080, function()
                {
                    app.emit("Gotova baza.");
                }); 
        });

//app.get('/zauzeca.json',function(req,res){
app.get('/zauzeca',function(req,res){
    //res.sendFile(__dirname+"/zauzeca.json"); sad se dohvaca iz baze
    var objekat = {};
    var tempObjekat = {};
    objekat.periodicna = [];
    objekat.vanredna = [];
    db.rezervacija.findAll({
        include:[
        {
            model: db.sala,
            as: "rezervacijaSala"
        },
        {
            model: db.osoblje,
            as: "rezervacijaOsoba"
        },
        {
            model: db.termin,
            as: "rezervacijaTermin"
        }
        ]
    }).then(function(rezervacije){
        rezervacije.forEach(rezervacija => {
            tempObjekat = {};
            tempObjekat.predavac = rezervacija.rezervacijaOsoba.ime + " " + rezervacija.rezervacijaOsoba.prezime;
            tempObjekat.naziv = rezervacija.rezervacijaSala.naziv;
            //jer vraca i sekunde
            var poc = rezervacija.rezervacijaTermin.pocetak.split(":");
            var end = rezervacija.rezervacijaTermin.kraj.split(":");
            if(rezervacija.rezervacijaTermin.redovni == true){
                tempObjekat.dan = rezervacija.rezervacijaTermin.dan;
                tempObjekat.semestar = rezervacija.rezervacijaTermin.semestar;
                tempObjekat.pocetak = poc[0] + ":" + poc[1];
                tempObjekat.kraj = end[0] + ":" + end[1];
                objekat.periodicna.push(tempObjekat);
            }
            else{
                tempObjekat.datum = rezervacija.rezervacijaTermin.datum;
                tempObjekat.pocetak = poc[0] + ":" + poc[1];
                tempObjekat.kraj = end[0] + ":" + end[1];
                objekat.vanredna.push(tempObjekat);
            }
        });
        res.json(objekat);
    });
});
app.get('/rezervacije',function(req,res){
    var objekat = [];
    var tempObjekat = {};
    db.rezervacija.findAll({
        include:[
        {
            model: db.sala,
            as: "rezervacijaSala"
        },
        {
            model: db.osoblje,
            as: "rezervacijaOsoba",
            //da uradi outer join
            required: false,
            right: true
        },
        {
            model: db.termin,
            as: "rezervacijaTermin",
            //ovdje moze where, al onda ne radi outer join pise na oficijelnos stranici fkt ne radi
            /*where:{
                [Op.or]: [
                    { [Op.and]: [
                        { dan: null },
                        { datum: today }
                      ] },
                    { [Op.and]: [
                        { dan: danUSedmici - 1 },
                        { datum: null }
                      ] }
                  ]
            }*/
        }
        ],
    }).then(function(rezervacije){
        rezervacije.forEach(rezervacija => {

            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();
            /*if (dd < 10) {
            dd = '0' + dd;
            } 
            if (mm < 10) {
            mm = '0' + mm;
            }*/
            var today = dd + '.' + mm + '.' + yyyy;

            var danUSedmici = new Date().getDay();
            if(danUSedmici==0) danUSedmici = 7;

            //posto imam vec fju za provjeravanje intervala
            var now = new Date();
            var satiSad = now.getHours();
            var minuteSad = now.getMinutes();
           
            if(satiSad<10) satiSad = '0' + satiSad;
            if(minuteSad<10) minuteSad = '0' + minuteSad;

            var pocIntervala = satiSad + ":" + minuteSad;
            var krajIntervala = pocIntervala;

            tempObjekat = {};
            if(rezervacija.rezervacijaTermin){
                var pocBaza = rezervacija.rezervacijaTermin.pocetak.split(":");
                    pocBaza = pocBaza[0] + ":" + pocBaza[1];
                    var krajBaza = rezervacija.rezervacijaTermin.kraj.split(":");
                    krajBaza = krajBaza[0] + ":" + krajBaza[1];
                if(rezervacija.rezervacijaTermin.redovni == true){
                    if(rezervacija.rezervacijaTermin.dan == danUSedmici - 1 && rezervacija.rezervacijaTermin.datum == null && poklapanjeIntervala(pocIntervala, krajIntervala, pocBaza, krajBaza)){
                        tempObjekat.predavac = rezervacija.rezervacijaOsoba.ime + " " + rezervacija.rezervacijaOsoba.prezime;
                        tempObjekat.naziv = rezervacija.rezervacijaSala.naziv; 
                        objekat.push(tempObjekat);
                    }
                }
                else{
                    if(rezervacija.rezervacijaTermin.dan == null && rezervacija.rezervacijaTermin.datum == today && poklapanjeIntervala(pocIntervala, krajIntervala, pocBaza, krajBaza)){
                        tempObjekat.predavac = rezervacija.rezervacijaOsoba.ime + " " + rezervacija.rezervacijaOsoba.prezime;
                        tempObjekat.naziv = rezervacija.rezervacijaSala.naziv;
                        objekat.push(tempObjekat);
                    }
                }
            }
            /*tempObjekat.predavac = rezervacija.rezervacijaOsoba.ime;
            if(rezervacija.rezervacijaSala)
            tempObjekat.naziv = rezervacija.rezervacijaSala.naziv;*/
            else {
                //za one koji nemaju nikakvu rezervaciju ne samo u ovom terminu
                tempObjekat.predavac = rezervacija.rezervacijaOsoba.ime + " " + rezervacija.rezervacijaOsoba.prezime;
                tempObjekat.naziv = "u kancelariji";
                objekat.push(tempObjekat);
            }
        });
        rezervacije.forEach(r => {
            tempObjekat = {};
            var ima = false;
                objekat.forEach(o => {
                    if(o.predavac == r.rezervacijaOsoba.ime + " " + r.rezervacijaOsoba.prezime){
                        //console.log(o.predavac);
                        ima = true;
                    }
                });
                if(!ima){
                    tempObjekat.predavac = r.rezervacijaOsoba.ime + " " + r.rezervacijaOsoba.prezime;
                    tempObjekat.naziv = "u kancelariji";
                    objekat.push(tempObjekat);
                }
        });
        res.json(objekat);
    });
});
app.get('/',function(req,res){
    res.sendFile(__dirname+"/public/pocetna.html");
});
app.get('/osoblje', function(req, res){
    db.osoblje.findAll().then(function(osobe){
        res.json(osobe);
    });
});
app.get('/sale', function(req, res){
    db.sala.findAll().then(function(sale){
        res.json(sale);
    });
});
app.post('/slike',function(req,res){
    let tijelo = req.body;
    //console.log(tijelo);
    //da dobijemo sve iz foldera slika
    var files = fs.readdirSync(__dirname + "/public/slike");
    var novi = [];
    for(var i=0;i<files.length;i++){
        if(!tijelo.includes(files[i])){
            novi.push(files[i]);
            if(novi.length === 3 ) break;
        }
    }
    if(files.length - tijelo.length <= 3){
        novi.push("disabled")
    }
    res.json(novi);
});
app.post('/rezervacija.html', function(req, res){
    //itd
    let tijelo = req.body;
    //console.log(tijelo);
    //prvo provjera pa dodavanje
    var objekat = {};
    var tempObjekat = {};
    objekat.periodicna = [];
    objekat.vanredna = [];
    db.rezervacija.findAll({
        include:[
        {
            model: db.sala,
            as: "rezervacijaSala"
        },
        {
            model: db.osoblje,
            as: "rezervacijaOsoba"
        },
        {
            model: db.termin,
            as: "rezervacijaTermin"
        }
        ]
    }).then(function(rezervacije){
        rezervacije.forEach(rezervacija => {
            tempObjekat = {};
            tempObjekat.predavac = rezervacija.rezervacijaOsoba.ime + " " + rezervacija.rezervacijaOsoba.prezime;
            tempObjekat.naziv = rezervacija.rezervacijaSala.naziv;
            //jer vraca i sekunde
            var poc = rezervacija.rezervacijaTermin.pocetak.split(":");
            var end = rezervacija.rezervacijaTermin.kraj.split(":");
            if(rezervacija.rezervacijaTermin.redovni == true){
                tempObjekat.dan = rezervacija.rezervacijaTermin.dan;
                tempObjekat.semestar = rezervacija.rezervacijaTermin.semestar;
                tempObjekat.pocetak = poc[0] + ":" + poc[1];
                tempObjekat.kraj = end[0] + ":" + end[1];
                objekat.periodicna.push(tempObjekat);
            }
            else{
                tempObjekat.datum = rezervacija.rezervacijaTermin.datum;
                tempObjekat.pocetak = poc[0] + ":" + poc[1];
                tempObjekat.kraj = end[0] + ":" + end[1];
                objekat.vanredna.push(tempObjekat);
            }
        });
        var nema = true;
        var imeOsobe = "";
        if(tijelo.semestar){
            objekat.periodicna.forEach(element => {
                if(element.dan === tijelo.dan && element.semestar === tijelo.semestar && element.naziv === tijelo.naziv && poklapanjeIntervala(tijelo.pocetak, tijelo.kraj, element.pocetak, element.kraj)){
                    nema = false;
                    imeOsobe = element.predavac;
                }
                
            });
            objekat.vanredna.forEach(element => {
                var danMjesecGodina = element.datum.split(".");
                var day = new Date(danMjesecGodina[2], danMjesecGodina[1]-1, danMjesecGodina[0]).getDay();
                if(day === 0) day = 7;
                switch(tijelo.semestar){
                    case "zimski":
                        if(danMjesecGodina[1] == 10 || danMjesecGodina[1] == 11 || danMjesecGodina[1] == 12 || danMjesecGodina[1] == 1){
                            if(day-1 === tijelo.dan && element.naziv === tijelo.naziv && poklapanjeIntervala(tijelo.pocetak, tijelo.kraj, element.pocetak, element.kraj)){    
                                nema = false;
                                imeOsobe = element.predavac;
                            }
                        }
                        break;
                    case "ljetni":
                        if(danMjesecGodina[1] == 2 || danMjesecGodina[1] == 3 || danMjesecGodina[1] == 4 || danMjesecGodina[1] == 5 || danMjesecGodina[1] == 6){
                            if(day-1 === tijelo.dan && element.naziv === tijelo.naziv && poklapanjeIntervala(tijelo.pocetak, tijelo.kraj, element.pocetak, element.kraj)){    
                                nema = false;
                                imeOsobe = element.predavac;
                            }
                        }
                        break;
                }
            });
            if(nema){
                var name = tijelo.predavac.split(" ")[0];
                var lastname = tijelo.predavac.split(" ")[1];
                objekat.periodicna.push(tijelo);
                var periodicnaListaPromisea = [];
                var terminiListaPromisea = [];
                db.sala.findOne({
                    where:{
                        naziv:tijelo.naziv
                    }
                }).then(function(s){
                    db.osoblje.findOne({
                        where:{
                            ime:name,
                            prezime: lastname
                        }
                    }).then(function(o){
                        return new Promise(function(resolve, reject){
                            terminiListaPromisea.push(db.termin.create({redovni:true, dan:tijelo.dan, datum:null, semestar:tijelo.semestar, pocetak: tijelo.pocetak, kraj: tijelo.kraj}));
                            Promise.all(terminiListaPromisea).then(function(termini){
                                var termin = termini.filter(function(a){return a.pocetak===tijelo.pocetak})[0];
                                periodicnaListaPromisea.push(db.rezervacija.create({termin:termin.id, sala:s.id, osoba:o.id}));
                                Promise.all(periodicnaListaPromisea).then(function(){
                                    res.json(objekat);
                                }).catch(function(err){console.log("Rezervacija greska "+err);});
                            }).catch(function(err){console.log("Termini greska "+err);});
                        });
                    });
                });
            } 
        }
        else{
            objekat.vanredna.forEach(element => {
                if(element.datum === tijelo.datum && element.naziv === tijelo.naziv && poklapanjeIntervala(tijelo.pocetak, tijelo.kraj, element.pocetak, element.kraj)){    
                    nema = false;
                    imeOsobe = element.predavac;
                }
            });
            objekat.periodicna.forEach(element => {
                var danMjesecGodina = tijelo.datum.split(".");
                var day = new Date(danMjesecGodina[2], danMjesecGodina[1]-1, danMjesecGodina[0]).getDay();
                if(day === 0) day = 7;
                switch(element.semestar){
                    case "zimski":
                        if(danMjesecGodina[1] == 10 || danMjesecGodina[1] == 11 || danMjesecGodina[1] == 12 || danMjesecGodina[1] == 1){
                            if(element.dan === day-1 && element.naziv === tijelo.naziv && poklapanjeIntervala(tijelo.pocetak, tijelo.kraj, element.pocetak, element.kraj)){
                                nema = false;
                                imeOsobe = element.predavac;
                            }
                        }
                        break;
                    case "ljetni":
                        if(danMjesecGodina[1] == 2 || danMjesecGodina[1] == 3 || danMjesecGodina[1] == 4 || danMjesecGodina[1] == 5 || danMjesecGodina[1] == 6){
                            if(element.dan === day-1 && element.naziv === tijelo.naziv && poklapanjeIntervala(tijelo.pocetak, tijelo.kraj, element.pocetak, element.kraj)){
                                nema = false;
                                imeOsobe = element.predavac;
                            }
                        }
                        break;
                }     
            });
            if(nema){
                var name = tijelo.predavac.split(" ")[0];
                var lastname = tijelo.predavac.split(" ")[1];
                objekat.vanredna.push(tijelo);
                var vanrednaListaPromisea = [];
                var terminiListaPromisea = [];
                db.sala.findOne({
                    where:{
                        naziv:tijelo.naziv
                    }
                }).then(function(s){
                    db.osoblje.findOne({
                        where:{
                            ime:name,
                            prezime: lastname
                        }
                    }).then(function(o){
                        return new Promise(function(resolve, reject){
                            terminiListaPromisea.push(db.termin.create({redovni:false, dan:null, datum:tijelo.datum, semestar:null, pocetak: tijelo.pocetak, kraj: tijelo.kraj}));
                            Promise.all(terminiListaPromisea).then(function(termini){
                                var termin = termini.filter(function(a){return a.pocetak===tijelo.pocetak})[0];
                                vanrednaListaPromisea.push(db.rezervacija.create({termin:termin.id, sala:s.id, osoba:o.id}));
                                Promise.all(vanrednaListaPromisea).then(function(){
                                    res.json(objekat);
                                }).catch(function(err){console.log("Rezervacija greska "+err);});
                            }).catch(function(err){console.log("Termini greska "+err);});
                        });
                    });
                });
            } 
        }
        /*fs.writeFile('zauzeca.json', JSON.stringify(objekat), function(err){
            if(err) throw err;
        });*/
        if(!nema){
            objekat.alert = imeOsobe;
            res.json(objekat);
        }
    });
    /*fs.readFile('zauzeca.json', function(err, buffer){
        if(err) throw err;
        var objekat = buffer;
        objekat = JSON.parse(objekat);
        //console.log(objekat);
    });*/
});
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

        if(poc1 > kraj1 || poc2 > kraj2){
            //alert("Pogresan vremenski interval.");
            return false;
        } 
        
        //uneseni pocetak se ne smije nalaziti izmedju pocetka iz liste i kraja iz liste niti smije biti jednak pocetku iz liste
        //uneseni kraj se ne smije nalaziti izmedju pocetka iz liste i kraja iz liste niti smije biti jednak kraju iz liste
		return((kraj1 > poc2 && kraj1 <= kraj2) || (poc1 >= poc2 && poc1 < kraj2) || (poc1 <= poc2 && kraj1 >= kraj2) || (poc2 <= poc1 && kraj2 >= kraj1));
    }
    //dodala ovo za testove
module.exports = app;
//app.listen(8080);
