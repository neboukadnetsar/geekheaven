<template>
    <div v-if="session && session.detailsUtilisateur && session.detailsUtilisateur.role === 'administrateur'">
        <EnteteClient v-if="!modification">Ajout de produit</EnteteClient>
        <EnteteClient v-else>Modification d'un produit</EnteteClient>
        <v-form ref="form">
            <v-container>
                <v-row>
                    <v-col cols="6">
                        <v-text-field v-model="produit_id"
                            :rules="[basicRule, v => /^[a-zA-Z0-9_&]+$/.test(v) || 'Caractères permis : a-z, A-Z, 0-9, _, &']"
                            :disabled="modification" label="Identifiant" required></v-text-field>
                        <v-text-field v-model="nom" :rules="[basicRule]" label="Nom" required></v-text-field>
                        <v-select v-model="categorie" :rules="[basicRule]" label="Catégorie" :items="categories"
                            required></v-select>
                        <v-row>
                            <v-col cols="6">
                                <v-select v-model="langue" label="Langue" :items="langues"></v-select>
                                <v-select v-model="genre" label="Genre" :items="genres"></v-select>
                                <v-text-field v-model="auteur" label="Auteur"></v-text-field>
                                <v-text-field v-model="temps_jeu_minutes" :rules="[integerRule]"
                                    label="Durée (min)"></v-text-field>

                                <v-text-field v-model="quantite" :rules="[basicRule, integerRule]" label="Quantité"
                                    required></v-text-field>
                                <v-text-field v-if="categorie === 'Librairie'" v-model="isbn" :rules="[upcRule]"
                                    label="ISBN"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field v-model="upc" :rules="[upcRule]" label="UPC"></v-text-field>
                                <v-text-field v-model="age" :rules="[integerRule]" label="Âge"></v-text-field>
                                <v-text-field v-model="editeur" label="Éditeur"></v-text-field>
                                <v-text-field v-model="nb_joueurs" :rules="[integerRule]"
                                    label="Nombre de joueurs"></v-text-field>

                                <v-text-field v-model="prix" :rules="[basicRule, prixRule]" label="Prix"
                                    required></v-text-field>
                                <v-text-field v-if="categorie === 'Librairie'" v-model="nb_pages" :rules="[integerRule]"
                                    label="Nombre de pages"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-checkbox v-model="est_actif" hide-details label="Disponible"></v-checkbox>
                        <v-textarea v-model="description" :rules="[basicRule]" label="Description" required></v-textarea>
                    </v-col>
                    <v-col cols="6">
                        <v-carousel v-if="images.length !== 0">
                            <v-carousel-item v-for="(image, index) in images" :key="index" :src="image.data">
                                <v-icon @click="deleteImage(index)" class="delete-icon">mdi-delete</v-icon>
                            </v-carousel-item>
                        </v-carousel>
                        <div v-else class="d-flex align-center justify-center"
                            style="background-color: gainsboro; height: 400px;">Ajouter une image</div>
                        <v-row align="center" justify="center">
                            <v-col cols="6">
                                <v-file-input v-model="imageFiles" multiple accept="image/*" label="Image"
                                    @change="onFileChange" variant="filled" prepend-icon="mdi-camera"></v-file-input>
                            </v-col>
                            <v-col cols="6">
                                <v-btn size="x-large" density="default" @click="validate">Sauvegarder</v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-dialog v-model="dialogue" width="auto" theme="dark" persistent>
                    <v-alert type="warning" title="Suppression d'image"
                        text="Êtes-vous certain de vouloir supprimer cette image?">
                        <v-row class="mt-1 pa-4">
                            <v-btn @click="dialogue = false; supprimerImage = true;" class="mr-5">SUPPRIMER</v-btn>
                            <v-btn @click="dialogue = false;">ANNULER</v-btn>
                        </v-row>
                    </v-alert>

                </v-dialog>
            </v-container>

        </v-form>
    </div>
</template>

<script>

import { fetchCategories, fetchLangues, fetchGenres, fetchProduit, postProduit, putProduit, fetchImages, putImage, deleteImage } from '../../ServicesProduits'
import session from '../../session'
import EnteteClient from '../client/components/EnteteClient.vue'

