const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const HttpError = require('./HttpError');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const crypto = require('crypto');

const routesProduits = require('./routes/RoutesProduits');
const routesUtilisateur = require('./routes/RoutesUtilisateur');
const routesAdresse = require('./routes/RoutesAdresse');
const routesPanier = require('./routes/RoutesPanier');
const routesCommande = require('./routes/RoutesCommande');

const requetesUtilisateur = require('./queries/RequetesUtilisateur');


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/produits', routesProduits);
app.use('/api/utilisateur', routesUtilisateur);
app.use('/api/adresse', routesAdresse);
app.use('/api/commande', routesCommande);
app.use('/api/panier', routesPanier);

class BasicStrategyModified extends BasicStrategy {
  constructor(options, verify) {
    return super(options, verify);
  }

  _challenge() {
    return 'xBasic realm="' + this._realm + '"';
  }
}

passport.use(new BasicStrategyModified((courriel, mdp, cb) => {
  requetesUtilisateur.getInfoCompteParCourriel(courriel.toLowerCase()).then(login => {
    if (!login || !login.estActif) {
      return cb(null, false);
    }

    const iterations = 100000;
    const keylen = 64;
    const digest = "sha512";

    crypto.pbkdf2(mdp, login.selMdp, iterations, keylen, digest, (err, mdpHache) => {
      if (err) {
        return cb(err);
      }

      const passwordHashBuffer = Buffer.from(login.hachageMdp, "base64");

      if (!crypto.timingSafeEqual(passwordHashBuffer, mdpHache)) {
        return cb(null, false);
      }

      return cb(null, login);
    });
  }).catch(err => {
    return cb(err);
  });
}));


app.use((err, req, res, next) => {
  console.log("error handler: ", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500)
  if (err instanceof HttpError) {
    res.json(err.getJsonMessage());
  } else {
    res.json(err);
  }
});

module.exports = app;
