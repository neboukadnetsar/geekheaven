<template >
    <v-container>
        <v-row no-gutters>
            <v-col cols="6">
                <div v-if="produit.langue_langue" class="text-h2">{{ produit.nom + "(" + produit.langue_langue + ")" }}
                </div>
                <div v-else class="text-h2">{{ produit.nom }} </div>
                <div class="text-h5">{{ "UPC : " + produit.upc }} </div>
            </v-col>

            <v-col class="d-flex align-center justify-center" cols="6">
                <v-sheet v-if="session.detailsUtilisateur">
                    <v-sheet v-if="session.detailsUtilisateur.role === 'administrateur'">
                        <v-btn :to="'/produits/modifier-produit/' + produit.id"
                            class="bg-red-darken-1 text-white">Modifier</v-btn>
                    </v-sheet>
                </v-sheet>
                <v-spacer></v-spacer>
            </v-col>
        </v-row>

        <v-row no-gutters>
            <v-spacer></v-spacer>
            <v-col cols="3">
                <v-card outlined color="grey-lighten-5" class="pa-3 bg-color=red">
                    <v-carousel hide-delimiter-background :key="carouselKey" :cycle="true" :interval="4000" v-if="isLoaded"
                        show-arrows="hover">
                        <v-carousel-item v-for="(image, index) in imagesProduit" :key="index">
                            <div class="carousel-image-wrapper">
                                <v-img max-height="450" :src="image.data" alt="Image du produit"
                                    @click="openImageModal(image.data)">
                                    <template v-slot:placeholder>
                                        <div>
                                            <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                                        </div>
                                    </template>
                                </v-img>
                            </div>
                        </v-carousel-item>
                    </v-carousel>
                </v-card>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="6">
                <div class="text-h5 py-3">{{ produit.prix + " $" }} </div>
                <v-row class="d-flex align-center" no-gutters>
                    <v-col>
                        <v-sheet class="d-flex align-center" v-if="session.detailsUtilisateur">
                            <div v-if="session.detailsUtilisateur.role !== 'administrateur'" class="d-flex">
                                <v-form ref="form">
                                    <div class="d-flex justify-space-between">
                                        <v-text-field type="number" v-model.number="quantite" min="1"
                                            :max="produit.quantite_disponible" class="d-flex align-center w-1 "
                                            :rules="[quantiteRule]" label="Quantité"></v-text-field>
                                        <v-btn @click="validate" class="bg-blue-darken-1 text-white">Ajouter au
                                            panier</v-btn>
                                    </div>
                                </v-form>

                            </div>
                        </v-sheet>

                        <v-sheet width="25em" v-else>
                            <v-btn to="/client/connexion" class="d-flex align-center">Se connecter pour ajouter au
                                panier</v-btn>
                        </v-sheet>
                    </v-col>
                </v-row>
                <v-row no-gutters class="py-3">
                    <v-col>
                        <div>
                            <p>{{ "UPC : " + produit.upc }}</p>
                        </div>

                        <div v-if="produit.categorie_nom === 'Librairie'">
                            <p v-if="produit.isbn">{{ "ISBN : " + produit.isbn }}</p>
                            <p v-if="produit.nb_pages">{{ "Nombre de pages : " + produit.nb_pages }}</p>
                        </div>

                        <div v-if="produit.categorie_nom === 'Jeux de société' || produit.categorie_nom === 'Extensions'">
                            <p v-if="produit.nb_joueurs">{{ "Nombre de joueurs : " + produit.nb_joueurs }}</p>
                            <p v-if="produit.temps_jeu_minutes">{{ "Durée : " + produit.temps_jeu_minutes }}</p>
                        </div>
                        <div
                            v-if="produit.categorie_nom === 'Jeux de société' || produit.categorie_nom === 'Extensions' || produit.categorie_nom === 'Librairie' || produit.categorie_nom === 'Jeux de rôle'">
                            <p v-if="produit.age">{{ "Age : " + produit.age }}</p>
                            <p v-if="produit.auteur">{{ "Auteur : " + produit.auteur }}</p>
                            <p v-if="produit.langue_langue">{{ "Langue : " + produit.langue_langue }}</p>
                            <p v-if="produit.genres_jeux_livre_nom">{{ "Genre : " + produit.genres_jeux_livre_nom }}</p>
                        </div>

                        <div class="text-h5 py-3">Description </div>
                        <p v-if="produit.description" class="border">{{ produit.description }}</p>
                        <p v-else class="border">Se produit n'a pas de description</p>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <!-- Fentetre modale lorsque l'on clique sur une image du caroussel principal -->
        <v-dialog v-model="isImageModalOpen" max-width="600">
            <v-img :src="selectedImage" max-height="500"></v-img>
            <v-btn @click="closeImageModal">Fermer</v-btn>
        </v-dialog>

        <SuggestionProduits @refresh="initialize" />
    </v-container>
</template>

<script>
import { fetchProduit, fetchImages } from '../../ServicesProduits';
import { ajouterAuPanier } from '../../ServicesPaniers';
import session from '../../session';
import SuggestionProduits from './SuggestionProduits.vue';


export default {
    components: {
        SuggestionProduits
    },
    props: {
        id: String
    },
    data: function () {
        return {
            carouselKey: 0,
            session: session,
            isLoaded: false,
            produit: {},
            produits: [],
            quantite: 1,
            componentKey: 0,
            selectedImage: '',      // URL de l'image ouverte
            isImageModalOpen: false // Contrôle la visibilité de la fentetre modale
        }
    },
    async mounted() {
        this.initialize(this.id);
    },
    methods: {
        openImageModal(imageSrc) {
            this.selectedImage = imageSrc;
            this.isImageModalOpen = true;
        },
        closeImageModal() {
            this.isImageModalOpen = false;
        },
        quantiteRule(value) {
            if (isNaN(value) || value <= 0 || value % 1 !== 0) {
                return "Quantité invalide"
            }
            if (value <= 0 || value > this.produit.quantite_disponible) {
                return `Quantité maximale ${this.produit.quantite_disponible}`
            }
            return true
        },
        async validate() {
            const { valid } = await this.$refs.form.validate()
            if (valid) {
                this.ajouter()
            } else {
                alert('Quantité invalide')
            }
        },
        async ajouter() {
            if (await ajouterAuPanier(this.produit.id, this.quantite))
                this.$router.push({ path: '/panier' })
        },
        async initialize(id) {
            this.produit = await fetchProduit(id);
            this.imagesProduit = await fetchImages(id);
            if (this.imagesProduit.length === 0) {
                this.imagesProduit[0] = { data: "../../../public/images/produitSansImage.jpg" };
            }
            if (this.imagesProduit.length >= 0) {
                this.isLoaded = true;
                // Mise à jour la clé du carrousel pour forcer le rafraîchissement
                this.carouselKey += 1;
            }
        }
    }
}
</script>

<style>
.carousel-image-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 90%;
}
</style>
