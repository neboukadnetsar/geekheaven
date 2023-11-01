const HttpError = require('../HttpError')
const pool = require('./DBPool')

const requetesPanier = require('./RequetesPanier')
const requetesProduit = require('./RequeteProduits')
const requetesUtilisateur = require('./RequetesUtilisateur')

function getSousTotal(produits) {
    let sousTotal = 0
    produits.forEach((produit) => {
        if(produit.prix) {
            sousTotal += produit.quantite * produit.prix
        } else if (produit.prixVente) {
            sousTotal += produit.quantite * produit.prixVente
        }
    })
    return sousTotal
}

function getPST(sousTotal, province) {
    switch (province) {
        case 'BC':
            return sousTotal * 0.07
        case 'MB':
            return sousTotal * 0.07
        case 'QC':
            return sousTotal * 0.09975
        case 'SK':
            return sousTotal * 0.06
        default:
            return 0
    }
}

function getGST(sousTotal, province) {
    switch (province) {
        case 'AB':
            return sousTotal * 0.05
        case 'BC':
            return sousTotal * 0.05
        case 'MB':
            return sousTotal * 0.05
        case 'NT':
            return sousTotal * 0.05
        case 'NU':
            return sousTotal * 0.05
        case 'QC':
            return sousTotal * 0.05
        case 'SK':
            return sousTotal * 0.05
        case 'YT':
            return sousTotal * 0.05
        default:
            return 0
    }
}

function getHST(sousTotal, province) {
    switch (province) {
        case 'NB':
            return sousTotal * 0.15
        case 'NL':
            return sousTotal * 0.15
        case 'NS':
            return sousTotal * 0.15
        case 'ON':
            return sousTotal * 0.13
        case 'PE':
            return sousTotal * 0.15
        default:
            return 0
    }
}


const soumettreCommande = async (courriel, usePoints) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN');
        const panierId = await requetesPanier.getIdPanierActif(courriel)
        const produits = await requetesPanier.getPanierActifParCourriel(courriel, client)
        if (produits.length === 0)
            throw new HttpError(400, 'Aucun produits dans le panier')

        await Promise.all(produits.map(async produit => {
            if (produit.quantiteDisponible < produit.quantite) {
                throw new HttpError(400, `Le produit ${produit.nom} est en quantité insufisante. ${produit.quantite} demandé, ${produit.quantiteDisponible} disponible.`)
            } else {
                const lowerQuantiteDisponible = requetesProduit.modifierProduitQuantite(produit.id, produit.quantiteDisponible - produit.quantite, client)
                const setPrixVente = requetesPanier.modifierProduitAuPanier(panierId, produit.id, produit.quantite, produit.prix, client)

                await Promise.all([lowerQuantiteDisponible, setPrixVente])
            }
        }))

        const userInfos = await requetesUtilisateur.getInfoCompteParCourriel(courriel, client)
        if (!userInfos.adresseActive)
            throw new HttpError(400, "Adresse de livraison non configuré")

        let sousTotal = getSousTotal(produits)

        let pointsRebate = 0
        let usablePoints = 0
        if (usePoints) {
            usablePoints = Math.floor(userInfos.pointsFidelite / 5000) * 5000
            pointsRebate = (usablePoints / 5000) * 5
            if (pointsRebate > sousTotal) {
                pointsRebate = Math.floor(sousTotal / 5) * 5
                usablePoints = pointsRebate * 1000
            }
            userInfos.pointsFidelite -= usablePoints
            await requetesUtilisateur.updateUserPoints(userInfos, client)
        }

        const pst = getPST(sousTotal, userInfos.province)
        const gst = getGST(sousTotal, userInfos.province)
        const hst = getHST(sousTotal, userInfos.province)

        const total = sousTotal - pointsRebate + pst + gst + hst

        const commande = {
            pointsUtilises: usablePoints,
            montantTotal: total.toFixed(2),
            etatCommande: 'CONFIRMEE',
            numRueExp: userInfos.numeroCivique,
            rueExp: userInfos.rue,
            villeExp: userInfos.ville,
            provinceExp: userInfos.province,
            numRuePmt: userInfos.numeroCivique,
            ruePmt: userInfos.rue,
            villePmt: userInfos.ville,
            provincePmt: userInfos.province
        }

        const response = await client.query(
            `INSERT INTO commandes (date_commande, points_utilises, montant_total, etats_commandes_etat, num_rue_exp, rue_exp, ville_exp, province_exp, num_rue_pmt, rue_pmt, ville_pmt, province_pmt)
            VALUES (NOW() AT TIME ZONE 'America/New_York', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id`,
            [commande.pointsUtilises, commande.montantTotal, commande.etatCommande, commande.numRueExp, commande.rueExp, commande.villeExp, commande.provinceExp, commande.numRuePmt, commande.ruePmt, commande.villePmt, commande.provincePmt]
        )

        const orderId = response.rows[0].id

        await requetesPanier.finalisePanier(panierId, orderId, client)

        const newOrder = getOrderById(orderId, client); 

        await client.query('COMMIT');
        return newOrder;

        // RETURN ORDER USING GET ORDER FUNCTION UPCOMMING
        // return produits;
    } catch (err) {
        await client.query("ROLLBACK")
        throw err
    } finally {
        client.release()
    }
}
exports.soumettreCommande = soumettreCommande


