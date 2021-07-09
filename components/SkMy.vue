<script>
import { MODES } from "~/utils/index.js";
import { eventBus } from '~/utils/eb';
import { 
        VImg,
        VList,
        VListItem,
        VListItemIcon,
        VListItemContent,
        VSkeletonLoader
    } from 'vuetify/lib';


const MyItem = {
    name: 'MyItem',
    props: {
        card: {
            type: Object,
            required: true
        }
    },
    components: {
        VImg,
        VListItem,
        VListItemIcon,
        VListItemContent
    },
    computed: {
        imgId(){
            return (!!this.card.brandavatar) 
                        ? this.card.brandavatar.id 
                        : (!!this.card.brandlogo)
                            ? this.card.brandlogo.id
                            : null;
        }   //imgId
    },
    render(h){
        const url = this.$http.env.rpcUrl;
        return h('v-list-item', {
            key: 'my-' + this.card.id,
            props: {to: '/stores/' + this.card.tenantid}  //TODO:
        }, [
            h('v-list-item-icon', [
                h('v-img', {props: {
                        src: url + '/static/model/view/' + this.imgId,
                            contain: true,
                            width: 48,
                            height: "auto"

                }})
            ]),
            h('v-list-item-content', [
                this.card.title,
                $utils.isEmpty(this.card.shortloyalty)
                    ? null
                    : h('div', {class:"text-muted"}, this.card.shortloyalty)
            ])
        ]);
    }
};  //MyItem

export default {
    name: 'SkMy',
    components: {
        VList,
        VSkeletonLoader,
        MyItem
    },
    data(){
        return {
            mode: MODES.none,
            cards: null
        };
    },
    created(){
        eventBus.$on('new-store', ()=>{
            this.load(true);
        });
    },
    async fetch(){
        this.load(false);
    },
    methods: {
        async load(reset){
            this.mode = MODES.loading;
            console.log('my: load', !!reset);
            try {
                const cards = await this.$store.dispatch("loadStores", {my: true, reset: !!reset});
                var _cards = [];
                cards.map((card)=>{
                    var c = Object.assign({}, card);
                    _cards.push(c);
                });
                this.cards = _cards;
                this.mode = MODES.default;
                this.$emit("load", this.cards.length);
            } catch(e) {
                console.log('ERR (my)', e);
                this.mode = MODES.error;
            }
        }
    },
    render(h){
        var childs = [];
        switch(this.mode){
            case MODES.loading:
                [1, 2, 3].map((i)=>{
                    childs.push(h('v-skeleton-loader', 
                                    { key: 'sk-loader-' + i,
                                      props: {type:'article', tile: true, boilerplate: false},
                                      class: {'mb-5': true}
                                    })
                                );
                });
                break;
            case MODES.error:
                break;
            case MODES.default:
                childs.push(h('v-list', [
                    this.cards.length > 0
                        ? this.cards.map((card)=>{
                                return h(MyItem, {props: {card: card}});
                          })
                        : h('v-list-item', {props: {to:{name: 'stores'}}}, [
                            h('v-list-item-icon', [
                                h('v-icon', {props: {color: 'accent'}}, 'mdi-storefront')
                            ]),
                            h('v-list-item-content', {
                                style: {"line-height": 1.125, "font-size": "0.9rem"}
                            }, [
                                'Вы можете добавить любой из представленных в нашем приложении магазин для быстрого доступа к его товарам, совершения покупок, участия в проводимых акциях и многого другого',
                                h('div', {class: "text-right mt-3"}, [
                                    h('v-btn', {props: {color: "accent", outlined: true, to: {name: 'stores'}}}, 
                                        [
                                            'Все магазины',
                                            h('v-icon', 'mdi-chevron-right')
                                        ])
                                ])
                            ])
                        ])
                ]));
                break;
        }
        return h('div', {class: "sk-my-cards"}, childs);
    }
}    
</script>
<style lang="scss">
    @import "~/assets/index.scss";
    
    $light-gray: lighten($gray-text, 30%);
    
    .sk-my-cards{
        & .v-list{
            & .v-list-item{
                padding: 0;
                &:not(:last-child){
                    border-bottom: 1px solid $light-gray;
                }
                & .v-list-item__icon{
                    align-self: center;
                    margin: 0;
                    margin-right: 1rem;
                    width: 64px;
                    padding: 6px;
                    min-height: 48px;
                    padding: 6px;
                    & .v-image{
                        padding: 0.25rem;
                        border: 1px solid $light-gray;
                        border-radius: 4px;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.22);
                    }
                }
            }
        }
    }
</style>
