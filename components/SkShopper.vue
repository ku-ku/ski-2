<template v-if="$store.getters['active/hasActiveStore']">
    <v-dialog v-model="__show" width="640" content-class="sk-shopper">
        <v-toolbar dark :color="color" height="auto">
            <v-img class="sk-store-logo" :src="logo" />
            <v-toolbar-title>{{magaz.title}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="hide"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-form v-on:submit="save">
            <v-card flat tile>
                <v-card-text>
                    <p>Для оформления заказа, пожалуйста {{confirm}} Ваше имя и телефон</p>
                    <v-text-field 
                        label="Ваше имя" 
                        name="u" 
                        v-model="shopper.name"
                        ></v-text-field>
                    <v-text-field 
                        label="Телефон для связи" 
                        type="tel"
                        name="t" 
                        v-model="shopper.phone"
                        required
                        :rules="telRules"
                        ></v-text-field>
                    <v-checkbox v-model="shopper.self" 
                                label="заказ заберу самостоятельно"
                                :color="color"
                                true-value="true"
                                :readonly="!hasDeliv"
                                :messages="deliv"
                            ></v-checkbox>
                    <v-autocomplete class="pt-8" dense hide-details v-if="(addrs.length > 0)&&(shopper.self==false)" label="Адрес доставки" v-model="shopper.addr"
                        :items="addrs"
                        item-value="address"
                        item-text="address">
                    </v-autocomplete>
                    <v-checkbox v-if="hasPay"
                                v-model="shopper.pay" 
                                label="оплатить on-line"
                                :color="color"
                                true-value="true"
                                hide-details
                            ></v-checkbox>
                    <v-alert v-show="alert.show" :type="(1===alert.show) ? 'success' : 'warning'"
                             class="mt-3"
                             dense
                             outlined border="left">{{ alert.msg }}</v-alert>
                    <v-alert v-if="!isUser" outlined dense type="info" color="blue-grey lighten-2" class="mn-agree">
                        Отправляя свои данные, Вы соглашаетесь с 
                        <a href="http://i.xn--80apggkpo6e.xn--p1ai/terms-of-use/" 
                           target="_blank">условиями использования нашего приложения</a>
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-btn :color="color" dark type="submit" width="100%" height="56">оформить заказ</v-btn>
                </v-card-actions>
            </v-card>
        </v-form>
    </v-dialog>
</template>

<script>
export default {
    name: 'SkShopper',
    props: ['show'],
    data(){
        return {
            telRules: [v => /^(\+)?\d{10,11}$/.test(v) || 'укажите Ваш телефон для связи (10 цифр)'],
            alert: {
                show: false,
                msg: null
            },
            shopper: {
                self: false,
                name: '',
                phone: '',
                pay: false,
                addr: null
            },
            addrs: []
        };
    },
    computed: {
        color(){return this.$store.getters['active/brand']('color');},
        logo(){return this.$store.getters['active/brand']('ava');},
        magaz(){
            return this.$store.state.active.store || {};
        },
        isUser(){
            return this.$store.getters["profile/is"]("user");
        },
        hasDeliv(){
            return (!!this.magaz) ? (!!this.magaz.hasdelivery) : false;
        },
        deliv(){
            if (!(!!this.magaz)){
                return '';
            }
            if (!this.magaz.hasdelivery){
                return 'мы не осуществляем доставку';
            } else {
                if (this.shopper.self){
                    var s = $utils.formatAddress(this.magaz.location);
                    if (!!this.magaz.lat){
                        var _d = this.$store.getters["geo/distance"](this.magaz);
                        s += ' (' + ( (_d < 1000) ? _d + ' м.)' : (_d/1000.0).toFixed(2) + ' км.)' );
                        return s;
                    }
                } else {
                    return 'возможна доставка';
                }
            }
            return null;
        },
        hasPay(){
            return (!!this.magaz) ? (!!this.magaz.haspay) : false;
        },
        confirm(){
            return this.$store.getters["profile/is"]("user") 
                        ? "подтвердите"
                        : "укажите";
        },
        __show: {
            get(){return (!!this.show);},
            set(val){
                this.$emit('hide', false);
            }
        }
    },
    methods: {
        save(e){
            e.preventDefault();
            this.alert = false;
            if ($utils.isEmpty(this.shopper.name)){
                this.alert = {
                    msg: "Пожалуйста, заполните Ваше имя",
                    show: 2
                };
                $(".sk-shopper").find('input[name="u"]').focus();
                return false;
            }
            if ($utils.isEmpty(this.shopper.phone)|| !(/^(\+)?\d{10,11}$/.test(this.shopper.phone))){
                this.alert = {
                    msg: "Пожалуйста, заполните телефон для обратной связи",
                    show: 2
                };
                $(".sk-shopper").find('input[name="t"]').focus();
                return false;
            }
            this.$emit('hide', this.shopper);
            return false;
        },   //save
        hide(){
            this.$emit('hide', false);
        }
    },
    watch: {
        show(val){
            if (!!val){
                const {user} = this.$store.state.profile;
                this.shopper.name = (!!user) 
                                        ? /anoni/.test(user.name) 
                                            ? '' : user.name
                                        : '';
                this.shopper.phone=  (!!user.adds) ? user.adds.phone : '';
                this.shopper.self = this.hasDeliv 
                                        ? (!!user.adds)&&(typeof user.adds.self !== "undefined") 
                                            ? user.adds.self 
                                            : false
                                        : true;
                this.addrs = (!!user.addrs) ? user.addrs : [];
                setTimeout(()=>{
                    $(".mn-shopper").find('input[name="u"]').focus();
                }, 200);
            }
        },
        'shopper.self'(val) {
            if ( val )
                this.shopper.addr = null;
        }
    }
}    
</script>    
<style lang="scss" scoped>
    .sk-shopper{
        & .v-toolbar{
            &__title{
                font-size: 1rem;
                line-height: 1.115;
                white-space: normal;
            }
            & .sk-store-logo{
                width: 48px;
                max-width: 48px;
                height: 48px;
                border-radius: 500px;
                border: 2px solid #fff;
                box-shadow: 0 2px 4px rgba(0,0,0, 0.18);
                margin-right: 0.5rem;
            }
        }
        & .v-card {
            & p{
                line-height: 1.125;
            }
            
            &__actions{
                padding: 0 !important;
                justify-content: center;
                & .v-btn{
                    border-radius: 0 0 4px 4px;
                }
            }
            & .mn-agree{
                margin-top: 2rem;
                font-size: 0.75rem;    
                line-height: 1.125;
                & a{
                    text-decoration: none;
                    color: #546E7A;
                }
            }
        }
    }
</style>    