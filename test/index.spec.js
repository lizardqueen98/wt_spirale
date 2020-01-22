const supertest = require("supertest");
const assert = require('assert');
const app = require("../index");
var chai = require('chai'), chaiHttp = require('chai-http');
chai.use(chaiHttp);
var expect = chai.expect;
//chai.request('http://localhost:8080') - ovo se treba staviti prije svakog poziva get ili post ako ne mogne

  describe("GET /osoblje", function() {
    it("Dohvacanje osoblja koje se ubacuje u bazu pri kreiranju.", function(done) {
      supertest(app)
      //chai.request('http://localhost:8080') - ovako
        .get("/osoblje")
        .end(function(err, res){
          if (err) done(err);
          //kod
          var rezultati = res.body;
          var osobe = ["Neko Nekic", "Drugi Neko", "Test Test"];
          var ima = true;
          rezultati.forEach(rezultat => {
            if(!osobe.includes(rezultat.ime + " " + rezultat.prezime)) ima = false;
          });
          expect(res).to.have.status(200);
          expect(ima).to.be.true;
          done();
        });
    });
  });
  describe("GET /sale", function() {
    it("Dohvacanje sala koje se ubacuju u bazu pri kreiranju.", function(done) {
      supertest(app)
        .get("/sale")
        .end(function(err, res){
          if (err) done(err);
          //kod
          var rezultati = res.body;
          var sale = ["1-11", "1-15"];
          var ima = true;
          rezultati.forEach(rezultat => {
            if(!sale.includes(rezultat.naziv)) ima = false;
          });
          expect(res).to.have.status(200);
          //ne moze strigify
          expect(ima).to.be.true;
          done();
        });
    });
  });
  describe("GET /zauzeca", function() {
    var zauzecePeriodicno = {
      predavac: "Test Test",
      naziv: "1-11",
      dan: 0,
      semestar: "zimski",
      pocetak: "13:00",
      kraj: "14:00"
    }
    var zauzeceVanredno = {
      predavac: "Neko Nekic",
      naziv: "1-11",
      datum: "1.1.2020",
      pocetak: "12:00",
      kraj: "13:00"
    }
    it("Dohvacanje zauzeca koja se ubacuju u bazu pri kreiranju.", function(done) {
      supertest(app)
        .get("/zauzeca")
        .end(function(err, res){
          if (err) done(err);
          //kod
          //provjeravamo ima li onih koje smo na pocetku pusali
          var zauzeca = res.body;
          var imaPeriodicno = false;
          var imaVanredno = false;
          zauzeca.periodicna.forEach(zauzece => {
            if(JSON.stringify(zauzece)==JSON.stringify(zauzecePeriodicno)) imaPeriodicno = true;
          });
          zauzeca.vanredna.forEach(zauzece => {
            if(JSON.stringify(zauzece)==JSON.stringify(zauzeceVanredno)) imaVanredno = true;
          });
          expect(res).to.have.status(200);
          expect(imaPeriodicno && imaVanredno).to.be.true;
          done();
        });
    });
  });
  describe("POST /rezervacija.html", function() {
    var today = new Date();
    var sad = today.getHours();
    var poslije = sad + 1;
    sad = sad + ":00";
    if(poslije == 24){
      poslije = "23:59";
    }
    else poslije = poslije + ":00";
    var danasnjiDan = today.getDay();
    if(danasnjiDan == 0) danasnjiDan = 7;

    var objekatPeriodicno = {
      predavac: "Neko Nekic",
      naziv: "1-11",
      dan: danasnjiDan - 1,
      semestar: "ljetni",
      pocetak: sad,
      kraj: poslije
    }
    var objekatVanredno = {
      predavac: "Test Test",
      naziv: "1-15",
      datum: "14.2.2020",
      pocetak: "13:00",
      kraj: "14:00"
    }
    it("Ubacivanje periodicnog zauzeca i provjera da li se korektno azurira niz zauzeca koji se treba ucitati.", function(done) {
      supertest(app)
        .post("/rezervacija.html")
        .set('content-type', 'application/json')
        .send(JSON.stringify(objekatPeriodicno))
        .end(function(err, res) {
          if (err) done(err);
          //kod
          let tijelo = res.body;
          var dodano = false;
          tijelo.periodicna.forEach(zauzece => {
            if(JSON.stringify(zauzece)==JSON.stringify(objekatPeriodicno)) dodano = true;
          });
          console.log(dodano);
          expect(res).to.have.status(200);
          expect(dodano).to.be.true;
          done();
        });
    });
    it("Ubacivanje periodicnog zauzeca koje vec postoji, od strane iste osobe, treba da se vrati alert.", function(done) {
      //s obzirom da se ovo zauzece u prethodnom testu uspjesno doda, prilikom dugog pokusaja dodavanja pojavit ce se alert
      this.timeout(1000);
      supertest(app)
        .post("/rezervacija.html")
        .set('content-type', 'application/json')
        .send(JSON.stringify(objekatPeriodicno))
        .end(function(err, res) {
          if (err) done(err);
          //kod
          let tijelo = res.body;
          expect(res).to.have.status(200);
          expect(tijelo).to.have.property('alert');
          done();
        });
    });
    it("Ubacivanje periodicnog zauzeca koje vec postoji, od strane druge osobe, treba da se vrati alert.", function(done) {
      //s obzirom da se ovo zauzece u prethodnom testu uspjesno doda, prilikom dugog pokusaja dodavanja pojavit ce se alert
      this.timeout(2000);
      objekatPeriodicno.predavac = "Drugi"
      supertest(app)
        .post("/rezervacija.html")
        .set('content-type', 'application/json')
        .send(JSON.stringify(objekatPeriodicno))
        .end(function(err, res) {
          if (err) done(err);
          //kod
          let tijelo = res.body;
          expect(res).to.have.status(200);
          expect(tijelo).to.have.property('alert');
          done();
        });
    });
    it("Ubacivanje vanrednog zauzeca i provjera da li se korektno azurira niz zauzeca koji se treba ucitati.", function(done) {
      supertest(app)
        .post("/rezervacija.html")
        .set('content-type', 'application/json')
        .send(JSON.stringify(objekatVanredno))
        .end(function(err, res) {
          if (err) done(err);
          //kod
          let tijelo = res.body;
          var dodano = false;
          tijelo.vanredna.forEach(zauzece => {
            if(JSON.stringify(zauzece)==JSON.stringify(objekatVanredno)) dodano = true;
          });
          console.log(dodano);
          expect(res).to.have.status(200);
          expect(dodano).to.be.true;
          done();
        });
    });
    it("Ubacivanje vanrednog zauzeca koje vec postoji, od strane iste osobe, treba da se vrati alert.", function(done) {
      //s obzirom da se ovo zauzece u prethodnom testu uspjesno doda, prilikom dugog pokusaja dodavanja pojavit ce se alert
      this.timeout(1000);
      supertest(app)
        .post("/rezervacija.html")
        .set('content-type', 'application/json')
        .send(JSON.stringify(objekatVanredno))
        .end(function(err, res) {
          if (err) done(err);
          //kod
          let tijelo = res.body;
          expect(res).to.have.status(200);
          expect(tijelo).to.have.property('alert');
          done();
        });
    });
    it("Ubacivanje vanrednog zauzeca koje vec postoji, od strane druge osobe, treba da se vrati alert.", function(done) {
      //s obzirom da se ovo zauzece u prethodnom testu uspjesno doda, prilikom dugog pokusaja dodavanja pojavit ce se alert
      this.timeout(2000);
      objekatVanredno.predavac = "Drugi";
      supertest(app)
        .post("/rezervacija.html")
        .set('content-type', 'application/json')
        .send(JSON.stringify(objekatVanredno))
        .end(function(err, res) {
          if (err) done(err);
          //kod
          let tijelo = res.body;
          expect(res).to.have.status(200);
          expect(tijelo).to.have.property('alert');
          done();
        });
    });
  });
  describe("GET /rezervacije", function() {
    it("Dohvacanje rezervacija, tj. osoba koje su trenutno u nekoj sali.", function(done) {
      this.timeout(5000);
      supertest(app)
        .get("/rezervacije")
        .end(function(err, res){
          if (err) done(err);
          //kod
          //provjeravamo ima li onih koje smo na pocetku pusali
          var osobeISale = res.body;
          //Neko treba biti u sali 1-11
          var uSali = false;
          osobeISale.forEach(elem => {
            if(elem.predavac == "Neko Nekic" && elem.naziv == "1-11") uSali = true;
          });
          expect(res).to.have.status(200);
          expect(uSali).to.be.true;
          done();
        });
    });
  });