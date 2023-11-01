<template>
    <v-app id="main-background">
        <MenuNavigation class="d-print-none" />
        <v-main class="main">
            <router-view></router-view>
        </v-main>
        <Footer class="d-print-none" />

    </v-app>
</template>

<script>
import { computed } from 'vue';

import MenuNavigation from './components/MenuNavigation.vue';
import Footer from './components/Footer.vue';
export default {
    components: {
        MenuNavigation,
        Footer
    },
    data: function () {
        return {

        };
    },
    async mounted() {

    },
    watch: {
        produits() {

        }
    },
    mounted() {

    }
}
</script>
