<script>
import { MODES } from "~/utils/index.js";    
import SkSvg from '~/components/SkSvg';
import { ellipsis } from 'ellipsed';
import { 
         VContainer,
         VRow,
         VCol,
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
         VCard,
         VCardText,
         VCardTitle,
         VSpacer,
         VSkeletonLoader,
         VDivider,
         VSheet,
         VBottomSheet,
         VRating,
         VBadge,
         VTextarea,
         VTextField
    } from 'vuetify/lib';
    
import { 
         Scroll,
} from 'vuetify/lib/directives';

const MN_MODE = Object.assign(MODES, {
    'ready': 16,
    'order': 32,
    'added': 64,
    'success': 128
});

const TB_EX_HEIGHT = 180;

export default {
    head(){
        return {
            title: (!!this.prod) ? this.prod.promogoods : 'loading...',
            meta: [
                    {hid: 'description', name: 'description', content: this._getdescr() }
            ]
        };
    },
    async asyncData(context){
        const { id } = context.params,
              { store } = context;
        try {
            var p = await store.dispatch("active/getProd", {id: id});
            return {prod: p, error: null, mode: MN_MODE.default};
        } catch(e){
            console.log('PROD ERROR:', e);
            return {prod: null, error: e, mode: MN_MODE.error};
        }
        
    },
    data(){
        return {
            sheet: false,
            n: 1,
            note: null,
            today: true,
            adding: false,
            self: false,
            image: {
                src: undefined,
                height: TB_EX_HEIGHT,
                fab: false,
                h: false
            }
        };
    },
    directives: { Scroll },       
    computed: {
        store(){
            return this.$store.state.active.store;
        },
        total(){
            var p = parseFloat(this.prod.newprice);
            return this.n * p;
        }
    },
    fetch(){
        console.log('PROD (fetch): ', this.prod);
        if (!(!!this.prod)) {
            return;
        }
        const id = this.$route.params.id;
        try {
            if (!!this.prod.promoimage){
                const url = this.$http.env.rpcUrl;
                fetch(url + '/static/model/view/' + this.prod.promoimage.id)
                    .then((response) => response.blob())
                    .then((data) => {
                    var blob = new Blob([data]);
                    this.image.src = URL.createObjectURL(blob);
                }).catch(function(err){
                    console.log('Image fail:', err);
                });
            }
            
            this.image.height = TB_EX_HEIGHT;
            this.image.fab = false;
            this._set_fab(false);
            setTimeout(()=>{
                this.activate();
                this.see();
            }, 100);
            this.mode = MN_MODE.default;
        }catch(e){
            console.log('On prod err:', e);
            this.mode = MN_MODE.error;
            if ((!!e.data)&&(/^(access)+/i.test(e.data))){
                this.$router.replace({name:"index"});
            }
        }
    },
    components: {
         VContainer,
         VRow,
         VCol,
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
         VCard,
         VCardText,
         VCardTitle,
         VSpacer,
         VSheet,
         VSkeletonLoader,
         VDivider,
         VBottomSheet,
         VRating,
         VBadge,
         VTextarea,
         VTextField,
         SkSvg
    },
    methods: {
        _getdescr(){
            var a = ['on-line price'];
            if (!!this.store){
                a.push(this.store.title);
                if (!!this.store.location){
                    a.push($utils.formatAddress(this.store.location, true));
                }
                if (!!this.prod){
                    a.push(this.prod.promogoods);
                }
            }                 
            return a.join(",");
        },  //_getdescr
        activate(){
            this.$nextTick(()=>{
                var i = $(this.$el).find('.sk-choice input');
                i.css({'text-align': 'center', 'max-height': '3rem'});
                const descr = $(this.$el).find('.sk-descr');
                descr.click(()=>{
                    if ('ellipsis'===descr.attr('data-trunc')){
                        descr.attr('data-trunc', 'none');
                        descr.html(this.prod.promodesc);
                    } else {
                        ellipsis('.sk-descr', 3);
                        descr.attr('data-trunc', 'ellipsis');
                    }
                });
                descr.trigger('click');
                $([document.documentElement, document.body]).animate({scrollTop: 0}, 100);
            });
        },
        see(){
            const opts = {
                type: 'core-create',
                query: 'sin2:/v:1cb7dc21-2866-4e29-905c-e183236ffa7a',
                params: [
                    {id: 'tenantid', type:'id', value: this.prod.tenantid},
                    {id: 'userid', type:'id', value: this.prod.userid},
                    {id: 'deviceip', type:'string', value: ''},
                    {id: 'devicemodel', type:'string', value: ''},
                    {id: 'deviceplatform', type:'string', value: ''},
                    {id: 'deviceuuid', type:'string', value: ''},
                    {id: 'deviceversion', type:'string', value: ''},
                    {id: 'productid', type:'id', value: this.prod.id},
                    {id: 'regdt', type:'datetime', value: new Date()}
                ]
            };
            this.$http.post(opts);
        },
        doRait(r){
            const opts = {
                type: 'core-create',
                query: 'sin2:/v:e4737054-e251-44ff-8fc7-9eba56dd1faf',
                params: [
                    {id: 'tenantid', type:'id', value: this.prod.tenantid},
                    {id: 'userid', type:'id', value: this.prod.userid},
                    {id: 'productid', type:'id', value: this.prod.id},
                    {id: 'rating', type:'integer', value: r},
                    {id: 'regdt', type:'datetime', value: new Date()}
                ]
            };
            this.$http.post(opts).always(()=>{
                this.prod.rating = r;
                this.sheet = false;
            });
        },   //doRait
        pm(add){
            var n = this.n + ((add) ? 1 : -1);
            if (n < 1){
                n = 1;
            }
            this.n = n;
            if (this.$store.getters["basket/has"](this.prod.id)){
                this._to_basket();
            }
        },
        in_cart(){
            if (!!this.prod){
                return this.$store.getters["basket/has"](this.prod.id);
            } else {
                return false;
            }
        },
        _to_basket(){
            const tenantId = (!!this.fill) 
                                ? this.fill.id
                                : $utils.isEmpty(this.prod.orgid) 
                                    ? this.prod.tenantid 
                                    : this.prod.orgid;
            var p = Object.assign({}, this.prod);
            
            p.store = {id: tenantId};
            p.num   = this.n;
            p.total = this.total;
            p.at    = this.at;
            p.note  = this.note;
            this.$store.dispatch('basket/add', p);
        },
        to_basket(){
            if ( this.in_cart() ){
                this.$router.replace({path: "/stores/" + this.store.id + "/basket"});
                return false;
            }
            this._to_basket();
            this.mode = MN_MODE.added;
            this.adding = true;
            setTimeout(()=>{this.adding = false;}, 600);
        },
        from_basket(){
            this.$store.dispatch('basket/rm', {id: this.prod.id});
            this.n = 1;
            this.mode = MN_MODE.order;
            this.$forceUpdate();
        },
        _adjustH(){
            var h = 160,
                h2= (!!this.image.domHeight) ? this.image.domHeight - 160: 0;
            if ( h2 > 0 ) {
                h += h2;
            }
            $(this.$el).find(".container").css({"padding-bottom": h+"px"});
        },
        _set_fab(show){
            const self = this;
            if (show){
                $(this.$el).find(".v-image .v-image__image").fadeOut();
                $(this.$el).find(".sk-btn-thumb").fadeIn({
                    always: function(){self.image.fab = true;}
                });
            } else {
                    $(this.$el).find(".v-image .v-image__image").fadeIn();
                    $(this.$el).find(".sk-btn-thumb").fadeOut({
                        always: function(){
                            self.image.fab = false;
                        }
                    });
            }
        },
        _scrolling(e){
            if (!!this.image.h){
                clearTimeout(this.image.h);
                this.image.h = false;
            }
            
            this.image.h = setTimeout(()=>{
                this.image.h = false;
                var height = window.scrollY;
                if (typeof height === "undefined"){
                    return;
                }
                if (height > 64){
                    if (!this.image.fab){
                        this._set_fab(true);
                    }
                } else {
                    if (this.image.fab){
                        this._set_fab(false);
                    }
                }
            }, 50);
        }
    },
    render(h){
        const prod  = this.prod,
              store = this.store,  
              accent = 'red darken-4',
              gray   = 'grey darken-1';
      
              
        if (!((!!prod)&&(!!store))){
            return h('v-skeleton-loader', {props: {type: "card"}});
        }
        
        const isService = !(!!prod.isproduct),
              inCart = this.in_cart(),
              hasDeliv = this.store.hasdelivery,
              color = this.store.brandcolor || accent;
      
        var meta = [];
        if (!!prod.timecook){
            meta.push(h('div', {class:"sk-time"}, [
                            h('sk-svg', {props: {xref:"#ico-clock"}}),
                            prod.timecook
            ]));
        }
        if ((!!prod.calories) || (!!prod.pfc)){
            meta.push(h('div', {class:"sk-calls"}, [
                            h('sk-svg', {props:{xref:"#ico-drumstick"}}),
                            ((!!prod.calories) ? prod.calories : '' ) + ((!!prod.pfc) ? ' (' + prod.pfc + ')' : '')
            ]));
        }
        if (!!prod.amount){
            meta.push(h('div', {class:"sk-ammount"}, [
                            h('sk-svg', {props:{xref:"#ico-balance-scale"}}),
                            prod.amount
            ]));
        }
        if (!!prod.promodesc){
            meta.push(h('div', {class: "sk-desc"}, prod.promodesc));
        }
        
        return h('v-container', {
                props: {fluid: true}, 
                class: {"sk-prod-conte": true},
                directives: [{
                                name: "scroll",
                                rawName: "v-scroll",
                                value: (e)=>{
                                    this._scrolling(e);
                                }
                }]
            }, [
            h('v-row', [h('v-col', {props: {cols: 12}}, [
                h('v-card', {
                    key: 'prod-' + prod.id,
                    attrs: {id: "sk-prod"},
                    class: {'sk-prod': true, 'sk-in-cart': inCart},
                    props: {flat: true, shaped: true}
                }, [
                    h('v-img', {
                            props: {
                                    src: this.image.src,
                                    eager: true,
                                    contain: true,
                                    "max-height": 280,
                                    "min-height": 72
                            },
                            ref: "prod-image",
                            on: {
                                load: ()=>{
                                    const img = $(this.$refs["prod-image"].$el);
                                    img.animate({opacity: 1});
                                    this.image.domHeight = img.height();
                                    this._adjustH();
                                }
                            }
                    }),
                    h('v-card-text', [
                        h('v-btn', {
                            props: {
                                        fab: true,
                                        "x-large": true, 
                                        right: true,
                                        top: true
                                    }, 
                            class: {"sk-btn-thumb": true},
                            style: {
                                "background": 'transparent url("' + this.image.src + '") center center scroll no-repeat',
                                "display": this.image.fab ? "" : "none"
                            },
                            on: {
                                click: ()=>{
                                    this._set_fab(false);
                                    window.scrollTo(0,0);
                                }
                            }
                        }),
                        h('h3',  {class: "sk-name"}, prod.promogoods),
                        h('div', {class: "sk-prod-meta"}, meta),
                        h('div', {class: "sk-price"}, [
                            h('div', [
                                        prod.newprice + ' руб.', 
                                        $utils.isEmpty(prod.unitname) ? null : ' / ' + prod.unitname
                            ]),
                            h('div', {style: {color: color}}, this.total + ' руб.')
                        ]),
                        h('div', {class: "sk-raiting"}, [
                            h('v-btn', {
                                props: {text: true},
                                on: {click: ()=>{this.sheet = (new Date()).getTime();}}
                            }, [
                                h('sk-svg', {props: {xref:"#ico-star"}}),
                                (!!prod.rating) ? prod.rating : 'оценить'
                            ])
                        ]),
                        isService 
                            ? null
                            : h('div', {class: "sk-quantity"}, [
                                'количество',
                                h('div', [
                                    h('v-btn',  {props: {text: true}, on: {click: ()=>{this.pm(false);}}}, '-'),
                                    h('v-text-field', {props: {
                                        value: this.n,
                                        color: color,
                                        "hide-details": true,
                                        "single-line": true
                                    }, on: {
                                        input: (e)=>{
                                            var n = Number(e);
                                            this.n = (!!n) ? n : 1;
                                        }
                                    }}),
                                    h('v-btn',  {props: {text: true}, on: {click: ()=>{this.pm(true);}}}, '+')
                                ])
                            ]),
                            h('v-textarea', {props: {
                                "value": this.note,
                                "full-width": true,
                                "rows": 1,
                                "auto-grow": true,
                                "dense": true,
                                "messages": 'комментарий к заказу',
                                "color": color
                                }, class:{"sk-comments": true},
                                on: {input: (e)=>{this.note = e;}
                            }})
                    ]),
                    h('v-card-actions', {class: {"v-card__actions": true}}, [
                        h('v-btn',  {props: {
                                            color: color,
                                            dark: true,
                                            loading: this.adding,
                                            large: true,
                                            disabled: (this.self && this.mustPoint)
                                        },
                                    on: {click: this.to_basket},
                                    class: {'sk-to-cart': true, 'flex-grow-1': true}
                            }, [
                                inCart
                                    ? h('div', {class:{'sk-in-cart': true}, style:{'background-color': accent}}, [
                                        h('sk-svg', {props: {xref: "#ico-check"}}),
                                        'в корзине'
                                    ])
                                    : 'заказать'
                            ]),
                        h('v-btn', {
                                    props: {dark:true, color: color, width:'3rem', large: true}, 
                                    on:    {click: this.from_basket},
                                    style: {display: inCart ? '' : 'none'}
                                }, [
                                    h('sk-svg', {props:{xref: "#ico-close"}})
                                ])
                    ])
                ])  /*v-card*/
            ])      /*v-col*/
        ]),         /*v-row*/
        h('v-bottom-sheet', {props: {value: this.sheet}}, [
            h('v-sheet', {
                class: {"text-center": true, "sk-rating-sheet": true}
            }, [
                h('h3', 'Нам очень важна Ваша оценка!'),
                h('v-rating', {
                    props: {color: 'orange',"background-color": 'orange'},
                    on: {input: this.doRait}
                })
            ])
        ]) /*v-bottom-sheet*/
        
        ]);
    }
}
</script>

