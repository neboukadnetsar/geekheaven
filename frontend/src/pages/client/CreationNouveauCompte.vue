<template>
    <EnteteClient>Création d'un nouveau compte client</EnteteClient>
    <v-sheet width="1000" class="pa-1 mx-auto my-5" elevation="4" rounded="lg">
        <v-form @submit.prevent="creerNouveauCompte"
            :validate-on="(valid === false ? 'input' : 'blur') + ' lazy' + ' submit'" ref="form" v-model="valid">
            <v-card class="pa-4 ma-4" elevation="4">
                <v-card-title class="text-h5 font-weight-bold">Informations personnelles</v-card-title>
                <v-text-field v-model="prenom" :rules="[rules.requis]" label="Prénom"></v-text-field>
                <v-text-field v-model="nom" :rules="[rules.requis]" label="Nom"></v-text-field>
                <v-text-field v-model="telephone" :rules="[rules.requis, ruleTelephone]" placeholder="1234657890"
                    @input="formatPhoneNumber" label="Téléphone" name="tel" ref="tel" @focus="checkIfFieldIsValid"
                    @keyup="checkIfFieldIsValid" @blur="tel = false">
                    <v-tooltip v-model="tel" :open-on-hover="false" activator="parent" location="start" offset="50"
                        width="215"><span class="text-subtitle-1">Veuillez saisir 10 chiffres<ul>
                                <li>Formatage automatique</li>
                            </ul></span></v-tooltip></v-text-field>
            </v-card>
            <v-radio-group v-model="infolettre">
                <template v-slot:label>
                    <div>Vous abonner à l'<strong>infolettre</strong>?</div>
                </template>
                <v-radio value="oui">
                    <template v-slot:label>
                        <div><strong class="text-success">Oui</strong></div>
                    </template>
                </v-radio>
                <v-radio value="non">
                    <template v-slot:label>
                        <div><strong class="text-primary">Non</strong></div>
                    </template>
                </v-radio>
            </v-radio-group>
            <v-card class="pa-4 ma-4" elevation="4">
                <v-card-title class="text-h5 font-weight-bold">Informations de connexion</v-card-title>
                <v-text-field v-model="courriel" label="Courriel" placeholder="exemple@exemple.com" name="email" ref="email"
                    @focus="checkIfFieldIsValid" @keyup="checkIfFieldIsValid" @blur="email = false"
                    @input="checkIfMailsOrPasswordsAreTheSame"
                    :rules="[rules.requis, rules.formatCourriel, rules.compteUtilisateurCourrielUnique]">
                    <v-tooltip v-model="email" :open-on-hover="false" activator="parent" location="start" offset="50"
                        width="215"><span class="text-subtitle-1">Veuillez respecter ce format :<ul>
                                <li>abcd@abcd.com</li>
                            </ul></span></v-tooltip></v-text-field>
                <v-text-field v-model="courrielConfirmation" :rules="[rules.requis, rules.courrielsCorrespondent]"
                    ref="emailConfirme" name="emailConfirme" @input="checkIfMailsOrPasswordsAreTheSame"
                    label="Confirmation de courriel"></v-text-field>
                <v-text-field v-model="mdp" type="password" :rules="[rules.requis, rules.formatMdp]" label="Mot de passe"
                    class="my-4" name="password" ref="password"
                    hint="Un minimum de 8 caractères et doit contenir au moins une minuscule, une majuscule, un chiffre et caractère spécial."
                    @focus="checkIfFieldIsValid" @keyup="checkIfFieldIsValid" @blur="password = false"
                    @input="checkIfMailsOrPasswordsAreTheSame">
                    <v-tooltip v-model="password" :open-on-hover="false" activator="parent" location="start" offset="50"
                        width="215">
                        <span class="text-subtitle-1">Veuillez saisir
                            <span v-if="(/^.{8,}$/).test(mdp)" class="good">8</span>
                            <span v-else class="bad">8</span>
                            caractères et au moins :
                            <ul>
                                <li v-if="(/[A-Z]/).test(mdp)" class="good">Une lettre majuscule</li>
                                <li v-else class="bad">Une lettre majuscule</li>
                                <li v-if="(/[a-z]/).test(mdp)" class="good">Une lettre minuscule</li>
                                <li v-else class="bad">Une lettre minuscule</li>
                                <li v-if="(/[^a-zA-Z0-9]/).test(mdp)" class="good">Une caractère spécial</li>
                                <li v-else class="bad">Une caractère spécial</li>
                                <li v-if="(/[0-9]/).test(mdp)" class="good">Un chiffre</li>
                                <li v-else class="bad">Un chiffre</li>
                            </ul>
                        </span></v-tooltip></v-text-field>
                <v-text-field v-model="mdpConfirmation" type="password" :rules="[rules.requis, rules.msdpCorrespondent]"
                    label="Confirmation de mot de passe" ref="passwordConfirme" name="passwordConfirme"
                    @input="checkIfMailsOrPasswordsAreTheSame"></v-text-field>
            </v-card>
            <v-sheet class="pa-4 ma-4" >
                <div @click="validate" style="display: inline-block" @mouseover="checkIfFormIsValid">
                    <v-btn type="submit" elevation="4" rounded="pill" color="green" :disabled="valid != true">Créer
                    votre compte</v-btn></div><span class="bad ml-4">{{ valid === false ? '* Certains champs comportent des erreurs' : '' }}</span><br />             
                <!-- <v-btn prepend-icon="mdi-chevron-left" class="mt-6" elevation="4" rounded="pill" color="grey-lighten-3"
                    disabled>Retour</v-btn> -->
            </v-sheet>
            <v-dialog v-model="dialogue" width="auto" theme="dark" persistent>
                <v-alert v-if="authErrorMessage" type="warning" v-model="dialogue" border="start" close-label="Close Alert"
                    color="red-lighten-3" class="text-h4" rounded="lg">
                    {{ authErrorMessage }}
                    <div align="center">
                        <v-btn class="mt-2" color="red-darken-3" rounded="lg" @click="dialogue = false">Ok</v-btn>
                    </div>
                </v-alert>
                <v-alert v-else type="success" v-model="dialogue" border="start" close-label="Close Alert"
                    color="blue-lighten-2" class="text-h4" rounded="lg">
                    {{ `Compte créé avec succès, veuillez vous authentifier pour
                    accéder à votre compte.`}}
                    <div align="center">
                        <v-btn class="mt-2" color="light-blue-darken-4" rounded="lg"
                            @click="this.$router.replace('/client/connexion')">CLiquer afin d'Accéder à la page
                            d'authentification</v-btn>
                    </div>
                </v-alert>
            </v-dialog>
        </v-form>
    </v-sheet>
