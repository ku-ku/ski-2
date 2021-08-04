<template>
    <v-list-item :key="'prod-' + prod.id"
                 class="sk-prod-item"
                 v-on:click="onorder">
        <template v-if="disp===DISP_MODES.list">
            <v-list-item-icon class="mr-3">
                <v-img :src="src"
                       max-height="86"
                       contain />
                <div v-if="has('end')" class="sk-dates">
                    {{ end }}
                </div>
            </v-list-item-icon>
            <v-list-item-content>
                <div class="sk-name">
                    {{ prod.promogoods }}
                </div>
                <div class="sk-price">
                    {{ Number(prod.newprice) > 0 ? prod.newprice : ''}}
                    <span class="sk-old" 
                          v-if="has('old')">
                        {{ prod.oldprice }}
                    </span>
                    &nbsp;руб.
                </div>
                <div class="sk-units"
                     v-if="has('unit')">
                    {{ ' (' + prod.unitname + ')' }}
                </div>
                <div class="sk-multi">
                    <span v-if="has('min')">{{ 'мин: ' + prod.minamount }}</span>
                    <span v-if="has('multi')">{{ 'кратн: ' + prod.multiplicity }}</span>
                </div>
                <div class="sk-produ"
                     v-if="has('producer')">
                    {{ prod.promoproducer }}
                </div>
                <div class="sk-from-basket"
                     v-if="has('basket')">
                    <v-btn outlined
                           color="default"
                           x-small
                           rounded
                           v-on:click.stop.prevent="frombasket">
                        <v-icon small>mdi-cart-minus</v-icon>&nbsp;убрать из корзины
                    </v-btn>
                </div>
            </v-list-item-content>
            <v-list-item-action>
                <div class="sk-pm">
                    <v-btn small
                           tile
                           plain
                           :color="bc"
                           v-on:click.stop.prevent:="_pm(true)">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <div class="sk-num-of" :style="{color: bc}">
                        {{ (Number(prod.n) > 0) ? prod.n : ''}}
                    </div>
                    <v-btn small
                           tile
                           plain
                           :color="bc"
                           v-on:click.stop.prevent="_pm(false)">
                        <v-icon>mdi-minus</v-icon>
                    </v-btn>
                </div>
            </v-list-item-action>
        </template>
        <template v-else>
            <v-card width="100%">
                <v-img :src="src"
                       max-height="180">
                    <div class="sk-name">
                        {{ prod.promogoods }}
                    </div>
                    <div v-if="has('basket')" class="sk-in-cart">
                        <v-icon color="#fff">mdi-cart-outline</v-icon>
                    </div>
                </v-img>
                <v-card-text>
                    <div class="sk-price">
                        {{ Number(prod.newprice) > 0 ? prod.newprice : null }}
                        <span class="sk-old"
                              v-if="has('old')">
                            {{ prod.oldprice }}
                        </span>
                        &nbsp;руб.
                        <div class="sk-units"
                             v-if="has('unit')">
                            {{ prod.unitname }}
                        </div>
                    </div>
                    <div class="sk-produ"
                         v-if="has('producer')">
                        {{ prod.promoproducer }}
                    </div>
                    <div class="sk-from-basket"
                         v-if="has('basket')">
                        <v-btn outlined
                               color="default"
                               x-small
                               rounded
                               v-on:click.stop.prevent="frombasket">
                            <v-icon small>mdi-cart-minus</v-icon>&nbsp;убрать из корзины
                        </v-btn>
                    </div>
                </v-card-text>
            </v-card>
        </template>
    </v-list-item>
</template>
<script>
import { MODES, DISP_MODES, MONTHS, isEmpty } from "~/utils/index";

