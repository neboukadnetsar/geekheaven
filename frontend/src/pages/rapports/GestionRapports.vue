<template>
    <div v-if="session && session.detailsUtilisateur && session.detailsUtilisateur.role === 'administrateur'"
        class="d-print-none">
        <EnteteClient>Gestion des rapports</EnteteClient>
    </div>
    <v-container v-if="session && session.detailsUtilisateur && session.detailsUtilisateur.role === 'administrateur'">
        <div>
            <v-expansion-panels>
                <v-expansion-panel>
                    <v-expansion-panel-title class="text-h7 font-weight-bold d-print-none">Gestion de
                        l'inventaire</v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <div class="d-flex flex-column d-print-none my-3 pa-3 border">
                            <v-row>
                                <v-col>
                                    <div>
                                        <v-btn @click="actualiserRapport" elevation="3" density="compact"
                                            prepend-icon="mdi mdi-refresh" title="Actualiser le rapport">Mettre à
                                            jour</v-btn>
                                    </div>
                                </v-col>
                                <v-col>
                                    <div>
                                        <v-btn @click="imprimerRapport" elevation="3" density="compact"
                                            prepend-icon="mdi mdi-printer" title="Imprimer le
                                            rapport">Imprimer le
                                            rapport</v-btn>
                                    </div>
                                </v-col>
                                <v-col>
                                    <div>
                                        <v-btn @click="genererPDF('inventaire')" elevation="3" density="compact"
                                            prepend-icon="mdi mdi-email-fast" title="generer PDF">Sauvegarder en PDF</v-btn>
                                    </div>
                                </v-col>
                                <v-spacer></v-spacer>
                                <v-spacer></v-spacer>
                                <v-spacer></v-spacer>
                                <v-divider></v-divider>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <div class="d-flex">
                                        <p class="text-h7 font-weight-bold mr-3">Afficher produits par catégorie :</p>
                                        <v-select v-model="filtres.categories" :items="categoriesProduits" multiple dense
                                            density="compact" hide-details label="Catégories" clearable></v-select>
                                    </div>
                                </v-col>
                                <v-col>
                                    <v-checkbox hide-details density="compact"
                                        label="Afficher seulement les produits à commander"
                                        v-model="afficherProduitACommander" @change="appliquerFiltre"></v-checkbox>
                                </v-col>
                                <v-spacer></v-spacer>
                                <v-spacer></v-spacer>
                                <v-spacer></v-spacer>
                            </v-row>
                        </div>
                        <div id="impression-rapport-stocks">
                            <div>
                                <div>
                                    <h1>Rapport inventaire</h1>
                                </div>
                                <div class="d-flex">
                                    <p class="text-h7 font-weight-bold">Mis à jour le :&nbsp;</p>
                                    <p :class="{ 'flash-text': flashDate }">{{ currentDateTime }}</p>
                                </div>
                            </div>
                            <div>
                                <v-table class="border" hover>
                                    <thead>
                                        <tr>
                                            <th class="text-left border">
                                                Code
                                            </th>
                                            <th class="text-left border" @click="triParNom">
                                                Nom
                                                <span v-if="colonneTrieInventaire === 'nom'"
                                                    :class="{ 'arrow-up': triNomAscendant, 'arrow-down': !triNomAscendant }"></span>
                                            </th>
                                            <th class="text-left border" @click="triParQuantiteDisponible">
                                                Quantité disponible
                                                <span v-if="colonneTrieInventaire === 'quantiteDisponible'"
                                                    :class="{ 'arrow-up': triQuantiteDisponibleAscendant, 'arrow-down': !triQuantiteDisponibleAscendant }"></span>
                                            </th>
                                            <th class="text-left border" @click="triParQuantiteInventaireVoulue">
                                                Quantité à maintenir
                                                <span v-if="colonneTrieInventaire === 'quantiteInventaireVoulue'"
                                                    :class="{ 'arrow-up': triQuantiteInventaireVoulueAscendant, 'arrow-down': !triQuantiteInventaireVoulueAscendant }"></span>
                                            </th>
                                            <th class="text-left border" @click="triParQuantiteACommander">
                                                Quantité à commander
                                                <span v-if="colonneTrieInventaire === 'quantiteACommander'"
                                                    :class="{ 'arrow-up': triQuantiteACommanderAscendant, 'arrow-down': !triQuantiteACommanderAscendant }"></span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="produit in produitsParCategorieFiltre" :key="produit.nom"
                                            class="noBreak">
                                            <td style="text-align:center;" class="text-left border">{{ produit.upc }}</td>
                                            <td style="text-align:center;" class="text-left border">{{ produit.nom }}</td>
                                            <td style="text-align:center;" class="text-left border">{{
                                                produit.quantite_disponible }}</td>
                                            <td style="text-align:center;" class="text-left border">{{
                                                produit.quantite_inventaire_voulue }}</td>
                                            <td style="text-align:center;" class="text-left border"
                                                :class="{ 'text-danger': (produit.quantite_inventaire_voulue - produit.quantite_disponible) >= (0.5 * produit.quantite_inventaire_voulue) }">
                                                {{ (produit.quantite_inventaire_voulue - produit.quantite_disponible) < 0 ?
                                                    0 : (produit.quantite_inventaire_voulue - produit.quantite_disponible)
                                                }} </td>
                                        </tr>
                                    </tbody>
                                </v-table>
                            </div>
                        </div>
                    </v-expansion-panel-text>
                </v-expansion-panel>

                <v-expansion-panel>
                    <v-expansion-panel-title class="text-h7 font-weight-bold d-print-none">Gestion des
                        ventes</v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <div class="d-flex flex-column d-print-none my-3 pa-3 border">
                            <v-row>
                                <v-col>
                                    <div>
                                        <v-btn @click="actualiserRapport" elevation="3" density="compact"
                                            prepend-icon="mdi mdi-refresh" title="Actualiser le rapport">Mettre à
                                            jour</v-btn>
                                    </div>
                                </v-col>
                                <v-col>
                                    <div>
                                        <v-btn @click="imprimerRapport" elevation="3" density="compact"
                                            prepend-icon="mdi mdi-printer" title="Imprimer le
                                            rapport">Imprimer le
                                            rapport</v-btn>
                                    </div>
                                </v-col>
                                <v-col>
                                    <div>
                                        <v-btn @click="genererPDF('ventes')" elevation="3" density="compact"
                                            prepend-icon="mdi mdi-email-fast" title="generer PDF">Sauvegarder en PDF</v-btn>
                                    </div>
                                </v-col>
                                <v-spacer></v-spacer>
                                <v-spacer></v-spacer>
                                <v-spacer></v-spacer>

                                <v-divider></v-divider>
                            </v-row>
                            <v-row align="center">
                                <v-col>
                                    <p class="text-h7 font-weight-bold mr-3">Afficher par période :</p>
                                    <v-btn @click="reinitialiserPeriode" elevation="3" density="compact"
                                        title="Réinitialiser">Réinitialiser</v-btn>
                                </v-col>
                                <v-col>
                                    <div class="d-flex justify-center text-h7 font-weight-bold mr-3">
                                        <label for="dateDebut">Date de début&nbsp;</label>
                                    </div>
                                    <v-text-field v-model="dateDebut" @change="commandesFiltrees" type="date"
                                        density="compact" hide-details></v-text-field>
                                </v-col>
                                <v-col>
                                    <div class="d-flex justify-center text-h7 font-weight-bold mr-3">
                                        <label for="dateFin">Date de fin&nbsp;</label>
                                    </div>
                                    <v-text-field v-model="dateFin" @change="commandesFiltrees" type="date"
                                        density="compact" hide-details></v-text-field>
                                </v-col>
                                <v-spacer></v-spacer>
                                <v-spacer></v-spacer>
                                <v-spacer></v-spacer>
                                <v-spacer></v-spacer>
                            </v-row>
                        </div>
                        <div id="impression-rapport-stocks">
                            <div>
                                <div>
                                    <h1>Rapport des ventes</h1>
                                </div>
                                <div class="d-flex">
                                    <p class="text-h7 font-weight-bold">Mis à jour le :&nbsp;</p>
                                    <p :class="{ 'flash-text': flashDate }">{{ currentDateTime }}</p>
                                </div>
                                <div v-if="dateDebut || dateFin">
                                    <div class="d-flex">
                                        <p class="text-h7 font-weight-bold">Période début :&nbsp;</p>
                                        <p>{{ dateDebut }}</p>
                                    </div>
                                    <div class="d-flex">
                                        <p class="text-h7 font-weight-bold">Période fin :&nbsp;</p>
                                        <p>{{ dateFin }}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <v-table class="border" hover>
                                    <thead>
                                        <tr>
                                            <th class="text-left border" @click="triParDate">
                                                Date
                                                <span v-if="colonneTrieeCommandes === 'date'"
                                                    :class="{ 'arrow-up': triDateAscendant, 'arrow-down': !triDateAscendant }"></span>
                                            </th>
                                            <th class="text-left border">
                                                Numéro de commande
                                            </th>
                                            <th class="text-left border" @click="triParSousTotal">
                                                Sous-total
                                                <span v-if="colonneTrieeCommandes === 'sousTotal'"
                                                    :class="{ 'arrow-up': triSousTotalAscendant, 'arrow-down': !triSousTotalAscendant }"></span>
                                            </th>
                                            <th class="text-left border" @click="triParTaxes">
                                                Taxes
                                                <span v-if="colonneTrieeCommandes === 'taxes'"
                                                    :class="{ 'arrow-up': triTaxesAscendant, 'arrow-down': !triTaxesAscendant }"></span>
                                            </th>
                                            <th class="text-left border" @click="triParTotal">
                                                Total
                                                <span v-if="colonneTrieeCommandes === 'total'"
                                                    :class="{ 'arrow-up': triTotalAscendant, 'arrow-down': !triTotalAscendant }"></span>
                                            </th>
                                            <th class="text-left border" @click="triEtat">
                                                État
                                                <span v-if="colonneTrieeCommandes === 'etat'"
                                                    :class="{ 'arrow-up': triEtatAscendant, 'arrow-down': !triEtatAscendant }"></span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="commande in commandesFiltrees" :key="commande.id" class="noBreak">
                                            <td style="text-align:center;" class="text-left border">{{
                                                commande.dateCommande.substring(0, 10) }}</td>
                                            <td style="text-align:center;" class="text-left border">{{ commande.id }}</td>
                                            <td style="text-align:center;" class="text-left border">{{
                                                commande.paiement.montantTotal }}</td>
                                            <td style="text-align:center;" class="text-left border">{{
                                                ((commande.paiement.montantTotal) *
                                                    0.14975).toFixed(2) }}</td>
                                            <td style="text-align:center;" class="text-left border">{{
                                                (((commande.paiement.montantTotal)) +
                                                    ((commande.paiement.montantTotal) * 0.14975)).toFixed(2) }}</td>
                                            <td style="text-align:center;" class="text-left border">{{ commande.orderStatus
                                            }}</td>
                                        </tr>
                                    </tbody>
                                </v-table>
                            </div>
                        </div>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </div>
    </v-container>
