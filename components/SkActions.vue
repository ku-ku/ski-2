<script>
import { MODES } from "~/utils/index.js";
import { 
         VImg,
         VIcon,
         VCard,
         VCardTitle,
         VSkeletonLoader,
    } from 'vuetify/lib';


const ActItem = {
    name: "ActItem",
    props: {
        action: {
            type: Object,
            required: true
        }
    },
    components: {
         VImg,
         VCard,
         VIcon,
         VCardTitle
    },
    computed: {
        imgId(){
            return this.action.promoimage.id;
        }, 
        addr(){
            return (!!this.action.location) ? $utils.formatAddress(this.action.location) : '';
        }
    },      //computed
    render(h){
        const url = this.$http.env.rpcUrl,
              dist= Number(this.action.distance);
      
        return h("v-card", {
            props: {
                width: "100%",
                to: "/stores/" + this.action.mainorgid
            },
            class: "mb-5"
        }, [
            h('v-card-title', [
                $utils.isEmpty(this.action.orgname) ? this.action.mainorgname : this.action.orgname,
                $utils.isEmpty(this.addr) 
                    ? '' 
                    : h('div', {class: "sk-address"}, [
                        h('v-icon', {props: {small: true}}, "mdi-map-marker-outline"),
                        this.addr 
                        /*,
                        (dist > 0) 
                            ? ' (~' + ((dist < 1000) 
                                            ? Math.round(dist) + 'м.' 
                                            : Math.round(dist/1000) + 'км.') + ')'
                            : ''
                        */
                      ])
            ]),
            h('v-img', {
                props: {
                    src: url + '/static/model/view/' + this.imgId
                }
            })
        ]);
    }   //render
};  //ActItem

export default {
    name: "SkActions",
    components: { 
        VSkeletonLoader,
        ActItem 
    },
    fetchOnServer: true,
    data(){
        return {
            mode: MODES.none,
            actions: null
        };
    },
    async fetch(){
        this.mode = MODES.loading;
        try {
            const cards = await this.$store.dispatch("loadStores", {my: true});
            const stores= await this.$store.dispatch("loadStores", {my: false});
            
            const all = [
                            ...cards, 
                            ...stores.filter((store)=>{
                                return store.distance < 10000;
                            })
                        ];
            const ids = [];
            const acts = await this.$store.dispatch("loadActions");
            var _acts = [];
            acts.map((a)=>{
                //don`t use without image
                if (!(!!a.promoimage)) {   
                    return;
                }
                var _id = (!!a.mainorgid) ? a.mainorgid : a.tenantid;
                
                /* get a store by action */
                var _all = all.filter((store)=>{
                    return ((_id === store.id)||(_id === store.tenantid));
                });
                if (_all.length < 1){
                    return;
                }
                if (ids.indexOf(_id) < 0){
                    ids.push(_id);
                    _acts.push(Object.assign({
                        distance: _all[0].distance, 
                        location: _all[0].location,
                        my: _all[0].my
                    }, a));
                    
                }
            });
            
            this.actions = _acts.sort((a1, a2)=>{
                if (!(!!a1.distance)){
                    return (!!a2.distance) ? -1 : 1;
                }
                return a1.distance < a2.distance 
                                ? -1 
                                : (a1.distance == a2.distance)
                                    ? (a1?.orgname || a1.mainorgname).localeCompare(a2?.orgname || a2.mainorgname)
                                    : 1;

/*                
                
                        
                        (a1.my && !a2.my) 
                        ? -1
                        : (!a1.my && a2.my) 
                            ? 1
                            : a1.distance < a2.distance 
                                ? -1
                                : (a1.distance > a2.distance) ? 1 : 0;
* 
*/
            });
            console.log('actions', this.actions);
            this.mode = MODES.default;
            this.$emit("load", this.actions.length);
        } catch(e) {
            console.log('ERR (actions)', e);
            this.mode = MODES.error;
        }
    },
    render(h){
        var childs = [];
        switch (this.mode){
            case MODES.loading:
                [1, 2, 3].map((i)=>{
                        childs.push(
                            h('v-skeleton-loader', { 
                                      key: 'sk-loader-' + i,
                                      props: {type:'card', tile: true, boilerplate: false},
                                      class: {'mb-5': true}
                            })
                        );
                });
                break;
            case MODES.error:
                break;
            case MODES.default:
                this.actions.map((a)=>{
                        childs.push(h(ActItem, {props: {action: a}}));
                });
                
        }
        return h('div', {class: "sk-actions"}, childs);
    }
}
</script>
<style lang="scss">
    @import "~/assets/index.scss";
    
    .sk-actions{
        margin-top: 2rem;
        & .v-card{
            & .v-card__title{
                font-size: 0.85rem;
                font-weight: 400;
                line-height: 1.115;
                padding: 0.5rem;
                display: block;
                & .sk-address{
                    font-size: 0.8rem;
                    color: $gray-color;
                    & .v-icon{
                        margin-right: 0.5rem;
                    }
                }
            }
            & .sk-price{
                position: absolute;
                top: 1rem;
                right: 1rem;
                padding: .5rem;
                font-size: 2rem;
                color: #fff;
                z-index: 2;
                background: rgba(24,15,13,.5);
                text-shadow: 0 2px 2px rgba(0, 0, 0, 0.7);
                width: 8rem;
                text-align: right;
                box-shadow: -2px 2px 4px rgba(0, 0, 0, 0.33);
                border-radius: 4px;                    
            }
            & h3{
                padding: 1rem;
                font-weight: 400;
            }
        }
    }
</style>    
