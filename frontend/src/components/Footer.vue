<template>
    <v-footer v-if="!estRapportsRoute" class="d-flex flex-column bg-grey-lighten-1 text-center"
        style="border-top: 8px solid #666666;">

        <v-row class="w-50 pt-6" no-gutters>
            <v-col cols="12">
                <router-link class="d-flex justify-center" to="/"><v-img max-height="5rem" max-width="50rem" cover
                        src="../../images/logo_footer.jpg" alt="logo"></v-img></router-link>
            </v-col>
            <v-col cols="6">
                <div class="text-left text-body-3 pt-2">
                    <p><strong>Tel</strong> : 819-123-4567</p>
                    <p><strong>Courriel</strong> : <a href="mailto:info@geekheaven.com"
                            style="text-decoration: none;">info@geekheaven.com</a></p>
                    <p><strong>Adresse</strong> : 3050 boulevard Portland, Sherbrooke, QC, J1L 1K1 </p>
                </div>
                <div class="d-flex pt-6 justify-start">
                    <iframe width="75%" height="300" frameborder="1" scrolling="no"
                        src="https://www.openstreetmap.org/export/embed.html?bbox=-71.95254,45.40146,-71.95254,45.40146&amp;layer=mapnik&amp;marker=45.40146,-71.95254"></iframe>
                </div>
            </v-col>

            <v-col class="d-flex align-center" cols="6">
                <div class="d-flex align-start">
                    <div>
                        <v-col>
                            <p class="text-h5 mb-1 font-weight-bold">Entreprise</p>
                            <p>Mon compte</p>
                            <p>Qui nous sommes</p>
                            <p>Emplois</p>
                            <p>Commentaires</p>
                        </v-col>
                    </div>
                    <v-divider class="d-flex ms-3 align-se-center" inset vertical></v-divider>
                    <div>
                        <v-col>
                            <p class="text-h5 mb-1 font-weight-bold">Support</p>
                            <p>Contactez-nous</p>
                            <p>Politique de confidentialité</p>
                            <p>FAQ</p>
                        </v-col>
                    </div>
                    <v-divider class="d-flex ms-3 align-se-center" inset vertical></v-divider>
                    <div>
                        <v-col>
                            <p class="text-h5 mb-1 font-weight-bold">Suivez-nous!</p>
                            <div class="d-flex align-center">
                                <v-btn v-for="icon in icons" :key="icon" class="mx-4" :icon="icon" variant="text"></v-btn>
                            </div>
                        </v-col>
                    </div>
                </div>
            </v-col>
        </v-row>
        <v-row no-gutters>
            <v-col>
                © <strong>Geek Heaven</strong> {{ new Date().getFullYear() }}
            </v-col>
        </v-row>
    </v-footer>
</template>

<script>
export default {

    data: function () {
        return {
            estRapportsRoute: false,
            dialogue: false,
            icons: [
                'mdi-facebook',
                'mdi-instagram',
                'mdi mdi-music-note-outline'
            ]
        };
    },
    async mounted() {

    },
    computed: {
        currentRoute() {
            //Valider la route actuelle pour cacher le footer sur les pages de gestion rapports et tableau de bord
            return this.$route.path;
        }
    },
    watch: {
        currentRoute(newRoute) {
            this.estRapportsRoute = newRoute.match(/^\/(client\/tableau-de-bord|rapports)(\/.*)?$/) !== null;
        }
    }
};

</script>

<style></style>