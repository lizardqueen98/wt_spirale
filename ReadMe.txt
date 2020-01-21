prvo: npm install
zatim punjenje baze i kreiranje tabela se pokrece sa: node priprema
//prvo se mora napraviti baza i popuniti da je osigurano da ona postoji
//u trenutnku kada se zahtjevi prilikom pokretanja indeksa upute
//ako stavimo pravljenje i popunjavanje u index.js ili db.js koji pozivamo u indeksu
//moze se desiti da se zahtjevi
//za podacima iz baze upute prilikom pokretanja indeksa, a da baza nije dovrsena
onda se stranica pokrece sa: node index
testovi se pokrecu sa: npm test