<script>
import { 
        VImg,
        VBtn,
        VAlert,
        VSkeletonLoader,
        VList,
        VListItem,
        VListItemIcon,
        VListItemContent,
        VListItemTitle, 
        VListItemSubtitle,
        VListItemAction,
        VListItemActionText
       } from 'vuetify/lib';
const modes = {
    OM_ERROR:  -1,
    OM_NONE:    0,
    OM_LOADING: 1,
    OM_READY:   2
};
export default {
    name: 'skOrders',
    components: {
        VImg,
        VBtn,
        VAlert,
        VSkeletonLoader,
        VList,
        VListItem,
        VListItemIcon,
        VListItemContent,
        VListItemTitle, 
        VListItemSubtitle,
        VListItemAction,
        VListItemActionText
    },
    props: {
    },
    data(){
        return {
            state: modes.OM_NONE,
            ords: null
        };
    },
    async asyncData(context){
        const { store } = context,
              isUser = store.getters["profile/is"]("user");
        var magazz = store.state.active.store;
        if (!(!!magazz)) {
            const magazzId = context.params.id;
            magazz = await store.dispatch("loadStore", {id: magazzId});
            store.commit("active/setStore", magazz);
        }
    },
    computed: {
        user(){
            return this.$store.state.profile.user;
        },
        prod(){
            return this.$store.state.active.store;
        },
        hasItems(){
            return (!!this.ords)&&(this.ords.length>0);
        }
    },
    mounted(){
        this.load();
    },
    methods: {
        back(){
            this.$router.go(-1);
        },
        async load(){
            const opts = {
                    type: 'core-read',
                    query: 'sin2:/v:c45a718a-eaef-4c29-8987-8450ddf7e444?filter=and('
                        + 'eq(field(".userID"),param("' + this.user.id + '", "id")), '
                        + 'eq(field(".tenantID"),param("' + this.prod.id + '", "id"))'
                        + ')&sort=-regDt'
                    };
            this.state = modes.OM_LOADING;
            try{
                var res = await this.$http.post(opts);
                if (!!res.error){
                    throw res.error;
                }
                this.ords = $utils.sin2objA(res.result.columnIndexes, res.result.data);
                this.state = modes.OM_READY;
            }catch(e){
                console.log(e);
                this.state = modes.OM_ERROR;
            }
        },

    },
    render(h){
        var bc = '',
            title='история заказов';
        if (!!this.prod){
            bc = this.prod.brandcolor || this.prod.brandcolormain;
            title = this.prod.mainorgname || this.prod.fullname || this.prod.title;
        }
        var childs = [
                h('div', {class:{'sk-top-bar': true}}, [
                    h('v-btn', {props: {
                                    dark: true,
                                    icon: true,
                                    small: true,
                                    tile: true
                                }, on: {
                                    click: ()=>{this.$router.go(-1);}
                                }}, [
                        h('svg', {attrs: {viewBox:"0 0 192 512"}, domProps:{innerHTML: '<use xlink:href="#ico-left" />'}})
                    ]),
                    h('h3', {style:{color:bc}}, title)
                ])
        ];
        switch(this.state) {
            case modes.OM_LOADING:
                for (var i=0; i<3; i++){
                    childs.push(h('v-skeleton-loader', {
                                    key: 'sk-loader-' + i,
                                    props: {type: "article"},
                                    class:{"mx-auto": true, "mb-3": true}
                                }
                    ));
                }
                break;
            case modes.OM_READY:
                const url = this.$http.env.rpcUrl
                if (!this.hasItems){
                    childs.push(h('div', {class:{'sk-no-orders': true, 'mt-12': true}}, 'нет заказов'));
                } else {
                    childs.push(h('v-list', {props:{flat:true}}, [
                        this.ords.map((o)=>{
                            var img = o.promoimage;
                            var wait= $utils.isEmpty(o.tenantdate);
                            return h('v-list-item', {
                                key: 'ord-' + o.id
                            },[
                                $utils.isEmpty(img)
                                    ? null
                                    : h('v-list-item-icon', [
                                        h('v-img', {props:{
                                                        src: url + '/static/model/view/' + img.id,
                                                        'max-height': 64,
                                                        contain: true
                                        }})
                                    ]),
                                h('v-list-item-content', [
                                    h('v-list-item-title', [
                                        h('div', {class: {'sk-ten-dt': true, 'sk-wait': wait}}, [
                                            wait ? h('svg', {attrs: {viewBox:"0 0 512 512"}, domProps:{innerHTML: '<use xlink:href="#ico-clock" />'}})
                                                 : h('svg', {attrs: {viewBox:"0 0 512 512"}, domProps:{innerHTML: '<use xlink:href="#ico-chk-circle" />'}}),
                                            wait ? 'в обработке' 
                                                 : $utils.formatDate(o.tenantdate, 'DD.MM.YYYY HH:mm')
                                        ]),
                                        o.promogoods
                                    ]),
                                    h('v-list-item-subtitle', {class:{'sk-dates': true}}, [
                                        h('div', {class: {'sk-reg': true}}, [
                                            $utils.formatDate(o.regdt, 'DD.MM.YYYY HH:mm'),
                                        ])
                                    ])
                                ]),
                                h('v-list-item-action', [
                                    h('v-list-item-action-text', [
                                        h('div', [
                                            h('div', {class: {'sk-ammount': true}}, o.amount),
                                            $utils.isEmpty(o.opersum)
                                                ? null
                                                : h('div', {class: {'sk-summ': true}}, o.opersum + ' руб.')
                                        ]),
                                        h('v-btn', {
                                            props: {
                                                'x-small': true,
                                                fab: true,
                                                elevation: 0
                                            }, 
                                            class: {'ml-2': true}
                                        }, [
                                            h('svg', {attrs: {viewBox:"0 0 128 512"}, domProps:{innerHTML: '<use xlink:href="#ico-dots" />'}})
                                        ])
                                    ])
                                ])  /*v-list-item-action*/
                            ]);
                        })
                    ]));
                }
                break;
        }
        
        return h('div', {
            key: 'orders-' + this.user.id,
            class: {'sk-orders': true}
        }, childs);
    }
};
</script>
<style lang="scss" scoped>
    @import "~/assets/index.scss";
    
    .sk-orders{
        color: $gray-color;
        padding: 1rem;
        height: 100%;
        & .sk-top-bar{
            padding: 1rem;
            position: absolute;
            z-index: 4;
            top: 0;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            & .v-btn{
                border-radius: 50%;
                background: rgba(0,0,0, 0.18);
                width: 32px;
                height: 32px;
                line-height: 32px;
                text-align: center;
                color: #fff;
                margin-right: 1rem;
                & .v-btn__content{
                    display: inline;
                }
                & svg{
                    width: 18px;
                    height: 18px;
                    opacity: 0.75;
                }
            }
            & h3{
                font-weight: 400;
                font-size: 1.25rem;
                white-space: nowrap;
                overflow: hidden; 
                text-overflow: ellipsis;
            }
        }
        & .v-list{
            margin-top: 2.5rem;
            margin-bottom: 4rem;
            & .v-list-item{
               border-top: 1px solid #ccc;
               padding: 0 !important;
               & .v-list-item__icon{
                   width: 32px;
               }
               & .v-list-item__action-text{
                    display: flex;
                    align-items: center;
               }
               & .sk-ten-dt{
                    position: absolute;
                    top: -12px;
                    right: 1rem;
                    font-size: 0.75rem;
                    border-radius: 9px;
                    border: 1px solid #ccc;
                    color: $gray-color;
                    width: auto;
                    padding: 0.25rem 0.5rem;
                    background: #fff;
                    & svg{
                        width: 0.75rem;
                        height: 0.75rem;
                        margin-right: 0.25rem;
                        color: #01579B;
                    }
                    &.sk-wait{
                        color: $red-color;
                        & svg{
                            color: $red-color;
                        }
                    }
               }
               & .v-btn--fab{
                   & svg{
                       width: 18px;
                       height: 18px;
                       color: $gray-color;
                   }
               }
            }
            & .sk-dates{
               font-size: 0.75rem;
            }
            & .sk-ammount{
               font-size: 1rem;
               text-align: right;
               color: $red-color;
            }
            & .sk-summ{
               text-align: right;
            }
        }
    }
    .v-application--is-ltr {
        .sk-orders{
            .v-list-item__icon:first-child{
                margin-right: 8px;
            }
        }
    }
</style>
