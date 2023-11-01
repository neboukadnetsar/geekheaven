<template>
    <v-sheet :height="200" :width="200"></v-sheet>
</template>

<script>
import session from '../../session';

export default {
    props: {
        
    },
    data: function () {
        return {
            session: session,
            rating: null
        };
    },
    computed: {
    },
    mounted() {
    }
}
</script>