</template>

<script>
import EnteteClient from './components/EnteteClient.vue';
import session from '../../session';
import { cleanPhoneNumber } from '../../utils';

export default {
    components: {
        EnteteClient
    },
    data() {
        return {
            valid: null,
            prenom: '',
            nom: '',
            telephone: '',
            courriel: '',
            courrielConfirmation: '',
            mdp: '',
            mdpConfirmation: '',
            rules: {
                requis: value => !!value || "Le champ est requis",
                // formatTelephone: (/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).test(this.telephone) || "Le format du numéro de téléphone est invalide",
                formatCourriel: () => (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).test(this.courriel) || "Le format du courriel est invalide",
                formatMdp: () => !((/^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/).test(this.mdp)) || "Le mot de passe doit contenir un minimum de 8 caractères et au moins une minuscule, une majuscule, un chiffre et caractère spécial.",
                msdpCorrespondent: () => this.mdp === this.mdpConfirmation || "Les mots de passe ne correspondent pas",
                courrielsCorrespondent: () => this.courriel === this.courrielConfirmation || "Les courriels ne correspondent pas",
                compteUtilisateurCourrielUnique: () => this.compteEstUnique || "Ce courriel est déjà utilisé, veuillez en entrer un autre"
            },
            compteEstUnique: true,
            dialogue: false,
            authErrorMessage: '',
            infolettre: 'non',
            tel: false,
            email: false,
            password: false,
        };
    },
    methods: {
        async creerNouveauCompte() {
            this.compteEstUnique = true;
            const { valid } = await this.$refs.form.validate();

            if (valid) {
                session.creerNouveauCompte(this.prenom, this.nom, cleanPhoneNumber(this.telephone), this.courriel, this.mdp, this.infolettre === 'oui' ? "true" : "false").then(() => {   //pourquoi "false" en string ?
                    this.compteEstUnique = true;
                    this.dialogue = true;
                    this.$refs.form.reset();
                }).catch(authError => {
                    this.authErrorMessage = authError.message;
                    this.dialogue = true;
                    if (authError.status === 409) {
                        this.compteEstUnique = false;
                        this.$refs.form.validate();
                    }
                });
            }
        },
        formatPhoneNumber(event) {
            if (event.keyCode === 8) {
                return;
            }

            let phoneNumber = this.telephone.replace(/\D/g, '');

            if (phoneNumber.length > 10) {
                phoneNumber = phoneNumber.slice(0, 10); 
            }

            if (phoneNumber.length >= 1) {
                phoneNumber = '(' + phoneNumber.slice(0, 3) + phoneNumber.slice(3);
            }
            if (phoneNumber.length > 4) {
                phoneNumber = phoneNumber.slice(0, 4) + ') ' + phoneNumber.slice(4);
            }
            if (phoneNumber.length > 9) {
                phoneNumber = phoneNumber.slice(0, 9) + '-' + phoneNumber.slice(9);
            }

            this.telephone = phoneNumber;
        },
        ruleTelephone() {
            let phoneNumber = this.telephone.replace(/\D/g, '');
            let rule = (/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).test(phoneNumber) || "Le format du numéro de téléphone est invalide";
            return rule;
        },
        checkIfFieldIsValid(event) {
            // console.log('COMPUTED', this.tel())
            // console.log(this.telephone)
            // console.log(test);
            // console.log(this.$refs.tel);
            // console.log(this.$refs.form.items);
            // console.log(this.$refs.tel.focused);
            // console.log(event.target.name);
            const name = event.target.name;
            const items = this.$refs.form.items;
            const item = items.find(item => item.id === name);
            // console.log(this.$refs[name]);

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
        checkIfMailsOrPasswordsAreTheSame(event) {
            const name = event.target.name;
            const items = this.$refs.form.items;
            const item = items.find(item => item.id === name);

            if (item && name && item.isValid != null && (name === 'email' || name === 'emailConfirme')) {
                this.$refs.email.validate();
                this.$refs.emailConfirme.validate();
            }
            else if (item && name && item.isValid != null && (name === 'password' || name === 'passwordConfirme')) {
                this.$refs.password.validate();
                this.$refs.passwordConfirme.validate();
            }
        },
        validate() {
            this.$refs.form.validate();
        },
        checkIfFormIsValid() {
            const items = this.$refs.form.items;
            let itemsValidated = 0;
            items.forEach(item => {
                if(item.isValid) {
                    itemsValidated += 1;
                }
            });
            if(itemsValidated === 7) {
                this.validate();
            }
            console.log(items);
        }
    },
    watch: {
        dialogue(nouvelleValeur) {
            if (nouvelleValeur === false) {
                this.authErrorMessage = '';
            }
        },
        courriel() {
            if (this.compteEstUnique === false) {
                // this.$refs.form.resetValidation();
                this.compteEstUnique = true;
            }
        }
    },
    mounted() {

    }
}
</script>

<style>
.good {
    color: rgb(3, 198, 3)
}

.bad {
    color: red
}
</style>
