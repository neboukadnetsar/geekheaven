<template>
    <v-row>
        <v-col cols="12">
            <EnteteClient>Tableau de bord</EnteteClient>
            <v-alert v-if="$route.query.alertVisible" type="success" closable>
                Votre commande a été reçue!
            </v-alert>
        </v-col>
    </v-row>
    <v-row>
        <v-spacer /><v-spacer />
        <v-col>
            <NavigationLaterale :key="componentKey"/>
        </v-col>
        <v-spacer />
        <v-col cols="9">
            <v-sheet elevation="4" class="mr-5 pa-4" min-height="calc(100vh - 300px)">
                <RouterView @forceRerender="forceRerender"/>
            </v-sheet>
        </v-col>
    </v-row>
</template>

<script>
import EnteteClient from './components/EnteteClient.vue';
import NavigationLaterale from './components/NavigationLaterale.vue';

export default {
    components: {
        EnteteClient,
        NavigationLaterale
    },
    data() {
        return {
            componentKey: 0,
        };
    },
    methods: {
        forceRerender() {
            // this.componentKey += 1;
            // PAS NECESSAIRE SI ON ENLEVE :value dans navigation !!!
        }
    }
}
</script>