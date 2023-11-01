<template>
    <header>
        <v-sheet>
            <v-row no-gutters>
                <v-col>
                    <v-sheet>
                        <router-link to="/"><v-img max-height="5rem" cover src="../../images/logo.jpg"
                                alt="logo"></v-img></router-link>
                    </v-sheet>
                </v-col>
                <v-col class="d-flex align-center justify-center">
                    <v-sheet class="d-flex align-center">
                        <v-btn type="button" @click="">Francais</v-btn>
                        <v-spacer>|</v-spacer>
                        <v-btn type="button" @click="">Anglais</v-btn>
                    </v-sheet>
                </v-col>
                <v-col cols="3" class="d-flex align-center justify-center">
                    <v-sheet>
                        <v-text-field id="champRecherche" density="compact" hide-details clearable class="relative"
                            style="width: 300px;" v-model="recherche" placeholder="Rechercher un produit"
                            prepend-icon="mdi-magnify" @mouseover="isFocus" @focus="isFocus" @blur="isBlur"
                            @mouseout="isBlurOut"></v-text-field>

                        <v-card :elevation="14" class="absolute overflow-auto bg-grey-lighten-5 pa-2 border"
                            style="position: absolute; z-index: 3; max-height: 600px; width: 500px;"
                            v-if="recherche && focus">
                            <div v-if="recherche" @mouseover="preventBlur = true" @mouseout="preventBlur = false">
                                <div v-if="produitsFiltre.length > 0" @mouseover="preventBlur = true"
                                    @mouseout="preventBlur = false" v-for="(produit, index) in produitsFiltre" :key="index">
                                    <a :href="'/produits/details-produit/' + produit.id" class="deco-liens">
                                        <v-row no-gutters>
                                            <v-col cols="2" class="text-center pa-1 d-flex align-center">
                                                <v-img :src="produit.image" alt="Image" max-width="100%"
                                                    max-height="100%"></v-img>
                                            </v-col>

                                            <v-col cols="10" class="pa-6">
                                                <p class="product-name">{{ produit.nom }}</p>
                                                <p>{{ produit.prix }} $</p>
                                            </v-col>
                                        </v-row>
                                    </a>
                                    <v-divider></v-divider>
                                </div>
                                <div v-else>
                                    <p>Aucun produit ne corespond à la recherche</p>
                                </div>
                            </div>
                        </v-card>
                    </v-sheet>
                </v-col>
                <v-col class="d-flex align-center justify-end">
                    <div v-if="session.detailsUtilisateur">
                        <div class="d-flex align-center justify-end">
                            <div v-if="session.detailsUtilisateur.role === 'administrateur'"
                                class="flex-grow-1 flex-shrink-0 pa-3">Bienvenue, {{
                                    session.detailsUtilisateur.nom }} (admin)
                            </div>
                            <div v-else class="flex-grow-1 flex-shrink-0 pa-3">Bienvenue, {{
                                session.detailsUtilisateur.prenom }} </div>
                            <div class="d-flex">
                                <v-btn class="ma-1" to="/client/tableau-de-bord" icon="mdi-account"
                                    title="Mon compte"></v-btn>
                                <v-btn v-if="session.detailsUtilisateur.role !== 'administrateur'" class="ma-1" to="/panier"
                                    icon="mdi-cart" title="Mon panier"></v-btn>
                                <v-btn @click="deconnexion" class="ma-2">Se déconnecter</v-btn>
                            </div>
                        </div>
                    </div>
                    <v-sheet v-else>
                        <v-btn to="/client/connexion" class="d-flex align-center mr-8 ">Se connecter</v-btn>
                    </v-sheet>
                </v-col>
            </v-row>

            <v-row no-gutters>
                <v-col>
                    <v-btn to='/produits/categorie/Accessoires' class="d-flex align-center">Accessoires</v-btn>
                </v-col>
                <v-col>
                    <v-btn to='/produits/categorie/Jeux de société' class="d-flex align-center">Jeux de société</v-btn>
                </v-col>
                <v-col>
                    <v-btn to='/produits/categorie/Jouets' class="d-flex align-center">Jouets</v-btn>
                </v-col>
                <v-col>
                    <v-btn to='/produits/categorie/Librairie' class="d-flex align-center">Librairie</v-btn>
                </v-col>
                <v-col>
                    <v-btn to='/produits/categorie/Figurines' class="d-flex align-center">Figurines</v-btn>
                </v-col>
            </v-row>

        </v-sheet>

    </header>
</template>

<script>

import session from '../session';
import { fetchProduits, fetchImages } from '../ServicesProduits';
let champRecherche = null;

export default {

    data: function () {
        return {
            session: session,
            produits: [],
            recherche: "",
            focus: false,
            preventBlur: false
        };
    },
    async mounted() {
        champRecherche = document.getElementById('champRecherche');
        this.produits = await fetchProduits();

        const promises = this.produits.map(async (produit) => {
            const images = await fetchImages(produit.id);
            if (images.length <= 0) {
                produit.image = "../../../public/images/produitSansImage.jpg";
            } else {
                produit.image = images[0].data;
            }
            return produit;
        });

    },
    methods: {
        deconnexion() {
            this.$router.replace('/client/tableau-de-bord/logout');
        },
        reset() {
            this.recherche = "";
        },
        isFocus() {
            champRecherche.focus();
            this.focus = true;
        },
        isBlur() {
            if (!this.preventBlur) {
                this.focus = false;
            }
        },
        isBlurOut() {
            if (this.recherche) {
                this.focus = true;
            } else {
                this.focus = false;
            }
        }
    },
    computed: {

        produitsFiltre() {
            return this.produits.filter((produit) =>
                produit.nom.toLowerCase().includes(this.recherche.toLowerCase())
            );
        }
    }
};

</script>

<style>
.no-decoration {
    text-decoration: none;
    color: #000;
}

.product-name {
    max-height: 40px;
    /* Ajustez la hauteur maximale selon vos besoins */
    overflow: hidden;
    text-overflow: ellipsis;
    /* Optionnel : ajoute des points de suspension si le texte est coupé */
    white-space: nowrap;
    /* Empêche le texte de passer à la ligne */
}

.deco-liens {
    text-decoration: none;
    color: #000;
}
</style>