const express = require('express');
const router = express.Router();
const passeport = require('passport');
const crypto = require('crypto');
const util = require('util');
const pbkdf2 = util.promisify(crypto.pbkdf2);
const HttpError = require("../HttpError");

// const multer = require('multer');
// const stockage = multer.memoryStorage();
// const televersement = multer({ stockage: stockage });

const requetesUtilisateur = require('../queries/RequetesUtilisateur');


router.post('/inscription', async (req, res, next) => {

  if (!req.body.prenom || req.body.prenom === '') {
    return next(new HttpError(400, 'Le champ « prenom » est requis'));
  }
  if (!req.body.nom || req.body.nom === '') {
    return next(new HttpError(400, 'Le champ « nom » est requis'));
  }
  if (!req.body.telephone || req.body.telephone === '') {
    return next(new HttpError(400, 'Le champ « telephone » est requis'));
  }
  if (!req.body.courriel || req.body.courriel === '') {
    return next(new HttpError(400, 'Le champ « courriel » est requis'));
  }
  if (!req.body.mdp || req.body.mdp === '') {
    return next(new HttpError(400, 'Le champ « mot de passe » est requis'));
  }
  if (!req.body.infolettre || req.body.infolettre === '' || (req.body.infolettre !== 'true' && req.body.infolettre !== 'false')) {
    return next(new HttpError(400, 'Le champ « infolettre » est requis et doit avoir la valeur string « true » ou « false »'));
  }

  const sel = crypto.randomBytes(16).toString("base64");

  crypto.pbkdf2(req.body.mdp, sel, 100000, 64, "sha512", async (err, derivedKey) => {
    if (err) {
      return next(err);
    }

    const mdpHachageBase64 = derivedKey.toString("base64");
    requetesUtilisateur.creerCompteUtilisateur(mdpHachageBase64, sel, req.body.courriel, req.body.prenom, req.body.nom, req.body.telephone, req.body.infolettre).then(compteUtilisateurAvecHachageMdp => {

      const detailsUtilisateur = {
        courriel: compteUtilisateurAvecHachageMdp.courriel,
        prenom: compteUtilisateurAvecHachageMdp.prenom,
        nom: compteUtilisateurAvecHachageMdp.nom,
        telephone: compteUtilisateurAvecHachageMdp.telephone,
        numeroCivique: compteUtilisateurAvecHachageMdp.numeroCivique,
        rue: compteUtilisateurAvecHachageMdp.rue,
        codePostal: compteUtilisateurAvecHachageMdp.codePostal,
        ville: compteUtilisateurAvecHachageMdp.ville,
        province: compteUtilisateurAvecHachageMdp.province,
        adresseActive: compteUtilisateurAvecHachageMdp.adresseActive,
        infolettre: compteUtilisateurAvecHachageMdp.infolettre,
        pointsFidelite: compteUtilisateurAvecHachageMdp.pointsFidelite,
        role: compteUtilisateurAvecHachageMdp.role,
        estActif: compteUtilisateurAvecHachageMdp.estActif
      };

      res.json(detailsUtilisateur);

    }).catch(err => {
      return next(err);
    })
  });
});


router.get('/connexion',
  passeport.authenticate('basic', { session: false }),
  (req, res, next) => {
    if (req.user) {
      const detailsUtilisateur = {
        courriel: req.user.courriel,
        prenom: req.user.prenom,
        nom: req.user.nom,
        telephone: req.user.telephone,
        numeroCivique: req.user.numeroCivique,
        rue: req.user.rue,
        codePostal: req.user.codePostal,
        ville: req.user.ville,
        province: req.user.province,
        adresseActive: req.user.adresseActive,
        infolettre: req.user.infolettre,
        pointsFidelite: req.user.pointsFidelite,
        role: req.user.role,
        estActif: req.user.estActif
      };

      res.json(detailsUtilisateur);
    } else {
      return next({ status: 500, message: "Propriété user absente" });
    }
  }
);

