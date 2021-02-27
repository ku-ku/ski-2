<script>
import { 
        VAlert,
        VCard,
        VCardText,
        VCardTitle,
        VCardActions,
        VImg,
        VIcon,
        VBadge,
        VBtn,
        VBtnToggle,
        VBottomSheet
    } from 'vuetify/lib';
import Color from 'color';
import SkSvg from '~/components/SkSvg';
import { MODES } from "~/utils/index.js";    

export default {
        name: 'SkBasket',
        props: ['active'],
        components:{
            VAlert,
            VCard,
            VCardText,
            VCardTitle,
            VCardActions,
            VImg,
            VIcon,
            VBadge,
            VBtn,
            VBtnToggle,
            VBottomSheet,
            SkSvg
        },
        data(){
            return {
            };
        },
        computed: {
            numof(){
                return this.$store.getters["basket/numof"];
            },
            total(){
                return this.$store.getters["basket/total"];
            },
            error(){
                return this.$store.state.basket.error;
            },
            store(){
                return this.$store.state.active.store;
            },
            brandColor(){
                return this.$store.getters["active/brand"]("color");
            },
            mustPoint(){
                if ((!!this.store.pointscount) && (Number(this.store.pointscount)>0)){
                    return !(!!this.store.fill);
                }
                return false;
            },
            ordering(){
                return this.$store.state.basket.processing;
            }
        },
        methods: {
            back(){
                this.$store.dispatch('basket/clear');
                this.$router.replace({path:"/stores/" + this.store.id});
            },
            show(e){
                this.$router.push({path: '/stores/' + this.store.id + '/basket'});
            }
        },
        render(h){
            const self = this;
            var   card = null, 
                  order = null,
                  hasErr= (this.ordering === MODES.error);
        
            if (this.ordering === MODES.success){
                order = this.$store.state.basket.order;
                card = h('v-card', {
                                        class: {"sk-basket": true, "sk-success": true},
                                        props: {flat:true, tile: true},
                                        style: {"border-top": "2px solid " + this.brandColor}
                                    }, [
                            h('v-card-text', [
                                h('sk-svg', {props:{xref:'#ico-chk-circle', width:28, height: 28}}),
                                'Ваш заказ № ',
                                h('strong', order.n),
                                ' успешно оформлен! Ожидайте дальнейших сообщений о его готовности.'
                            ])
                ]);
            } else if (this.numof > 0) {
                var grad = "#fff";
                try {
                    grad = "linear-gradient(to bottom, "
                           + Color(this.brandColor).alpha(0.1) + " 0%," 
                           + Color(this.brandColor).alpha(0.01) + " 100%)";
                } catch(e){}
                card = h('v-card', {
                                        class: {"sk-basket": true}, 
                                        props: {flat: true, tile: true},
                                        style: {
                                            "border-top": "2px solid " + this.brandColor,
                                            "background": grad
                                        }
                                   }, [
                        h('v-card-text', [
                            h('div', {class: {"d-flex": true, "justify-space-between": true}}, [
                                    h("div", {
                                        class: {"sk-basket-num": true},
                                        style: {"background-color": this.brandColor}
                                    }, [
                                        hasErr 
                                            ? h('v-icon', {props: {color: 'warning', size: 32}}, 'mdi-alert-outline')
                                            : h('v-badge',{props:{content: this.numof, value: this.numof, dark: true, color: Color(this.brandColor).lighten(0.5).hex()}}, [
                                                h('sk-svg', {props: {xref:'#ico-cart', width: 32, height: 32}})
                                              ])
                                    ]),
                                    h('div', {
                                        class: {'sk-total':true},
                                        style: {color: this.brandColor}
                                    }, this.total + ' руб.')
                            ])
                        ]),
                        h('v-card-actions', [
                                    h('v-btn', {
                                        props: {small:true, dark: true, color: this.brandColor, width: "10rem", loading: (this.ordering === MODES.saving)},
                                        on: {click: ()=>{this.$emit("order");}}
                                    }, 'оформить'),
                                    h('v-btn', {
                                        props: {small:true, dark: true, color: this.brandColor},
                                        on: {click: this.show}
                                        }, [h('sk-svg', {props:{xref:'#ico-eye', width:18, height: 18}})]
                                    ),
                                    h('v-btn', {
                                        props: {small:true, dark: true, color: this.brandColor},
                                        on: {click: ()=>{this.$emit("clear");}}
                                    }, [h('v-icon', {props: {small: true}}, 'mdi-close')])
                                ]
                        )
                ]);
            }
            
            if (!!card){
                return h('v-bottom-sheet', {
                    key: 'sk-bottom-basket',
                    props: {"hide-overlay": true, value: this.active, persistent: true, "content-class": "sk-whited"}
                }, [ card ]);
            } else {
                return null;
            }
        }
    }
</script>
<style lang="scss" scoped>
    @import "~/assets/index.scss";
    
    .sk-basket{
        padding-top: 1.5rem;
        padding-bottom: 1rem;
        background-color: #fafafa;
        border-radius: 0;
        & .v-card__text{
            padding: 0 !important;
            display: block;
            text-align: center;
            & .sk-basket-num{
                border-radius: 0 0 500px 0;
                color: #fff;
                height: 80px;
                width:  80px;
                margin-top: -1.5rem;
                line-height: 88px;
                text-align: center;
                padding-right: 1.5rem;
                box-shadow: 0 2px 2px 6px rgba(255,255,255, 0.33);
                & .v-icon{
                    margin-top: -1.5rem;
                }
            }
            & .sk-total{
                margin-right: 1rem;
                font-size: 2rem;
                font-weight: 400;
                color: #000;
            }
            & .sk-confirm{
                font-size: 1.25rem;
                font-weight: 400;
                color: $main-color;
                margin: 1rem 0;
            }
        }
        & .v-card__actions{
            justify-content: flex-end;
            padding-right: 1rem;
        }
        &.sk-success{
            & .v-card__text{
                padding: 1rem !important;
                display: block !important;
                & svg{
                    color: #2196f3;
                    margin-right: 0.5rem;
                }
            }
        }
    }
    .sk-call-us{
        position: absolute;
        left: 0;
        bottom: 0;
        width: 64px;
        height: auto;
    }
    
</style>