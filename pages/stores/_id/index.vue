<script>
import { MODES, ST_MODES } from "~/utils/index.js";
import { 
        VBtn,
        VImg,
        VCard,
        VCardText
} from 'vuetify/lib';


import geo   from "~/utils/geo.js";
import SkSvg from "~/components/SkSvg";
import SkStoreNavi from "~/components/SkStoreNavi";
import SkQr  from "~/components/SkQr";
import SkStoreShare from "~/components/SkStoreShare";
import SkStoreBanners from "~/components/SkStoreBanners";
import SkStoreActions from "~/components/SkStoreActions";
import SkBottom from '~/components/SkBottom';

import SkMap from '@/components/map';

import { 
         Scroll
} from 'vuetify/lib/directives';


export default {
    props: ['id'],
    head(){
        return {
            title: (!!this.store) ? this.store.title : 'loading...',
            meta: [
                    {hid: 'description', name: 'description', content: this._getdescr() }
            ]
        };
    },
    components: {
        VBtn,
        VImg,
        VCard,
        VCardText,
        SkStoreNavi,
        SkSvg,
        SkQr,
        SkStoreBanners,
        SkStoreActions,
        SkStoreShare,
        SkBottom,
        SkMap
    },
    directives: { Scroll },
    inject: ['defs'],
    data(){
        return {
            mode: MODES.none,
            state: ST_MODES.none,
            store: null,
            card: null,
            fill: null,
            sending: false,
            fab: false,
            map: false
        };
    },
    fetchOnServer: false,
    async fetch(){
        this.mode = MODES.loading;
        this.card = null;   //reset
        const id = this.$route.params.id;
        try {
            const store = await this.$store.dispatch("loadStore", {id: id});
            this.store = store;
            console.log('Active store', store);
            this.$store.commit("active/setStore", store);
            if (this.$store.getters["profile/is"]("user")){
                this.$store.dispatch("loadCard", {by: "tenant", id: store.tenantid}).then((card)=>{
                    this.card = card;
                    console.log('card', card, this.has);
                });
            }
            this.mode = MODES.default;
            this.state = ST_MODES.def;
            this.see();
        } catch(e) {
            console.log("ERR on store", e);
            this.mode = MODES.error;
        }
    },
    activated(){
        if (!this.has.store){
            (async ()=>{
                await this.$fetch();
            })();
        } 
        this.$store.commit("active/setStore", this.store);
    },
    computed: {
        has(){
            var _h = {
                store: (!!this.store),
                card:  (!!this.card),
                user:  this.$store.getters["profile/is"]("user")
            };
            
            _h.logo = (_h.store) ? (!!this.store.brandlogo) : false;
            _h.addr = (_h.store) ? (!!this.store.location) : false;
            _h.fills = (_h.store) ? (this.store.pointscount > 0) : false;
            
            return _h;
        },
        bonuces(){
            return (this.has.card) ? this.card.amount : null;
        }
    },
    methods:{
        _getdescr(){
            var a = [];
            if (this.has.store){
                a.push(this.store.title);
                if (this.has.addr){
                    a.push($utils.formatAddress(this.store.location, true));
                }
            }                 
            return a.join(",");
        },   //_getdescr
        see(){
            const hasDev = (typeof device !== "undefined");
            const opts = {
                type: 'core-create',
                query: 'sin2:/v:1cb7dc21-2866-4e29-905c-e183236ffa7a',
                params: [
                    {id: 'tenantid', type:'id', value: this.store.id},
                    {id: 'userid', type:'id', value: this.$store.state.profile.user.id},
                    {id: 'deviceip', type:'string', value: ''},
                    {id: 'devicemodel', type:'string', value: (hasDev) ? device.model : ''},
                    {id: 'deviceplatform', type:'string', value: (hasDev) ? device.platform : ''},
                    {id: 'deviceuuid', type:'string', value: (hasDev) ? device.uuid : ''},
                    {id: 'deviceversion', type:'string', value: (hasDev) ? device.version : ''},
                    {id: 'regdt', type:'datetime', value: new Date()}
                ]
            };
            this.$http.post(opts);
        },
        async onmap(){
            var points;
            this.map = (new Date()).getTime();
            try {
                if (this.has.fills){
                    points = await this.$store.dispatch("active/getFills");
                } else {
                    await this.$store.dispatch("active/getLatLon");
                    points = [this];
                }
                this.$nextTick(()=>{
                    this.$refs.storeMap.addPoints(points);
                });
            } catch(e){
                console.log('ERR on map', e);
            }
        },   /*onmap*/
        async takecard(){
            if (this.has.card) {
                ski.msg({text:'У Вас уже есть подписка на "' + this.store.title + '"', type:'info'});
                return;
            }
            if (this.$store.getters["profile/isAnonymous"]){
                ski.authOrReg();
                return;
            }
          
            this.sending = true;
            try{
                var card = await this.$store.dispatch("takeCard", {id: this.store.id});
                this.sending = false;
            } catch(e){
                console.log('ERR on call /share card:', e);
                if ((!!e.data)&&/already\sexist/gi.test(e.data)){
                    ski.msg({text:'У Вас уже есть подписка на "' + this.storeTitle + '"', type:'info'});
                } else {
                    ski.msg({text:'Ошибка регистрации, попробуйте получить позднее.', type:'warning'});
                }
                this.sending = false;
            }
        }   /*takecard*/
    },
    watch: {
        id(id){
            this.$fetch();
        }
    },
    beforeRouteLeave(to, from, next){
        console.log('beforeRouteLeave', to);
        var _next = true;
        if (!(/(\/stores\/)+([\w,-]{32,})+/.test(to.path))){
            if (this.$store.getters["basket/numof"] > 0){
                _next = false;
                (async ()=>{
                    _next = await ski.confirm({
                                        title: this.store.title, 
                                        msg: 'Ваша корзина не пуста, Вы действительно хотите выйти?<hr /><div class="text-muted">При выходе козина будет очищена:<br /><b>"ОК"</b> - подтвердить выход,<br /><b>"отмена"</b> - продолжить покупки</div>', 
                                        type: 'warning'
                            });
                    if (_next) {
                        this.$store.dispatch("basket/clear");
                        next();
                    }
                })();
            }
        }
        if (_next){
            next();
        } else {
            next(false);
        }
    },
    render(h){
        const url = this.$http.env.rpcUrl;
        const bg = this.has.store ? this.store.brandcolor || "orange" : "default";
        const bc = this.has.store ? this.store.balancecolor || "#ffb300" : "default";
        var conte = [];
        var noBigLogo = true;
        
        switch(this.mode){
            case MODES.loading:
                conte.push( h('v-skeleton-loader', { props: {type:'card'} }) );
                break;
            case MODES.error:
                //TODO:
                break;
            case MODES.default:
                var items = [];
                if (this.has.logo){
                    const src= url + '/static/model/view/' + this.store.brandlogo.id;
                    noBigLogo= !((this.state===ST_MODES.def)||(this.state===ST_MODES.qr));
                    conte.push( ((this.state===ST_MODES.def)||(this.state===ST_MODES.qr))
                                ? h('v-img', {
                                    props: {
                                                src: src, 
                                                width:'100%', height:'auto', 
                                                eager: true
                                           },
                                    class: {"sk-store-brand": true},
                                    ref: "store-img",
                                    on: {
                                            load: ()=>{$(this.$refs["store-img"].$el).animate({opacity: 1});}
                                        }
                                    }, [
                                        (!!this.bonuces) 
                                            ? h('div', {
                                                class: "sk-bonuces",
                                                style: {color: bc}
                                            }, "" + this.bonuces)
                                            : null
                                    ])
                                : h('div', {
                                    class: {"sk-store-brand": true, "sk-thumbinal": true},
                                    style: {backgroundImage: 'url("' + src + '")'}
                                })
                    );
                }
                items.push(h('div', {class: "sk-location"}, [
                        h('a', {
                                class: {'sk-addr': true}, style:{color: (!!bg) ? bg : '' },
                                on: {click: this.onmap}
                            }, [
                                h('sk-svg',{props: {xref:'#ico-map-marker', width: 16, height: 16}}),
                                (!!this.fill) 
                                    ? this.fill.address
                                    : (!!this.store.location) 
                                        ? geo.a2s(this.store.location) 
                                        : 'на карте'
                        ])
                    ])
                );
                switch( this.state ){
                    case ST_MODES.def:
                    case ST_MODES.qr:
                        if (this.state === ST_MODES.qr){
                            if (this.has.card){
                                items.push(h('sk-qr', {props: {cardId: this.card.id}}));
                            } else {
                                if (!$utils.isEmpty(this.store.loyalty)){
                                    items.push( h('h3', {class: {'sk-loyalty': true}, domProps: {innerHTML: this.store.loyalty}}) );
                                }
                                items.push( h('div', {class: {'sk-takes': true}}, [
                                        h('v-btn', {
                                                        class: {'sk-take': true},
                                                        props: {outlined: true, loading: this.sending},
                                                        on:    {click: this.takecard}
                                                    }, 'Стать клиентом')
                                ]));
                            }
                        }
                        items.push(h('sk-store-banners', {props: {store: this.store}}));
                        items.push(h('sk-store-actions', {props: {store: this.store}}));
                        
                        break;
                }
                
                conte.push(h('v-card-text', [
                    h(SkStoreNavi, {
                        props: {store: this.store, has: this.has, value: this.state},
                        on: {state: (s)=>{this.state = s;}},
                        style: {marginTop: noBigLogo ? 'initial' : '-36px'}
                    }),
                    items
                ]));
                
                
                break;
        }
        
        /* fab */
        conte.push( h('v-btn', {
                props: {fab: true, dark: true, fixed: true, bottom: true, right: true, color: bg, small: true, elevation: 5},
                on: {click: ()=>{ this.$vuetify.goTo(0); }},
                directives: [{
                        name: "scroll",  
                        rawName: "v-scroll",
                        value: (e)=>{
                            if (typeof window === 'undefined') return;
                            const top = window.pageYOffset ||   e.target.scrollTop || 0;
                            this.fab = top > 120;
                            this.defs({avaNeed: this.fab});
                        }
                }],
                style: {display: this.fab ? '' : 'none'}
            }, [
                h('sk-svg', {props:{xref:"#ico-up"}})
        ]));
        
        /* map */
        if (this.$store.getters["basket/numof"] < 1){
            conte.push(
                h('sk-bottom',  {
                        key: 'sk-bottom-map-' + this.id,
                        props: {show: this.map}}, [
                            !!this.map 
                                ? h('sk-map', {
                                    props: {
                                        center: this.store
                                    },
                                    ref: 'storeMap',
                                    on: {'click': (_fill)=>{
                                            if (typeof _fill === "string"){
                                                _fill = JSON.parse(_fill);
                                            }
                                            this.$store.commit('active/setStoreFill', _fill);
                                            this.fill = _fill;
                                            this.map = false;
                                        }}
                                })
                                : null
                ])
            );
        }
        
        return h('v-card', {
            key: 'store-' + ((!!this.store) ? this.store.id : 'unknown'),
            class: "sk-store",
            props: {flat: true, tile: true}
        }, conte );
    }
}    
</script>    
<style lang="scss">
    @import "~/assets/index.scss";
    
    .sk-store{
        & .sk-store-brand{
            min-height: 160px;
            opacity: 0;
            &.sk-thumbinal{
                opacity: 1;
                position: fixed;
                border: 2px solid #fff;
                border-radius: 500px;
                min-height: 50px;
                width: 50px;
                height: 50px;
                right: 4px;
                top: 2px;
                z-index: 9;
                box-shadow: 0 2px 6px rgba(0,0,0,0.22);
                border-top-left-radius: 500px !important;
                border-top-right-radius: 500px !important;
                background-position: center center;
                background-repeat: no-repeat;
                background-size: cover;
            }
        }
        & .sk-bonuces{
            position: absolute;
            top: 1rem;
            right: 1rem;
            font-size: 1.125rem;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            background-color: rgba(0,0,0,0.05);
        }
        & .sk-location{
            margin-top: 1rem;
            margin-bottom: 1rem;
            & a{
                text-decoration: none;
                display: block;
                color: $gray-color;
                text-align: right;
                & svg{
                    vertical-align: middle;
                    margin-right: 0.5rem;
                }
            }
            & a.sk-addr{
                white-space: normal;
                display: block;
                text-align: center;
                & svg{
                    margin-right: 0.5rem;
                }
            }
        }
        & .sk-loyalty{
            font-size: 0.85rem;
            color: $gray-color;
            text-align: center;
            line-height: 1.115;
            font-weight: 300;
        }
        & .sk-takes {
            margin-top: 3rem;
            display: flex;
            flex-direction: column;
            & .v-btn.v-size--default{
                border-radius: 500px;
                margin: 0 4rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.33) !important;
                border-color:  $gray-color;
                font-size: 1rem;
                &.sk-take{
                    background-color: $red-color;
                    border-color:  $red-color;
                    color: #fff;
                    margin-bottom: 2rem;
                }
            }
        }
        
    }   /* .sk-store */
    
</style>    