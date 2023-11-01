<template>
    <v-container>
        <v-row v-if="isLoaded" no-gutters>
            <v-col cols="12">
                <div class="pa-3 text-h4 text-center">D'autres produits à découvrir!</div>
            </v-col>
            <v-row class="d-flex">
                <v-col class="carousel justify-center" cols="12">
                    <div v-for="(produit, index) in produits" :key="index" class="carousel-slide w-auto">
                        <router-link :to="'/produits/details-produit/' + produit.id">
                            <img @click="$emit('refresh', produit.id)" v-if="produit.image" :src="produit.image.data"
                                alt="Image" :height="200" class="border rounded-lg carousel-slide pa-2" />
                        </router-link>
                    </div>
                </v-col>
            </v-row>
        </v-row>
    </v-container>
</template>

<script>
import { fetchImages, fetchProduitsAleatoires } from '../../ServicesProduits';

export default {
    props: {
        id: String
    },
    data: function () {
        return {
            isLoaded: false,
            produits: []
        }
    },
    async mounted() {
        this.produits = await fetchProduitsAleatoires();
        Promise.all(this.produits.map(produit => {
            fetchImages(produit.id).then(images => {
                produit.image = images[0]
                return produit
            })
        })).then(() => {
            this.isLoaded = true
        })
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
}

.carousel-slide {
    flex: 0 0 auto;
    margin-right: 10px;
}

.carousel-image {
    width: 100px;
    height: auto;
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