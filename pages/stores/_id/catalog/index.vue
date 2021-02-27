<script>
import { MODES } from "~/utils/index.js";
    
import { 
         VBtn,
         VImg,
         VList, 
         VSubheader,
         VListItem,
         VListGroup,
         VListItemGroup,
         VListItemIcon,
         VListItemContent,
         VListItemTitle,
         VListItemSubtitle,
         VListItemAction,
         VTextField,
         VBadge,
         VChip,
         VChipGroup,
         VBottomSheet,
         VCard,
         VCardText,
         VCardTitle,
         VToolbar,
         VToolbarTitle,
         VSpacer,
         VSheet,
         VForm,
         VSkeletonLoader,
         VTooltip,
         VTreeview,
         VDivider,
         VAlert
    } from 'vuetify/lib';
import SkSvg from '~/components/SkSvg';
    
const FIND_MODE = Object.assign(MODES, {
    abc: 99,
    cat: 999,
    q:   9999
});

export default {
    components: {
        VBtn,
        VImg,
        VList, 
        VSubheader,
        VListItem,
        VListGroup,
        VListItemGroup,
        VListItemIcon,
        VListItemContent,
        VListItemTitle,
        VListItemSubtitle,
        VListItemAction,
        VTextField,
        VBadge,
        VChip,
        VChipGroup,
        VBottomSheet,
        VCard,
        VCardTitle,
        VCardText,
        VToolbar,
        VToolbarTitle,
        VSpacer,
        VSheet,
        VForm,
        VSkeletonLoader,
        VTooltip,
        VTreeview,
        VDivider,
        VAlert,
        SkSvg
    },
    async asyncData(context){
        const { store } = context;
        var magazz = store.state.active.store;
        if (!(!!magazz)) {
            const magazzId = context.params.id;
            magazz = await store.dispatch("loadStore", {id: magazzId});
            store.commit("active/setStore", magazz);
        }
        
        return {
            parent: magazz,
            has: {
                    store: (!!magazz)
            }
        };
    },
    data(){
        return {
            mode: FIND_MODE.none,
            showParams: false,
            totals: null,
            abc:  null,
            kinds: null,
            activeKind: null,
            data: null,
            q: null
        };
    },
    computed: {
        tenant(){
            return (!!this.parent) ? this.parent.id : '00000000-0000-0000-0000-000000000666';
        },
        hasKinds(){
            return (!!this.kinds)&&(this.kinds.length > 0);
        },
        canFind(){
            return (!!this.totals)&&(this.totals.n > 0);
        }
    },
    created(){
        this.refresh();
    },  //created
    activated(){
        if (!(!!this.data)){
            this.refresh().then(()=>{
                this.show_find_params();
            });
        }
    },
    deactivated(){
        this.showParams = false; //hide params-pane
        $(".sk-find-params").css({display:'none'});
    },
    methods: {
        async refresh(){
            this.mode = FIND_MODE.loading;
            try {
                
                /* Categories */
                this.getcats(null);
                
                /* totals */
                const opts = {
                    type: "query",
                    query: "37afe6aa-4d4b-4f27-a34c-173e746cd7d7.searchData",
                    params: {
                        that: 1,
                        tenantid: this.tenant,
                        prms: ''
                    }
                };
                var resp = await this.$http.post(opts);
                console.log(resp);
                if (!!resp.error){
                    throw resp.error;
                }
                
                /* ABC */
                var abc = [];
                resp.result.data.map((a)=>{
                    if (!this.totals){
                        this.totals = {n: a[0]};
                        this.totals.dt = $utils.formatDate(new Date(a[1]));
                    }
                    abc.push({a: a[2], n: a[3], active: false});
                });
                this.abc = abc;
                this.mode = FIND_MODE.default;
            }catch(e){
                this.mode = FIND_MODE.error;
                console.log('ERR: load abc:', e);
            }
        },
        async find(that){
            this.mode = FIND_MODE.loading;
            this.data = null;
            const opts = {
                type: "query",
                query: "37afe6aa-4d4b-4f27-a34c-173e746cd7d7.searchData",
                params: {
                    that: 2,
                    tenantid: this.tenant,
                    prms: that
                }
            };
            try {
                var resp = await this.$http.post(opts);
                if (!!resp.error){
                    throw resp.error;
                }
                var data = [];
                resp.result.data.map((a)=>{
                    data.push({id: a[4], name: a[6], price: a[11], img: a[5], unit: a[13]});
                });
                if (!this.totals){
                    this.totals = {n: 0};
                }
                this.totals.n = data.length;
                this.data = data;
                this.$nextTick(()=>{this.$forceUpdate();});
            } catch(e) {
                console.log('ERR: load data', e);
            }
            this.$nextTick(()=>{this.mode = FIND_MODE.default;});
        },
        async getcats(parent){
            const self = this;
            return new Promise((resolve, reject) => {
                this.$store.dispatch("active/getCats", parent).then((cats)=>{
                    if (!(!!parent)){
                        self.kinds = cats;
                    }
                    resolve(cats.length);
                }).catch((err)=>{
                    console.log('ERR on cats:', err);
                    reject(err);
                });
            });
        },
        async oncat(cat){
            this.activeKind = cat;
            this.find('#' + cat.id);
            this.showParams = false;
        },  //oncat
        onabc(a){
            this.abc.map((_a)=>{
                _a.active = (_a.a === a.a);
            });
            this.find(a.a);
            this.showParams = false;
        },   //onabc
        _text_find(e){
            if (e){
                e.stopPropagation();
                e.preventDefault();
            }
            
            const inp = this.$refs['sk-find-inp'];
            if (
                    ($utils.isEmpty(this.q))
                  || (this.q.length < 3)
                ){
                inp.valid = false;
                inp.error = true;
                $(inp.$el).find('input').trigger('focus');
                app.msg({text:'Для поиска введите не менее 3-х символов', color:'warning'});
                return false;
            }
            this.showParams = false;
            this.find(this.q);
            return false;
        },
        show_find_params(){
            this.showParams = (new Date()).getTime();
            this.$nextTick(()=>{
                $('.sk-find-text input').trigger('focus');
            });
        },
        async open(prod){
            this.showParams = false; 
            this.$store.commit('active/setAction', prod);
            this.$router.push({
                    path: "/stores/" + this.tenant + "/catalog/" + prod.id
            });
        },
        back(){
            if (!!this.data){
                this.data = null;
                this.show_find_params();
            } else {
                this.$router.go(-1);
            }
        }
    },
    watch: {
        tenant(){
            this.mode = FIND_MODE.none;
            this.showParams = false;
            this.totals = null;
            this.abc = null;
            this.kinds = null;
            this.activeKind = null;
            this.data = null;
            this.q = null;
        },
        showParams(val){
            if (!!val){
                const pane = $(".sk-find-params");
                pane.css({display:''});
                pane.find('input').trigger('focus');
            }
        }
    },
    render: function(h){
        const self = this;
        const url = this.$http.env.rpcUrl;
        const color = this.parent.brandcolor || 'orange';
        
        var childs = [], 
            b = h('sk-svg', {props:{xref:"#ico-search"}});
        if ((!!this.totals)&&(!!this.totals.n)&&(this.totals.n>0)){
            b = h('v-badge', {
                                props: {content: this.totals.n, color: color},
                                class: {'sk-totals': true},
                                attrs: {id: 'sk-find-totals'}
                }, [ b ]);
                childs.push(h('v-btn', {
                                props: {icon: true, fab: true, fixed: true, dark: true, small: true},
                                style: {top: "8px", right: "1rem", zIndex: 9, "background-color": color},
                                on: {click: this.show_find_params}
                             }, [ b ])
                );
        } 
        
        

        if (this.mode === FIND_MODE.loading){
            childs.push(
                h('div',{style:{"margin-top":"64px"}},[
                    [1,2,3,4,5].map(()=>{
                        return h('v-skeleton-loader', {props:{type:'list-item-avatar-three-line'}});
                    })
                ])
            );
        } else {
            if (!!this.data){
                childs.push(
                    h('v-list', {props:{dense: true}, class: {'sk-find-prods': true}}, [
                        (this.data.length > 0)
                            ? this.data.map((d)=>{
                                return h('v-list-item', {
                                        key: 'prod-' + d.id,
                                        on: {click: ()=>{this.open(d);}}
                                    }, [ 
                                        h('v-list-item-icon', {class:{'sk-prod-image': true}}, [
                                            $utils.isEmpty(d.img) 
                                                ? h('sk-svg', {props:{xref:"#ico-box-full"}, style:{color:color}})
                                                : h('v-img',  {
                                                    props:{
                                                            contain: true,
                                                            'max-height': 86,
                                                            src: url + '/static/model/view/' + d.img
                                                    }
                                                })
                                        ]),
                                        h('v-list-item-content', [
                                            d.name,
                                            h('div', {class:{'sk-price': true}}, [
                                                (Number(d.price)>0) ? d.price + 'р.' : '',
                                                $utils.isEmpty(d.unit) ? null : h('span', {class:{'sk-unit': true}}, ' (' + d.unit + ')')
                                            ])
                                        ]),
                                        h('v-list-item-icon', [
                                            h('sk-svg', {props:{xref:"#ico-right"}, style:{color:"#ccc"}})
                                        ])
                                ]);
                            })
                            : h('v-list-item', {key: 'prod-not-found', props: {'three-line': true}}, [ 
                                h('v-list-item-content', [
                                    h('v-list-item-subtitle', 'По Вашему запросу ничего не найдено - попробуйте изменить условия поиска.')
                                ])
                            ])
                    ])
                );
            } else {
                //TODO: no-search, no-data
            }
        }   //else loading
        
        if (this.canFind) {
            childs.push(h('v-bottom-sheet', {
                props: {value: this.showParams, width: '100%', scrollable: true},
                class: {'sk-find-bottom': true}
            }, [
                h('v-card', {
                    props: {width: '100%', 'min-height': 420},
                    class: {'sk-find-params': true}
                }, [
                    h('v-card-title', {
                        style: {"background-color": color, color: "#fff"}
                    }, ['поиск',
                        h('v-spacer'),
                        (!!this.totals) ? this.totals.dt : null
                    ]),
                    h('v-card-text', [
                        h('v-form', {
                            on: {submit: this._text_find}
                        }, [
                            h('div', {class:{'sk-find-text': true}}, [
                                h('v-text-field', {
                                    props: {
                                        label: 'наименование',
                                        rules: [
                                            value => ($utils.isEmpty(value)||(!!value && value.length > 2)) || 'не менее 3-х символов'
                                        ]
                                    }, 
                                    ref:'sk-find-inp',
                                    on: {input:(v)=>{this.q = v;}},
                                    }),
                                    h('v-btn', {
                                                    props: {tile: true, type: 'submit', color: 'grey lighten-3', elevation: 0}
                                                }, [
                                                    h('sk-svg', {props:{xref: '#ico-search', width:16, height: 16}})
                                    ])
                            ])
                        ]),
                        (!!this.abc)
                            ? [ h('v-subheader', 'по алфавиту'),
                                h('v-chip-group', {
                                    class: {'sk-abc': true}
                                }, [
                                        this.abc.map((a)=>{
                                            return h('v-chip', {
                                                key: 'search-a-' + a.a,
                                                props: {small: true, value: a.n, color: !!a.active ? color : 'default'},
                                                on: {click: ()=>{this.onabc(a);}}
                                            }, a.a);
                                        })
                                ]),
                               h('v-divider')
                            ]
                            : null,
                        (this.hasKinds)
                            ? [h('v-subheader', 'по категории'),
                               h('v-treeview', {
                                    props: {
                                        activatable: true,
                                        transition: true,
                                        "open-on-click": true,
                                        items: this.kinds,
                                        "item-children": "childs",
                                        "item-key": "id",
                                        "return-object": true,
                                        "load-children": this.getcats,
                                        "expand-icon": "fas fa-chevron-down",
                                        "item-text": "kindname",
                                        "selection-type": "independent",
                                        "value": [this.activeKind]
                                    },
                                    on: {'update:active':(actives)=>{
                                            if (actives.length>0){
                                                this.oncat(actives[0]);
                                            }
                                        }
                                    },
                                    scopedSlots: {
                                        prepend: (props)=>{
                                            if (!!props.item.kindimage){
                                                return h('v-img',{
                                                    props: {
                                                        height:'32px',
                                                        width: '32px',
                                                        src: url + '/static/model/view/' + props.item.kindimage
                                                    }
                                                });
                                            }
                                        }
                                    }
                            })]
                            : null
                    ])
                ])
            ]));
        } else {
            if (this.mode !== FIND_MODE.loading) {
                childs.push(h('v-alert', {
                    props: {border:'top', type: 'warning',  "colored-border": true, elevation: 2}, 
                    style:{"margin": "96px auto 0 auto", width: "95%"}
                }, [
                    'Магазин пока не предоставил номенклатуру своих товаров, попробуйте зайти позже.'
                ]));
            }
        }
        
        return h('v-sheet', {key:'search-' + this.tenant}, childs);
    }
}
</script>
<style lang="scss">
    .v-icon.v-icon.v-treeview-node__toggle{
        font-size: 12px !important;
        width: 24px;
        height: 24px;
        text-align: center;
        &::before{
            margin-top: 4px; 
        }
    }
    .v-treeview-node__label{
        font-size: 1.125rem;
    }
    .v-toolbar{
        & #sk-find-totals {
            margin-right: 1rem;
            & .v-badge__wrapper{
                top: 4px !important;
            }
            & .v-badge__badge{
                border: 1px solid #fff;
                border-color: #fff !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.22);
            }
        }
    }
