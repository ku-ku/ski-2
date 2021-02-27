<script>
import { MODES } from "~/utils/index.js";

import { 
        VCard,
        VSlideGroup,
        VSlideItem,
        VImg,
        VSkeletonLoader
    } from 'vuetify/lib';
    
export default {
    name: 'SkStoreBanners',
    props: {
        store: {
            type: Object,
            required: true
        }
    },
    components: {
        VCard,
        VSlideGroup,
        VSlideItem,
        VImg,
        VSkeletonLoader
    },
    data(){
        return {
            mode: MODES.none,
            banners: null
        };
    },
    async fetch(){
        this.mode = MODES.loading;
        try {
            this.banners = await this.$store.dispatch("active/getBanners");
            this.mode = MODES.default;
            this.$emit("load", this.banners.length);  //TODO: when empty
        } catch(e) {
            this.mode = MODES.error;
            console.log('ERR on banners:', e);
        }
    },
    render(h){
        var items = [];
        switch (this.mode){
            case MODES.loading:
                return h('v-skeleton-loader', {props: {type: 'image'}});
                break;
            case MODES.default:
                const url = this.$http.env.rpcUrl;
                this.banners.map((item)=>{
                        if (!!item.promoimage){
                            items.push(
                                h("v-slide-item", {key: 'ban-item-' + item.id, props:{value: item.id}}, [
                                        h("v-img", {
                                            props: {
                                                src: url + '/static/model/view/' + item.promoimage.id,
                                                height: 96,
                                                width: 148
                                            }
                                        })
                                ])
                            );
                        }
                });
        }   //switch
        return h('v-slide-group', {class: "sk-banners"}, items);
    }
};
</script>
<style lang="scss" scoped>
    .sk-banners {
        margin-top: 1rem;
        & .v-image{
            border-radius: 0.5rem;
            margin-right: 0.5rem;
        }
    }
</style>
