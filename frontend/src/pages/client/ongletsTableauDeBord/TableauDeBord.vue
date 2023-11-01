<template>
    <div v-if="detailsUtilisateurRole === 'utilisateur'">
        <v-row>
            <v-col>
                <div class="d-flex justify-start">
                    <div class="flex-grow-1">
                        <v-card class="mx-auto" variant="outlined" rounded="xl" height="275">
                            <v-card-item prepend-icon="mdi-map-marker">
                                <v-card-title>Adresse</v-card-title>
                            </v-card-item>
                            <v-card-text v-if="adresseActive">
                                <v-list :items="items" density="compact"></v-list>
                            </v-card-text>
                            <v-card-text v-else>
                                <span class="color">Aucune adresse valide associée au compte !</span>
                            </v-card-text>
                            <v-card-actions>
                                <router-link to="/client/tableau-de-bord/adresse"
                                    @click="$emit('forceRerender')">Modifier</router-link>
                            </v-card-actions>
                        </v-card>
                    </div>
                    <v-divider class="ma-6 border-opacity-50" vertical :thickness="4" color="info"></v-divider>
                    <div class="flex-grow-1">
                        <v-card class="mx-auto" variant="outlined" rounded="xl" height="275">
                            <v-card-item prepend-icon="mdi-email-newsletter">
                                <v-card-title>Infoletttre</v-card-title>
                            </v-card-item>
                            <v-card-text v-if="infolettre">
                                <span class="text-h6">Vous êtes abonné à notre infolettre !</span>
                            </v-card-text>
                            <v-card-text v-else>
                                <span class="color">Vous n'êtes pas abonné à l'infolettre !</span>
                            </v-card-text>
                            <v-card-actions>
                                <router-link to="/client/tableau-de-bord/infolettre">Modifier</router-link>
                            </v-card-actions>
                            <v-divider class="ma-2 border-opacity-50" :thickness="2" color="info"></v-divider>
                            <v-card-item prepend-icon="mdi-account-cash">
                                <v-card-title>Infoletttre</v-card-title>
                            </v-card-item>
                            <v-card-text>
                                <span class="text-h6">Points accumulés : {{ pointsGeeko }}</span>
                            </v-card-text>
                        </v-card>
                    </div>
                </div>
                <v-divider class="ma-6 border-opacity-50" :thickness="4" color="info"></v-divider>

                <!-- <p>Rajouter ici pour superposer</p> -->
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-sheet class="pa-2">
                    <!-- <p>test</p> -->
                </v-sheet>
            </v-col>
        </v-row>
    </div>
    <div v-else-if="detailsUtilisateurRole === 'administrateur'">
        <v-row>
            <v-col>
                <v-sheet class="pa-2">
                    <p>admin !!!</p>
                </v-sheet>
            </v-col>
        </v-row>
    </div>
    <v-dialog v-model="dialogue" width="auto" theme="dark" persistent>
        <v-alert v-if="authErrorMessage" type="warning" v-model="dialogue" border="start" closable close-label="Close Alert"
            color="red-lighten-3" class="text-h4" rounded="lg">
            {{ authErrorMessage }}
        </v-alert>
    </v-dialog>
</template>

<script>
import session from '../../../session';
import { watch } from 'vue';
import { getCurrentInstance } from 'vue';

export default {
    data() {
        return {
            adresseActive: false,
            tel: '',
            numero: '',
            rue: '',
            ville: '',
            province: '',
            codePostal: '',

            infolettre: false,

            pointsGeeko: 0,

            detailsUtilisateurRole: null,
            dialogue: false,
            authErrorMessage: '',
        };
    },
    methods: {

    },
    computed: {
        checkClass() {
            return {
                activee: this.estInscrit === 'Activée',
                desactivee: this.estInscrit === 'Désactivée'
            }
        },
        items() {
            return [
                { title: `Tel : ${this.tel}` },
                { title: `${this.numero} ${this.rue}` },
                { title: `${this.ville}, ${this.province}` },
                { title: `${this.codePostal}` }
            ];
        }
    },
    setup() {
        const instance = getCurrentInstance();
        watch(() => session.loaded, (newValue, oldValue) => {
            // console.log(`Le message a changé de ${oldValue} à ${newValue}`);
            if (newValue === true) {
                instance.data.dialogue = false;

                if (session.detailsUtilisateur.adresseActive === true) {
                    instance.data.adresseActive = true;
                    instance.data.tel = session.detailsUtilisateur.telephone;
                    instance.data.numero = session.detailsUtilisateur.numeroCivique;
                    instance.data.rue = session.detailsUtilisateur.rue;
                    instance.data.ville = session.detailsUtilisateur.ville;
                    instance.data.province = session.detailsUtilisateur.province;
                    instance.data.codePostal = session.detailsUtilisateur.codePostal;
                }

                instance.data.infolettre = session.detailsUtilisateur.infolettre;
                instance.data.detailsUtilisateurRole = session.detailsUtilisateur.role;
                instance.data.pointsGeeko = session.detailsUtilisateur.pointsFidelite;
            }
        });
    },
    watch: {
        dialogue(nouvelleValeur) {
            if (nouvelleValeur === false) {
                this.authErrorMessage = '';
            }
        }
    },
    mounted() {

        if (session.loaded === true) {
            if (session.detailsUtilisateur.adresseActive === true) {
                this.adresseActive = true;
                this.tel = session.detailsUtilisateur.telephone;
                this.numero = session.detailsUtilisateur.numeroCivique;
                this.rue = session.detailsUtilisateur.rue;
                this.ville = session.detailsUtilisateur.ville;
                this.province = session.detailsUtilisateur.province;
                this.codePostal = session.detailsUtilisateur.codePostal;
            }

            this.infolettre = session.detailsUtilisateur.infolettre;
            this.detailsUtilisateurRole = session.detailsUtilisateur.role;
            this.pointsGeeko = session.detailsUtilisateur.pointsFidelite;
        }
        else {
            this.authErrorMessage = 'Vous devez être connecté voir cette page !';
            this.dialogue = true;
        }
    }
}
</script>

<style>
.activee {
    color: rgb(3, 198, 3)
}

.desactivee {
    color: red
}

.v-list-item--density-compact.v-list-item--one-line {
    min-height: 0px !important;
    margin: 0px;
    padding: 0px
}

.color {
    color: orange;
    font-size: large;
}

#main-background > div > main > div:nth-child(2) > div.v-col.v-col-9 > div > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div.v-card-text {
    padding: 0 16px;
}

#main-background > div > main > div:nth-child(2) > div.v-col.v-col-9 > div > div > div:nth-child(1) > div > div > div:nth-child(3) > div > div:nth-child(3) {
    padding: 0 16px;
}

</style>