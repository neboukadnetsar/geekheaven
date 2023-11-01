import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
// import { VDataTable } from 'vuetify/labs/VDataTable';
import * as components from 'vuetify/components';
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

import App from './App.vue';
import TableauDeBord from './pages/client/TableauDeBord.vue';
import Accueil from './pages/Accueil.vue';
import CreationNouveauCompte from './pages/client/CreationNouveauCompte.vue';
import FormulaireProduit from './pages/produits/FormulaireProduit.vue';
import GestionRapports from './pages/rapports/GestionRapports.vue';
import ProduitDetails from './pages/produits/ProduitDetails.vue';
import ProduitsCategorie from './pages/produits/ProduitsCategorie.vue';
import ConnexionCompte from './pages/client/ConnexionCompte.vue';
import Adresse from './pages/client/ongletsTableauDeBord/Adresse.vue';
import Infolettre from './pages/client/ongletsTableauDeBord/Infolettre.vue';
import DeconnexionCompte from './pages/client/ongletsTableauDeBord/DeconnexionCompte.vue';
import Panier from './pages/client/Panier.vue';
import TableauDeBordOnglet from './pages/client/ongletsTableauDeBord/TableauDeBord.vue';
import InfosDuCompte from './pages/client/ongletsTableauDeBord/InfosDuCompte.vue';
import Caisse from './pages/client/Caisse.vue';
import CommandesAdmin from './pages/client/ongletsTableauDeBord/ongletsAdmin/CommandesAdmin.vue';
import ClientsAdmin from './pages/client/ongletsTableauDeBord/ongletsAdmin/ClientsAdmin.vue';

// //transfers sessionStorage from one tab to another
// var sessionStorage_transfer = function (event) {
//   if (!event) { event = window.event; } // ie suq
//   if (!event.newValue) return;          // do nothing if no value to work with
//   if (event.key == 'getSessionStorage') {
//     // another tab asked for the sessionStorage -> send it
//     localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
//     // the other tab should now have it, so we're done with it.
//     localStorage.removeItem('sessionStorage'); // <- could do short timeout as well.
//   } else if (event.key == 'sessionStorage' && !sessionStorage.length) {
//     // another tab sent data <- get it
//     var data = JSON.parse(event.newValue);
//     for (var key in data) {
//       sessionStorage.setItem(key, data[key]);
//     }
//   }
// };

// // listen for changes to localStorage
// if (window.addEventListener) {
//   window.addEventListener("storage", sessionStorage_transfer, false);
// } else {
//   window.attachEvent("onstorage", sessionStorage_transfer);
// };


// // Ask other tabs for session storage (this is ONLY to trigger event)
// if (!sessionStorage.length) {
//   localStorage.setItem('getSessionStorage', 'foobar');
//   localStorage.removeItem('getSessionStorage', 'foobar');
// };

// window.onload = function () {
//   if (!window.location.hash) {
//     window.location = window.location + '#loaded';
//     window.location.reload();
//   }
// }

const app = createApp(App);

// Déclaration de Vue Router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/produits/ajouter-produit', component: FormulaireProduit },
    { path: '/rapports', component: GestionRapports },
    { path: '/', component: Accueil },
    { path: '/produits/modifier-produit/:id', component: FormulaireProduit, props: true },
    { path: '/produits/details-produit/:id', component: ProduitDetails, props: true },
    { path: '/produits/categorie/:categorie', component: ProduitsCategorie, props: true },
    { path: '/client/connexion', component: ConnexionCompte },
    { path: '/client/inscription', component: CreationNouveauCompte },
    {
      path: '/client/tableau-de-bord',
      component: TableauDeBord,
      children: [
        {
          path: 'tableau-de-bord',
          component: TableauDeBordOnglet
        },
        {
          path: 'adresse',
          component: Adresse
        },
        {
          path: 'infolettre',
          component: Infolettre
        },
        {
          path: 'logout',
          component: DeconnexionCompte
        },
        {
          path: 'infos-du-compte',
          component: InfosDuCompte
        },
        {
          path: 'admin/commandes',
          component: CommandesAdmin
        },
        {
          path: 'admin/clients',
          component: ClientsAdmin
        }
      ]
    },
    { path: '/panier', component: Panier },
    { path: '/caisse', component: Caisse },
  ]
});

// Ajout de Vue Router à l'application
app.use(router);

const vuetify = createVuetify({
  components: {
    ...components,
    ...labsComponents
  },
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  }
});

app.use(vuetify);

app.mount("#app");
