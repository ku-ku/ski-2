<script>
import { short, MODES } from "~/utils/index.js";    
import { 
        VImg,
        VIcon,
        VBtn,
        VCard,
        VSlideGroup,
        VSlideItem
    } from 'vuetify/lib';

const NrItem = {
    name: "NrItem",
    props: {
        store: {
            type: Object,
            required: true
        }
    },
    components: {
        VImg,
        VIcon,
        VBtn,
        VCard,
        VSlideGroup,
        VSlideItem
    },
    computed: {
        imgId(){
            return (!!this.store.brandavatar) 
                        ? this.store.brandavatar.id 
                        : (!!this.store.brandlogo)
                            ? this.store.brandlogo.id
                            : null;
        },
        short(){
            return short(this.store.title);
        }
    },
    render(h){
        const url = this.$http.env.rpcUrl;
        return h("v-slide-item", {
            key: 'nr-item-' + this.store.id,
            props: {}
        }, [
            h("v-card", {
                class: "ma-2",
                props: {
                    width: 96,
                    height: 96,
                    to: "/stores/" + this.store.id
                }
            }, [
                (!!this.imgId) 
                    ? h("v-img", {
                        props: {
                            src: url + '/static/model/view/' + this.imgId,
                            contain: true,
                            width: "100%",
                            height: "100%"
                        }
                }) 
                : h('div', {
                    class: {"sk-short": true, "fill-height": true, "d-flex": true, "justify-center": true, "align-center": true},
                    style: {"background-color": this.store.brandcolor, color: "#fff"}
                }, this.short)
            ])
        ]);
    }
};  //NrItem

export default {
    name: "SkNear",
    components: { 
        VIcon,
        VBtn,
        VSlideGroup,
        NrItem 
    },
    data(){
        return {
            mode: MODES.none,
            stores: null
        };
    },
    async fetch(){
        this.mode = MODES.loading;
        try {
            const stores = await this.$store.dispatch("loadStores", {my: false});
            var _stores = [];
            stores.map((store)=>{
                var s = Object.assign({}, store);
                if (s.distance < 10000){
                    _stores.push(s);
                }
            });
            this.stores = _stores.sort((s1, s2)=>{
                    return s1.distance < s2.distance 
                                ? -1 
                                : (s1.distance == s2.distance)
                                    ? s1.title.localeCompare(s2.title)
                                    : 1;
            });
            this.mode = MODES.default;
            this.$emit("load", this.stores.length);
        } catch(e) {
            this.mode = MODES.error;
        }
    },
    computed: {
        nears(){
            if (!!this.stores){
                return this.stores;
            }
            return [];
        }
    },
    render(h){
        var childs = [];
        if (MODES.default === this.mode){
            const ct  = this.$store.getters["geo/city"],
                  fine= this.$store.state.geo.ll.fine;
            childs.push(h('h2', [
                h('div', {
                    class: {"d-flex": true, "align-center": true}
                }, [
                    h('v-icon', {
                        props: {color: fine ? '' : 'orange'},
                        class: "mr-2"
                    }, fine ? 'mdi-map-marker-radius-outline' : 'mdi-map-marker-alert-outline'),
                    h('div', [
                        'рядом',
                        h('div', {class: "text-muted"}, ct)
                    ])
                ]),
                h('v-btn', {
                    props: {outlined: true, color: 'grey', to: "/stores", small: true}
                }, [
                    h('v-icon', {
                        props: {small: true},
                        class: "mr-2"
                    }, 'mdi-view-list'),
                    'все'
                ])
            ]));
            childs.push(h('v-slide-group', [
                this.nears.map((store)=>{
                    return h(NrItem, {props: {store: store}});
                })
            ]));
        }
        return h('div', {class: "sk-nears"}, childs);
    }
}
</script>
<style lang="scss" scoped>
    @import "~/assets/index.scss";
    
    .sk-nears{
        margin-top: 1rem;
        & h2{
            font-size: 1.25rem;
            font-weight: 400;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        & .v-slide-group{
            margin-top: 1rem;
        }
    }
</style>    