router.put('/modification',
  passeport.authenticate('basic', { session: false }),
  async (req, res, next) => {
    if (!req.user) {
      return next({ status: 500, message: "Propriété user absente" });
    }
    if (!req.body.prenom || req.body.prenom === '') {
      return next(new HttpError(400, 'Le champ « prenom » est requis'));
    }
    if (!req.body.nom || req.body.nom === '') {
      return next(new HttpError(400, 'Le champ « nom » est requis'));
    }
    if (!req.body.telephone || req.body.telephone === '') {
      return next(new HttpError(400, 'Le champ « telephone » est requis'));
    }
    if (!req.body.numeroCivique || req.body.numeroCivique === '') {
      req.body.numeroCivique = null;
    }
    // if (!req.body.courriel || req.body.courriel === '') {
    //   return next(new HttpError(400, 'Le champ « courriel » est requis'));  //NON ! (présent dans req.user)
    // }
    if (req.body.mdpSouhaite && (!req.body.mdpActuel || req.body.mdpActuel === '')) {
      return next(new HttpError(400, 'Le champ « mot de passe Actuel » est requis pour modifier le mot de passe')); 
    }

    if (!Number.isInteger(req.body.pointsFidelite) || req.body.pointsFidelite < 0) {
      return next(new HttpError(400, "L'attribut pointsFidelite est requis et doit être de type entier et >= 0"));
    }

    if (typeof req.body.infolettre != "boolean") {  //???????
      return next(new HttpError(400, 'Le champ « infolettre » est requis et doit avoir la valeur string « true » ou « false »'));
    }

    if (typeof req.body.estActif != "boolean") {  //???????
      return next(new HttpError(400, 'Le champ « estActif » est requis et doit être un booléen'));  //!req.body.estActif les falsy on peut pas car "false" !!!
    }
    // console.log('REQ.USER : ', req.user);
    const sel = crypto.randomBytes(16).toString("base64");
    let mdpSouhaiteHachageBase64;
    
    if (req.body.mdpSouhaite) {
      try {
        // const passwordHashBuffer = Buffer.from(login.hachageMdp, "base64");
        const derivedKeyActuelBody = await pbkdf2(req.body.mdpActuel, req.user.selMdp, 100000, 64, "sha512");

        mdpActuelBodyHachageBase64 = derivedKeyActuelBody.toString("base64");
        if (mdpActuelBodyHachageBase64 != req.user.hachageMdp) {
          throw new HttpError(409, `Le mot de passe actuel fourni ne correspond pas au mot de passe associé au compte de cet utilisateur`);
        }
        else {
          const derivedKeySouhaite = await pbkdf2(req.body.mdpSouhaite, sel, 100000, 64, "sha512");
          mdpSouhaiteHachageBase64 = derivedKeySouhaite.toString("base64");
        }
      } catch (err) {
        return next(err);
      }
    }

    let mdpHacheDevantEtreEnregistreDansLaBd;
    let selDevantEtreEnregistreDansLaBd;
    req.body.mdpSouhaite ? mdpHacheDevantEtreEnregistreDansLaBd = mdpSouhaiteHachageBase64 : mdpHacheDevantEtreEnregistreDansLaBd = req.user.hachageMdp;
    req.body.mdpSouhaite ? selDevantEtreEnregistreDansLaBd = sel : selDevantEtreEnregistreDansLaBd = req.user.selMdp;
    // console.log('MDP_HACHE : ', mdpHacheDevantEtreEnregistreDansLaBd);
    //*************************************** */
    console.log(req.body);
    const utilisateurModifie = {
      courriel: req.user.courriel,
      prenom: req.body.prenom,
      nom: req.body.nom,
      mdpHache: mdpHacheDevantEtreEnregistreDansLaBd,
      sel: selDevantEtreEnregistreDansLaBd,
      telephone: req.body.telephone,
      numeroCivique: req.body.numeroCivique,
      rue: req.body.rue,
      codePostal: req.body.codePostal ? req.body.codePostal.replace(/\s/g, '').toUpperCase() : null,
      ville: req.body.ville,
      province: req.body.province,
      // adresseActive: req.body.adresse_active,  probablement pas 
      infolettre: req.body.infolettre,
      pointsFidelite: req.body.pointsFidelite,
      estActif: req.body.estActif
    };

    // console.log(utilisateurModifie);

    requetesUtilisateur.updateUtilisateur(utilisateurModifie).then(result => {
      if (!result) {
        return next(new HttpError(404, `Courriel ${id} introuvable`));
      }
      delete result.selMdp;
      delete result.hachageMdp;

      res.json(result);
    }).catch(err => {
      return next(err);
    });
  }
);

router.get('/',
  passeport.authenticate('basic', { session: false }),
  async (req, res, next) => {
    if(req.user.role !== 'administrateur')
      return next(new HttpError(403,'Admin Only'))

    res.json(await requetesUtilisateur.getAllUsers())
  }
);

router.put('/active',
  passeport.authenticate('basic', { session: false }),
  async (req, res, next) => {
    if(req.user.role !== 'administrateur')
      return next(new HttpError(403,'Admin Only'))

    const courriel = req.body.courriel;
    const estActif = req.body.estActif;

    if(!courriel || courriel === '')
      return next(new HttpError(400, 'courriel est obligatoire'))

    if(estActif === undefined)
      return next(new HttpError(400, 'estActif est obligatoire'))

    const result = await requetesUtilisateur.setActiveStatus(courriel, estActif)
    
    if(!result)
      return next(new HttpError(404, 'Compte introuvable'))

    res.json(result)
  }
)

module.exports = router;