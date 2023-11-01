<template></template>

<script>
import session from '../../../session';

export default {
    data() {
        return {

        };
    },
    methods: {

    },
    computed: {

    },
    watch: {

    },
    mounted() {
        session.disconnect();
        alert('Vous vous êtes déconnecté');
        this.$router.replace('/');
    }
}
</script>