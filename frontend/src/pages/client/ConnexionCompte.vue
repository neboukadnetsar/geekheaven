<template>
    <EnteteClient>Accès client</EnteteClient>
    <v-sheet width="1000" class="pa-1 mx-auto my-5">
        <v-row>
            <v-col class="mr-2">
                <div class="text-h4 police-espace-client">Inscription</div>
                <v-divider thickness="2" color="grey-darken-4" class="mb-4 mt-1"></v-divider>
                <p>La création d'un compte a de nombreux avantages : consultation rapide, sauvegarder plusieurs adresses,
                    suivre les commandes, et bien plus encore.</p>
                <br />
                <v-btn class="mb-6" elevation="4" rounded="pill" color="green" to="/client/inscription">Créer votre
                    compte</v-btn>
            </v-col>
            <v-col class="ml-2">
                <v-form ref="form" @submit.prevent="login" v-model="valid">
                    <div class="text-h4 police-espace-client">Authentification</div>
                    <v-divider thickness="2" color="grey-darken-4" class="mb-4 mt-1"></v-divider>
                    <v-text-field v-model="courriel" label="Identifiant utilisateur" :rules="[rules.required]"
                        variant="underlined"></v-text-field>
                    <v-text-field v-model="mdp" label="Mot de passe" type="password" :rules="[rules.required]"
                        variant="underlined"></v-text-field>
                    <div class=" test d-flex justify-space-between align-center">
                        <v-btn type="submit" class="mb-6" elevation="4" rounded="pill" color="green"
                            :disabled="!courriel || !mdp">Connexion</v-btn>                 
                    </div>
                    <span class="bad">{{ !valid ? '* Tous les champs sont requis' : ''}}</span>
                </v-form>
            </v-col>
        </v-row>
    </v-sheet>
    <v-dialog v-model="dialogue" width="auto" theme="dark" persistent>
        <v-alert v-if="authErrorMessage" type="warning" v-model="dialogue" border="start" close-label="Close Alert"
            color="red-lighten-3" class="text-h4" rounded="lg">
            {{ authErrorMessage }}
            <div align="center">
                <v-btn class="mt-2" color="red-darken-3" rounded="lg"
                    @click="dialogue = false">Ok</v-btn>
            </div>
        </v-alert>
        <v-alert v-else type="success" v-model="dialogue" border="start" close-label="Close Alert"
            color="blue-lighten-2" class="text-h4" rounded="lg">
            Bonjour {{ prenom }}
            <div align="center">
                <v-btn class="mt-2" color="light-blue-darken-4" rounded="lg"
                    @click="this.$router.replace(role === 'utilisateur' ? '/client/tableau-de-bord/tableau-de-bord' : '/client/tableau-de-bord/admin/commandes')">Ok</v-btn>
            </div>
        </v-alert>
    </v-dialog>
</template>

<script>
import session from '../../session';
import EnteteClient from './components/EnteteClient.vue';

export default {
    components: {
        EnteteClient
    },
    data: function () {
        return {
            valid: null,
            courriel: '',
            mdp: '',
            rules: {
                required: value => !!value || "Le champ est requis"
            },
            dialogue: false,
            authErrorMessage: '',
            prenom: '',
            role: ''
        };
    },
    methods: {
        login() {
            session.login(this.courriel, this.mdp).then(() => {
                this.prenom = session.detailsUtilisateur.prenom;
                this.role = session.detailsUtilisateur.role;
                this.dialogue = true;
            }).catch(authError => {
                this.authErrorMessage = authError.message;
                this.dialogue = true;
            });
        }
    },
    watch: {
        dialogue(nouvelleValeur) {
            if (nouvelleValeur === false) {
                this.authErrorMessage = '';
            }
        }
    }
}
</script>

<style lang="scss">
@import '../../styles/main.scss';
.bad {
    color: red
}
</style>