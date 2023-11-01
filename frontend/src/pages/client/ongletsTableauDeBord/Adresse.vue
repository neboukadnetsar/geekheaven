<template>
    <v-form @submit.prevent="enregistrerNouvelleAdresse" v-if="detailsUtilisateurRole === 'utilisateur'"
        :validate-on="(valid === false ? 'input' : 'blur') + ' lazy' + ' submit'" ref="form" v-model="valid">
        <v-card class="pa-4 ma-4" elevation="4">

            <div class="d-flex justify-space-between"><v-card-title class="text-h5 font-weight-bold">Adresse</v-card-title>
                <div>
                    <v-alert v-if="!adresseActive" type="warning" border="start" close-label="Close Alert" density="compact"
                        variant="tonal" class="text-h5" rounded="lg">
                        Aucune adresse valide associée au compte !
                    </v-alert>
                    <v-alert v-else type="success" border="start" close-label="Close Alert" density="compact"
                        variant="tonal" class="text-h5" rounded="lg">
                        Adresse valide !
                    </v-alert>
                </div>
            </div>

            <v-text-field v-model="prenom" :rules="[rules.requis]" disabled label="Prénom"
                @mouseleave="checkIfFormIsValid"></v-text-field>

            <v-text-field v-model="nom" :rules="[rules.requis]" disabled label="Nom"
                @mouseleave="checkIfFormIsValid"></v-text-field>

            <v-text-field v-model="telephone" :rules="[rules.requis, ruleTelephone]" placeholder="1234657890"
                @mouseleave="checkIfFormIsValid" label="Téléphone" name="tel" ref="tel" @focus="checkIfFieldIsValid"
                validate-on="input" @keyup="checkIfFieldIsValid" @blur="tel = false">
                <v-tooltip v-model="tel" :open-on-hover="false" activator="parent" location="top" width="215">
                    <span class="text-subtitle-1">Veuillez saisir 10 chiffres
                        <ul>
                            <li>Formatage automatique</li>
                        </ul>
                    </span>
                </v-tooltip>
            </v-text-field>

            <v-text-field v-model="numeroCivique" :rules="[rules.requis]" ref="numeroCivique"
                @mouseleave="checkIfFormIsValid" name="numeroCivique" label="Numéro civique">
            </v-text-field>

            <v-text-field v-model="rue" :rules="[rules.requis]" ref="rue" name="rue" label="Rue"
                @mouseleave="checkIfFormIsValid"></v-text-field>

            <v-autocomplete v-model="ville" ref="ville" name="ville" return-object :rules="[rules.requisVille]"
                @mouseleave="checkIfFormIsValid" :disabled="!province.code" :bg-color="bgColor"
                @focus="villeFieldIsNewlyFocused = true" :items="listeVilles" item-title="nom" item-value="nom"
                label="Ville">
            </v-autocomplete>

            <v-select v-model="province" :items="listeProvinces" return-object item-title="nom" item-value="code"
                @mouseleave="checkIfFormIsValid" :rules="[rules.requisProvince]" ref="province" name="province"
                label="Province">
            </v-select>

            <v-text-field v-model="codePostal" :rules="[rules.requis, rules.codePostal]" label="Code Postal"
                @mouseleave="checkIfFormIsValid" ref="codePostal" name="codePostal">
            </v-text-field>
        </v-card>
        <v-sheet class="pa-4 ma-4">
            <div @click="validate" style="display: inline-block" @mouseover="checkIfFormIsValid">
                <v-btn type="submit" elevation="4" rounded="pill" color="green"
                    :disabled="valid != true">Enregistrer</v-btn>
            </div><span class="bad ml-4">{{ valid === false ? '* Certains champs comportent des erreurs' : ''
            }}</span><br /><br />
            <a v-if="province.code != null" href="https://simplemaps.com/data/canada-cities" target="_blank">La liste de
                villes est fournie par simplemaps.com</a>
        </v-sheet>
    </v-form>
    <v-dialog v-model="dialogue" width="auto" theme="dark"
        :persistent="detailsUtilisateurRole === 'utilisateur' ? false : true">
        <v-alert v-if="authErrorMessage" type="warning" v-model="dialogue" border="start" close-label="Close Alert"
            color="red-lighten-3" class="text-h4" rounded="lg">
            {{ authErrorMessage }}
            <div align="center">
                <v-btn class="mt-2" color="red-darken-3" rounded="lg" @click="dialogue = false">Ok</v-btn>
            </div>
        </v-alert>
        <v-alert v-else type="success" v-model="dialogue" border="start" close-label="Close Alert" closable
            color="blue-lighten-2" class="text-h4" rounded="lg">
            {{ `Adresse enregistrée avec succès !` }}
        </v-alert>
    </v-dialog>
</template>

<script>
import { fetchProvinces, fetchVillesParProvince } from '../../../AdresseService';
import session from '../../../session';
import { cleanPhoneNumber } from '../../../utils';
import { watch } from 'vue';
import { getCurrentInstance } from 'vue';