</style>

<style lang="scss" scoped>
    @import "~/assets/index";
    
    .v-toolbar{
        width: 100%;
    }
    
    .sk-find-bottom{
        background: #fff;
    }
    
    .sk-find-params{
        & .v-card__title{
            font-weight: 400;
            font-size: 1rem;
            color: #fff;
        }
        & .sk-find-text{
            display: flex;
            align-items: center;
            justify-content: space-between;
            & button[type="submit"]{
                margin-top: -8px;
            }
        }
        & .v-subheader{
            padding: 16px 0 4px 0;
            font-style: italic;
        }
        & .v-chip-group {
            & .v-chip--active{
                color: #fff;
            }
        }
        
        & .v-treeview-node__toggle{
            &.fas{
                font-size: 0.8rem !important;
            }
        }
        & .v-treeview{
            margin: 0 -24px;
            & .v-treeview-node__prepend{
                & .v-image.v-responsive{
                    box-shadow: 0 2px 4px rgba(0,0,0,0.28);
                    border-radius: 500px;
                }
            }
        }   /*.v-treeview*/
    }       /*.sk-find-params*/
    .sk-find-info{
        padding-top: 96px;
        h2 {
            font-weight: 300;
            margin: 2rem 0 0 0;
        }
        & .v-card__title{
            flex-direction: column;
            align-content: flex-start;
            text-align: left;
            align-items: flex-start;
            font-weight: 400;
            font-size: 0.9rem;
        }
        & .v-card__text{
            display: flex;
            flex-direction: column;
            & .v-btn{
                margin-top: 1rem;
                width: 14rem;
                align-self: center;
                & svg{
                    margin-right: 1rem;
                }
            }
        }
    }
    
    .sk-find-prods{
        padding-bottom: 2rem;
        height: 100vh;
        overflow: auto;
        padding-top: 64px;
        & .v-list-item {
            border-bottom: 1px solid #ccc;
            line-height: 1.115;
            font-size: 1rem;
            & .v-list-item__icon{
                align-self: center !important;
                &.sk-prod-image{
                    width:64px;
                    height: auto;
                    max-height: 64px;
                    margin: 0.5rem 1rem 0.5rem 0 !important;
                }
            }
            & .sk-price{
                font-size: 1.25rem;
                color: $red-color;
                & .sk-unit{
                    color: $gray-color;
                    font-size: 0.85rem;
                }
            }
        }
    }
</style>

