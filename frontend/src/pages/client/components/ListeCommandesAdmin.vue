<template>
    <!-- :show-select="ordersStatus.toUpperCase() === 'CONFIRMEE' && detailsUtilisateurRole === 'administrateur'" -->
    <v-data-table :headers="headers" v-model="selectedValues" id="dundee"
        :items="allOrders.filter(order => ordersStatus === 'Tous' || ordersStatus.toUpperCase() === order.orderStatus.toUpperCase())">
        <template v-slot:item.data-table-select="{ item }">
            <v-checkbox-btn :disabled="item.orderStatus !== 'CONFIRMEE'" v-model="selectedValues" :value="item.id"
                :class="getClass(item)"></v-checkbox-btn>
        </template>
        <template v-slot:item.id="{ value, item }">
            <div @click="voirDetailsCommande(item)" :class="getClass(item)">{{ value }}</div>
        </template>
        <template v-slot:item.userId="{ value, item }">
            <div @click="voirDetailsCommande(item)" :class="getClass(item)">{{ value }}</div>
        </template>
        <template v-slot:item.dateCommande="{ value, item }">
            <div @click="voirDetailsCommande(item)" :class="getClass(item)">{{ formatDate(value) }}</div>
        </template>
        <template v-slot:item.orderStatus="{ value, item }">
            <div @click="voirDetailsCommande(item)" :class="getClass(item)"><v-chip :color="getStatusColor(value)">{{ value
            }}</v-chip></div>
        </template>
    </v-data-table>
    <v-dialog v-model="dialogue" width="auto">
        <v-card width="mx-auto">
            <v-card-title class="blue lighten-2 white--text">
                <v-icon left>mdi-cart</v-icon>
                Commande n° {{ item.id }}
            </v-card-title>

            <v-card-subtitle class="blue lighten-4">
                <v-icon left>mdi-calendar</v-icon>
                Date: {{ formatDate(item.dateCommande) }}
            </v-card-subtitle>

            <div v-if="detailsUtilisateurRole === 'administrateur'">
                <v-card-actions class="blue lighten-4 mb-2 pb-0" v-if="item.orderStatus === 'CONFIRMEE'">
                    <v-btn color="primary" @click="envoyerCommande(item.id)" class="elevation-4">
                        Envoyer la commande
                    </v-btn>

                    <v-btn color="error" @click="supprimerCommande(item.id)" class="elevation-4">
                        Supprimer la commande
                    </v-btn>
                </v-card-actions>
            </div>

            <v-card-text>
                <div class="mb-8 subtitle-1">
                    <v-icon left :color="getStatusColor(item.orderStatus)">{{ getStatusIcon(item.orderStatus) }}</v-icon>
                    Statut de la commande: <span :style="{ color: getStatusColor(item.orderStatus) }">{{ item.orderStatus
                    }}</span>
                </div>

                <div class="my-4 subtitle-1">
                    <v-icon left color="green">mdi-account</v-icon>
                    Détails du client
                </div>

                <div>
                    Nom: {{ item.adresseExpedition.prenom }} {{ item.adresseExpedition.nom }}
                </div>

                <div>
                    Email: {{ item.userId }}
                </div>

                <div class="my-4 subtitle-1">
                    <v-icon left color="orange">mdi-credit-card</v-icon>
                    Détails du paiement
                </div>

                <div>
                    Adresse: {{ item.paiement.adresse.numero }} {{ item.paiement.adresse.rue }}, {{
                        item.paiement.adresse.ville }}, {{ item.paiement.adresse.province }}, {{
        item.paiement.adresse.codePostal }}
                </div>

                <div>
                    Points utilisés: {{ item.paiement.pointUtilises }}
                </div>

                <div>
                    Montant total: {{ item.paiement.montantTotal }}
                </div>

                <div class="my-4 subtitle-1">
                    <v-icon left color="purple">mdi-truck</v-icon>
                    Détails de l'expédition
                </div>

                <div>
                    Mode d'expédition: {{ item.modeExp || 'Non spécifié' }}
                </div>

                <div>
                    Adresse: {{ item.adresseExpedition.numero }} {{ item.adresseExpedition.rue }}, {{
                        item.adresseExpedition.ville }}, {{ item.adresseExpedition.province }}, {{
        item.adresseExpedition.codePostal }}
                </div>

                <div class="my-4 subtitle-1">
                    <v-icon left color="red">mdi-basket</v-icon>
                    Détails de la commande
                </div>

                <v-table :cell-padding="30" :cell-spacing="15">
                    <thead>
                        <tr>
                            <th class="text-left"> Produit </th>
                            <th class="text-left"> Quantité </th>
                            <th class="text-left"> Prix unitaire </th>
                            <th class="text-left"> Prix total </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in item.cart" :key="item.produitId">
                            <td>{{ item.produitId }}</td>
                            <td>{{ item.quantite }}</td>
                            <td>{{ item.prixVente }}</td>
                            <td>{{ item.quantite * item.prixVente }}</td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>


