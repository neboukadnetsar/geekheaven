const pool = require('./DBPool')

const getCategories = async () => {
    const resultat = await pool.query(
        'SELECT * FROM categories ORDER BY nom ASC'
    )
    return resultat.rows.map(categorie => categorie.nom)
}
exports.getCategories = getCategories

const getLangues = async () => {
    const resultat = await pool.query(
        'SELECT * FROM langues ORDER BY langue ASC'
    )
    return resultat.rows.map(langue => langue.langue)
}
exports.getLangues = getLangues

const getGenres = async () => {
    const resultat = await pool.query(
        'SELECT * FROM genres_jeux_livres ORDER BY nom ASC'
    )
    return resultat.rows.map(genre => genre.nom)
}
exports.getGenres = getGenres

const getProduits = async () => {
    const resultat = await pool.query(
        `SELECT * 
        FROM produits`
    )

    return resultat.rows.map(rangee => {
        const produit = {
            id: rangee.id,
            upc: rangee.upc,
            nom: rangee.nom,
            prix: rangee.prix,
            quantite_disponible: rangee.quantite_disponible,
            quantite_inventaire_voulue: rangee.quantite_inventaire_voulue,
            description: rangee.description,
            isbn: rangee.isbn,
            nb_pages: rangee.nb_pages,
            auteur: rangee.auteur,
            nb_joueurs: rangee.nb_joueurs,
            temps_jeu_minutes: rangee.temps_jeu_minutes,
            age: rangee.age,
            est_actif: rangee.est_actif,
            langue_langue: rangee.langue_langue,
            genres_jeux_livre_nom: rangee.genres_jeux_livre_nom,
            categorie_nom: rangee.categorie_nom
        }
        return produit
    })
}
exports.getProduits = getProduits

const getProduitsAleatoires = async () => {
    const resultat = await pool.query(
        `SELECT *
         FROM produits
         ORDER BY RANDOM()
         LIMIT 5`
    );

    return resultat.rows.map(rangee => {
        const produits = {
            id: rangee.id,
            image: null
        };
        return produits;
    });
};

exports.getProduitsAleatoires = getProduitsAleatoires;

const getProduitsParCategorie = async (categorie) => {
    const resultat = await pool.query(
        `SELECT *
            FROM produits
            WHERE categorie_nom = $1
            ORDER BY RANDOM()`,
        [categorie]
    )

    return resultat.rows.map(rangee => {
        const produits = {
            id: rangee.id,
            nom: rangee.nom,
            prix: rangee.prix,
            age: rangee.age,
            nb_joueurs: rangee.nb_joueurs,
            temps_jeu_minutes: rangee.temps_jeu_minutes,
            genre: rangee.genres_jeux_livre_nom,
            langue: rangee.langue_langue,
            image: null
        };
        return produits;
    });

};
exports.getProduitsParCategorie = getProduitsParCategorie;

const getProduitParID = async (id, client) => {
    const resultat = await (client || pool).query(
        `SELECT *
        FROM produits
        WHERE id = $1`,
        [id]
    )

    const rangee = resultat.rows[0]
    if (rangee) {
        const produit = {
            id: rangee.id,
            upc: rangee.upc,
            nom: rangee.nom,
            prix: rangee.prix,
            quantite_disponible: rangee.quantite_disponible,
            description: rangee.description,
            isbn: rangee.isbn,
            nb_pages: rangee.nb_pages,
            auteur: rangee.auteur,
            nb_joueurs: rangee.nb_joueurs,
            temps_jeu_minutes: rangee.temps_jeu_minutes,
            age: rangee.age,
            est_actif: rangee.est_actif,
            langue_langue: rangee.langue_langue,
            genres_jeux_livre_nom: rangee.genres_jeux_livre_nom,
            categorie_nom: rangee.categorie_nom
        }
        return produit
    }
    return undefined
}
exports.getProduitParID = getProduitParID