<style lang="scss">
    @import "~/assets/index.scss";
    
    .sk-prod-conte{
        margin-top: 1rem;
        padding-bottom: 160px;
    }
    .sk-prod {
        & .v-image{
            opacity: 0;
            border-top-left-radius: 22px !important;
            border-top-right-radius: 22px !important;
        }
        & .sk-btn-back{
            background: rgba(0,0,0, 0.18);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 2px 4px rgba(0,0,0, 0.33);
            position: fixed;
            left: 0.5rem;
            top: 0.5rem;
            z-index: 3;
        }
        & .v-toolbar{
            background: transparent !important;
            position: fixed;
            z-index: 3;
        }
        & .v-card__text{
            color: #3a3a3a;
            background: $light-color;
            border-radius: 22px 22px 0 0;
            border-top: 1px solid #fff;
            padding-top: 1rem;
            margin-top: -16px;
            position: relative;
            display: block;
            
            & .sk-btn-thumb{
                background-size: cover !important;
                border: 2px solid #fff;
                top: -34px;
                right: 1rem;
                position: absolute;
            }
            
            & .sk-raiting{
                & .v-btn{
                    margin-left: -0.75rem;
                    font-size: 0.9rem;
                    & svg{
                        margin-right: 0.5rem;
                        color: #ccc;
                    }
                }
            }
            & .sk-name{
                font-size: 1.5rem;
                font-weight: 400;
                line-height: 1.125;
                color: #3a3a3a;
                word-break: normal;
                margin: 0.5rem 0;
                padding: 0 72px 0 0;
            }
            & .sk-price{
                margin: 0.5rem 0;
                display: flex;
                justify-content: space-between;
                & > :first-child{
                    font-size: 1rem;
                }
                & > :last-child{
                    font-size: 2rem;
                }
            }
            & .sk-prod-meta{
                display: flex;
                & svg{
                    color: #ababab;
                    width: 16px;
                    height: 16px;
                    margin-right: 0.5rem;
                }
            }
            & .sk-quantity{
                $border: 1px solid #ddd;
                margin: 1rem 0 2rem 0;
                background: #fff;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border: $border;
                padding: 0 0 0 0.5rem;
                font-size: 1rem;
                & .v-btn--fab{
                    position: absolute;
                    right: 1rem;
                    left: auto;
                }
                & > div {
                    display: flex;
                    align-self: flex-end;
                    align-items: center;
                    & .v-text-field{
                        padding-top: 0;
                        margin-top: 0;
                        & .v-input__control > .v-input__slot:before {
                            display: none;
                        }
                    }
                    & .v-input{
                        max-width: 72px;
                        width: 64px;
                        & input{
                            text-align: center;
                            font-size: 1.5rem;
                            color: inherit;
                        }
                    }
                    & .v-btn{
                        border-radius: 0;
                        border: 0 none;
                        font-size: 1.5rem;
                        width: 48px;
                        min-width: 48px;
                        height: 48px;
                        padding: 0;
                        &:first-child{
                            border-right: $border;
                            border-left: $border;
                        }
                        &:last-child{
                            border-left: $border;
                        }
                    }
                }
            }
        }   /* v-card__text */
        & .v-card__actions, & .v-card-actions{
            background: $light-color;
            border-radius: 0 0 22px 22px !important;
            padding: 1rem 0 0 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.18);
            justify-content: center;
            align-items: center;
            flex-direction: row;
            & .v-btn{
                border-radius: 0 0 22px 22px;
                & svg{
                    margin-right: 1rem;
                }
            }
        }   /*v-card__actions*/
        &.sk-in-cart{
            & .v-card__actions{
                & .v-btn:first-child {
                    border-radius: 0 0 0 22px;
                }
                & .v-btn:last-child {
                    border-radius: 0 0 22px 0;
                    border-left: 0 none;
                    margin-left: -2px;
                }
            }
        }
    }   /* sk-prod */
    
    .sk-rating-sheet{
        height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        & h3{
            font-weight: 400;
            margin-bottom: 1.5rem;
        }
    }
    @media (min-width: 960px){
        .sk-prod {
            max-width: 900px;
            margin-left: auto;
            margin-right: auto;
        }    
    }
</style>