export default {
    data() {
        return {
            detailsUtilisateurRole: null,
            valid: null,
            adresseActive: false,

            prenom: '',
            nom: '',

            telephone: null,
            numeroCivique: null,
            rue: '',

            ville: { provinceCode: '', nom: '' },
            villeFieldIsNewlyFocused: false,

            province: { code: '', nom: '' },
            codePostal: '',

            rules: {
                requis: (value) => !!value || "Le champ est requis",
                requisVille: (valueVille) => (!!valueVille && (!!valueVille.nom && !!valueVille.provinceCode)) || "Le champ est requis",
                requisProvince: (value) => !!(value.code) || "Le champ est requis",
                // numeroCivique: () => (/\d+(-\d+)?$/).test(this.numeroCivique) || "Le format du numéro est invalide",
                codePostal: () => (/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/).test(this.codePostal) || "Le format du code postal est invalide"
            },

            dialogue: false,
            authErrorMessage: '',

            tel: false,

            listeProvinces: [{ code: '', nom: '' }],
            listeVilles: [{ provinceCode: '', nom: '' }]
        };
    },
    methods: {

        // requisVille() {
        //     if(!this.ville) {
        //         return "Le champs est requis"
        //     }
        //     else if(this.ville.nom === '') {
        //         return "Le champs est requis"
        //     }
        //     else {
        //         return true
        //     }
        // },

        ruleTelephone() {
            let phoneNumber = this.telephone.replace(/\D/g, '');
            let rule = (/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).test(phoneNumber) || "Le format du numéro de téléphone est invalide";
            return rule;
        },

        formatPhoneNumber(event) {
            if (event && event.keyCode === 8) {
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

        async enregistrerNouvelleAdresse() {
            const { valid } = await this.$refs.form.validate();

            if (valid) {
                session.detailsUtilisateur.telephone = cleanPhoneNumber(this.telephone)
                session.detailsUtilisateur.numeroCivique = this.numeroCivique;
                session.detailsUtilisateur.rue = this.rue;
                session.detailsUtilisateur.ville = this.ville.nom;
                session.detailsUtilisateur.province = this.province.code;
                session.detailsUtilisateur.codePostal = this.codePostal;

                session.updateUtilisateur().then(() => {
                    this.dialogue = true;
                }).catch(authError => {
                    console.error(authError);
                    session.initialize();
                    // this.authErrorMessage = authError.message;
                    // this.dialogue = true;
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
            if (itemsValidated === 5 || this.adresseActive) {
                this.validate();
            }
        },

        fetchVilles(oldValue) {
            fetchVillesParProvince(this.province.code).then((villes) => {
                this.listeVilles = villes;
                if (!this.adresseActive || this.adresseActive && oldValue) {
                    this.ville.nom = '';
                }
            }).catch((err) => {
                console.error('erreur:', err);
            });
        }
    },

    watch: {

        dialogue(nouvelleValeur) {
            if (nouvelleValeur === false) {
                this.authErrorMessage = '';
            }
        },

        telephone(newValue, oldValue) {
            //ici plutot qu'un @input permet d'afficher deja formatte au premier load de la page
            this.formatPhoneNumber();
        },

        ['province.code'](newValue, oldValue) {
            if (newValue) {
                this.fetchVilles(oldValue);
            }
        }
    },

    computed: {

        bgColor() {
            if (!this.province.code) {
                return 'red-lighten-3';
            } else if (!this.adresseActive && !this.villeFieldIsNewlyFocused) {
                return 'green-lighten-4'
            } else {
                return undefined;
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
                instance.data.adresseActive = session.detailsUtilisateur.adresseActive;
                instance.data.prenom = session.detailsUtilisateur.prenom;
                instance.data.nom = session.detailsUtilisateur.nom;
                instance.data.telephone = session.detailsUtilisateur.telephone;
                instance.data.numeroCivique = session.detailsUtilisateur.numeroCivique;
                instance.data.rue = session.detailsUtilisateur.rue;
                instance.data.ville.nom = session.detailsUtilisateur.ville || 'Veuillez choisir une province ou territoire pour sélectionner une ville';
                instance.data.ville.provinceCode = session.detailsUtilisateur.province || '';
                instance.data.province.code = session.detailsUtilisateur.province;
                instance.data.codePostal = session.detailsUtilisateur.codePostal;
            }
            else {

            }
        });
    },

    mounted() {
        if (session.loaded === true && session.detailsUtilisateur.role === 'utilisateur') {
            this.detailsUtilisateurRole = session.detailsUtilisateur.role;
            this.adresseActive = session.detailsUtilisateur.adresseActive;
            this.prenom = session.detailsUtilisateur.prenom;
            this.nom = session.detailsUtilisateur.nom;
            this.telephone = session.detailsUtilisateur.telephone;
            this.numeroCivique = session.detailsUtilisateur.numeroCivique;
            this.rue = session.detailsUtilisateur.rue;
            this.ville.nom = session.detailsUtilisateur.ville || 'Veuillez choisir une province ou territoire pour sélectionner une ville';
            this.ville.provinceCode = session.detailsUtilisateur.province || '';
            this.province.code = session.detailsUtilisateur.province;
            this.codePostal = session.detailsUtilisateur.codePostal;
        }
        else {
            this.authErrorMessage = 'Vous devez être connecté et non administrateur pour voir cette page !';
            this.dialogue = true;
        }

        fetchProvinces().then((provinces) => {
            this.listeProvinces = provinces;
        }).catch((err) => {
            console.error('erreur:', err);
        });
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

.v-text-field {
    margin-bottom: 10px;
}
</style>
