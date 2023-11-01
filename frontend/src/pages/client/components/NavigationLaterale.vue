<template>
    <v-card class="mx-auto" width="256">
        <v-list :lines="false" density="compact" class="v-list" nav ref="list" v-model:selected="selected">
            <v-list-item
                v-for="(item, i) in items.filter(item => ((item.admin === true && this.detailsUtilisateurRole === 'administrateur' || item.admin === false && this.detailsUtilisateurRole === 'utilisateur') || item.admin === null))"
                :key="i" color="primary" :to="item.route" ref="item" nav v-if="detailsUtilisateurRole">
                <!-- :value="item.text"  PAS METTRE ÇA POUR EVITER CONFLITS ENTRE SELECTED ET ROUTER -->
                <template v-slot:prepend ref="dundee">
                    <v-icon :icon="item.icon"></v-icon>
                </template>
                <v-list-item-title v-text="item.text"></v-list-item-title>
            </v-list-item>
        </v-list>
    </v-card>
</template>
  
<script>
import session from '../../../session';
import { watch } from 'vue';
import { getCurrentInstance } from 'vue';

export default {
    data() {
        return {
            detailsUtilisateurRole: null,
            selected: null,
            items: [
                { text: 'Tableau-de-bord', icon: 'mdi-view-dashboard', admin: false, route: '/client/tableau-de-bord/tableau-de-bord' },
                { text: 'Informations du compte', icon: 'mdi-information-variant-circle-outline', admin: false, route: '/client/tableau-de-bord/infos-du-compte' },
                { text: 'Mon adresse', icon: 'mdi-map-marker', admin: false, route: '/client/tableau-de-bord/adresse' },
                { text: 'Mes commandes', icon: 'mdi-clipboard-list-outline', admin: false, route: '/client/tableau-de-bord/admin/commandes' },
                { text: 'Infolettre', icon: 'mdi-email-newsletter', admin: false, route: '/client/tableau-de-bord/infolettre' },
                // { text: 'Points Geeko', icon: 'mdi-account-cash', admin: false },
                { text: 'Commandes', icon: 'mdi-clipboard-list-outline', admin: true, route: '/client/tableau-de-bord/admin/commandes' },
                { text: 'Clients', icon: 'mdi mdi-account-multiple-outline', admin: true, route: '/client/tableau-de-bord/admin/clients' },
                { text: 'Rapports', icon: 'mdi-post-outline', admin: true, route: '/rapports' },
                { text: 'Ajouter un produit', icon: 'mdi-plus', admin: true, route: '/produits/ajouter-produit' },
                { text: 'Déconnexion', icon: 'mdi mdi-logout', admin: null, route: '/client/tableau-de-bord/logout' }
            ]
        };
    },
    mounted() {
        if (session.loaded === true) {
            this.detailsUtilisateurRole = session.detailsUtilisateur.role;
        }
    },
    setup() {
        const instance = getCurrentInstance();
        watch(() => session.loaded, (newValue, oldValue) => {
            // console.log(`Le message a changé de ${oldValue} à ${newValue}`);
            if (newValue === true) {
                instance.data.detailsUtilisateurRole = session.detailsUtilisateur.role;
            }
        });
    }
}
</script>

<style>
.v-list {
    font-size: 1.5rem;
}
</style>