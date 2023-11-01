<template>
    <v-row>
        <v-col>
            <v-card color="#EEEEEE">
                <v-virtual-scroll
                    :items="produits"
                    :height="450"
                    :item-height="150"
                >
                    <template v-slot:default="{ item }">
                        <v-list-item>
                            <v-card class="ma-2 pa-2">
                                <v-row class="d-flex align-center justify-space-between">
                                    <v-col cols="4">
                                        <v-img :height="125" :src="productImages[item.id] || defaultImage"></v-img>
                                    </v-col>
                                    <v-col cols="8">
                                        <div><strong>{{ item.nom }}</strong></div>
                                        <div class="d-flex align-center ma-3 ml-0">
                                            <div><strong>Quantité: {{ item.quantite }}</strong></div>
                                            <div class="ml-5"><strong>Prix: {{ item.prix }}$</strong></div>
                                        </div>
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-list-item>
                    </template>
                </v-virtual-scroll>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import { fetchImages } from '../../../ServicesProduits';

export default {
    props: {
        produits: Array
    },
    data() {
        return {
            productImages: {},
            defaultImage: '/public/images/produitSansImage.jpg'
        };
    },
    methods: {
        async fetchAndSetProductImage(id) {
            const images = await fetchImages(id);
            if (images.length > 0) {
                this.productImages[id] = images[0].data;
            } else {
                this.productImages[id] = this.defaultImage;
            }
        }
    },
    mounted() {
        this.produits.forEach(product => {
            this.fetchAndSetProductImage(product.id);
        });
    }
}
</script>