const getOrderById = async (orderId, clientParam) => {
    const client = clientParam || await pool.connect();

    try {
        if (!clientParam) {
            await client.query('BEGIN');
        }

        const ordersResult = await client.query(
            `SELECT
                c.id, comptes_utilisateurs_courriel, date_commande, points_utilises, montant_total, etats_commandes_etat, 
                num_rue_exp, rue_exp, ville_exp, province_exp, 
                num_rue_pmt, rue_pmt, ville_pmt, province_pmt
            FROM commandes c
            JOIN paniers p ON p.commandes_id = c.id
            WHERE c.id = $1`,
            [orderId]
        );

        const orderRow = ordersResult.rows[0];
        if (!orderRow) {
            throw new Error(`Impossible de trouver la commande avec purchaseOrderKey ${orderId}`);
        }
        const order = await buildOrderResponseObject(orderRow, client);

        if (!clientParam) {
            await client.query("COMMIT");
        }

        return order;
    } catch (err) {
        if (!clientParam) {
            await client.query("ROLLBACK");
        }
        throw err;
    } finally {
        if (!clientParam) {
            client.release();
        }
    }
};


const buildOrderResponseObject = async (orderRow, client, userInfos = null) => {
    const orderKey = orderRow.id;

    const cartResult = await (client || pool).query(
        `SELECT comptes_utilisateurs_courriel, produits_id, quantite, prix_vente
         FROM
             produits_paniers pp
             JOIN paniers p ON p.id = pp.paniers_id
         WHERE
             p.commandes_id = $1`,
        [orderKey]
    );

    const courriel = orderRow.comptes_utilisateurs_courriel;
    const detailsUtilisateur = userInfos || await requetesUtilisateur.getInfoCompteParCourriel(courriel, client);
    const cart = cartResult.rows.map(cartRow => {
        return {
            produitId: cartRow.produits_id,
            quantite: cartRow.quantite,
            prixVente: cartRow.prix_vente
        };
    });

    const order = {
        id: orderRow.id,
        userId: detailsUtilisateur.courriel,
        cart: cart,
        paiement: {
            adresse: {
                numero: orderRow.num_rue_pmt,
                rue: orderRow.rue_pmt,
                ville: orderRow.ville_pmt,
                province: orderRow.province_pmt,
                // codePostal: non implemente dans table commande !
                codePostal: detailsUtilisateur.codePostal //triche :) 
            },
            pointUtilises: orderRow.points_utilises,
            montantTotal: orderRow.montant_total,
            modePaiement: null,
            // autres: null
        },
        modeExp: null,
        adresseExpedition: {
            prenom: detailsUtilisateur.prenom,
            nom: detailsUtilisateur.nom,
            numero: orderRow.num_rue_exp,
            rue: orderRow.rue_exp,
            ville: orderRow.ville_exp,
            province: orderRow.province_exp,
            // codePostal: non implemente dans table commande !
            codePostal: detailsUtilisateur.codePostal //triche :)
        },
        dateCommande: orderRow.date_commande,
        orderStatus: orderRow.etats_commandes_etat
    };

    return order;
};

