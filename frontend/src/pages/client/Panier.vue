<template>
    <div v-if="session && session.detailsUtilisateur && session.detailsUtilisateur.role !== 'administrateur' && loaded">
        <EnteteClient>Votre panier</EnteteClient>
        <v-container>
            <v-row>
                <v-col cols="8">
                    <v-card color="#EEEEEE">
                        <v-virtual-scroll
                            :items="produits"
                            :height="600"
                            :item-height="200"
                        >
                            <template v-slot:default="{ item }">
                                <ProduitPanier @updatePanier="initialize" :produit="item"></ProduitPanier>
                            </template>
                        </v-virtual-scroll>
                    </v-card>
                </v-col>
                <v-col cols="4">
                    <v-card color="#EEEEEE" :height="600">
                        <div color="#FFFFFF" class="d-flex flex-column justify-space-between h-100">
                            <div class="text-h3 font-weight-black ma-3">Sommaire</div>
                            <div class="ma-3 d-flex flex-column justify-space-evenly h-75 text-h5">
                                <div class="d-flex justify-space-between"><span>Sous Total: </span><span>{{ getSousTotal().toFixed(2) }}$</span></div>
                                <div class="d-flex justify-space-between"><span>Récompense Geeko Points: <!--TODO reduire les geekos point utilise du total pour calculer rewards--> </span><span>{{ Math.floor(getSousTotal() * 10) }}</span></div>
                            </div>
                            <div class="ma-3 d-flex justify-space-between">
                                <v-btn @click="viderPanier" :disabled="produits.length === 0" color="red">Vider Panier</v-btn>
                                <v-btn @click="passerALaCaisse" :disabled="produits.length === 0" color="green">Aller à la caisse</v-btn>
                            </div>
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
import { getPanier, retirerProduit } from '../../ServicesPaniers'
import session from '../../session'
import EnteteClient from './components/EnteteClient.vue'
import ProduitPanier from './components/ProduitPanier.vue'

export default {
    components: {
        EnteteClient,
        ProduitPanier,
    },
    data: function() {
        return {
            loaded: true,
            session: session,
            produits: []
        }
    },
    watch:{
        'session.detailsUtilisateur':{
            handler(newVal, oldVal) {
                this.initialize()
            }
        }
    },
    methods: {
        async initialize(){
            this.produits = []
            this.produits = await getPanier()
            this.loaded = true
        },
        getSousTotal(){
            let sousTotal = 0
            this.produits.forEach(produit => {
                sousTotal += produit.prix * produit.quantite
            })
            return sousTotal
        },
        viderPanier(){
            Promise.all(this.produits.map(produit => {
                return retirerProduit(produit.id)
            })).then(result => {
                this.produits = []
            }).catch(err => {
                console.log(err)
            })
        },
        passerALaCaisse(){
            this.$router.push('caisse')
        }
    },
    async mounted(){
        if(this.session.detailsUtilisateur){
            this.initialize()
        }
    }
}
</script>