</template>

<script>
import session from '../../session'
import EnteteClient from '../client/components/enteteclient.vue';
import { fetchProduits, fetchCategories } from '../../ServicesProduits';
import { getAllOrders } from '../../CommandeService';
import html2pdf from 'html2pdf.js';

export default {
    components: {
        EnteteClient
    },
    data: function () {
        return {
            session: session,
            commandes: [],
            commande: {},
            produits: [],
            produitsParCategorieFiltre: [],
            currentDateTime: '',
            filtres: {
                categories: []
            },
            categoriesProduits: [],
            flashDate: false,
            afficherProduitACommander: false,
            triNom: false,
            triQuantiteDisponible: false,
            triNomAscendant: false,
            triQuantiteDisponibleAscendant: false,
            triQuantiteInventaireVoulueAscendant: false,
            triQuantiteACommanderAscendant: false,
            triDateAscendant: false,
            triSousTotalAscendant: false,
            triTaxesAscendant: false,
            triTotalAscendant: false,
            triEtatAscendant: false,
            colonneTrieInventaire: null,
            colonneTrieeCommandes: null,
            dateDebut: null,
            dateFin: null
        }
    },
    methods: {
        async initialize() {
            this.produits = await fetchProduits();
            this.commandes = await getAllOrders();
            this.produitsParCategorieFiltre = this.produits;
            this.categoriesProduits = await fetchCategories();
            this.updateCurrentDateTime();
            this.triParNom();
            this.triParDate();
        },
        triParNom() {
            this.colonneTrieInventaire = 'nom';
            this.triNomAscendant = !this.triNomAscendant;
            this.produitsParCategorieFiltre.sort((a, b) => {
                const orderFactor = this.triNomAscendant ? 1 : -1;
                return orderFactor * a.nom.localeCompare(b.nom);
            });
        },
        triParQuantiteDisponible() {
            this.colonneTrieInventaire = 'quantiteDisponible';
            this.triQuantiteDisponibleAscendant = !this.triQuantiteDisponibleAscendant;
            this.produitsParCategorieFiltre.sort((a, b) => {
                const quantiteA = parseFloat(a.quantite_disponible);
                const quantiteB = parseFloat(b.quantite_disponible);
                const orderFactor = this.triQuantiteDisponibleAscendant ? 1 : -1;
                return orderFactor * (quantiteA - quantiteB);
            });
        },
        triParQuantiteInventaireVoulue() {
            this.colonneTrieInventaire = 'quantiteInventaireVoulue';
            this.triQuantiteInventaireVoulueAscendant = !this.triQuantiteInventaireVoulueAscendant;
            this.produitsParCategorieFiltre.sort((a, b) => {
                const quantiteA = parseFloat(a.quantite_inventaire_voulue);
                const quantiteB = parseFloat(b.quantite_inventaire_voulue);
                const orderFactor = this.triQuantiteInventaireVoulueAscendant ? 1 : -1;
                return orderFactor * (quantiteA - quantiteB);
            });
        },
        triParQuantiteACommander() {
            this.colonneTrieInventaire = 'quantiteACommander';
            this.triQuantiteACommanderAscendant = !this.triQuantiteACommanderAscendant;
            this.produitsParCategorieFiltre.sort((a, b) => {
                const resultatA = parseFloat(a.quantite_inventaire_voulue) - parseFloat(a.quantite_disponible);
                const resultatB = parseFloat(b.quantite_inventaire_voulue) - parseFloat(b.quantite_disponible);
                const orderFactor = this.triQuantiteACommanderAscendant ? 1 : -1;
                return orderFactor * (resultatA - resultatB);
            });
        },
        triParDate() {
            this.colonneTrieeCommandes = 'date';
            this.triDateAscendant = !this.triDateAscendant;
            this.commandesFiltrees.sort((a, b) => {
                const dateA = new Date(a.dateCommande);
                const dateB = new Date(b.dateCommande);
                const orderFactor = this.triDateAscendant ? 1 : -1;
                return orderFactor * (dateA - dateB);
            });
        },
        triParSousTotal() {
            this.colonneTrieeCommandes = 'sousTotal';
            this.triSousTotalAscendant = !this.triSousTotalAscendant;
            this.commandesFiltrees.sort((a, b) => {
                const sousTotalA = a.paiement.montantTotal;
                const sousTotalB = b.paiement.montantTotal;
                const orderFactor = this.triSousTotalAscendant ? 1 : -1;
                return orderFactor * (sousTotalA - sousTotalB);
            });
        },
        triParTaxes() {
            this.colonneTrieeCommandes = 'taxes';
            this.triTaxesAscendant = !this.triTaxesAscendant;
            this.commandesFiltrees.sort((a, b) => {
                const taxesA = (a.paiement.montantTotal) * 0.14975;
                const taxesB = (b.paiement.montantTotal) * 0.14975;
                const orderFactor = this.triTaxesAscendant ? 1 : -1;
                return orderFactor * (taxesA - taxesB);
            });
        },
        triParTotal() {
            this.colonneTrieeCommandes = 'total';
            this.triTotalAscendant = !this.triTotalAscendant;
            this.commandesFiltrees.sort((a, b) => {
                const totalA = (a.paiement.montantTotal) + ((a.paiement.montantTotal) * 0.14975);
                const totalB = (b.paiement.montantTotal) + ((b.paiement.montantTotal) * 0.14975);
                const orderFactor = this.triTotalAscendant ? 1 : -1;
                return orderFactor * (totalA - totalB);
            });
        },
        triEtat() {
            this.colonneTrieeCommandes = 'etat';
            this.triEtatAscendant = !this.triEtatAscendant;
            this.commandesFiltrees.sort((a, b) => {
                const etatA = a.orderStatus;
                const etatB = b.orderStatus;
                const orderFactor = this.triEtatAscendant ? 1 : -1;
                return orderFactor * etatA.localeCompare(etatB);
            });
        },
        async actualiserRapport() {
            this.flashDate = true;
            this.produits = await fetchProduits();
            this.commandes = await getAllOrders();
            this.updateCurrentDateTime();
        },
        imprimerRapport() {
            const contenuImpression = document.getElementById("impression-rapport-stocks").innerHTML;
            const frame1 = document.createElement('iframe');
            frame1.name = "frame1";
            frame1.style.position = "absolute";
            frame1.style.top = "-1000000px";
            document.body.appendChild(frame1);
            const frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;
            frameDoc.document.open();
            frameDoc.document.write('</head><body>');
            frameDoc.document.write(contenuImpression);
            frameDoc.document.close();
            setTimeout(function () {
                window.frames["frame1"].focus();
                window.frames["frame1"].print();
                document.body.removeChild(frame1);
            }, 500);
            return false;
        },
        genererPDF(typeRapport) {
            let contenuPDF = document.getElementById("impression-rapport-stocks");
            let rapportType = typeRapport === 'inventaire' ? 'Rapport - Inventaire' : 'Rapport - Ventes';
            const currentDate = new Date().toISOString().split('T')[0];
            const fileName = `${rapportType} - ${currentDate}.pdf`;

            let options = {
                margin: [10, 10],
                filename: fileName,
                image: { type: "jpeg", quality: 1, format: "a2" },
                html2canvas: { scale: 1, letterRendering: true },
                jsPDF: {
                    unit: "pt",
                    format: "a2",
                    orientation: "portrait",
                },
                pagebreak: { mode: ["avoid-all", "css", "legacy"] }
            };
            html2pdf().set(options).from(contenuPDF).save();
        },
        updateCurrentDateTime() {
            const now = new Date();
            // Format de la date et de l'heure, par exemple : "11 octobre 2023, 15:30:00"
            this.currentDateTime = now.toLocaleString();

            // Désactive le clignotement après 1 seconde
            setTimeout(() => {
                this.flashDate = false;
            }, 1000);
        },
        appliquerFiltre() {
            this.produitsParCategorieFiltre = this.produits.filter(produit => {
                const condition = (produit.quantite_inventaire_voulue - produit.quantite_disponible) >= (0.5 * produit.quantite_inventaire_voulue);

                const categorieProduitActuel = produit.categorie_nom;
                const categorieFiltre = this.filtres.categories;

                if (this.afficherProduitACommander) {
                    return condition && (categorieFiltre.length === 0 || categorieFiltre.includes(categorieProduitActuel));
                } else {
                    return (categorieFiltre.length === 0 || categorieFiltre.includes(categorieProduitActuel));
                }
            });
        },
        reinitialiserPeriode() {
            this.dateDebut = null;
            this.dateFin = null;
        }
    },
    async mounted() {
        this.initialize();
    },
    computed: {
        commandesFiltrees() {
            if (this.dateDebut && this.dateFin) {
                return this.commandes.filter(commande => {
                    const dateCommande = new Date(commande.dateCommande);
                    return dateCommande >= new Date(this.dateDebut) && dateCommande <= new Date(this.dateFin);
                });
            } else {
                return this.commandes;
            }
        },
        filtresActifs() {
            return this.filtres.categories.length > 0;
        },
    },
    watch: {
        'filtres.categories': 'appliquerFiltre',
        'produits': 'appliquerFiltre'
    }
}
</script>

<style>
.flash-text {
    animation: flash-greenyellow 2s alternate infinite;
    color: greenyellow;
}

@keyframes flash-greenyellow {
    0% {
        color: greenyellow;
    }

    100% {
        color: black;
    }
}

.noBreak {
    break-inside: avoid;
}

.text-danger {
    color: red;
}

/* Flèche vers le haut */
.arrow-up::before {
    content: "\25B2";
    /* Utilisez le caractère Unicode de la flèche vers le haut */
}

/* Flèche vers le bas */
.arrow-down::before {
    content: "\25BC";
    /* Utilisez le caractère Unicode de la flèche vers le bas */
}
</style>