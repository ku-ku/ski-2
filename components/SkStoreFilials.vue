<script>
import { MODES } from "~/utils/index.js";
import SkSvg from "~/components/SkSvg";
    
import { VBtn,
         VRow,
         VCol,
         VList, 
         VSubheader,
         VListItem,
         VListItemGroup,
         VListItemIcon,
         VListItemContent,
         VListItemTitle,
         VListItemSubtitle,
         VListItemAction,
         VSkeletonLoader
       } from 'vuetify/lib';
    
export default {
    name: 'SkStoreFilials',
    props: {
        parent: {
            type: Object, /*store*/
            required: true
        }
    },
    components: {
        VBtn,
        VRow,
        VCol,
        VList, 
        VSubheader,
        VListItem,
        VListItemGroup,
        VListItemIcon,
        VListItemContent,
        VListItemTitle,
        VListItemSubtitle,
        VListItemAction,
        VSkeletonLoader,
        SkSvg
    },
    data(){
        return {
            mode: MODES.none,
            error:   null,
            fills:   null
        };
    },
    async fetch(){
        this.mode = MODES.loading;
        try {
            var fills = await this.$store.dispatch("active/getFills");
            console.log('FILLS: at #', this.parent.id, fills);
            if (fills.length < 1){
                fills = [this.parent];
            }
            this.fills = fills;
            this.mode = MODES.default;
        } catch(e) {
            console.log('FILLS error:', e);
            this.mode = MODES.error;
            this.error = e;
        }
    },
    computed:{
        hasFils(){
            return ((!!this.fills) && (!!this.fills.length>0));
        },
        coords(){
            return this.$store.state.geo.ll;
        }
    },
    methods: {
        isOpen(st, end){
            if ('00:00'===st){
                return true;
            }
            if ($utils.isEmpty(st)||$utils.isEmpty(end)){
                return true;
            }
            const now = new Date();
            var tt = [0, 0];
            if (st.indexOf){
                tt = (st.indexOf(":")<0) ? [0, 0] : st.split(":");
            }
            var dt1 = new Date(
                    now.getFullYear(), now.getMonth(), now.getDate(), tt[0], tt[1], 0
            );
            if (end.indexOf){
                tt = (end.indexOf(":")<0) ? [23, 59] : end.split(":");
            } else {
                tt = [23, 59];
            }
            var dt2 = new Date(
                now.getFullYear(), now.getMonth(), now.getDate() + (tt[0] < 8 ? 1 : 0), tt[0], tt[1], 0
            );
            return now.getTime() >= dt1.getTime() && now.getTime() <= dt2.getTime();
        }
    },
    render: function(h){
        var childs = [];
        if (this.loading){
            childs.push(h('v-list-item', {key:'sk-fils-loading'}, [
                [1,2,3].map((i)=>{
                        return h('v-skeleton-loader', { key: 'sk-loader-' + i,
                                      props: {type:'article', tile: true, boilerplate: false},
                                      class: {'mb-5': true}
                               });
                })
            ]));
        } else if (!!this.error) {
            console.log(this.error);  //TODO: err
        } else if (!this.hasFils){
            childs.push( 
                h('v-list-item', {props:{key:'sk-fils-nodata'},class:{'d-none':true}})  //stub
            );
        } else {
            const now = new Date(); 
            this.fills.map( (fil)=>{
                var a    = fil.location,
                    title= $utils.isEmpty(fil.fullname) ? fil.title : fil.fullname,
                    t    = fil.phone,
                    st   = fil.starttime,
                    end  = fil.endtime,
                    bc   = this.parent.brandcolor,
                    dist = fil.distance,
                    isOpen = true, 
                    tm = false;
                if (!$utils.isEmpty(st)){
                    if ('00:00'===st){
                        tm = 'круглосуточно';
                        isOpen = true;
                    } else {
                        tm = st;
                        if (!$utils.isEmpty(end)){
                            tm += '-' + end;
                            isOpen = this.isOpen(st, end);
                        }
                    }
                }    
                childs.push( h('v-list-item', {props: {
                        key:'sk-fil-' + fil.id
                    },
                    style:{'border-color': $utils.isEmpty(bc) ? '' : bc}
                }, [
                    h('v-list-item-content', [
                        $utils.isEmpty(title) 
                            ? null
                            : h('div', {
                                            class: {'sk-title':true},
                                            style: {'border-color': $utils.isEmpty(bc) ? '' : bc}
                                }, [
                                    title,
                                    $utils.isEmpty(dist) || (dist < 0)
                                        ? null
                                        : h('span', {class:{'sk-dist': true}}, (dist < 1000) ? Math.round(dist) + 'м.' : Math.round(dist/1000) + 'км.')
                                ]),
                        h('v-row', [
                            h('v-col', {props:{cols:6}}, 
                                (!!a) //TODO: 
                                    ? [
                                        h('div', {class:{'sk-city':true}}, (!!a.city)  ? a.city.name : ''),
                                        h('div', {class:{'sk-addr':true}}, ((!!a.street) ? 'ул.' + a.street.name : '') 
                                                                            + ((!!a.number) ? ', ' + a.number : ''))
                                    ] 
                                    : null),
                            h('v-col', {props:{cols:6}}, [
                                h('div', {class:{'sk-state': true, 'sk-open': isOpen}}, [
                                    h('i'),
                                    isOpen ? 'открыто' : 'закрыто',
                                    (tm) 
                                        ? h('div', {class:{'sk-time':true}}, tm) 
                                        : null
                                ])
                            ])
                        ]),
                        h('v-row', {
                            props: {align: "center", "align-content": "space-between"}
                        }, [
                            h('v-col', [
                                $utils.isEmpty(t) 
                                    ? null
                                    : h('a', {
                                                attrs: {href:'tel:' + t, target:'_blank'},
                                                class: {'sk-tel': true},
                                                style: {'color': $utils.isEmpty(bc) ? '' : bc}
                                            }, t)
                            ]),
                            h('v-col', {props: {cols: "auto"}}, [
                                h('v-btn', {
                                                props: {
                                                    icon: true,
                                                    to: {path: '/stores/' + this.parent.id + '/chat'}   //TODO: by fill
                                                }, 
                                                class: {'sk-msg': true}
                                            }, [
                                    h('sk-svg', {props: {xref:"#ico-chat"}})
                                ])
                            ])
                        ])
                    ])
                ]));
            });
        }
        return h('v-list', {
            class: {'sk-filials': true}
        }, childs);
    }
};
</script>
<style lang="scss" scoped>
    @import "~/assets/index";
    
    $is-open: #00796B;
    $no-open: #F44336;
    $blue-color: #01579B;
    .sk-filials{
        margin-top: 1rem;
        & .v-list-item{
            border: 1px solid lighten($gray-color, 20%);
            border-radius: 6px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.18);
            margin-bottom: 2rem;
            & .v-list-item__content{
                display: block;
            }
            & .sk-title{
                font-size: 0.7rem;
                position: absolute;
                color: $gray-color;
                width: auto;
                padding: 0.25rem 0.5rem;
                border: 1px solid #ccc;
                border-radius: 9px;
                background: #fff;
                top: -12px;
                & .sk-dist{
                    display: inline-block;
                    margin-left: 0.5rem;
                }
            }
            & .sk-city{
                font-size: 0.85rem;
                font-weight: 300;
            }
            & .sk-addr{
                font-size: 1rem;
                font-weight: 400;
            }
            & .sk-tel{
                font-size: 0.9rem;
                color: $blue-color;
                text-decoration: none;
                font-weight: bold;
                white-space: nowrap;
                & svg{
                    width: 14px;
                    height: 14px;
                    margin-right: 0.25rem;
                }
            }
            & .sk-msg {
                width: 36px;
                height: 36px;
                & svg{
                    width: 18px;
                    height: 18px;
                    color: $gray-color;
                }
            }
        
            & .sk-state{
                text-align: right;
                color: $no-open;
                & i{
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    background-color: $no-open;
                    border-radius: 50%;
                    margin: 0 0.25rem 0 0 ;
                }
                & .sk-time{color: #000;}
                &.sk-open{
                    color: $is-open;
                    & i{background-color: $is-open;}
                }
            }
        }
    }
</style>
