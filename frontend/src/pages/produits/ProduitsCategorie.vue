<template>
    <v-container class="d-flex">
        <v-row>
            <v-col v-if="!isHomePage" cols="2">
                <!-- Filtrage -->
                <div class="pa-2">
                    <v-card class="bg-grey-lighten-5">
                        <v-card-title class="text-h6 text-center">Filtrer par</v-card-title>
                        <v-card-text>
                            <!-- Prix -->
                            <p class="text-h6">Prix</p>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field density="compact" hide-details clearable v-model="filtres.prixMin"
                                        label="min"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field density="compact" hide-details clearable v-model="filtres.prixMax"
                                        label="max"></v-text-field>
                                </v-col>
                            </v-row>

                            <!-- Age -->
                            <p class="text-h6 pb-2">Age</p>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field density="compact" clearable hide-details v-model="filtres.ageMin"
                                        label="min"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field density="compact" clearable hide-details v-model="filtres.ageMax"
                                        label="max"></v-text-field>
                                </v-col>
                            </v-row>

                            <!-- Nombre de joueurs -->
                            <p class="text-h6 pt-2">Nombre de joueurs</p>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field density="compact" clearable hide-details v-model="filtres.nbJoueursMin"
                                        label="min"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field density="compact" clearable hide-details v-model="filtres.nbJoueursMax"
                                        label="max"></v-text-field>
                                </v-col>
                            </v-row>

                            <!-- Temps de jeu -->
                            <p class="text-h6 pt-2">Durée</p>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field density="compact" clearable hide-details v-model="filtres.dureeMin"
                                        label="min"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field density="compact" clearable hide-details v-model="filtres.dureeMax"
                                        label="max"></v-text-field>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col>
                                    <!-- Liste des langues -->
                                    <p class="text-h6 pb-2">Langues</p>
                                    <div v-for="(langue, index) in languesProduits" :key="index">
                                        <v-checkbox hide-details density="compact" v-model="filtres.langues" :label="langue"
                                            :value="langue"></v-checkbox>
                                    </div>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col>
                                    <!-- Liste des genres -->
                                    <p class="text-h6">Genres</p>
                                    <div v-for="(genre, index) in genresProduits" :key="index" class="ma-0 pa-0">
                                        <v-checkbox density="compact" hide-details v-model="filtres.genres" :label="genre"
                                            :value="genre"></v-checkbox>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn @click="reinitialiserFiltres">Réinitialiser les filtres</v-btn>
                        </v-card-actions>
                    </v-card>
                </div>
            </v-col>
            <v-col cols="10">
                <v-row>
                    <v-col>
                        <div>
                            <v-pagination v-model="currentPage" :length="totalPages" @input="changePage"></v-pagination>
                        </div>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <!-- Affichage des produits -->
                        <div class="d-flex" :class="{ 'flex-wrap': !isHomePage }">
                            <div v-if="produitsParCategorieFiltre.length > 0" class="pa-2"
                                v-for="(produit, index) in itemsToShow" :key="index">

                                <v-card class="d-flex flex-column align-center" style="height: 400px; width: 300px;">
                                    <span class="pa-2 text-h6 border" style="height: 100px; width: 300px;">
                                        <p>{{ produit.nom }}</p>
                                    </span>

                                    <span class="text-center" style="height: 200px; width: 300px;">
                                        <router-link :to="'/produits/details-produit/' + produit.id">
                                            <img v-if="produit.image" :src="produit.image" alt="Image" class="pa-3"
                                                style="object-fit: cover; max-height: 100%; max-width: 100%;" />
                                        </router-link>
                                    </span>

                                    <span class="d-flex flex-column align-center py-4 border"
                                        style="height: 100px; width: 300px;">
                                        <p class="text-h7">{{ produit.prix }} $</p>
                                        <v-btn
                                            v-if="session && session.detailsUtilisateur && session.detailsUtilisateur.role !== 'administrateur'"
                                            @click="ajouterAuPanier(produit.id)" class="ma-1" icon="mdi-cart"
                                            title="Ajouter au panier"></v-btn>
                                    </span>
                                </v-card>
                            </div>
                            <div v-else>
                                <p class="pa-2 text-h6">Aucun produits ne corresponds à ces critères.</p>
                            </div>
                        </div>
                    </v-col>
                </v-row>


            </v-col>
        </v-row>
    </v-container>

    <SuggestionProduits v-if="!isHomePage" @refresh="initialize" />
</template>

