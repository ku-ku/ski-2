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

import { MODES, DISP_MODES, isEmpty } from "~/utils/index.js";

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
import SkProdItem from "~/components/SkProdItem";
const _stop = function(e){
        if (!!e){
            e.preventDefault();
            e.stopPropagation();
        }
};

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
        SkSvg,
        SkProdItem
    },
    data(){
        return {
            mode: MODES.none,
            cats: [],
            actions: null,
            chips: true     /* display: chips & list or cards */
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
        catbyid(id){
            return this.cats.filter((c)=>{return c.id === id;})[0];
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
                if ((this.cats)&&(this.cats.length > 1)){
                    const b = h('v-btn', {
                                            props: {
                                                small: true, 
                                                color: bc, 
                                                icon: true 
                                            },
                                            on: {click: ()=>{this.chips = !this.chips;}}
                              }, [h("v-icon", {props: {}}, this.chips ? "mdi-cards-variant" : "mdi-format-list-text")]);

                    items.push( h('v-list-item', {
                            key: 'store-cats-' + this.store.id,
                            class: 'sk-store-cats px-0'
                        }, [
                            this.chips 
                                ? [
                                    h('v-list-item-action', {class: "mr-0"}, [ b ]),
                                    h('v-list-item-content', [
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
                                    ])
                                ]
                                : h('div', {class: {'sk-cats-cards': true}}, [
                                    h('div', {class: 'h3', style:{color: bc}}, [b, h('span', 'категории')]),
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
                                                        "max-height": 86
                                                    }}),
                                            h('v-card-text', c.name)
                                        ]);
                                    })
                                ])
                        ])
                    );
                }

                var kindId = 'xxx', kind = null;
                
                this.actions.map((item)=>{
                    if (!$utils.isEmpty(item.kindid)){
                        if (kindId!==item.kindid){
                            kindId = item.kindid;
                            kind = this.catbyid(kindId);
                            if (!!kind.mode){
                                kind.mode = DISP_MODES.list;
                            }
                            
                            items.push(h('v-subheader', {
                                key: 'cat-' + kind.id,
                                props: {inset: true},
                                attrs: {"data-cat-id": kind.id},
                                style: {color: bc}
                            }, [
                                kind.name
                            ]));
                        }
                    }
                    
                    items.push(
                                h(SkProdItem, {
                                    props: {
                                                prod: item, 
                                                store: this.store, 
                                                disp:  (this.chips) ? DISP_MODES.list : DISP_MODES.cards
                                            }
                                })  
                    );
                });
        }   //switch
        return h('v-list', {
            key: 'list-acts-' + this.store.id, 
            class: {"sk-store-actions": true, "sk-cards-mode": !this.chips},
            props: {subheader: true}
        }, items);
    }
};
</script>
<style lang="scss" scoped>
    @import "~/assets/index";
    
    .sk-store-actions{
        margin-top: 1rem;
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
        &.sk-cards-mode{
            & .v-list-item{
                border-bottom: 0 none;
                margin-bottom: 1rem;
            }
            
        }
        & .sk-cats-cards{
            position: relative;
            display: flex;
            flex-wrap: wrap;
            align-items: stretch;
            justify-content: space-around;
            width: 100%;
            & .h3{
                font-weight: 300;
                font-size: 1.25rem;
                font-style: italic;
                padding: 1rem 1rem 0.5rem 0;
                width: 100%;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                & .v-btn{
                    color: #fff
                }
            }
            & .v-card{
                width: calc(50% - 1rem);
                margin: 0 0.5rem 1rem 0;
                & .v-image{
                    & .v-image__image{
                        background-size: cover !important;
                    }
                }
                & .v-card__text{
                    line-height: 1.125;
                }
            }
            & .v-card:nth-child(2n+1){
                margin-right: 0;
            }
        }   /* sk-cats-cards */
    }
</style>
