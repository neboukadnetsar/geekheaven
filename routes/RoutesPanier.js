const express = require('express');
const router = express.Router();
const passport = require('passport');

const HttpError = require("../HttpError");

const requetesProduit = require('../queries/RequeteProduits')
const requetesPanier = require('../queries/RequetesPanier')
const requetesUtilisateur = require('../queries/RequetesUtilisateur')

router.use(passport.authenticate('basic', { session: false }))

const verifierAuthorisationPanier = (req, courriel, next) => {
    const user = req.user
    if(!user) {
        throw new HttpError(403, "Il faut être authentifié pour interagir avec un panier");
    }else if(user.role !== 'administrateur' && user.courriel !== courriel) {
        throw new HttpError(403, "Un utilisateur non-administrateur ne peut interagir qu'avec son propre panier");
    }
}

router.get('/:courriel', async (req, res, next) => {
    try{
        if(!req.params.courriel || req.params.courriel === ''){
            throw new HttpError(400, "Le paramètre courriel doit être spécifié")
        }

        const courriel = decodeURIComponent(req.params.courriel)
        
        if(!await requetesUtilisateur.getInfoCompteParCourriel(courriel)){
            throw new HttpError(400, "Le courriel n'est pas valide")
        }

        verifierAuthorisationPanier(req, courriel, next)

        const id = await requetesPanier.getIdPanierActif(courriel)
        if(id){
            const panier = await requetesPanier.getPanierActifParCourriel(courriel)
            return res.json(panier)
        }
        await requetesPanier.createPanierParCourriel(courriel)
        return res.json([])
    }catch(err){
        return next(err)
    }
})

router.post('/', async (req, res, next) => {
    try{
        const courriel = req.body.courriel
        if(!courriel || courriel === '')
            throw new HttpError(400, "Le paramètre courriel doit être spécifié")

        verifierAuthorisationPanier(req, courriel, next)

        if(!await requetesUtilisateur.getInfoCompteParCourriel(courriel)){
            throw new HttpError(400, "Le courriel n'est pas valide")
        }

        const produit_id = req.body.produitId
        if(!produit_id || produit_id === '')
            throw new HttpError(400, "Le paramètre produitId doit être spécifié")

        const quantite = req.body.quantite
        if(isNaN(quantite) || quantite <= 0 || quantite % 1 !== 0)
            throw new HttpError(400, "Le paramètre quantite doit être spécifié en nombre entier supérieur à zéro")

        const produit = await requetesProduit.getProduitParID(produit_id)
        if(!produit)
            throw new HttpError(400, `Le produit ${produit_id} n'existe pas`)

        let panier_id = await requetesPanier.getIdPanierActif(courriel)
        if(!panier_id)
            panier_id = await requetesPanier.createPanierParCourriel(courriel)

        const ids = await requetesPanier.ajouterProduitAuPanier(panier_id, produit_id, quantite)

        return res.json(ids)

    }catch(err){
        return next(err)
    }
})

router.put('/', async (req, res, next) => {
    try{
        const courriel = req.body.courriel
        if(!courriel || courriel === '')
            throw new HttpError(400, "Le paramètre courriel doit être spécifié")

        verifierAuthorisationPanier(req, courriel, next)

        if(!await requetesUtilisateur.getInfoCompteParCourriel(courriel)){
            throw new HttpError(400, "Le courriel n'est pas valide")
        }

        const produit_id = req.body.produitId
        if(!produit_id || produit_id === '')
            throw new HttpError(400, "Le paramètre produitId doit être spécifié")

        const quantite = req.body.quantite
        if(isNaN(quantite) || quantite <= 0 || quantite % 1 !== 0)
            throw new HttpError(400, "Le paramètre quantite doit être spécifié en nombre entier supérieur à zéro")

        const produit = await requetesProduit.getProduitParID(produit_id)
        if(!produit)
            throw new HttpError(400, `Le produit ${produit_id} n'existe pas`)

        let panier_id = await requetesPanier.getIdPanierActif(courriel)
        if(!panier_id)
            panier_id = await requetesPanier.createPanierParCourriel(courriel)

        await requetesPanier.modifierProduitAuPanier(panier_id, produit_id, quantite)

        return res.json({})
    }catch(err){
        return next(err)
    }
})

router.delete('/', async (req, res, next) => {
    try{
        const courriel = req.body.courriel
        if(!courriel || courriel === '')
            throw new HttpError(400, "Le paramètre courriel doit être spécifié")

        verifierAuthorisationPanier(req, courriel, next)

        if(!await requetesUtilisateur.getInfoCompteParCourriel(courriel)){
            throw new HttpError(400, "Le courriel n'est pas valide")
        }

        const produit_id = req.body.produitId
        if(!produit_id || produit_id === '')
            throw new HttpError(400, "Le paramètre produitId doit être spécifié")

        const produit = await requetesProduit.getProduitParID(produit_id)
        if(!produit)
            throw new HttpError(400, `Le produit ${produit_id} n'existe pas`)

        let panier_id = await requetesPanier.getIdPanierActif(courriel)
        if(!panier_id)
            panier_id = await requetesPanier.createPanierParCourriel(courriel)

        await requetesPanier.supprimerProduitAuPanier(panier_id, produit_id)

        return res.json({})
    }catch(err){
        return next(err)
    }
})

module.exports = router;
