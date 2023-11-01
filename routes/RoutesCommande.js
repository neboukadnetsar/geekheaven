const express = require('express');
const router = express.Router();
const passport = require('passport');

const HttpError = require("../HttpError");

const requetesProduit = require('../queries/RequeteProduits')
const requetesPanier = require('../queries/RequetesPanier')
const requetesUtilisateur = require('../queries/RequetesUtilisateur')
const requetesCommande = require('../queries/RequetesCommande')

router.use(passport.authenticate('basic', { session: false }))

router.post('/', async (req, res, next) => {
    try{
        const courriel = req.user.courriel
        const usePoints = req.body.usePoints

        const response = await requetesCommande.soumettreCommande(courriel,usePoints)
        return res.json(response)
    }catch(err){
        return next(err)
    }
});

router.get('/', (req, res, next) => {
    if (!req.user || req.user.role != 'administrateur') {
        return next(new HttpError(403, "Seul un administrateur peut obtenir la liste des commandes"));
    }
    requetesCommande.getAllOrders().then(orders => {
        res.json(orders);
    }).catch(err => {
        return next(err);
    })
});

router.get('/:courriel', (req, res, next) => { 
    const userMail = req.params.courriel;
    if (!req.user || req.user.courriel !== userMail) {
        return next(new HttpError(403, "Un utilisateur ne peut pas visualiser les commandes d'un autre compte"));
    }
    requetesCommande.getAllOrders(userMail).then(orders => {
        res.json(orders);
    }).catch(err => {
        return next(err);
    })
});

router.put('/delete/:orderId', (req, res, next) => {
    const orderId = req.params.orderId;
    if (!req.user || req.user.role != 'administrateur') {
        return next(new HttpError(403, "Seul un administrateur peut supprimer une commande"));
    }

    requetesCommande.deleteOrder(orderId).then(result => {
        if(!result) {
            return next(new HttpError(500, `Order ${orderId} ne peut pas être supprimée`));
        }

        res.json(result);
    }).catch(err => {
        return next(err);
    });
});

router.put('/expediate/:orderId', (req, res, next) => {
    const orderId = req.params.orderId;
    if (!req.user || req.user.role != 'administrateur') {
        return next(new HttpError(403, "Seul un administrateur peut supprimer une commande"));
    }

    if(!orderId || orderId === '') {
        return next(new HttpError(400, "url param orderId is required"))
    }

    requetesCommande.expediateOrder(orderId).then(result => {
        if(!result) {
            return next(new HttpError(404, `order ${orderId} not found`))
        }

        res.json(result)
    }).catch(err => {
        return next(err);
    })
});

module.exports = router;