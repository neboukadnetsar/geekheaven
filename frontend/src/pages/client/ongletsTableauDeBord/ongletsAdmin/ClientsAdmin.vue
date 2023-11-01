<template>
    <div v-if="session?.detailsUtilisateur?.role && session.detailsUtilisateur.role === 'administrateur' && isLoaded">
        <h1>Clients</h1>
        <ListeClientsAdmin :clients="clients"/>
    </div>
    <div v-else>Page réservé aux administrateurs</div>
</template>

<script>
import ListeClientsAdmin from '../../components/ListeClientsAdmin.vue'
import session from '../../../../session'

export default {
    components: {
        ListeClientsAdmin
    },
    data() {
        return {
            session: session,
            clients: [],
            isLoaded: false,
        }   
    },
    watch: {
        session: {
          immediate: true,
          handler(newValue, oldValue) {
            if (newValue !== oldValue && newValue !== null) {
                this.fetchClients();
            }
          },
        },
    },
    methods: {
        async fetchClients(){
            try {
                const response = await fetch('/api/utilisateur', {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...session.getAuthHeaders()
                    }
                })

                if(response.ok){

                    const utilisateurs = await response.json()

                    utilisateurs.forEach(utilisateur => {
                        if(utilisateur.role === 'utilisateur'){
                            this.clients.push(utilisateur);
                        }
                    });
                    this.isLoaded = true
                }


            }catch(err){
                console.log(err.message)
            }
        }
    }
}
</script>