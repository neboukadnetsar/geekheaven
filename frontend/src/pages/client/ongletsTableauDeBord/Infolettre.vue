<template>
    <v-row v-if="detailsUtilisateurRole === 'utilisateur'">
        <v-col class="d-flex justify-center">
            <v-sheet class="pa-2" rounded="lg" elevation="3" style="display: inline-block">
                <v-switch v-model="estInscrit" inset color="primary" true-value="Activée" false-value="Désactivée"
                    hide-details @click="changerStatut">
                    <template v-slot:label>
                        <div class="text-h4">
                            Inscription à l'infolettre :&nbsp<span :class="checkClass">{{ estInscrit }}</span>
                        </div>
                    </template>
                </v-switch>
            </v-sheet>
            <!-- <p>Rajouter ici pour superposer</p> -->
        </v-col>
    </v-row>
    <v-dialog v-model="dialogue" width="auto" theme="dark" persistent>
        <v-alert v-if="authErrorMessage" type="warning" v-model="dialogue" border="start" closable close-label="Close Alert"
            color="red-lighten-3" class="text-h4" rounded="lg">
            {{ authErrorMessage }}
        </v-alert>
    </v-dialog>
    <v-row>
        <v-col>
            <v-sheet class="pa-2">
                <!-- <p>test</p> -->
            </v-sheet>
        </v-col>
    </v-row>
</template>

<script>
import session from '../../../session';
import { watch } from 'vue';
import { getCurrentInstance } from 'vue';

export default {
    data() {
        return {
            detailsUtilisateurRole: null,
            estInscrit: 'Désactivée',
            infolettreIsLoaded: false,
            dialogue: false,
            authErrorMessage: '',
        };
    },
    methods: {
        changerStatut() {
            if (this.estInscrit === 'Désactivée') {
                session.detailsUtilisateur.infolettre = true;
            } else {
                session.detailsUtilisateur.infolettre = false;
            }

            session.updateUtilisateur().then(() => {

            }).catch(authError => {
                this.authErrorMessage = authError.message;
                this.dialogue = true;
                session.detailsUtilisateur.infolettre = !session.detailsUtilisateur.infolettre;
                if (this.estInscrit === 'Activée') {
                    this.estInscrit = 'Désactivée';
                }
                else {
                    this.estInscrit = 'Activée';
                }
            });
        }
    },
    computed: {
        checkClass() {
            return {
                activee: this.estInscrit === 'Activée',
                desactivee: this.estInscrit === 'Désactivée'
            }
        }
    },
    setup() {
        const instance = getCurrentInstance();
        watch(() => session.loaded, (newValue, oldValue) => {
            // console.log(`Le message a changé de ${oldValue} à ${newValue}`);
            if (newValue === true && session.detailsUtilisateur.role === 'utilisateur') {
                instance.data.dialogue = false;
                instance.data.detailsUtilisateurRole = session.detailsUtilisateur.role;
                if (session.detailsUtilisateur.infolettre === true) {
                    instance.data.estInscrit = 'Activée';
                }
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
        if (session.loaded === true && session.detailsUtilisateur.role === 'utilisateur') {
            this.detailsUtilisateurRole = session.detailsUtilisateur.role;
            if (session.detailsUtilisateur.infolettre === true) {
                this.estInscrit = 'Activée';
            }
            else {
                this.estInscrit = 'Désactivée';
            }
        }
        else {
            this.authErrorMessage = 'Vous devez être connecté et non administrateur pour voir cette page !';
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
</style>