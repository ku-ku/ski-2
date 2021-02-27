<script>
import { ST_MODES } from "~/utils/index.js";
import { 
        VBtn,
        VCard,
        VCardText
} from 'vuetify/lib';

import SkStoreNavi from "~/components/SkStoreNavi";
import SkStoreInfo from "~/components/SkStoreInfo";

export default {
    async asyncData(context){
        const { store } = context,
              isUser = store.getters["profile/is"]("user");
        var card = null, 
            magazz = store.state.active.store;
        if (!(!!magazz)) {
            const magazzId = context.params.id;
            magazz = await store.dispatch("loadStore", {id: magazzId});
            store.commit("active/setStore", magazz);
        }
        if (isUser && (!!magazz) && (!!magazz.hasaccount)) {
            card = await store.dispatch("loadCard", {by: "tenant", id: magazz.tenantid});
        }
        
        
        return {
            store: magazz,
            card: card,
            has: {
                    store: (!!magazz),
                    card:  card,
                    user:  isUser
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
        SkStoreInfo
    },
    render(h){
        return h('v-card', {props: {flat: true}}, [
            h('v-card-text', [
                h(SkStoreNavi, {
                    key: 'store-navi-info',
                    props: {store: this.store, has: this.has, value: ST_MODES.info}
                }),
                h(SkStoreInfo, {props: {store: this.store, card: this.card, has: this.has}})
            ])
        ]);
    }
}    
</script>    

