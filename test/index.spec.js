const supertest = require("supertest");
const assert = require('assert');
const app = require("../index");
var chai = require('chai'), chaiHttp = require('chai-http');
chai.use(chaiHttp);
var expect = chai.expect;
//chai.request('http://localhost:8080') - ovo se treba staviti prije svakog poziva get ili post ako ne mogne

  describe("GET /osoblje", function() {
    it("it should has status code 200", function(done) {
      supertest(app)
      //chai.request('http://localhost:8080') - ovako
        .get("/osoblje")
        .end(function(err, res){
          if (err) done(err);
          //kod
          var rezultati = res.body;
          var osobe = ["Neko", "Drugi", "Test"];
          var rezultatOsobe = [];
          rezultati.forEach(rezultat => {
            rezultatOsobe.push(rezultat.ime);
          });
          expect(res).to.have.status(200);
          expect(JSON.stringify(osobe)==JSON.stringify(rezultatOsobe)).to.be.true;
          done();
        });
    });
  });
  describe("GET /sale", function() {
    it("it should has status code 200", function(done) {
      supertest(app)
        .get("/sale")
        .end(function(err, res){
          if (err) done(err);
          //kod
          var rezultati = res.body;
          var sale = ["1-11", "1-15"];
          var rezultatSale = [];
          rezultati.forEach(rezultat => {
            rezultatSale.push(rezultat.naziv);
          });
          expect(res).to.have.status(200);
          expect(JSON.stringify(sale)==JSON.stringify(rezultatSale)).to.be.true;
          done();
        });
    });
  });
  describe("GET /zauzeca", function() {
    var zauzecePeriodicno = {
      predavac: "Test",
      naziv: "1-11",
      dan: 0,
      semestar: "zimski",
      pocetak: "13:00",
      kraj: "14:00"
    }
    var zauzeceVanredno = {
      predavac: "Neko",
      naziv: "1-11",
      datum: "1.1.2020",
      pocetak: "12:00",
      kraj: "13:00"
    }
    it("it should has status code 200", function(done) {
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
    var objekatPeriodicno = {
      predavac: "Neko",
      naziv: "1-11",
      dan: 1,
      semestar: "ljetni",
      pocetak: "12:00",
      kraj: "13:00"
    }
    var objekatVanredno = {
      predavac: "Test",
      naziv: "1-15",
      datum: "14.2.2020",
      pocetak: "13:00",
      kraj: "14:00"
    }
    it("it shoud return status code 200 is name exists", function(done) {
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
    it("it shoud return status code 200 is name exists", function(done) {
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
  });