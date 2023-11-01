<template>
    <div v-if="session && session.detailsUtilisateur && session.detailsUtilisateur.role !== 'administrateur' && loaded">
        <EnteteClient>Caisse</EnteteClient>
        <v-container>
            <SommairePanier :produits="produits"></SommairePanier>
            <InformationsLivraison></InformationsLivraison>
            <MethodesPaiement @updateMethodePaiement="updateMethodePaiement" @updateGeekoPoints="updateGeekoPointsUsage" :getGeekoPointsValue="getGeekoPointsValue"></MethodesPaiement>
            <v-row v-if="session?.detailsUtilisateur?.adresseActive">
                <v-col>
                    <v-card color="#EEEEEE">
                        <v-card class="ma-5">
                            <v-card-title class="title my-2"><strong>Sommaire</strong></v-card-title>
                            <v-card-text class="headline">
                                <div class="my-3 d-flex flex-row justify-space-between">
                                    <span>Sous Total: </span><span>{{ getSousTotal().toFixed(2) }}$</span>
                                </div>
                                <div v-if="hasGST()" class="my-3 d-flex flex-row justify-space-between">
                                    <span>GST: </span><span>{{ getGST().toFixed(2) }}$</span>
                                </div>
                                <div v-if="hasPST()" class="my-3 d-flex flex-row justify-space-between">
                                    <span>PST: </span><span>{{ getPST().toFixed(2) }}$</span>
                                </div>
                                <div v-if="hasHST()" class="my-3 d-flex flex-row justify-space-between">
                                    <span>HST: </span><span>{{ getHST().toFixed(2) }}$</span>
                                </div>
                                <div class="my-3 d-flex flex-row justify-space-between">
                                    <span>Geeko points utilisés (tranches de 5$, max sous total):</span><span>-{{ useGeekoPoints ? getMaxUsablePoints().toFixed(2) : '0.00' }}$</span>
                                </div>
                                <div class="my-3 d-flex flex-row justify-space-between">
                                    <span>Total: </span><span>{{ getTotal().toFixed(2) }}$</span>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-card>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-card color="#EEEEEE">
                        <v-card class="ma-5">
                            <v-card-actions class="justify-space-between pa-4">
                                <v-btn class="retour" @click="this.$router.push('panier')"><strong>Retour au Panier</strong></v-btn>
                                <v-btn :disabled="methodeDePaiement === null || !session?.detailsUtilisateur?.adresseActive || produits.length === 0" @click="soumettreCommande"><strong>Soumettre</strong></v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
    <div v-else>
        <v-container>
            <v-row>
                <v-col>
                    <p>Cette page est seulement accessible aux utilisateurs connectés.</p>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
import session from '../../session'
import { getPanier, getGeekoPoints } from '../../ServicesPaniers'
import { soumettreCommande } from '../../CommandeService'
import EnteteClient from './components/EnteteClient.vue'
import SommairePanier from './components/SommairePanier.vue'
import InformationsLivraison from './components/InformationsLivraison.vue'
import MethodesPaiement from './components/MethodesPaiement.vue'

export default {
    components: {
        EnteteClient,
        SommairePanier,
        InformationsLivraison,
        MethodesPaiement,
    },
    data: function() {
        return {
            loaded: false,
            session: session,
            produits: [],
            methodeDePaiement: null,
            useGeekoPoints: false,
        }
    },
    watch:{
        'session.detailsUtilisateur':{
            handler(newVal, oldVal) {
                this.fetchProduits()
            }
        }
    },
    methods: {
        async fetchProduits(){
            this.produits = await getPanier()
            this.loaded = true
        },
        updateMethodePaiement(methodeDePaiement){
            this.methodeDePaiement = methodeDePaiement
        },
        updateGeekoPointsUsage(geekoPointsUsage){
            this.useGeekoPoints = geekoPointsUsage
        },
        async soumettreCommande() {
            const response = await soumettreCommande(this.useGeekoPoints)
            if(response.id) {
                this.$router.push({ 
                    path: '/client/tableau-de-bord/admin/commandes', 
                    query: { alertVisible: true } 
                });
            }
            else{
                this.$router.push('/panier')
            }
        },
        getSousTotal() {
            let sousTotal = 0
            this.produits.forEach(produit => {
                sousTotal += produit.prix * produit.quantite
            })
            return sousTotal
        },
        getGeekoPointsValue(){
            const points = this.session.detailsUtilisateur.pointsFidelite
            const numberOfSlices = Math.floor(points / 5000)
            return numberOfSlices * 5
        },
        getMaxUsablePoints(){
            const allowedPointsValue = Math.floor(this.getSousTotal() / 5) * 5
            const totalPointValue = this.getGeekoPointsValue()
            return (totalPointValue <= allowedPointsValue ? totalPointValue : allowedPointsValue)
        },
        getPST() {
            switch(session.detailsUtilisateur.province){
                case 'BC':
                    return this.getSousTotal() * 0.07
                case 'MB':
                    return this.getSousTotal() * 0.07
                case 'QC':
                    return this.getSousTotal() * 0.09975
                case 'SK':
                    return this.getSousTotal() * 0.06
                default:
                    return 0
            }
        },
        getGST() {
            switch(session.detailsUtilisateur.province){
                case 'AB':
                    return this.getSousTotal() * 0.05
                case 'BC':
                    return this.getSousTotal() * 0.05
                case 'MB':
                    return this.getSousTotal() * 0.05
                case 'NT':
                    return this.getSousTotal() * 0.05
                case 'NU':
                    return this.getSousTotal() * 0.05
                case 'QC':
                    return this.getSousTotal() * 0.05
                case 'SK':
                    return this.getSousTotal() * 0.05
                case 'YT':
                    return this.getSousTotal() * 0.05
                default:
                    return 0
            }
        },
        getHST() {
            switch(session.detailsUtilisateur.province){
                case 'NB':
                    return this.getSousTotal() * 0.15
                case 'NL':
                    return this.getSousTotal() * 0.15
                case 'NS':
                    return this.getSousTotal() * 0.15
                case 'ON':
                    return this.getSousTotal() * 0.13
                case 'PE':
                    return this.getSousTotal() * 0.15
                default:
                    return 0
            }
        },
        getTotal() {
            let total = this.getSousTotal()
            if(this.hasGST())
                total += this.getGST()
            if(this.hasPST())
                total += this.getPST()
            if(this.hasHST())
                total += this.getHST()
            if(this.useGeekoPoints){
                total -= this.getMaxUsablePoints()
            }
            return total
        },
        hasPST(){
            const p = session.detailsUtilisateur.province
            return p === 'BM' || p === 'MB' || p === 'QC' || p === 'SK'
        },
        hasGST(){
            const p = session.detailsUtilisateur.province
            return p === 'AB' || p === 'BC' || p === 'MB' || p === 'NT'
                    || p === 'NU' || p === 'QC' || p === 'SK' || p === 'YT'
        },
        hasHST(){
            const p = session.detailsUtilisateur.province
            return p === 'NB' || p === 'NL' || p === 'NS' || p === 'ON' || p === 'PE'
        },
    },
    mounted(){
        if(this.session.detailsUtilisateur){
            this.fetchProduits()
        }
    }
}
</script>

<style scoped>
.v-btn {
    background-color: lightgray !important;
    color: blueviolet !important; 
}
.v-btn.retour{
    color: red !important; 
}
.headline {
    font-size: 20px;
}
.title{
    font-size: 25px;
}
</style>