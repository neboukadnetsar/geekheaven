<template>
    <v-data-table id="clients-table" :headers="headers" :items="clients" :items-per-page="10" class="elevation-1">
        <template v-slot:item.courriel="{ item }">
            <div @click="openDialog(item)">{{ item.courriel }}</div>
        </template>
        <template v-slot:item.nom="{ item }">
            <div @click="openDialog(item)">{{ item.nom }}</div>
        </template>
        <template v-slot:item.prenom="{ item }">
            <div @click="openDialog(item)">{{ item.prenom }}</div>
        </template>
        <template v-slot:item.estActif="{ item }">
            <div @click="openDialog(item)"><v-chip :color="item.estActif ? 'green' : 'red'">{{item.estActif ? 'Vrai' : 'Faux'}}</v-chip></div>
        </template>
    </v-data-table>
    <v-dialog v-model="dialog" :key="selectedUser.id" max-width="600px">
        <v-card>
            <v-container>
                <v-card-title>
                    <v-row>
                        <v-col cols="9">
                            <div class="text-h4"><v-icon icon="mdi mdi-account"/> {{ selectedUser.prenom + ' ' + selectedUser.nom }}</div>
                        </v-col>
                        <v-col cols="3" class="text-end">
                            <v-btn 
                                class="mt-1"
                                :color="selectedUser.estActif ? 'red' : 'green'"
                                variant="outlined"
                                @click="clientActiveStatusHandler(selectedUser.courriel, !selectedUser.estActif)"
                            >
                                {{ selectedUser.estActif ? 'Désactiver' : 'Activé' }}
                            </v-btn>
                        </v-col>
                    </v-row>
                    
                </v-card-title>
                <v-card-text class="mt-2">
                    <v-row>
                        <v-col>
                            <span class="text-h5"><span class="mdi mdi-information-outline"></span><strong> Infos client:</strong></span>
                            <div class="mt-2 text-body-1">
                                <p><strong>Geeko Points:</strong> {{ selectedUser.pointsFidelite }}</p>
                                <p><strong>Courriel:</strong> {{ selectedUser.courriel }}</p>
                                <p><strong>Téléphone:</strong> {{ formatPhoneNumber(selectedUser.telephone) }}</p>
                                <p :class="selectedUser.estActif ? 'bg-green' : 'bg-red'"><strong>Est Actif:</strong> {{ selectedUser.estActif ? 'Vrai' : 'Faux' }}</p>
                            </div>
                        </v-col>
                        <v-col>
                            <span class="text-h5"><span class="mdi mdi-home"></span><strong> Adresse:</strong></span>
                            <div class="ml-1 mt-2 text-body-1">
                                <div v-if="selectedUser.adresseActive">
                                    <div>
                                        <span>{{ selectedUser.numeroCivique }}</span>
                                        <span> {{ ' ' + selectedUser.rue }}</span>
                                    </div>
                                    <div>
                                        <span>{{ selectedUser.ville }}</span>
                                        <span>{{ ', ' + selectedUser.province }}</span>
                                    </div>
                                    <div>
                                        <span>Canada {{ selectedUser.codePostal }}</span>
                                    </div>
                                </div>
                                <div v-else>
                                    <p>Aucune adresse configurée.</p>
                                </div>                                
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-container>
            
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import session from '../../../session'

export default {
    props: {
        clients: Array,
    },
    data() {
        return {
            headers: [
                { title: 'Courriel', key: 'courriel' },
                { title: 'Nom', key: 'nom' },
                { title: 'Prenom', key:'prenom' },
                { title: 'Est Actif', key: 'estActif' },
            ],
            dialog: false,
            selectedUser: {},
        };
    },
    methods: {
        openDialog(item) {
            this.selectedUser = item;
            this.dialog = true;
        },
        formatAddress(user) {
            return `${user.numeroCivique} ${user.rue}, ${user.ville}, ${user.province}, ${user.codePostal}`;
        },
        formatPhoneNumber(number) {
            if (number.length !== 10) {
                return 'Invalid number';
            }

            const areaCode = number.substring(0, 3);
            const centralOfficeCode = number.substring(3, 6);
            const stationCode = number.substring(6, 10);

            return `(${areaCode}) ${centralOfficeCode}-${stationCode}`;
        },
        async clientActiveStatusHandler(courriel, estActif) {
            const response = await fetch ('/api/utilisateur/active', {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...session.getAuthHeaders()
                },
                body: JSON.stringify({
                    courriel,
                    estActif
                })
            })
            if(response.ok){
                this.selectedUser.estActif = estActif
            }
        }
    },
};
</script>

<style>
#clients-table > div.v-table__wrapper > table > tbody > tr:hover{
    cursor: pointer;
    background: rgba(177, 139, 253, 0.3) !important;
}
</style>