const ajouterProduit = async (produit) => {
    const resultat = await pool.query(
        `INSERT INTO produits (id, upc, nom, prix, quantite_disponible, description, isbn, nb_pages, auteur, nb_joueurs, temps_jeu_minutes, age, est_actif, langue_langue, genres_jeux_livre_nom, categorie_nom)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
            produit.id,
            (produit.upc ? produit.upc : null),
            produit.nom,
            produit.prix,
            produit.quantite_disponible,
            produit.description,
            (produit.isbn ? produit.isbn : null),
            (produit.nb_pages ? produit.nb_pages : null),
            (produit.auteur ? produit.auteur : null),
            (produit.nb_joueurs ? produit.nb_joueurs : null),
            (produit.temps_jeu_minutes ? produit.temps_jeu_minutes : null),
            (produit.age ? produit.age : null),
            produit.est_actif,
            (produit.langue_langue ? produit.langue_langue : null),
            (produit.genres_jeux_livre_nom ? produit.genres_jeux_livre_nom : null),
            produit.categorie_nom
        ]
    )
    return getProduitParID(produit.id)
}
exports.ajouterProduit = ajouterProduit

const modifierProduit = async (produit) => {
    const resultat = await pool.query(
        `UPDATE produits SET upc = $2, nom = $3, prix = $4, quantite_disponible = $5,
            description = $6, isbn = $7, nb_pages = $8, auteur = $9, nb_joueurs = $10,
            temps_jeu_minutes = $11, age = $12, est_actif = $13, langue_langue = $14,
            genres_jeux_livre_nom = $15, categorie_nom = $16 
            WHERE id = $1`,
        [
            produit.id,
            (produit.upc ? produit.upc : null),
            produit.nom,
            produit.prix,
            produit.quantite_disponible,
            produit.description,
            (produit.isbn ? produit.isbn : null),
            (produit.nb_pages ? produit.nb_pages : null),
            (produit.auteur ? produit.auteur : null),
            (produit.nb_joueurs ? produit.nb_joueurs : null),
            (produit.temps_jeu_minutes ? produit.temps_jeu_minutes : null),
            (produit.age ? produit.age : null),
            produit.est_actif,
            (produit.langue_langue ? produit.langue_langue : null),
            (produit.genres_jeux_livre_nom ? produit.genres_jeux_livre_nom : null),
            produit.categorie_nom
        ]
    )

    if (resultat.rowCount === 0)
        return undefined

    return getProduitParID(produit.id)
}
exports.modifierProduit = modifierProduit

const modifierProduitQuantite = async (id, quantite, client) => {
    const resultat = await (client || pool).query(
        `UPDATE produits SET quantite_disponible = $2
        WHERE id = $1`,
        [id, quantite]
    )

    if (resultat.rowCount === 0)
        return undefined

    const response = await getProduitParID(id, client);
    return response;
}
exports.modifierProduitQuantite = modifierProduitQuantite

const supprimerProduitParID = async (id) => {
    const resultat = await pool.query(
        `DELETE FROM produits WHERE id = $1`,
        [id]
    )

    if (resultat.rowCount === 0) {
        return undefined
    }

    return {}
}
exports.supprimerProduitParID = supprimerProduitParID

const getImagesUrl = async (id) => {
    const resultat = await pool.query(
        `SELECT * FROM chemins_images WHERE produit_id = $1`,
        [id]
    )

    return resultat.rows
}
exports.getImagesUrl = getImagesUrl

const getImageUrlByImageId = async (id) => {
    const resultat = await pool.query(
        `SELECT url_image FROM chemins_images WHERE id = $1`,
        [id]
    )

    if (resultat.rowCount === 0) {
        return undefined
    }

    return resultat.rows[0]
}
exports.getImageUrlByImageId = getImageUrlByImageId

const deleteImageUrlById = async (id) => {
    const resultat = await pool.query(
        `DELETE FROM chemins_images WHERE id = $1`,
        [id]
    )

    if (resultat.rowCount === 0) {
        return undefined
    }

    return resultat.rows[0]
}
exports.deleteImageUrlById = deleteImageUrlById

const ajouterImageProduit = async (id, url) => {
    const resultat = await pool.query(
        `INSERT INTO chemins_images (url_image, produit_id)
        VALUES ($1, $2)`,
        [url, id]
    )

    if (resultat.rowCount === 0) {
        return undefined
    }

    return {}
}
exports.ajouterImageProduit = ajouterImageProduit
