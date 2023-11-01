import { reactive } from "vue";

class AuthError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const session = reactive({
    detailsUtilisateur: null,
    courriel: null,
    mdp: null,
    loaded: false,

    initialize() {
        if (sessionStorage.courriel) {
            this.courriel = sessionStorage.courriel;
        }
        if (sessionStorage.mdp) {
            this.mdp = sessionStorage.mdp;
        }
        if (this.detailsUtilisateur == null && this.courriel != null) {
            return this.fetchUser().catch(err => console.error("L'authentification initiale a échouée: ", err));
        }
    },
    login(courriel, mdp) {
        this.setCredentials(courriel, mdp);
        return this.fetchUser();
    },
    setCredentials(courriel, mdp) {
        this.courriel = courriel;
        sessionStorage.courriel = courriel;
        this.mdp = mdp;
        sessionStorage.mdp = mdp;
    },
    clearCredentials() {
        this.courriel = null;
        sessionStorage.removeItem('courriel');
        this.mdp = null;
        sessionStorage.removeItem('mdp');
    },
    disconnect() {
        this.detailsUtilisateur = null;
        this.loaded = false;
        this.clearCredentials();
    },
    async fetchUser() {
        const response = await fetch("/api/utilisateur/connexion", {
            method: "GET",
            headers: {
                ... this.getAuthHeaders()
            }
        });

        if (response.ok) {
            const detailsUtilisateur = await response.json();
            this.detailsUtilisateur = detailsUtilisateur;
            this.loaded = true;
            console.log('DETAILS UTILISATEUR : ', detailsUtilisateur);
            return detailsUtilisateur;
        } else {
            this.detailsUtilisateur = null;
            this.loaded = false;
            if (response.status === 401) {
                throw new AuthError(response.status, "Nom d'utilisateur ou mot de passe incorrect");
            } else {
                throw new AuthError(response.status, "Erreur lors de l'authentification: " + response.status);
            }
        }
    },
    getAuthHeaders() {
        if (this.courriel) {
            return {
                "Authorization": "Basic " + btoa(this.courriel + ":" + this.mdp),
                "X-Requested-With": "XMLHttpRequest"
            };
        } else {
            return {};
        }
    },
    async creerNouveauCompte(prenom, nom, telephone, courriel, mdp, infolettre) {
        const response = await fetch("/api/utilisateur/inscription", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prenom: prenom,
                nom: nom,
                telephone: telephone,
                courriel: courriel,
                mdp: mdp,
                infolettre: infolettre
            })
        });

        if (response.ok) {
            const detailsUtilisateur = await response.json();
            return detailsUtilisateur;
        } else {
            this.detailsUtilisateur = null;
            this.loaded = false;
            if (response.status === 409) {
                const respBody = await response.json();
                if (respBody && respBody.message) {
                    throw new AuthError(response.status, respBody.message);
                }
                throw new AuthError(response.status, "Erreur lors de la création du compte");
            } else {
                throw new AuthError(response.status, "Erreur lors de la création du compte: " + response.status);
            }
        }
    },
    async updateUtilisateur() {
        this.loaded = false;
        const response = await fetch("/api/utilisateur/modification", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ... this.getAuthHeaders()
            },
            body: JSON.stringify(this.detailsUtilisateur)
        });

        if (response.ok) {
            const detailsUtilisateur = await response.json();
            this.detailsUtilisateur = detailsUtilisateur;
            this.loaded = true;
            // return detailsUtilisateur;
        } else {
            this.detailsUtilisateur = null;
            // this.loaded = false;
            // À VÉRIFIER
            const respBody = await response.json();
            if (response.status === 409) {
                
                if (respBody && respBody.message) {
                    throw new AuthError(response.status, respBody.message);
                }
                throw new AuthError(response.status, "Erreur lors de la mise à jour du compte");
            } else {
                throw new AuthError(response.status, "Erreur lors de la mise à jour du compte: " + response.status);
            }
        }
    }
});

export default session;

session.initialize();