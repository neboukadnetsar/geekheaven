<template>
    <v-sheet v-if="detailsUtilisateurRole">
        <h1>Liste des commandes</h1>
        <span style="font-size: x-large;">Statut :</span>
        <label v-for="status in statusList" :key="status">
            <input type="radio" :value="status" v-model="ordersStatus" name="status"/>
            <span>{{ status }}</span>
        </label>
        <ListeCommandesAdmin :ordersStatus="ordersStatus" :detailsUtilisateurRole="detailsUtilisateurRole" :courriel="courriel"></ListeCommandesAdmin>

    </v-sheet>
    <v-dialog v-model="dialogue" width="auto" theme="dark"
        :persistent="authErrorMessage ? true : false">
        <v-alert v-if="authErrorMessage" type="warning" v-model="dialogue" border="start" close-label="Close Alert"
            color="red-lighten-3" class="text-h4" rounded="lg">
            {{ authErrorMessage }}
            <div align="center">
                <v-btn class="mt-2" color="red-darken-3" rounded="lg" @click="dialogue = false">Ok</v-btn>
            </div>
        </v-alert>
        <!-- <v-alert v-else-if="!mdpIsEditing" type="success" v-model="dialogue" border="start" close-label="Close Alert"
            closable color="blue-lighten-2" class="text-h4" rounded="lg">
            {{ `Infos enregistrées avec succès !` }}
        </v-alert>
        <v-alert v-else type="success" v-model="dialogue" border="start" close-label="Close Alert" color="blue-lighten-2"
            class="text-h4" rounded="lg">
            {{ `Infos enregistrées avec succès, veuillez vous ré-authentifier avec le nouveau mot de passe.` }}
            <div align="center">
                <v-btn class="mt-2" color="light-blue-darken-4" rounded="lg" @click="seReAuthentifier">CLiquer afin
                    d'Accéder à la page d'authentification</v-btn>
            </div>
        </v-alert> -->
    </v-dialog>
</template>

<script>
import ListeCommandesAdmin from '../../components/ListeCommandesAdmin.vue'
import session from '../../../../session';
import { watch } from 'vue';
import { getCurrentInstance } from 'vue';

export default {
    components: {
        ListeCommandesAdmin
    },
    data() {
        return {
            detailsUtilisateurRole: null,
            courriel: null,

            dialogue: false,
            // dialogue409: false,
            authErrorMessage: '',

            // session: session,
            statusList: [
                'Tous',
                'CONFIRMEE',
                'ENVOYEE',
                'SUPPRIMEE'
            ],
            ordersStatus: 'Tous'
        }
    },
    setup() {
        const instance = getCurrentInstance();
        watch(() => session.loaded, (newValue, oldValue) => {
            // console.log(`Le message a changé de ${oldValue} à ${newValue}`);
            if (newValue === true) {
                // if (instance.data.dialogue409 === false) {
                //     instance.data.dialogue = false; //?????????????????????????
                // }
                instance.data.dialogue = false;
                instance.data.detailsUtilisateurRole = session.detailsUtilisateur.role;
                instance.data.courriel = session.courriel;
            }
            else {

            }
        });
    },
    mounted() {
        if (session.loaded === true) {
            this.detailsUtilisateurRole = session.detailsUtilisateur.role;
            this.courriel = session.courriel;
        }
        else {
            this.authErrorMessage = 'Vous devez être connecté pour voir cette page !';
            this.dialogue = true;
        }
    }
}
</script>

<style scoped>
input[type="radio"] {
    margin: 0 5px 0 30px;
}
</style>