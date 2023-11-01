<template>
    <v-form @submit.prevent="enregistrerNouvellesInfos" v-if="detailsUtilisateurRole === 'utilisateur'"
        :validate-on="(valid === false ? 'input' : 'blur') + ' submit'" ref="form" v-model="valid">

        <v-card class="pa-4 ma-4" elevation="4">
            <v-card-title class="text-h5 font-weight-bold">Prénom et
                nom</v-card-title>
            <v-text-field v-model="prenom" :rules="[rules.requis]" label="Prénom"></v-text-field>
            <v-text-field v-model="nom" :rules="[rules.requis]" label="Nom"></v-text-field>
        </v-card>

        <v-checkbox v-model="mdpIsEditing" label="Modifier le mot de passe" @click="checkIfFormIsValid"></v-checkbox>

        <v-card v-if="mdpIsEditing" class="pa-4 ma-4" elevation="4">
            <v-card-title class="text-h5 font-weight-bold">Mot de passe</v-card-title>
            <v-text-field v-model="mdpActuel" :rules="[rules.requis]" label="Mot de passe actuel"
                type="password"></v-text-field>

            <v-text-field v-model="mdpSouhaite" type="password" :rules="[rules.requis, rules.formatMdp]"
                label="Nouveau mot de passe" class="my-4" name="password" ref="password"
                hint="Un minimum de 8 caractères et doit contenir au moins une minuscule, une majuscule, un chiffre et caractère spécial."
                @focus="checkIfFieldIsValid" @keyup="checkIfFieldIsValid" @blur="password = false"
                @input="checkIfPasswordsAreTheSame">
                <v-tooltip v-model="password" :open-on-hover="false" activator="parent" location="start" offset="50"
                    width="215">
                    <span class="text-subtitle-1">Veuillez saisir
                        <span v-if="(/^.{8,}$/).test(mdpSouhaite)" class="good">8</span>
                        <span v-else class="bad">8</span>
                        caractères et au moins :
                        <ul>
                            <li v-if="(/[A-Z]/).test(mdpSouhaite)" class="good">Une lettre majuscule</li>
                            <li v-else class="bad">Une lettre majuscule</li>
                            <li v-if="mdpSouhaite && (/[a-z]/).test(mdpSouhaite)" class="good">Une lettre minuscule</li>
                            <li v-else class="bad">Une lettre minuscule</li>
                            <li v-if="(/[^a-zA-Z0-9]/).test(mdpSouhaite)" class="good">Une caractère spécial</li>
                            <li v-else class="bad">Une caractère spécial</li>
                            <li v-if="(/[0-9]/).test(mdpSouhaite)" class="good">Un chiffre</li>
                            <li v-else class="bad">Un chiffre</li>
                        </ul>
                    </span></v-tooltip></v-text-field>
            <v-text-field v-model="mdpConfirmation" type="password" :rules="[rules.requis, rules.msdpCorrespondent]"
                label="Confirmation de mot de passe" ref="passwordConfirme" name="passwordConfirme"
                @input="checkIfPasswordsAreTheSame"></v-text-field>
        </v-card>

        <v-sheet class="pa-4 ma-4">
            <div @click="validate" style="display: inline-block" @mouseover="checkIfFormIsValid">
                <v-btn type="submit" elevation="4" rounded="pill" color="green"
                    :disabled="valid != true">Enregistrer</v-btn>
            </div><span class="bad ml-4">{{ valid === false ? '* Certains champs comportent des erreurs' : ''
            }}</span>
        </v-sheet>
    </v-form>

    <v-dialog v-model="dialogue" width="auto" theme="dark"
        :persistent="authErrorMessage || (!authErrorMessage && mdpIsEditing) ? true : false">
        <v-alert v-if="authErrorMessage" type="warning" v-model="dialogue" border="start" close-label="Close Alert"
            color="red-lighten-3" class="text-h4" rounded="lg">
            {{ authErrorMessage }}
            <div align="center">
                <v-btn class="mt-2" color="red-darken-3" rounded="lg" @click="dialogue = false">Ok</v-btn>
            </div>
        </v-alert>
        <v-alert v-else-if="!mdpIsEditing" type="success" v-model="dialogue" border="start" close-label="Close Alert"
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
            detailsUtilisateurRole: null,
            valid: null,
            mdpIsEditing: false,

            prenom: '',
            nom: '',

            mdpActuel: '',
            mdpSouhaite: null,
            mdpConfirmation: '',

            rules: {
                requis: (value) => !!value || "Le champ est requis",
                formatMdp: () => !((/^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/).test(this.mdpSouhaite)) || "Le mot de passe doit contenir un minimum de 8 caractères et au moins une minuscule, une majuscule, un chiffre et caractère spécial.",
                msdpCorrespondent: () => this.mdpSouhaite === this.mdpConfirmation || "Les mots de passe ne correspondent pas"
            },

            dialogue: false,
            // dialogue409: false,
            authErrorMessage: '',

            password: false,
        };
    },
    methods: {
        async enregistrerNouvellesInfos() {
            const { valid } = await this.$refs.form.validate();

            if (valid) {
                session.detailsUtilisateur.prenom = this.prenom;
                session.detailsUtilisateur.nom = this.nom;
                session.detailsUtilisateur.mdpActuel = this.mdpActuel;
                session.detailsUtilisateur.mdpSouhaite = this.mdpSouhaite;

                session.updateUtilisateur().then(() => {
                    // console.log('devrait être apres false à true(watch setup)')
                    this.dialogue = true;
                }).catch(authError => {
                    console.error(authError);
                    session.initialize().then(() => {
                        this.authErrorMessage = authError.message;
                        this.dialogue = true;
                        // this.dialogue409 = true;
                    });
                });
            }
        },

        checkIfFieldIsValid(event) {
            const name = event.target.name;
            const items = this.$refs.form.items;
            const item = items.find(item => item.id === name);

            if (item && name && item.isValid != true) {
                this[name] = true;
            }
            else if (item && name && item.isValid === true) {
                this.$refs[name].validate().then(() => {
                    if (item.isValid != true) {
                        this[name] = true;
                    } else {
                        this[name] = false;
                    }
                });
            }
        },

        validate() {
            this.$refs.form.validate();
        },

        checkIfFormIsValid() {
            const items = this.$refs.form.items;
            let itemsValidated = 0;
            items.forEach(item => {
                if (item.isValid) {
                    itemsValidated += 1;
                }
            });
            if (itemsValidated === 5 && this.mdpIsEditing) {
                this.validate();
            }
        },

        checkIfPasswordsAreTheSame(event) {
            const name = event.target.name;
            const items = this.$refs.form.items;
            const item = items.find(item => item.id === name);

            if (item && name && item.isValid != null && (name === 'password' || name === 'passwordConfirme')) {
                this.$refs.password.validate();
                this.$refs.passwordConfirme.validate();
            }
        },

        seReAuthentifier() {
            session.disconnect();
            this.$router.replace('/client/connexion');
        }
    },

    watch: {
        dialogue(nouvelleValeur) {
            if (nouvelleValeur === false) {
                this.authErrorMessage = '';
                // this.dialogue409 = false;
            }
        }
    },

    computed: {

    },

    setup() {
        const instance = getCurrentInstance();
        watch(() => session.loaded, (newValue, oldValue) => {
            // console.log(`Le message a changé de ${oldValue} à ${newValue}`);
            if (newValue === true && session.detailsUtilisateur.role === 'utilisateur') {
                // if (instance.data.dialogue409 === false) {
                //     instance.data.dialogue = false; //?????????????????????????
                // }
                instance.data.dialogue = false;
                instance.data.detailsUtilisateurRole = session.detailsUtilisateur.role;
                instance.data.prenom = session.detailsUtilisateur.prenom;
                instance.data.nom = session.detailsUtilisateur.nom;
            }
            else {

            }
        });
    },

    mounted() {
        if (session.loaded === true && session.detailsUtilisateur.role === 'utilisateur') {
            this.detailsUtilisateurRole = session.detailsUtilisateur.role;
            this.prenom = session.detailsUtilisateur.prenom;
            this.nom = session.detailsUtilisateur.nom;
        }
        else {
            this.authErrorMessage = 'Vous devez être connecté et non administrateur pour voir cette page !';
            this.dialogue = true;
        }
    }
}
</script>