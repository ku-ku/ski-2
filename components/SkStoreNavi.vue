<script>
import { MODES, ST_MODES } from "~/utils/index.js";

import { VBtn,
         VBadge
    } from 'vuetify/lib';

import SkSvg from "~/components/SkSvg";



const SkStoreNavi = {
    name: 'SkStoreNavi',
    props: {
        store: {type: Object, required: true},
        has:   {type: Object, required: true},
        value: {type: Number, required: false, default: ST_MODES.none}
    },
    components: { 
        VBtn,
        VBadge,
        SkSvg 
    },
    data(){
        return {
            mode: ST_MODES.none
        };
    },
    mounted(){
        this.mode = this.value;
    },
    methods: {
        setMode(mode){
            const old = this.mode,
                  main = /^stores-id$/.test(this.$route.name);
            console.log('NAV (mode):', old + ' -> ' + mode, main);
            if (mode === old){
                mode = ST_MODES.def;
            }
            
            switch (mode){
                case ST_MODES.qr:
                case ST_MODES.def:
                    if (main){
                        this.mode = mode;
                        this.$emit("state", mode);
                    } else {
                        this.$router.replace({path: "/stores/" + this.store.id});
                    }
                    break;
                case ST_MODES.fils:
                    this.$router.push({path: "/stores/" + this.store.id + "/filials"});
                    break;
                case ST_MODES.find:
                    this.$router.push({path: "/stores/" + this.store.id + "/catalog/"});
                    break;
                case ST_MODES.info:
                    this.$router.push({path: "/stores/" + this.store.id + "/info"});
                    break;
                case ST_MODES.share:
                    this.$router.push({path: "/stores/" + this.store.id + "/share"});
                    break;
            }
        }
    },
    render(h){
        const bg = this.store.brandcolor;
        return h('div', {class: {
                "sk-store-nav": true,
                "sk-has-qr":    (this.mode === ST_MODES.qr),
                "sk-has-info":  (this.mode === ST_MODES.info),
                "sk-has-fils":  (this.mode === ST_MODES.fils),
                "sk-has-find":  (this.mode === ST_MODES.find),
                "sk-has-share": (this.mode === ST_MODES.share),
                "sk-has-chat":  (this.mode === ST_MODES.chat),
                "sk-has-card":  (this.has.card),
                "sk-no-card":   (!this.has.card)
            }}, [
                    h('v-badge', {
                        props: {
                            overlap: true, 
                            color: $utils.isEmpty(this.store.pointscount) ? 'transparent' : bg||'default', 
                            content: this.store.pointscount
                        }
                    }, [
                        h('v-btn', {
                            props: {outlined: true},
                            on: {click: ()=>{ this.setMode(ST_MODES.fils); }}
                        }, [
                            h('sk-svg', {props: {xref: "#ico-store"}})
                        ])
                    ]),
                    h('v-btn', { 
                            props: {outlined: true},
                            on: {click: ()=>{ this.setMode(ST_MODES.find); }}
                        }, [
                            h('sk-svg',{props:{xref:"#ico-search"}})
                    ]),
                    h('v-btn', {
                        props: {outlined: true}, 
                        on: {click: ()=>{ this.setMode(ST_MODES.qr); }}
                    }, [
                            h('sk-svg', {props: {xref: "#ico-qrcode"}}),
                            this.has.card ? h('div', {class:"sk-has-card"}) : null

                    ]),
                    h('v-btn', {
                            props: {outlined: true}, 
                            on: {click: ()=>{ this.setMode(ST_MODES.share); }}
                        }, [h('sk-svg', {props: {xref:"#ico-share"}})]
                    ),
                    h('v-btn', {
                        props: {outlined: true}, 
                        on: {click: ()=>{ this.setMode(ST_MODES.info); }}
                        }, [h('sk-svg', {props: {xref: "#ico-info"}})]
                    )
                ]);
    }
};  //SkStoreNavi

export default SkStoreNavi;
</script>    

<style lang="scss" scoped>
    @import "~/assets/index.scss";
    .sk-store-nav{
        display: flex;
        justify-content: space-around!important;
        align-items: center!important;
        flex-wrap: nowrap;
        width:100%;
        background: transparent;
        & .v-btn:not(.v-btn--round).v-size--default{
            padding: 0;
            width: 38px;
            min-width: 38px;
            height: 38px;
            border-color: darken($gray-color, 10%);
            background-color: #fff;
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.5) !important;
            transition: all 0.33s ease;
            & svg {
                transition: all 0.33s ease;
                width: 22px;
                height: 22px;
                color: $gray-color;
            }
            & .sk-has-card{
                position: absolute;
                width: 8px;
                height: 8px;
                background-color: #11b719;
                border-radius: 50%;
                border: 1px solid #fff;
                top: -10px;
                right: -2px;
            }
        }
        &.sk-has-qr{
            & .v-btn:not(.v-btn--round).v-size--default{
                &:nth-child(2), &:nth-child(4){
                    width: 46px;
                    min-width: 46px;
                    height: 46px;
                }
                &:nth-child(3){
                    width: 56px;
                    min-width: 56px;
                    height: 56px;
                    & svg {
                        width: 32px;
                        height: 32px;
                    }
                }
            }
        }   /*.sk-has-qr*/
        &.sk-has-info{
            & .v-btn:not(.v-btn--round).v-size--default{
                &:nth-child(4){
                    width: 46px;
                    min-width: 46px;
                    height: 46px;
                }
                &:nth-child(5){
                    width: 56px;
                    min-width: 56px;
                    height: 56px;
                    & svg {
                        width: 32px;
                        height: 32px;
                    }
                }
            }
        }   /*.sk-has-info*/
        &.sk-has-fils{
            & .v-btn:not(.v-btn--round).v-size--default{
                width: 38px;
                min-width: 38px;
                height: 38px;
                & svg{
                    width: 22px;
                    height: 22px;
                }
                &:nth-child(1){
                    width: 56px;
                    min-width: 56px;
                    height: 56px;
                    & svg {
                        width: 32px;
                        height: 32px;
                    }
                }
                &:nth-child(2){
                    width: 46px;
                    min-width: 46px;
                    height: 46px;
                }
            }
        }   /*.sk-has-fils*/
        &.sk-has-find{
            & .v-btn:not(.v-btn--round).v-size--default{
                &:nth-child(1), &:nth-child(3), &:nth-child(4), &:nth-child(5){
                    width: 46px;
                    min-width: 46px;
                    height: 46px;
                }
                &:nth-child(2){
                    width: 56px;
                    min-width: 56px;
                    height: 56px;
                    & svg {
                        width: 32px;
                        height: 32px;
                    }
                }
            }
        }   /*.sk-has-find*/
        &.sk-has-share{
            & .v-btn:not(.v-btn--round).v-size--default{
                &:nth-child(1), &:nth-child(2), &:nth-child(3), &:nth-child(5){
                    width: 46px;
                    min-width: 46px;
                    height: 46px;
                }
                &:nth-child(4){
                    width: 56px;
                    min-width: 56px;
                    height: 56px;
                    & svg {
                        width: 32px;
                        height: 32px;
                    }
                }
            }
        }   /*.sk-has-share*/
    }       /* .sk-store-nav */
    
</style>    