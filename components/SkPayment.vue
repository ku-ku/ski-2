<template>
    <v-dialog v-model="__show" width="640" content-class="mn-payment" fullscreen>
        <v-toolbar dark :color="color" height="auto">
            <v-toolbar-title>Оплата заказа № {{order.n}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="__show=false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <p class="text-right">
            <a href="http://i.xn--80apggkpo6e.xn--p1ai/pay-agree/" target="_blank">правила оплаты&nbsp;<v-icon>mdi-credit-card-outline</v-icon></a>
        </p>
        <p v-if="((mode==MODES.success)||(mode==MODES.error))">
            <v-alert type="success" outlined class="mt-5" v-if="(mode==MODES.success)">
                Платеж совершен!
                <v-spacer></v-spacer>
                <v-btn @click="hide" color="success" class="mt-3">вернуться к меню</v-btn>
            </v-alert>
            <v-alert type="warning" outlined class="mt-5" v-else-if="(mode==MODES.error)">
                Оплата не проведена. С Вами свяжется наш представитель
                <v-spacer></v-spacer>
                <v-btn @click="hide" class="warning">вернуться к меню</v-btn>
            </v-alert>
        </p>
        <div v-else>
            <iframe v-if="hasLink" :src="order.payLink" frameborder="0"></iframe>
            <template v-else>
                <p class="pa-3">Получение ссылки для оплаты...</p>
                <v-skeleton-loader type="article, actions"></v-skeleton-loader>
            </template>    
        </div>
    </v-dialog>
</template>
<script>
import { MODES } from '~/utils';
import { eventBus } from '~/utils/eb';

export default {
    name: 'SkPayment',
    props: ['show'], /** mode: see store/basket.js::processing */
    data(){
        return {
            MODES
        };
    },
    created(){
        const self = this;
        eventBus.$on('order', (msg)=>{
            if ('success'===msg){
                self.$store.commit('basket/complete', self.order);
            } else {
                self.$store.commit('basket/error', {message: msg});
            }
        });
    },
    computed: {
        order(){
            return this.$store.state.basket.order || {n: '-', payLink: ''};
        },
        hasLink(){
            return (!!this.order) && !$utils.isEmpty(this.order.payLink);
        },
        mode(){
            return this.$store.state.basket.processing;
        },
        color(){return this.$store.getters['active/brand']('color');},
        __show: {
            get(){return (!!this.show);},
            set(val){
                if (this.mode===MODES.payment){
                    ski.confirm({
                                    title: "Оплата", 
                                    msg: 'Оплата заказа не произведена, Вы действительно хотите выйти?', 
                                    type: 'warning'
                    }).then((val)=>{
                        if (val){
                            this.$emit('hide');
                        }
                    });
                } else {
                    this.$emit('hide');
                }
            }
        }
    },
    methods: {
        hide(){
            this.$emit('hide');
        }
    }
}
</script>
<style lang="scss">
    .mn-payment{
        background: #fff;
        & p {
            background: #fff;margin: 0; padding: 1rem;
        }
        & a{
            &:link, &:visited {color: #1a1a1a;text-decoration: none;}
            &:hover{color: #ad0900;}
        }
        & iframe{
            background: #fff;
            width: 100%;
            min-height: 1024px;
            height: 100%;
        }
    }
    iframe{
        body{
            #text_form{
                width: auto !important;
            }
        }
    }
    
</style>    