<script>
import { getAllOrders, deleteOrder, expediateOrder, getOrdersByUser } from '../../../CommandeService';

export default {
    props: {
        ordersStatus: String,
        detailsUtilisateurRole: String,
        courriel: String
    },
    data() {
        return {
            item: null,
            dialogue: false,
            selected: [],
            headers: [
                {
                    title: 'Numéro de commande',
                    align: 'start',
                    sortable: false,
                    key: 'id',
                },
                { title: 'Client', key: 'userId' },
                { title: 'Date de la commande', key: 'dateCommande' },
                { title: 'Statut', key: 'orderStatus' }
            ],
            allOrders: [],
            selectedValues: [],
            filtrageEnCours: false
        }
    },
    methods: {
        supprimerCommande(orderId) {
            deleteOrder(orderId).then(() => {
                console.log(`SUPPRESSION DE LA COMMANDE ${orderId} EFFECTUEE AVEC SUCCES`);
                this.loadOrdersList();
            }).catch((err) => {
                console.error('ERREUR : ', err);
                console.log('ERREUR DANS LA SUPPRESSION DE LA COMMANDE');
            })
        },
        envoyerCommande(orderId) {
            expediateOrder(orderId).then(() => {
                console.log(`ENVOIE DE LA COMMANDE ${orderId} EFFECTUEE AVEC SUCCES`);
                this.loadOrdersList();
            }).catch((err) => {
                console.error('ERREUR : ', err);
                console.log('ERREUR DANS L\'ENVOIE DE LA COMMANDE');
            })
        },
        loadOrdersList() {
            if (this.detailsUtilisateurRole === 'administrateur') {
                getAllOrders().then(ordersList => {
                    this.allOrders = ordersList;
                    if (this.item) {
                        const itemFind = this.allOrders.find(commande => commande.id === this.item.id);
                        itemFind ? this.item = itemFind : null;
                    }
                }).catch(err => {
                    console.error(err);
                })
            }
            else if (this.detailsUtilisateurRole === 'utilisateur') {
                getOrdersByUser(this.courriel).then(ordersList => {
                    this.allOrders = ordersList;
                    if (this.item) {
                        const itemFind = this.allOrders.find(commande => commande.id === this.item.id);
                        itemFind ? this.item = itemFind : null;
                    }
                }).catch(err => {
                    console.error(err);
                })
            }

        },
        voirDetailsCommande(item) {
            console.log(item)
            this.item = item;
            this.dialogue = true;
        },
        getClass(item) {
            // this.refreshKey;
            // if (this.selectedValues.find(orderSelected => orderSelected === item.id)) {
            //     return 'selected';
            // }
            if (this.selectedValues.includes(item.id) && item.orderStatus === 'CONFIRMEE') {
                return 'selected';
            }
        },
        getStatusColor(status) {
            switch (status) {
                case 'CONFIRMEE':
                    return 'green'
                case 'ENVOYEE':
                    return 'rgba(255, 137, 41)'
                case 'SUPPRIMEE':
                    return 'red'
                default:
                    return 'grey'
            }
        },
        getStatusIcon(status) {
            switch (status) {
                case 'CONFIRMEE':
                    return 'mdi-check'
                case 'ENVOYEE':
                    return 'mdi-send'
                case 'SUPPRIMEE':
                    return 'mdi-delete'
                default:
                    return ''
            }
        },
        formatDate(date)
        {
            return date.split('T').splice(0)[0];
        }
    },
    computed: {
        // selectedValuesLength() {
        //     return this.selectedValues.length;
        // },
        // orderDate()
        // {
        //     return this.order.orderDateTime.split('T').splice(0)[0];
        // }
    },
    watch: {
        // selectedValuesLength() {
        //     console.log('SELECTED_VALUES : ', this.selectedValues);
        // },
        ordersStatus() {
            this.selectedValues = [];
        }
    },
    mounted() {
        this.loadOrdersList()
    }
}
</script>

<style>
#dundee.v-table>.v-table__wrapper>table>tbody>tr:hover {
    cursor: pointer;
    background: rgba(177, 139, 253, 0.3) !important;
}

#dundee.v-table>.v-table__wrapper>table>tbody>tr>td>div {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
}

#dundee.v-table>.v-table__wrapper>table th {
    padding: 0px
}

#dundee.v-table>.v-table__wrapper>table>tbody>tr>td {
    padding: 0px
}

.selected {
    background: rgba(183, 183, 183, 0.3) !important;
}
</style>