export default {
    name: "SkProdItem",
    props: [
                "prod", 
                "store",
                "disp"
           ],
    data(){
        return { 
            MODES,
            DISP_MODES
        };
    },
    created(){
        this.prod.n = this.$store.getters["basket/amount"](this.prod.id);
    },
    computed: {
        /**
         * Brand color (at store)
         * @returns {String}
         */
        bc(){
            return this.store?.brandcolor || 'orange';
        },
        /**
         * Get a product image src | no-image
         */
        src(){
            return (!!this.prod.promoimage)
                        ? `${ this.$http.env.rpcUrl }/static/model/view/${ this.prod.promoimage.id }`
                        : '/no-image.png';
        },
        end(){
            if (!!this.prod.enddt) {
                var d = new Date(this.prod.enddt);
                return `до ${ d.getDate() } ${ MONTHS[d.getMonth()]} `;
            }
            return '';
        }
    },
    methods: {
        has(q){
            switch(q){
                case "basket":
                    return this.$store.getters["basket/has"](this.prod.id);
                case "end":
                    return !!this.prod.enddt;
                case "min": 
                    return Number(this.prod.minamount) > 0;
                case "multi":
                    return Number(this.prod.multiplicity) > 0;
                case "old":
                    return !!this.prod.oldprice;
                case "online":
                    return (!!this.store?.hasonline);
                case "producer":
                    return !isEmpty(this.prod.promoproducer);
                case "unit":
                    return !isEmpty(this.prod.unitname);
                default:
                    return false;
            }
        },  //has
        onorder(){
            if (this.has("online")){
                this.$store.commit('active/setAction', this.prod);
                this.$router.push({path: "/stores/" + this.store.id + "/catalog/" + this.prod.nameid || this.prod.id});
            }
        },   //onorder
        frombasket(){
            this.$store.dispatch('basket/rm', {id: this.prod.id});
            this.prod.n = 0;
            this.prod.total = 0;
            return false;
        },
        _pm(add){
            const tenantId = (!!this.store.fill) 
                                ? this.store.fill.id
                                : isEmpty(this.prod.orgid) ? this.prod.tenantid : this.prod.orgid;
                                
            var diff = this.prod.multiplicity || 1;
            var n = (this.prod.n || 0) + ((add) ? diff : -diff);
            if (n < diff){
                n = 0;
            }
            this.prod.n = n;
            this.prod.total = parseFloat(this.prod.newprice) * n;
            
            var p = {...this.prod};
            p.store = {id: tenantId};
            if ( n > 0 ){
                this.$store.dispatch('basket/add', p);
            } else {
                this.frombasket();
            }
            this.$forceUpdate();
            return false;
        }
    }   //_pm
}
</script>
<style lang="scss" scoped>
.sk-prod-item{
    border-bottom: 1px solid #ccc;
    & .v-list-item__icon{
        flex-direction: column;
        margin: 0 0.5rem 0 0 !important;
        align-self: center !important;
        justify-content: space-around;
        width: 72px;
        padding: 0.5rem 0;
        & .v-image{
                width: 72px;
                height: auto;
                box-shadow: 0 2px 4px rgba(0,0,0,0.18);
                border-radius: 4px;
        }
        & .sk-dates{
            font-size: 0.6rem;
            color: $red-color;
            margin-top: 0.15rem;
            text-align: center;
        }
    }   /* .v-list-item__icon */
    & .sk-name{
        font-size: 1.125rem;
        color: #000;
    }
    & .sk-price{
        font-size: 1.25rem;
        color: $red-color;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        & .sk-old, & .sk-units{
            font-size: 0.85rem;
            display: inline-block;
            margin-left: 0.5rem;
            color: $gray-color;
        }
        & .sk-units{
            display: block;
        }
        & .sk-old{
            text-decoration: line-through;
        }
    }   /* .sk-price */
    & .sk-produ{
        font-size: 0.75rem;
        color: $gray-color;
    }
    & .sk-from-basket{
        text-align: center;
        margin-top: 0.5rem;
        & .v-btn{
            border-color: $gray-color;
            color: $gray-color;
            text-transform: lowercase !important;
            & .v-btn__content{
                color: $gray-color;
            }
        }
    }
    & .v-list-item__action{
        & .sk-pm{
            display: flex;
            flex-direction: column;
            width: 38px;
            align-items: center;
            justify-content: space-around;
            & .v-btn{
                width: 38px;
                min-width: 38px;
            }
            & .sk-num-of{
                width: 38px;
                min-height: 1rem;
                text-align: center;
                font-size: 1.125rem;
                color: #000;
            }
        }
    }   /* .v-list-item__action */
    & .sk-in-cart{
        width: 32px;
        height: 32px;
        line-height: 28px;
        text-align: center;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.18);
        background: $main-color;
        & .v-icon{
            margin: 0 auto;
            color: #fff;
            font-size: 1.125rem;
        }
    }   /* .sk-in-cart */
    & .v-card{
        & .v-image{
            width: 100%;
            position: relative;
        }
        & .sk-name{
            background: rgba(0,0,0,0.22) scroll 0 0 repeat;
            font-size: 1.25rem;
            bottom: 0;
            position: absolute;
            padding: 1rem;
            color: #fff;
            text-shadow: 0 2px 4px rgba(0,0,0,0.22);
            width: 100%;
        }
        & .sk-in-cart{
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
        }
    }   /*.v-card*/
    
}   /*.sk-prod-item*/
</style>
    
