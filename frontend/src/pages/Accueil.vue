<template >
    <div>
        <EnteteClient>Accueil</EnteteClient>
    </div>
    <v-container>
        <div class="ma-3" v-for="(categorie, index) in categories" :key="index">
            <v-card class="pr-16 bg-grey-lighten-5">
                <v-row class="w-100">
                    <v-col cols="2">
                        <div class="d-flex flex-column align-center">
                            <p class="ma-1 pt-6 text-h4">{{ categorie }}</p>
                            <router-link :to="'/produits/categorie/' + categorie">
                                <v-btn>Plus de produits</v-btn>
                            </router-link>
                        </div>
                    </v-col>
                    <v-col cols="10">
                        <ProduitsCategorie :categorie="categorie" />
                    </v-col>
                </v-row>
            </v-card>
        </div>
        <SuggestionProduits @refresh="initialize" />
    </v-container>
</template>

<script>
import { fetchCategories } from '../ServicesProduits';
import session from '../session';
import SuggestionProduits from './produits/SuggestionProduits.vue';
import ProduitsCategorie from './produits/ProduitsCategorie.vue';
import EnteteClient from './client/components/enteteclient.vue';



export default {
    components: {
        SuggestionProduits,
        ProduitsCategorie,
        EnteteClient
    },
    props: {
        id: String
    },
    data: function () {
        return {
            session: session,
            isLoaded: false,
            textFieldValue: 0,
            categories: []
        }
    },
    async mounted() {
        this.initialize();
    },
    methods: {
        async initialize() {
            this.categories = await fetchCategories();
        }
    }
}
</script>

<style></style>
