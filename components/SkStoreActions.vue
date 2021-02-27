<script>
const MONTHS = {
                1: 'янв.',
                2: 'фев.',
                3: 'мар.',
                4: 'апр.',
                5: 'мая',
                6: 'июн.',
                7: 'июл.',
                8: 'авг.',
                9: 'сен.',
                10: 'окт.',
                11:'ноя.',
                12:'дек.'
};  //MONTHS

import { MODES } from "~/utils/index.js";

import { 
        VCard,
        VCardText,
        VBtn,
        VSubheader,
        VList,
        VListItem,
        VListItemIcon,
        VListItemContent,
        VListItemAction,
        VIcon,
        VImg,
        VChip,
        VChipGroup,
        VSkeletonLoader
       } from 'vuetify/lib';
import SkSvg from "~/components/SkSvg";
    
export default {
    name: 'SkStoreActions',
    props: {
        store: {
            type: Object,
            required: true
        }
    },
    components: {
        VCard,
        VCardText,
        VBtn,
        VSubheader,
        VList,
        VListItem,
        VListItemIcon,
        VListItemContent,
        VListItemAction,
        VIcon,
        VImg,
        VChip,
        VChipGroup,
        VSkeletonLoader,
        SkSvg
    },
    data(){
        return {
            mode: MODES.none,
            cats: [],
            actions: null,
            chips: true
        };
    },
    async fetch(){
        this.mode = MODES.loading;
        try {
            var n, actions = [... await this.$store.dispatch("active/getActions")];
            this.actions = actions.sort((a1, a2) => {
                //TODO: by & basket ( ? )
                n = a1.num - a2.num;
                return (n === 0)
                        ? ($utils.isEmpty(a1.kindname) ? 'xxx' : a1.kindname).localeCompare($utils.isEmpty(a2.kindname) ? 'xxx' : a2.kindname)
                        : n < 0 ? -1 : 1;
            });
            this.cats = this.$store.state.active.groups;
                    
            this.mode = MODES.default;
            this.$emit("load", this.actions.length);  //TODO: when empty
        } catch(e) {
            this.mode = MODES.error;
            console.log('ERR on actions:', e);
        }
    },
    methods: {
        gocat(id){
            var h = $(this.$el).find('.v-subheader[data-cat-id="' + id + '"]');
            if (h.length > 0){
                $([document.documentElement, document.body]).animate({
                    scrollTop: h.offset().top-56
                }, 800);
            }
        },   //gocat
        month(m){
            return (!!m) ? MONTHS[Number(m)] : '';
        },
        onorder(item){
            this.$router.push({path: "/stores/" + this.store.id + "/catalog/" + item.nameid});
        },
        frombasket(e, id){
            
        }
    },
    render(h){
        var items = [];
        switch (this.mode){
            case MODES.loading:
                items.push(
                        [1,2,3].map((i)=>{
                            return h('v-list-item', {key:'sk-fils-loading-' + i}, [
                                        h('v-skeleton-loader', { key: 'sk-loader-' + i,
                                            props: {type:'article', tile: true, boilerplate: false},
                                            class: {'mb-5': true}
                                        })
                            ]);
                        })
                );
                break;
            case MODES.default:
                const url = this.$http.env.rpcUrl;
                const bc  = this.store.brandcolor || 'orange';
                if ((this.cats)&&(this.cats.length>1)){
                    const b = h('v-btn', {
                                            props: {
                                                small: true, 
                                                color: bc, 
                                                icon: this.chips, 
                                                fab: !this.chips,
                                                absolute: !this.chips
                                            },
                                            on: {click: ()=>{this.chips = !this.chips;}}
                              }, [h("v-icon", {props: {}}, "mdi-dots-vertical")]);

                    items.push( h('v-list-item', {
                            key: 'store-cats-' + this.store.id,
                            class: 'sk-store-cats px-0'
                        }, [
                            this.chips 
                                ? [h('v-list-item-content', [
                                        h('v-chip-group', {
                                            class: {'sk-cats': true},
                                            props: {'show-arrows': false}
                                        }, [this.cats.map((c)=>{
                                                return h('v-chip', {
                                                    key: 'chip-' + c.id,
                                                    attrs: {'data-cat-id': c.id},
                                                    props: {color: bc, 'outlined': true, small: true},
                                                    on: {click: ()=>{this.gocat(c.id);}}
                                                }, c.name);
                                            })
                                        ])
                                    ]),
                                    h('v-list-item-action', [ b ])
                                ]
                                : h('div', {class: {'sk-cats-cards': true}}, [
                                    b,
                                    this.cats.map((c)=>{
                                        return h('v-card', {
                                            key: 'card-' + c.id,
                                            attrs: {'data-cat-id': c.id},
                                            on: {click: ()=>{this.gocat(c.id);}}
                                        }, [
                                            $utils.isEmpty(c.img)
                                                ? null
                                                : h('v-img', {props: {
                                                        src: url + '/static/model/view/' + c.img,
                                                        contain: true,
                                                        "max-height": 86
                                                    }}),
                                            h('v-card-text', c.name)
                                        ]);
                                    })
                                ])
                        ])
                    );
                }

                var dates, inCart,
                    kind = 'xxx', numOf = 0;
                
                this.actions.map((item)=>{
                    inCart = this.$store.getters["basket/has"](item.id);
                    if ($utils.isEmpty(item.enddt)){
                        dates = false;
                    } else {
                        var d = new Date(item.enddt);
                        //TODO: by moment
                        dates = 'до ' + d.getDate() + ' ' + this.month(d.getMonth());
                    }
                    
                    if (!$utils.isEmpty(item.kindid)){
                        if (kind!==item.kindid){
                            kind = item.kindid;
                            items.push(h('v-subheader', {
                                props: {inset: true},
                                attrs: {"data-cat-id": item.kindid},
                                style: {color: bc}
                            }, item.kindname));
                        }
                    }
                    items.push(
                        h("v-list-item", {
                            key: 'act-' + item.id, 
                            props: {},
                            on: {click: ()=>{
                                    (!!this.store.hasonline) ? this.onorder(item) : void(0);
                            }}
                        }, [
                            h('v-list-item-icon', {class:{"mr-3": true}}, [
                                    (!!item.promoimage) 
                                        ? h('v-img',{props: {
                                                                src: url + '/static/model/view/' + item.promoimage.id,
                                                                "max-height": 86,
                                                                contain: true
                                                            }})
                                        : null,
                                    (dates)
                                        ? h('div', {class: {'sk-dates': true}}, dates)
                                        : null
                            ]), /* v-list-item-icon */
                            h('v-list-item-content', [
                                h('div',{class:{'sk-name': true}}, [ item.promogoods ]),
                                h('div',{class:{'sk-price': true}}, [
                                    $utils.isEmpty(item.newprice) ? null : item.newprice,
                                    $utils.isEmpty(item.oldprice) ? null : h('span', {class:{'sk-old': true}}, item.oldprice),
                                    h('div', {class: {"sk-units": true}}, 'руб.' +
                                        ($utils.isEmpty(item.unitname) ? '' : ' (' + item.unitname + ')')
                                    )
                                ]),
                                $utils.isEmpty(item.promoproducer)
                                    ? null
                                    : h('div', {class: {"sk-produ": true}}, item.promoproducer),
                                inCart 
                                    ? h('div', {class: {"sk-from-basket": true}}, [
                                        h('v-btn', {
                                            props: {outlined: true, color: 'default', 'x-small': true, rounded: true},
                                                    on: { click: ()=>{this.frombasket(event, item.id);} }
                                        }, 'убрать из корзины')
                                      ])
                                      : null
                                ]), /* v-list-item-content */
                                (!!this.store.hasonline) 
                                    ? h('v-list-item-action',  [
                                        inCart 
                                            ? h('div', {class: {"sk-in-cart": true}}, [
                                                    h('sk-svg', {props:{xref: "#ico-cart"}})
                                              ])
                                            : h('sk-svg', {props:{xref: "#ico-right"}})
                                      ])    /* v-list-item-action */
                                    : null
                    ]));
                });
        }   //switch
        return h('v-list', {
            key: 'list-acts-' + this.store.id, 
            class: {"sk-store-actions": true},
            props: {subheader: true}
        }, items);
    }
};
</script>
<style lang="scss" scoped>
    @import "~/assets/index";
    
    .sk-store-actions{
        margin-top: 1rem;
        & .sk-cats{
        }
        & .sk-cats-cards{
            position: relative;
            display: flex;
            flex-wrap: wrap;
            align-items: stretch;
            justify-content: space-around;
            width: 100%;
            & .v-card{
                width: calc(50% - 1rem);
                margin: 0 0.5rem 1rem 0;
                & .v-img{
                }
                & .v-card__text{
                    line-height: 1.125;
                }
            }
            & .v-btn{
                right: 0;
                z-index: 9;
                top: -1rem;
                color: #fff
            }
        }
        
        margin-bottom: 180px;
        & .v-subheader{
            font-weight: 300;
            font-size: 1.25rem;
            font-style: italic;
            justify-content: flex-end;
            margin: 0;
            margin-left: 0 !important;
            padding: 1rem 0 0.25rem 0;
            height: auto;
        }
        & .v-list-item{
            border-bottom: 1px solid #ccc;
        }
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
            & svg{
                color: lighten($gray-color, 20%);
                width: 18px;
                height: 18px;
            }
            & .sk-in-cart{
                width: 32px;
                height: 32px;
                line-height: 38px;
                text-align: center;
                border-radius: 50%;
                border: 2px solid #fff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.18);
                background: $main-color;
                & svg{
                    width: 18px;
                    height: 18px;
                    margin: 0 auto;
                    color: #fff;
                }
            }
        }
    }
</style>
