<script>
import { MODES, ST_MODES } from "~/utils/index.js";
import { 
        VCard,
        VCardText
} from 'vuetify/lib';

import SkStoreFilials from "~/components/SkStoreFilials";
import SkStoreNavi from "~/components/SkStoreNavi";


export default {
    async asyncData(context){
        const { store } = context;
        var magazz = store.state.active.store;
        if (!(!!magazz)) {
            const magazzId = context.params.id;
            magazz = await store.dispatch("loadStore", {id: magazzId});
            store.commit("active/setStore", magazz);
        }
        
        return {
            store: magazz,
            has: {
                    store: (!!magazz),
                    card:  (!!magazz)&&(magazz.hasaccount)
            }
        };
    },
    head(){
        //TODO:
        return {title: this.has.store ? this.store.title : 'loading...'};
    },
    components: {
        VCard,
        VCardText,
        SkStoreNavi,
        SkStoreFilials
    },
    render(h){
        return h('v-card', {props: {flat: true}}, [
            h('v-card-text', [
                h(SkStoreNavi, {
                    key: 'store-navi-fills',
                    props: {store: this.store, has: this.has, value: ST_MODES.fils}
                }),
                h(SkStoreFilials, {props: {parent: this.store}})
            ])
        ]);
    }
}    
</script>    
