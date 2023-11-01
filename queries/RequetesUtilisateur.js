const piscine = require('./DBPool');
const HttpError = require("../HttpError");

const getInfoCompteParCourriel = async (courriel, client) => {
    const result = await (client || piscine).query(
        `SELECT LOWER(courriel) AS courriel, prenom, nom, telephone, numero_civique, rue, code_postal, ville_nom, ville_province_code AS province_code, adresse_active, infolettre, points_fidelite, hachage_mdp, sel_mdp, role_nom, est_actif
         FROM comptes_utilisateurs
         WHERE courriel = $1`,
        [courriel]
    );

    const row = result.rows[0];
    if (row) {
        return {
            courriel: row.courriel,
            prenom: row.prenom,
            nom: row.nom,
            telephone: row.telephone,
            numeroCivique: row.numero_civique,
            rue: row.rue,
            codePostal: row.code_postal,
            ville: row.ville_nom,
            province: row.province_code,
            adresseActive: row.adresse_active,
            infolettre: row.infolettre,
            pointsFidelite: row.points_fidelite,
            hachageMdp: row.hachage_mdp,
            selMdp: row.sel_mdp,
            role: row.role_nom,
            estActif: row.est_actif
        };
    }
    return undefined;
};
exports.getInfoCompteParCourriel = getInfoCompteParCourriel;


const creerCompteUtilisateur = async (mdpHachageBase64, sel, courriel, prenom, nom, telephone, infolettre) => {
    const client = await piscine.connect();

    try {
        await client.query('BEGIN');

        const compteExistant = await getInfoCompteParCourriel(courriel.toLowerCase(), client);
        if (compteExistant) {
            throw new HttpError(409, `Un compte avec le courriel ${courriel} existe déjà`);
        }

        const resultat = await (client || piscine).query(
            `INSERT INTO comptes_utilisateurs (courriel, prenom, nom, telephone, hachage_mdp, sel_mdp, infolettre)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [courriel.toLowerCase(), prenom, nom, telephone, mdpHachageBase64, sel, infolettre]
        );

        const compteClient = getInfoCompteParCourriel(courriel.toLowerCase(), client);

        await client.query('COMMIT');

        return compteClient;
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw new HttpError(err.status || 500, err.message);
        // throw err;
    }
    finally {
        client.release();
    }
};
exports.creerCompteUtilisateur = creerCompteUtilisateur;


const updateUtilisateur = async (utilisateur) => {

    try {
        const result = await piscine.query(
            `UPDATE comptes_utilisateurs SET infolettre = $2, telephone = $3, numero_civique = $4, rue = $5, code_postal = $6, ville_nom = $7, ville_province_code = $8, prenom = $9, nom = $10, hachage_mdp = $11, sel_mdp = $12
        WHERE courriel = $1`,
            [utilisateur.courriel, utilisateur.infolettre, utilisateur.telephone, utilisateur.numeroCivique, utilisateur.rue, utilisateur.codePostal, utilisateur.ville, utilisateur.province, utilisateur.prenom, utilisateur.nom, utilisateur.mdpHache, utilisateur.sel]
        );

        if (result.rowCount === 0) {
            // Aucune rangée modifiée, veut dire que le courriel n'existe pas
            return undefined;
        }
        // throw new HttpError(500, 'test');
        return getInfoCompteParCourriel(utilisateur.courriel);
    }
    catch (erreur) {
        // Permet de récupérer les exceptions custom levées par le trigger (pas juste throw erreur car c pour aussi les erreurs internes du trigger entres autres)
        throw new HttpError(500, erreur.message);
    }
};
exports.updateUtilisateur = updateUtilisateur;

const updateUserPoints =  async (user, client) => {
    try {
        const result = await (client || piscine).query(
            `UPDATE comptes_utilisateurs SET points_fidelite = $2 WHERE courriel = $1`,
            [user.courriel, user.pointsFidelite]
        )

        if(result.rowCount === 0)
            return undefined

        return getInfoCompteParCourriel(user.courriel)
    } catch (err) {
        throw new HttpError(500, err.message)
    }
}
exports.updateUserPoints = updateUserPoints

const getAllUsers = async () => {
    try {
        const users = []

        const result = await piscine.query(
            `SELECT courriel FROM comptes_utilisateurs`
        )

        for(row of result.rows){
            users.push(await getInfoCompteParCourriel(row.courriel))
        }

        return users
    }catch(err){
        throw new HttpError(500, err.message)
    }
}
exports.getAllUsers = getAllUsers

const setActiveStatus = async (courriel, estActif) => {
    try {

        const result = await piscine.query(
            `UPDATE comptes_utilisateurs SET est_actif = $2 WHERE courriel = $1`,
            [courriel, estActif]
        )
        
        if(result.rowCount === 0)
            return undefined

        return getInfoCompteParCourriel(courriel)
        
    }catch(err){
        throw new HttpError(500, err.message)
    }
}
exports.setActiveStatus = setActiveStatus