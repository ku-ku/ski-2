<script>
import { MODES } from "~/utils/index.js";    
import { VBtn,
         VImg,
         VList, 
         VListItem,
         VListItemIcon,
         VListItemContent,
         VListItemTitle,
         VListItemSubtitle,
         VListItemAction,
         VBadge,
         VCard,
         VCardText,
         VToolbar,
         VToolbarTitle,
         VSpacer,
         VDivider
    } from 'vuetify/lib';
import SkSvg from '@/components/SkSvg';

export default {
    name: 'SkBasket',
    components: {
        VBtn,
        VImg,
        VList, 
        VListItem,
        VListItemIcon,
        VListItemContent,
        VListItemTitle,
        VListItemSubtitle,
        VListItemAction,
        VBadge,
        VCard,
        VCardText,
        VToolbar,
        VToolbarTitle,
        VSpacer,
        VDivider,
        SkSvg
    },
    data(){
        return {
            mode: MODES.none
        };
    },
    computed: {
        magaz(){
            return this.$store.state.active.store;
        },
        prods(){
            return this.$store.state.basket.basket.prods;
        },
        shopper(){
            return this.$store.state.profile.user;
        }
    },
    methods: {
        from_basket(e, prod){
            e.preventDefault();
            e.stopPropagation();
            this.$store.dispatch('basket/rm', {id: prod.id});
            var n = this.$store.getters["basket/numof"];
            if (n < 1){
                this.basket = false;
            }
            return false;
        },
        pm(prod, add){
            var p = Object.assign({}, prod);
            var diff = prod.multiplicity || 1;
            var n = prod.num + ((add) ? diff : -diff);
            if (n < 1){
                n = diff;
            }
            p.num = n;
            p.total = n * p.newprice;
            this.$store.dispatch('basket/add', p);
        }
    },
    render(h){
        if (!(!!this.magaz)){
            return h('div',{key:'basket-stub'});
        }
        const url = this.$http.env.rpcUrl;
        
        const color = this.magaz.brandcolor || 'yellow lighten-4';
                
        return h('v-card', {
            props: {flat: true},
            class: {"sk-backet-conte": true}
        }, [
            h('v-list', [
                (this.prods.length > 0)
                    ? this.prods.map((prod)=>{
                        return [h('v-list-item', {key: 'sk-prod-' + prod.id}, [
                                    h('v-list-item-icon', {class:{"mr-3": true}}, [
                                        (!!prod.promoimage)
                                            ? h('v-img',{props: {
                                                                    src: url + '/static/model/view/' + prod.promoimage.id,
                                                                    "max-height": 86,
                                                                    contain: true
                                                                }})
                                            : h('sk-svg', {props:{xref:"#ico-box-full"}, style:{color:color}})
                                    ]),
                                    h('v-list-item-content', [
                                        h('div',{class:{'sk-name': true}}, prod.promogoods), 
                                            $utils.isEmpty(prod.total)
                                                ? null
                                                : h('div', {class: {'sk-price': true}}, [
                                                    h('span', '(' + prod.newprice + ')'),
                                                    h('span', {style: {color: color}}, prod.total + ' р.')
                                                  ]),
                                        $utils.isEmpty(prod.promoproducer)
                                                ? null
                                                : h('div', {class: {'sk-produ': true}}, prod.promoproducer),
                                        (!$utils.isEmpty(prod.minamount)||!$utils.isEmpty(prod.multiplicity))
                                            ? h('div', [
                                                !$utils.isEmpty(prod.minamount) ? h('span', {class: `${(prod.minamount > prod.num) ? 'red' : 'orange'}--text text--darken-2`}, 'Мин: ' + prod.minamount + '; ') : null,
                                                ' ',
                                                !$utils.isEmpty(prod.multiplicity) ? h('span', {class: `orange--text text--darken-2`}, 'Кратн: ' + prod.multiplicity) : null
                                            ])
                                            : null,
                                        h('div', {class: {'sk-from-basket': true}}, [
                                                h('v-btn', {
                                                            props: {color: 'secondary', 'x-small': true, text: true},
                                                            on: {
                                                                click: ()=>{this.from_basket(event, prod);}
                                                            }
                                                        }, 'убрать из заказа')
                                                ])
                                    ]),
                                    h('v-list-item-action', [
                                        h('v-btn', {
                                                        props: {color: color, dark: true},
                                                        on:{click:()=>{this.pm(prod, true);}}
                                                }, '+'),
                                        h('div', {class: "sk-units"}, [
                                            h('div', {style: {color: color}}, prod.num),
                                            h('div', prod.unitname || '')
                                        ]),
                                        h('v-btn', {
                                                        props: {dark: false},
                                                        style: {color: color, border: "1px solid " + color},
                                                        on:{click:()=>{this.pm(prod, false);}}
                                                    }, '-')
                                    ])
                                ]),
                                h('v-divider')
                            ];
                        })
                    : h('v-list-item', {key: 'sk-prod-empty'}, [
                        h('v-list-item-icon', {class:{"mr-3": true}}, [
                            h('sk-svg', {props:{xref:"#ico-empty"}, style:{color:color}})
                        ]),
                        h('v-list-item-content', [
                            h('v-list-item-title', 'В корзине ничего нет'),
                            h('v-list-item-subtitle', 'нажмите кнопку "назад", чтобы вернуться к покупкам')
                        ])
                    ])
            ])
        ]);
    }
}
</script>
<style lang="scss" scoped>
    @import "~/assets/index.scss";
    
    .v-toolbar{
        & h2, & h3{font-size: 1rem; font-weight: 400;}
        & h2 {font-size: 1.125rem;}
    }
    .sk-backet-conte{
        padding-bottom: 160px;
        & .v-list{
            & .v-list-item__icon{
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
                & svg{
                    width: 48px;
                    height: auto;
                }
            }
            & .sk-price{
                font-size: 1.25rem;
                color: $red-color;
                & > span:first-child{
                    font-size: 0.9rem;
                    color: $gray-color;
                    margin-right: 0.5rem;
                }
            }
            & .sk-from-basket{
                margin-top: 0.75rem;
                & .v-btn{
                    border-color: $gray-color;
                    color: $gray-color;
                    text-transform: lowercase !important;
                    & .v-btn__content{
                        color: $gray-color;
                    }
                }
            }
            & .sk-units{
                margin: 0.5rem 0;
                max-width: 6rem;
                word-wrap: break-word;
                white-space: normal;
                text-align: center;
                line-height: 1.125;
                font-size: 0.75rem;
                display: flex;
                flex-direction: column;
                & > div:first-child{
                    color: $red-color;
                    font-size: 1.5rem;
                }
            }
            & .sk-produ{
                font-size: 0.75rem;
                color: $gray-color;
            }
            
            & .v-list-item__action{
                flex-direction: column;
                align-items: center;
                justify-content: center;
                & .v-btn{
                    &.v-size--default{
                        width: 28px  !important;
                        height: 28px !important;
                        min-width: 32px;
                        padding: 0;
                        font-size: 1.25rem;
                    }
                    box-shadow: 0 2px 4px rgba(0,0,0,0.18);
                }
            }
        }
    }
</style>
