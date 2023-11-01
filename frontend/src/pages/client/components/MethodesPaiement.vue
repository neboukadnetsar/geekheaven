<template>
    <v-row>
        <v-col>
            <v-card color="#EEEEEE">
                <v-card class="ma-5">
                    <v-card-title class="title my-2"><strong>Méthodes de paiement</strong></v-card-title>
                    <v-card-text class="headline">
                        <v-radio-group v-model="selectedPayment">
                            <v-row class="d-flex flex-row justify-space-around">
                                <v-col class="d-flex justify-center align-center" cols="4">
                                    <div @click="selectRadio('paypal')" class="d-flex flex-row align-center justify-center">
                                        <v-radio ref="paypalRadio" value="paypal"></v-radio>
                                        <img height="150" src="/public/images/paypal.png"/>
                                    </div> 
                                </v-col>
                                <v-col class="d-flex flex-row justify-center align-center" cols="4">
                                    <div @click="selectRadio('googlePay')" class="d-flex flex-row align-center justify-center">
                                        <v-radio ref="googlePayRadio" value="googlePay"></v-radio>
                                        <img height="150" src="/public/images/google-pay.png"/>
                                    </div>    
                                </v-col>
                            </v-row>
                        </v-radio-group>
                    </v-card-text>
                    <v-card-title class="title mb-2"><strong>Points Geeko</strong></v-card-title>
                    <v-card-text>
                        <div>
                            <v-checkbox v-model="useGeekoPoints" :disabled="getGeekoPointsValue() === 0" class="headline" :label="geekoPointsLabel"></v-checkbox>
                        </div>
                    </v-card-text>
                </v-card>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
export default {
    props: {
        getGeekoPointsValue: Function,
    },
    computed: {
        geekoPointsLabel() {
            return `Utiliser mes points Geeko (jusqu'à ${this.getGeekoPointsValue().toFixed(2)}$)`;
        }
    },
    data() {
        return {
            selectedPayment: null,
            useGeekoPoints: false,
        };
    },
    watch:{
        'selectedPayment':{
            handler(newVal, oldVal) {
                if(newVal !== oldVal){
                    this.$emit('updateMethodePaiement', newVal)
                }
            }
        },
        'useGeekoPoints':{
            handler(newVal, oldVal) {
                if(newVal !== oldVal){
                    this.$emit('updateGeekoPoints', newVal)
                }
            }
        },
    },
    methods: {
        selectRadio(paymentType) {
            this.selectedPayment = paymentType;
        },
    }
}
</script>

<style scoped>
.headline::v-deep .v-label {
    font-size: 20px !important;
}

.title{
    font-size: 25px;
}
</style>