class ServiceError extends Error{
    constructor(status, message){
        super(message)
        this.status = status
    }
}

import session from './session.js'
import { fetchProduit } from './ServicesProduits.js'

async function getResponseMessage(response){
    try{
        const obj = await response.json()
        return obj.message ? obj.message : "Erreur inconnue"
    }catch(err){
        return "" + err
    }
}

async function createServiceError(response){
    return new ServiceError(response.status, await getResponseMessage(response))
}

export async function getPanier(){
    const courriel = session.detailsUtilisateur.courriel
    const response =  await fetch('/api/panier/'+encodeURIComponent(courriel), {
        method: "GET",
        headers: {
            ...session.getAuthHeaders()
        }
    })

    if(response.ok){
        return await response.json()
    }else{
        throw await createServiceError(response)
    }
}

export async function ajouterAuPanier(produitId, quantite){
    let produit
    try{
        produit = await fetchProduit(produitId)
    }catch(err){
        console.log(err.message)
        return false
    }
    
    const produitPanier = (await getPanier()).find(produit => produit.id === produitId)
    if (produitPanier) {
        const nouvQuantite = (((quantite + produitPanier.quantite) <= produit.quantite_disponible) ? quantite + produitPanier.quantite : produit.quantite_disponible)
        await modifierQuantiteProduit(produitId, nouvQuantite)
    } else {
        const nouvQuantite = ((quantite <= produit.quantite_disponible) ? quantite : produit.quantite_disponible)
        await ajouterProduit(produitId, nouvQuantite)
    }
    return true
}

export async function ajouterProduit(produitId, quantite){
    const courriel = session.detailsUtilisateur.courriel
    const addObj = {
        courriel: courriel,
        produitId: produitId,
        quantite, quantite
    }
    const response = await fetch('/api/panier', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...session.getAuthHeaders()
        },
        body: JSON.stringify(addObj)
    })

    if(response.ok){
        return await response.json()
    }else{
        throw await createServiceError(response)
    }
}

export async function retirerProduit(produitId){
    const courriel = session.detailsUtilisateur.courriel
    const deleteObj = {
        courriel: courriel,
        produitId: produitId
    }
    const response = await fetch('/api/panier', {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...session.getAuthHeaders()
        },
        body: JSON.stringify(deleteObj)
    })

    if(response.ok){
        return await response.json()
    }else{
        throw await createServiceError(response)
    }
}

export async function modifierQuantiteProduit(produitId, nouvelleQuantite){
    const courriel = session.detailsUtilisateur.courriel
    const updateObj = {
        courriel: courriel,
        produitId: produitId,
        quantite: nouvelleQuantite
    }
    const response = await fetch('/api/panier', {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...session.getAuthHeaders()
        },
        body: JSON.stringify(updateObj)
    })

    if(response.ok){
        return await response.json()
    }else{
        throw await createServiceError(response)
    }
}

export function getGeekoPoints(){
    // TODO fonction qui demande le nombre de points geeko utilisable.
    return 25784
}