export default {
    props: {
        id: String
    },
    components: {
        EnteteClient
    },
    data: function () {
        return {
            session: session,
            modification: false,
            produit_id: '',
            nom: '',
            categorie: '',
            langue: null,
            upc: null,
            genre: null,
            age: null,
            auteur: null,
            editeur: null,
            nb_joueurs: null,
            quantite: '',
            prix: '',
            isbn: null,
            nb_pages: null,
            temps_jeu_minutes: null,
            est_actif: false,
            description: '',
            imageFiles: [],
            images: [],
            categories: [],
            langues: [],
            genres: [],
            dialogue: null,
            supprimerImage: false
        }
    },
    watch: {
        '$route'(to, from) {
            if (from.path.includes('/produits/modifier-produit') && to.path.includes('/produits/ajouter-produit')) {
                this.produit_id = ''
                this.modification = false
                this.nom = ''
                this.categorie = ''
                this.langue = null
                this.upc = null
                this.genre = null
                this.age = null
                this.auteur = null
                this.editeur = null
                this.nb_joueurs = null
                this.quantite = ''
                this.prix = ''
                this.isbn = null
                this.nb_pages = null
                this.temps_jeu_minutes = null
                this.est_actif = false
                this.description = ''
                this.images = []
            }
        }
    },
    methods: {
        basicRule(value) {
            if (value) return true
            return 'Champs requis'
        },
        integerRule(value) {
            if (/^[1-9]\d*$/.test(value) || !value) return true
            return 'L\'entrée doit être donné en format nombre entier'
        },
        upcRule(value) {
            if (/^\d+$/.test(value) || !value) return true
            return 'L\'entrée doit être composé seulement de nombre 0-9'
        },
        prixRule(value) {
            if (/^[1-9]\d*(\.\d{1,2})?$/.test(value)) return true
            return 'Entrer le prix dans le format suivant 10.99'
        },
        async initialize() {
            this.categories = await fetchCategories()
            this.langues = await fetchLangues()
            this.genres = await fetchGenres()
            if (this.produit_id) {
                this.modification = true
                try {
                    const produit = await fetchProduit(this.produit_id)
                    this.fillProductInformations(produit)
                    this.images = await fetchImages(this.produit_id)
                } catch (err) {
                    alert(err.message)
                    this.$router.push('/')
                }
            }
        },
        onFileChange() {
            if (this.imageFiles && this.imageFiles.length > 0) {
                this.imageFiles.forEach((file) => {
                    const reader = new FileReader()
                    reader.onload = e => {
                        this.images.push({ new: true, data: e.target.result, file: file })
                        this.imageFiles = null
                    }
                    reader.readAsDataURL(file)
                })
            }
        },
        fillProductInformations(produit) {
            //this.produit_id = produit.id
            this.nom = produit.nom
            this.categorie = produit.categorie_nom
            this.langue = produit.langue_langue
            this.upc = produit.upc
            this.genre = produit.genres_jeux_livre_nom
            this.age = produit.age
            this.auteur = produit.auteur
            this.editeur = produit.editeur
            this.nb_joueurs = produit.nb_joueurs
            this.quantite = produit.quantite_disponible
            this.prix = produit.prix
            this.isbn = produit.isbn
            this.nb_pages = produit.nb_pages
            this.temps_jeu_minutes = produit.temps_jeu_minutes
            this.est_actif = produit.est_actif
            this.description = produit.description
        },
        async validate() {
            const { valid } = await this.$refs.form.validate()
            if (valid) {
                await this.sendForm()
                await this.sendImage()
                this.$router.push('/produits/details-produit/' + this.produit_id)
            } else {
                alert('Remplir tout les champs obligatoires.')
            }
        },
        async sendForm() {
            const produit = {
                id: this.produit_id,
                upc: this.upc ? this.upc : null,
                nom: this.nom,
                prix: this.prix,
                quantite_disponible: this.quantite,
                description: this.description,
                isbn: this.isbn ? this.isbn : null,
                nb_pages: this.nb_pages ? this.nb_pages : null,
                auteur: this.auteur ? this.auteur : null,
                editeur: this.editeur ? this.editeur : null,
                nb_joueurs: this.nb_joueurs ? this.nb_joueurs : null,
                temps_jeu_minutes: this.temps_jeu_minutes ? this.temps_jeu_minutes : null,
                age: this.age ? this.age : null,
                est_actif: this.est_actif,
                langue_langue: this.langue ? this.langue : null,
                genres_jeux_livre_nom: this.genre ? this.genre : null,
                categorie_nom: this.categorie
            }
            if (this.modification) {
                console.log(await putProduit(produit))
            } else {
                console.log(await postProduit(produit))
            }
        },
        async sendImage() {
            if (this.images && this.images.length !== 0) {
                Promise.all(this.images.map(image => {
                    if (image.new) {
                        return putImage(this.produit_id, image.file)
                    }
                })).then(images => {
                    console.log(images)
                }).catch(err => {
                    console.log(err)
                })
            }
        },
        async deleteImage(index) {
            this.supprimerImage = false
            this.dialogue = true

            const unwatch = this.$watch('dialogue', async (newVal) => {
                if (!newVal && this.supprimerImage) {
                    if (!this.images[index].new) {
                        console.log(await deleteImage(this.images[index].id))
                    }
                    this.images.splice(index, 1)
                }
                unwatch()
            })
        }
    },
    mounted() {
        if (this.id)
            this.produit_id = this.id
        this.initialize()
    }
}
</script>

<style scoped>
.delete-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    color: white;
}

.carousel-image-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 90%;
    /* Pour occuper toute la hauteur du conteneur du carrousel */
}
</style>