<script>
import { fetchImages, fetchProduitsParCategorie, fetchGenres, fetchLangues } from '../../ServicesProduits';
import { ajouterAuPanier } from '../../ServicesPaniers'
import SuggestionProduits from './SuggestionProduits.vue';
import session from '../../session';
export default {
    components: {
        SuggestionProduits
    },
    props: {
        id: String,
        categorie: String
    },
    data: function () {
        return {
            session: session,
            isLoaded: false,
            produitsParCategorie: [],
            produitsParCategorieFiltre: [],
            genresProduits: [],
            languesProduits: [],
            currentPage: 1,
            itemsPerPage: 10, // Nombre d'éléments à afficher par page,
            filtres: {
                prixMin: null,
                prixMax: null,
                ageMin: null,
                ageMax: null,
                nbJoueursMin: null,
                nbJoueursMax: null,
                dureeMin: null,
                dureeMax: null,
                langues: [],
                genres: []
            }
        }
    },
    async mounted() {
        this.initialize();
        if (this.isHomePage) {
            this.itemsPerPage = 5;
        }

    },
    computed: {
        // Calculez le nombre total de pages en fonction du nombre d'articles et d'articles par page
        totalPages() {
            return Math.ceil(this.produitsParCategorieFiltre.length / this.itemsPerPage);
        },
        // Calculez les articles à afficher sur la page actuelle
        itemsToShow() {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            return this.produitsParCategorieFiltre.slice(startIndex, endIndex);
        },
        // Déterminez si vous êtes sur la page d'accueil en fonction de l'itinéraire actuel
        isHomePage() {
            return this.$route.path === '/';
        },
        filtresActifs() {
            return (
                this.filtres.prixMin !== null ||
                this.filtres.prixMax !== null ||
                this.filtres.ageMin !== null ||
                this.filtres.ageMax !== null ||
                this.filtres.nbJoueursMin !== null ||
                this.filtres.nbJoueursMax !== null ||
                this.filtres.dureeMin !== null ||
                this.filtres.dureeMax !== null ||
                this.filtres.langues.length > 0 ||
                this.filtres.genres.length > 0
            );
        }

    },
    methods: {
        // Fonction pour changer de page
        changePage(page) {
            this.currentPage = page;
        },
        appliquerFiltre() {
            // Copiez la liste complète des produits dans la liste filtrée
            this.produitsParCategorieFiltre = [...this.produitsParCategorie];

            // Appliquer le filtre par prix
            this.produitsParCategorieFiltre = this.produitsParCategorieFiltre.filter(produit => {
                const prix = produit.prix;
                const prixMin = this.filtres.prixMin;
                const prixMax = this.filtres.prixMax;

                // Vérifiez si les champs de prix sont vides ou non
                const prixMinValide = prixMin === null || prixMin === '' || isNaN(prixMin);
                const prixMaxValide = prixMax === null || prixMax === '' || isNaN(prixMax);

                // Vérifiez si le produit satisfait les critères de prix
                return (prixMinValide || prix >= parseFloat(prixMin)) &&
                    (prixMaxValide || prix <= parseFloat(prixMax));
            });

            // Appliquer le filtre par age
            this.produitsParCategorieFiltre = this.produitsParCategorieFiltre.filter(produit => {
                const age = produit.age;
                const ageMin = this.filtres.ageMin;
                const ageMax = this.filtres.ageMax;

                // Vérifiez si les champs d'age sont vides ou non
                const ageMinValide = ageMin === null || ageMin === '' || isNaN(ageMin);
                const ageMaxValide = ageMax === null || ageMax === '' || isNaN(ageMax);

                // Vérifiez si le produit satisfait les critères d'age
                return (ageMinValide || age >= parseFloat(ageMin)) &&
                    (ageMaxValide || age <= parseFloat(ageMax));
            });

            // Appliquer le filtre par nombre de joueurs
            this.produitsParCategorieFiltre = this.produitsParCategorieFiltre.filter(produit => {
                const nbJoueurs = produit.nb_joueurs;
                const nbJoueursMin = this.filtres.nbJoueursMin;
                const nbJoueursMax = this.filtres.nbJoueursMax;

                // Vérifiez si les champs d'age sont vides ou non
                const nbJoueursMinValide = nbJoueursMin === null || nbJoueursMin === '' || isNaN(nbJoueursMin);
                const nbJoueursMaxValide = nbJoueursMax === null || nbJoueursMax === '' || isNaN(nbJoueursMax);

                // Vérifiez si le produit satisfait les critères d'age
                return (nbJoueursMinValide || nbJoueurs >= parseFloat(nbJoueursMin)) &&
                    (nbJoueursMaxValide || nbJoueurs <= parseFloat(nbJoueursMax));
            });

            // Appliquer le filtre par durée
            this.produitsParCategorieFiltre = this.produitsParCategorieFiltre.filter(produit => {
                const duree = produit.temps_jeu_minutes;
                const dureeMin = this.filtres.dureeMin;
                const dureeMax = this.filtres.dureeMax;

                // Vérifiez si les champs d'age sont vides ou non
                const dureeMinValide = dureeMin === null || dureeMin === '' || isNaN(dureeMin);
                const dureeMaxValide = dureeMax === null || dureeMax === '' || isNaN(dureeMax);

                // Vérifiez si le produit satisfait les critères d'age
                return (dureeMinValide || duree >= parseFloat(dureeMin)) &&
                    (dureeMaxValide || duree <= parseFloat(dureeMax));
            });

            // Appliquer le filtre par langue
            if (this.filtres.langues.length > 0) {
                this.produitsParCategorieFiltre = this.produitsParCategorieFiltre.filter(produit => {
                    const langueProduitActuel = produit.langue;
                    const languesFiltre = this.filtres.langues;

                    return languesFiltre.includes(langueProduitActuel);
                });
            }

            // Appliquer le filtre par genre
            if (this.filtres.genres.length > 0) {
                this.produitsParCategorieFiltre = this.produitsParCategorieFiltre.filter(produit => {
                    const genreProduitActuel = produit.genre;
                    const genreFiltre = this.filtres.genres;

                    return (genreFiltre.length === 0 || genreFiltre.includes(genreProduitActuel));
                });
            }

            // Réinitialiser la pagination
            this.currentPage = 1;
        },
        reinitialiserFiltres() {
            // Réinitialiser les valeurs des filtres
            this.filtres.prixMin = null;
            this.filtres.prixMax = null;
            this.filtres.ageMin = null;
            this.filtres.ageMax = null;
            this.filtres.nbJoueursMin = null;
            this.filtres.nbJoueursMax = null;
            this.filtres.dureeMin = null;
            this.filtres.dureeMax = null;
            this.filtres.genres = [];
            this.filtres.langues = [];

            // Réinitialiser la liste des produits filtrés
            this.produitsParCategorieFiltre = this.produitsParCategorie;

            // Réinitialiser la pagination
            this.currentPage = 1;
        },
        async initialize() {
            this.produitsParCategorie = await fetchProduitsParCategorie(this.categorie);

            // Utilisez map pour générer un tableau de promesses
            const promises = this.produitsParCategorie.map(async (produit) => {
                const images = await fetchImages(produit.id);
                if (images.length <= 0) {
                    produit.image = "../../../public/images/produitSansImage.jpg";
                } else {
                    produit.image = images[0].data;
                }
                return produit; // Retournez le produit mis à jour
            });

            // Utilisez Promise.all pour attendre la résolution de toutes les promesses
            await Promise.all(promises);

            this.isLoaded = true;
            this.genresProduits = await fetchGenres();
            this.languesProduits = await fetchLangues();
            this.produitsParCategorieFiltre = this.produitsParCategorie;

        },
        async ajouterAuPanier(id) {
            await ajouterAuPanier(id, 1)
            this.$router.push({ path: '/panier' })
        }
    },
    watch: {
        'filtres.prixMin': 'appliquerFiltre',
        'filtres.prixMax': 'appliquerFiltre',
        'filtres.ageMin': 'appliquerFiltre',
        'filtres.ageMax': 'appliquerFiltre',
        'filtres.nbJoueursMin': 'appliquerFiltre',
        'filtres.nbJoueursMax': 'appliquerFiltre',
        'filtres.dureeMin': 'appliquerFiltre',
        'filtres.dureeMax': 'appliquerFiltre',
        'filtres.langues': 'appliquerFiltre',
        'filtres.genres': 'appliquerFiltre',
        '$route'(to, from) {

            this.$router.go()
        }
    }
}
</script>

<style>
.carousel {
    display: flex;
    overflow: hidden;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    /* animation: scroll 1s linear infinite; */
    /* Réglez le temps de défilement selon vos besoins */
}

.carousel-slide {
    flex: 0 0 auto;
    margin-right: 10px;
    /* Espace entre les images */
}

.carousel-image {
    width: 100px;
    /* Réglez la largeur des images selon vos besoins */
    height: auto;
    /* Pour conserver les proportions de l'image */
}

@keyframes scroll {
    0% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(-100%);
    }
}
</style>