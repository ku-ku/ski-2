<script>
import { MODES, DISP_MODES } from '@/utils';
import { 
        VBtn,
        VCard,
        VCardTitle,
        VCardText,
        VImg,
        VList,
        VListItem,
        VListItemContent,
        VListItemIcon,
        VSkeletonLoader
} from 'vuetify/lib';
import { Scroll } from 'vuetify/lib/directives';

import SkSvg from "~/components/SkSvg";
    
export default{
    name: 'SkStores',
    async asyncData(context){
        const { store } = context;
        try {
            store.commit("settings/setDispMode", DISP_MODES.list);
            return {stores: await store.dispatch("loadStores", {my: false})};
        } catch(e) {
            console.log('ERR SkStores', e);
        }
    },
    data(){
        return {
            fab: false
        };
    },
    directives: { Scroll },
    components: { 
        VBtn,
        VCard,
        VCardTitle,
        VCardText,
        VImg,
        VList,
        VListItem,
        VListItemContent,
        VListItemIcon,
        VSkeletonLoader,
        SkSvg 
    },
    computed: {
        disp(){
            return this.$store.state.settings.dispMode;
        }
    },
    activated(){
        this.$store.commit("active/empty");
    },
    render(h){
        var conte = [];

        const url = this.$http.env.rpcUrl;
        
        if (!!this.stores){
            switch(this.disp){
                case DISP_MODES.list:
                    conte.push(h('v-list', [
                        this.stores.map((store)=>{

                            const imgId = (!!store.brandavatar) ? store.brandavatar.id : (!!store.brandlogo) ? store.brandlogo.id : null;

                            return h('v-list-item', {
                                            key: 'store-item-' + store.id,
                                            props: {to: "/stores/" + store.id}
                                    }, [
                                    h('v-list-item-icon', [
                                        $utils.isEmpty(imgId) 
                                            ? null
                                            : h('v-img', {props: {
                                                    src: url + '/static/model/view/' + imgId,
                                                    contain: true,
                                                    width: 48,
                                                    height: "auto"

                                                }})
                                    ]),
                                    h('v-list-item-content', [
                                        $utils.isEmpty(store.fullname) ? store.title : store.fullname,
                                        $utils.isEmpty(store.shortloyalty)
                                            ? null
                                            : h('div', {class:"text-muted"}, store.shortloyalty)
                                    ])
                                ]);
                            })
                    ]));
                    break;
                case DISP_MODES.cards:
                    this.stores.map((store)=>{
                        const imgId = (!!store.brandlogo) ? store.brandlogo.id : null;
                        conte.push(h('v-card', {
                            key: 'store-card-' + store.id,
                            props: {width: "47%", to: "/stores/" + store.id},
                            class: {"mb-5": true}
                        }, [
                            h('v-img', {props: {src: url + '/static/model/view/' + imgId}}),
                            h('v-card-title', [
                                $utils.isEmpty(store.fullname) ? store.title : store.fullname,
                                $utils.isEmpty(store.shortloyalty)
                                    ? null
                                    : h('div', {class:"text-muted"}, store.shortloyalty)
                            ])
                        ]));
                    });
                    break;
            }
            
            /* fab */
            conte.push( h('v-btn', {
                    props: {fab: true, dark: true, fixed: true, bottom: true, right: true, color: "orange", small: true, elevation: 5},
                    on: {click: ()=>{ this.$vuetify.goTo(0); }},
                    directives: [{
                            name: "scroll",  
                            rawName: "v-scroll",
                            value: (e)=>{
                                if (typeof window === 'undefined') return;
                                const top = window.pageYOffset ||   e.target.scrollTop || 0;
                                this.fab = top > 120;
                            }
                    }],
                    style: {display: this.fab ? '' : 'none'}
                }, [
                    h('sk-svg', {props:{xref:"#ico-up"}})
            ]));
            
            
        } else {
                [1, 2, 3].map((i)=>{
                        conte.push(
                            h('v-skeleton-loader', { 
                                      key: 'sk-loader-' + i,
                                      props: {type:'card', tile: true, boilerplate: false},
                                      class: {'mb-5': true}
                            })
                        );
                });
        }
        
        return h('div', {
            class: {
                "sk-stores": true,
                "sk-cards": (this.disp===DISP_MODES.cards)
            }
        }, conte);
    }   //render
}
</script>    
<style lang="scss">
    @import "~/assets/index.scss";
    
    $light-gray: lighten($gray-text, 30%);
    
    .sk-stores{
        padding: 0 0.5rem 5rem 0.5rem;
        &.sk-cards{
            display: flex;
            flex-wrap: wrap;
            align-items: stretch;
            justify-content: space-around;
        }
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
                    & .v-image{
                        padding: 0.25rem;
                        border: 1px solid $light-gray;
                        border-radius: 4px;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.22);
                    }
                }
                & .v-list-item__content{
                    line-height: 1.115;
                }
            }
        }
        & .v-card{
            & .v-image{
                min-height: 120px;
            }
            &__title{
                line-height: 1.115;
                display: block;
                font-weight: 400;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                & .text-muted{
                    white-space: normal;
                    word-break: break-word;
                }
            }
        }
    }
</style>
