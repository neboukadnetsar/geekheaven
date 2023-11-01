const HttpError = require('../HttpError')
const pool = require('./DBPool')

const getPanierActifParCourriel = async (courriel, client) => {
    const resultat = await (client || pool).query(
        `SELECT 
            pnr.id AS panier_id, pdt.id AS produit_id, pdt.nom AS produit_nom,
            pdt.prix, pdt.description, pdt.quantite_disponible, pdt_pnr.quantite
        FROM 
            paniers pnr
            JOIN produits_paniers pdt_pnr ON pnr.id = pdt_pnr.paniers_id
            JOIN produits pdt ON pdt.id = pdt_pnr.produits_id
        WHERE 
            pnr.comptes_utilisateurs_courriel = $1 
            AND pnr.commandes_id IS NULL
        ORDER BY produit_id;`,
        [courriel]
    )
    return resultat.rows.map(row => {
        return {
            id: row.produit_id,
            nom: row.produit_nom,
            prix: row.prix,
            desc: row.description,
            quantite: row.quantite,
            quantiteDisponible: row.quantite_disponible
        }
    })
}
exports.getPanierActifParCourriel = getPanierActifParCourriel

const getIdPanierActif = async (courriel) => {
    const resultat = await pool.query(
        `SELECT 
            id FROM paniers 
        WHERE 
            comptes_utilisateurs_courriel = $1
            AND commandes_id IS NULL;`,
        [courriel]
    )

    if(resultat.rows.length !== 0){
        return resultat.rows[0].id
    }

    return undefined
}
exports.getIdPanierActif = getIdPanierActif

const createPanierParCourriel = async (courriel) => {
    const resultat = await pool.query(
        `INSERT INTO paniers (comptes_utilisateurs_courriel)
        VALUES ($1)
        RETURNING id;`,
        [courriel]
    )

    const row = resultat.rows[0]
    if(row){
        return row.id
    }

    return undefined
}
exports.createPanierParCourriel = createPanierParCourriel

const ajouterProduitAuPanier = async (panier_id, produit_id, quantite) => {
    try{
        const resultat = await pool.query(
            `INSERT INTO produits_paniers (paniers_id, produits_id, quantite)
            VALUES ($1, $2, $3)
            RETURNING paniers_id, produits_id;`,
            [panier_id, produit_id, quantite]
        )
    
        const row = resultat.rows[0]
        if(row){
            return {
                panier_id: row.paniers_id,
                produit_id: row.produits_id
            }
        }
    
        return undefined
    }catch(err){
        throw new HttpError(400, "Produit déjà dans le panier")
    }
}
exports.ajouterProduitAuPanier = ajouterProduitAuPanier

const modifierProduitAuPanier = async (panier_id, produit_id, quantite, prix = null, client) => {
    const response = await (client || pool).query(
        `UPDATE produits_paniers
        SET quantite = $3 , prix_vente = $4
        WHERE paniers_id = $1 AND produits_id = $2;`,
        [panier_id, produit_id, quantite, prix]
    )
}
exports.modifierProduitAuPanier = modifierProduitAuPanier

const supprimerProduitAuPanier = async (panier_id, produit_id) => {
    const resultat = await pool.query(
        `DELETE FROM produits_paniers
        WHERE paniers_id = $1 AND produits_id = $2;`,
        [panier_id, produit_id]
    )
}
exports.supprimerProduitAuPanier = supprimerProduitAuPanier

const finalisePanier = async (panier_id, order_id, client) => {
    const resultat = await client.query(
        `UPDATE paniers SET commandes_id = $2 WHERE id = $1`,
        [panier_id, order_id]
    )
}
exports.finalisePanier = finalisePanier