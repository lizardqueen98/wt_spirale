const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
//__dirname tells you the absolute path of the directory containing the currently executing file.

app.get('/zauzeca.json',function(req,res){
    res.sendFile(__dirname+"/zauzeca.json");
});
app.get('/',function(req,res){
    res.sendFile(__dirname+"/public/pocetna.html");
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
    fs.readFile('zauzeca.json', function(err, buffer){
        if(err) throw err;
        var objekat = buffer;
        objekat = JSON.parse(objekat);
        //console.log(objekat);
        var nema = true;
        if(tijelo.semestar){
            objekat.periodicna.forEach(element => {
                if(element.dan === tijelo.dan && element.semestar === tijelo.semestar && element.naziv === tijelo.naziv && poklapanjeIntervala(tijelo.pocetak, tijelo.kraj, element.pocetak, element.kraj)){
                    nema = false;
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
                            }
                        }
                        break;
                    case "ljetni":
                        if(danMjesecGodina[1] == 2 || danMjesecGodina[1] == 3 || danMjesecGodina[1] == 4 || danMjesecGodina[1] == 5 || danMjesecGodina[1] == 6){
                            if(day-1 === tijelo.dan && element.naziv === tijelo.naziv && poklapanjeIntervala(tijelo.pocetak, tijelo.kraj, element.pocetak, element.kraj)){    
                                nema = false;
                            }
                        }
                        break;
                }
            });
            if(nema) objekat.periodicna.push(tijelo);
        }
        else{
            objekat.vanredna.forEach(element => {
                if(element.datum === tijelo.datum && element.naziv === tijelo.naziv && poklapanjeIntervala(tijelo.pocetak, tijelo.kraj, element.pocetak, element.kraj)){    
                    nema = false;
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
                            }
                        }
                        break;
                    case "ljetni":
                        if(danMjesecGodina[1] == 2 || danMjesecGodina[1] == 3 || danMjesecGodina[1] == 4 || danMjesecGodina[1] == 5 || danMjesecGodina[1] == 6){
                            if(element.dan === day-1 && element.naziv === tijelo.naziv && poklapanjeIntervala(tijelo.pocetak, tijelo.kraj, element.pocetak, element.kraj)){
                                nema = false;
                            }
                        }
                        break;
                }     
            });
            if(nema) objekat.vanredna.push(tijelo);
        }
        fs.writeFile('zauzeca.json', JSON.stringify(objekat), function(err){
            if(err) throw err;
        })
        if(!nema) objekat.alert = true;
        //moze objekat ne mora se stringify
        res.json(objekat);
    })
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

        if(poc1 >= kraj1 || poc2 >= kraj2){
            //alert("Pogresan vremenski interval.");
            return false;
        } 
        
        //uneseni pocetak se ne smije nalaziti izmedju pocetka iz liste i kraja iz liste niti smije biti jednak pocetku iz liste
        //uneseni kraj se ne smije nalaziti izmedju pocetka iz liste i kraja iz liste niti smije biti jednak kraju iz liste
		return((kraj1 > poc2 && kraj1 <= kraj2) || (poc1 >= poc2 && poc1 < kraj2) || (poc1 <= poc2 && kraj1 >= kraj2) || (poc2 <= poc1 && kraj2 >= kraj1));
	}
app.listen(8080);
