<template>
    <v-list-item  >
        <v-card class="ma-2 pa-2">
            <v-row class="d-flex align-center">
                <v-col cols="4" >
                    <v-img  :height="150" :src="image"></v-img>
                </v-col>
                <v-col cols="8">
                    <div><router-link :to="`/produits/details-produit/${produit.id}`"><strong>{{ produit.nom }}</strong></router-link></div>
                    <div class="d-flex align-center ma-3 ml-0">
                        <v-btn @click="reduireQuantite" :disabled="produit.quantite <= 1" density="compact" icon="mdi-minus"></v-btn>
                        <div class="mx-4"><strong>{{ produit.quantite }}</strong></div>
                        <v-btn @click="augmenteQuantite" :disabled="produit.quantite >= produit.quantiteDisponible" density="compact" icon="mdi-plus"></v-btn>
                        <div class="ml-3">@ {{ produit.prix }}$</div>
                    </div>
                    <div class="d-flex justify-end ma-3"><v-btn @click="retirer" density="compact" icon="mdi-delete"></v-btn></div>
                </v-col>
            </v-row>
        </v-card>
    </v-list-item>
</template>

<script>
import { modifierQuantiteProduit, retirerProduit } from '../../../ServicesPaniers'
import { fetchImages } from '../../../ServicesProduits'

export default{
    props: {
        produit: Object,
    },
    data: function () {
        return {
            image: "/public/images/produitSansImage.jpg"
        }
    },
    methods:{
        async reduireQuantite(){
            await modifierQuantiteProduit(this.produit.id, this.produit.quantite - 1)
            this.$emit('updatePanier')
        },
        async augmenteQuantite(){
            await modifierQuantiteProduit(this.produit.id, this.produit.quantite + 1)
            this.$emit('updatePanier')
        },
        async retirer(){
            await retirerProduit(this.produit.id)
            this.$emit('updatePanier')
        },
        async getProductImage(){
            //TODO create a api call to return only the first image, 
            // no need to fetch all images just to show a thumbnail.
            const images = await fetchImages(this.produit.id)
            if(images.length > 0){
                this.image = images[0].data
            }
        }
    },
    mounted(){
        this.getProductImage()
    }
}
</script>