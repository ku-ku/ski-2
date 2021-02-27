<script>
import { 
        VList,
        VListItem,
        VListItemIcon,
        VListItemContent,
        VImg
} from 'vuetify/lib';
import SkSvg from '~/components/SkSvg';
    
export default {
        name: 'SkStoreActionsNavi',
        components: {
            VList,
            VListItem,
            VListItemIcon,
            VListItemContent,
            VImg,
            SkSvg
        },
        data(){
            return { cats: [] };
        },
        async fetch(){
            await this.$store.dispatch("active/getActions");            
            this.cats = this.$store.state.active.groups;
        },
        computed: {
            has(){
                return (this.cats?.length || 0) > 0;
            }
        },
        methods: {
            go(cat){
                this.$emit("click");
                
                const _go = ()=>{
                    var h = $('.v-subheader[data-cat-id="' + cat.id + '"]');
                    if (h.length > 0){
                        $([document.documentElement, document.body]).animate({
                            scrollTop: h.offset().top-56
                        }, 800);
                    }
                };
                if (/(\/stores\/)+(.{38,})+/.test(this.$route.path)){ //don`t in store
                    setTimeout(_go, 300);
                    this.$router.back();
                } else {
                    _go();
                }
            }
        },
        render(h){
            if (this.has){
                const url = this.$http.env.rpcUrl;
                return h('v-list', {class: "sk-actions-navi"}, [
                    this.cats.map((cat)=>{
                        return h('v-list-item', {
                                    key: 'cat-nav-' + cat.id,
                                        on: {click: ()=>{this.go(cat);}}
                                    }, [ 
                                        h('v-list-item-icon', {class: "sk-cat-image mr-3"}, [
                                            $utils.isEmpty(cat.img) 
                                                ? h('sk-svg', {props:{xref:"#ico-box-full"}})
                                                : h('v-img',  {
                                                    props:{
                                                            src: url + '/static/model/view/' + cat.img
                                                    }
                                                })
                                        ]),
                                        h('v-list-item-content', cat.name)
                                ]);
                    })
                ]);
            }
            return null;
        }
}
</script>    
<style lang="scss" scoped>
    .sk-actions-navi{
        & .v-list-item{
            & .v-list-item__icon{
                & .v-image{
                    width: 36px;
                    height: 36px;
                    border-radius: 500px;
                    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.18);
                }
            }
        }
    }
</style>    