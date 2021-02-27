<script>
import { ST_MODES } from "~/utils/index.js";
import { 
        VBtn,
        VCard,
        VCardText
} from 'vuetify/lib';

import SkStoreNavi from "~/components/SkStoreNavi";
import SkStoreShare from "~/components/SkStoreShare";

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
                    store: (!!magazz)
            }
        };
    },
    head(){
        return {title: this.has.store ? this.store.title : 'loading...'};
    },
    components: {
        VBtn,
        VCard,
        VCardText,
        SkStoreNavi,
        SkStoreShare
    },
    render(h){
        return h('v-card', {props: {flat: true}}, [
            h('v-card-text', [
                h(SkStoreNavi, {
                    key: 'store-navi-info',
                    props: {store: this.store, has: this.has, value: ST_MODES.share}
                }),
                h(SkStoreShare, {props: {parent: this.store, has: this.has}})
            ])
        ]);
    }
}    
</script>