const getAllOrders= async (userMail = null) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const ordersResult = await client.query(
            `SELECT
                c.id, comptes_utilisateurs_courriel, date_commande, points_utilises, montant_total, etats_commandes_etat, 
                num_rue_exp, rue_exp, ville_exp, province_exp, 
                num_rue_pmt, rue_pmt, ville_pmt, province_pmt
            FROM commandes c
            JOIN paniers p ON p.commandes_id = c.id
            WHERE comptes_utilisateurs_courriel ~ $1
            ORDER BY id`,
            [userMail || '.*']
        );

        const orderResponsePromises = ordersResult.rows.map(orderRow => buildOrderResponseObject(orderRow, client));
        const orders = await Promise.all(orderResponsePromises);

        await client.query("COMMIT");

        return orders;

    } catch (err) {
        await client.query("ROLLBACK");
        throw err;

    } finally {
        client.release();
    }
};
exports.getAllOrders = getAllOrders;


const deleteOrder = async (id) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const orderWithDetails = await getOrderById(id, client);

        // Pour tester
        // orderWithDetails.orderStatus = 'SUPPRIMEE';

        if (orderWithDetails.orderStatus === 'ENVOYEE' || orderWithDetails.orderStatus === 'SUPPRIMEE') {
            await client.query("ROLLBACK");
            return undefined;
        }

        const produitsDontLesStocksDoiventEtreRemisAJour = orderWithDetails.cart.map(produit => {
            return {
                productId: produit.produitId,
                quantity: +produit.quantite
            }
        });

        for (item of produitsDontLesStocksDoiventEtreRemisAJour) {
            const produitAvecStockNonMisAJour = await requetesProduit.getProduitParID(item.productId);
            const nouvelleQuantite = produitAvecStockNonMisAJour.quantite_disponible += item.quantity;
            const result = await requetesProduit.modifierProduitQuantite(item.productId, nouvelleQuantite, client);
            if (result.quantite_disponible !== nouvelleQuantite) {
                await client.query("ROLLBACK");
                return undefined;
            }
        }

        orderWithDetails.orderStatus = 'SUPPRIMEE';
        const orderUpdated = await updateOrder(orderWithDetails, client);

        await client.query("COMMIT");
        return orderUpdated;
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
};
exports.deleteOrder = deleteOrder;

const expediateOrder = async (orderId) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN');

        const order = await getOrderById(orderId, client)
        if(!order)
            return undefined

        if(order.orderStatus !== 'CONFIRMEE')
            throw new HttpError(400, "Only confirmed order can be expediated")

        const geekoPoints = Math.floor(getSousTotal(order.cart) * 10);
        const user = await requetesUtilisateur.getInfoCompteParCourriel(order.userId)
        user.pointsFidelite += geekoPoints

        await requetesUtilisateur.updateUserPoints(user, client)

        order.orderStatus = 'ENVOYEE'
        const expediatedOrder = await updateOrder(order, client)

        await client.query("COMMIT");
        
        return expediatedOrder
    } catch (err) {
        await client.query("ROLLBACK")
        throw err
    } finally {
        client.release()
    }
}
exports.expediateOrder = expediateOrder

const updateOrder = async (order, clientParam) => {

    const client = clientParam || await pool.connect();

    try {
        if (!clientParam) {
            await client.query('BEGIN');
        }
        let result = await client.query(
            `UPDATE commandes SET etats_commandes_etat = $2
        WHERE id = $1`,
            [order.id, order.orderStatus]
        );

        if (result.rowCount === 0) {
            if (!clientParam) {
                await client.query("ROLLBACK");
            }
            // Aucune rangée modifiée, veut dire que l'id n'existe pas
            return undefined;
        }

        if (!clientParam) {
            await client.query("COMMIT");
        }

        result = await getOrderById(order.id, clientParam);
        return result;
    } catch (err) {
        if (!clientParam) {
            await client.query("ROLLBACK");
        }
        throw err;
    } finally {
        if (!clientParam) {
            client.release();
        }
    }
};
exports.updateOrder = updateOrder;