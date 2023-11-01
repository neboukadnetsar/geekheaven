<template>
    <v-row>
        <v-col>
            <v-card color="#EEEEEE">
                <v-card v-if="session?.detailsUtilisateur?.adresseActive" class="ma-5">
                    <v-card-title class="title my-2"><strong>Informations de livraison</strong></v-card-title>
                    <v-card-text class="headline">
                        <div class="my-2">
                            <span><strong>{{ session?.detailsUtilisateur?.prenom }}</strong></span>
                            <span class="ml-2"><strong>{{ session?.detailsUtilisateur?.nom }}</strong></span>
                        </div>
                        <div class="my-1">
                            <span>{{ session?.detailsUtilisateur?.numeroCivique }}</span>
                            <span class="ml-1">{{ session?.detailsUtilisateur?.rue }}</span>
                        </div>
                        <div class="my-1">{{ session?.detailsUtilisateur?.ville }}</div>
                        <div class="my-1">
                            <span>{{ session?.detailsUtilisateur?.province + ',' }}</span>
                            <span class="ml-1">{{ session?.detailsUtilisateur?.codePostal }}</span>
                        </div>
                    </v-card-text>
                    <v-card-actions class="justify-end pa-4">
                        <v-btn @click="this.$router.push('client/tableau-de-bord/adresse')"><strong>Modifier</strong></v-btn>
                    </v-card-actions>
                </v-card>
                <v-card v-else class="ma-5">
                    <v-card-title><strong>Informations de livraison</strong></v-card-title>
                    <v-card-text>
                        <p>Vous n'avez pas d'adresse enregistré au compte. Veuillez entrer une adresse pour commander.</p>
                    </v-card-text>
                    <v-card-actions class="justify-end pa-4">
                        <v-btn @click="this.$router.push('client/tableau-de-bord/adresse')"><strong>Ajouter Adresse</strong></v-btn>
                    </v-card-actions>
                </v-card>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import session from '../../../session'
export default {
    data() {
        return{
            session: session,
        }
    },
    methods: {
        print(){
            console.log(session?.detailsUtilisateur?.adresseActive)
        }
    }
}
</script>

<style scoped>
.v-btn {
    background-color: lightgray !important;
    color: blueviolet !important; 
}
.headline {
    font-size: 20px;
}
.title{
    font-size: 25px;
}
</style>