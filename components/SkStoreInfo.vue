<script>
import SkSvg from "~/components/SkSvg";
import { VBtn } from 'vuetify/lib';


export default {
    name: 'SkStoreInfo',
    components: { 
        VBtn,
        SkSvg 
    },
    props: {
        has: {
            type: Object,
            required: true
        },
        store: {
            type: Object,
            required: true
        },
        card: {
            type: Object,
            required: false
        }
    },
    render(h){
        const bg = this.store.brandcolor || '#222';

        var links = [],
            conte = [];
        if ( !$utils.isEmpty(this.store.phone) ){
            links.push( h('a', {attrs: {href:'tel:'+this.store.phone, target:'_blank'}, style:{color: bg}}, [
                h('sk-svg',{props: {xref: "#ico-phone"}}),
                this.store.phone
            ]));
        }
        if ( !$utils.isEmpty(this.store.uri) ){
            links.push( h('a', {attrs: {href: this.store.uri, target: '_blank'}, style:{color: bg}}, [
                h('sk-svg', {props: {xref: "#ico-planet"}}),
                this.store.uri
            ]));
        }
        if ( !$utils.isEmpty(this.store.loyalty) ){     
            conte.push(h('h3', {class: {'sk-loyalty': true}, domProps: {innerHTML: this.store.loyalty}}));
        }
        if (this.has.card){
            conte.push( h('h3', {class: {'sk-card-inf': true}},
                $utils.isEmpty(this.card.regnum) 
                                        ? 'дата регистрации: ' + $utils.formatDate(this.card.regdt)
                                        : 'карта № ' + this.card.regnum  + ' оформлена ' + $utils.formatDate(this.card.regdt)
                ));
        }
        if ( links.length > 0 ) {
            conte.push(h('div', {class: {'sk-links': true}}, [
                'Вы можете связаться с нами:',
                links
            ]));
        }
        conte.push(h('v-btn', {props:{
                                to: {path: '/stores/' + this.store.id + '/orders'},
                                outlined: true,
                                color: bg
                            }, class: {'mt-3': true, 'sk-go-orders': true}}, [
                                h('sk-svg', {
                                            props: {xref:"#ico-bags"}, 
                                            style: {color: bg, "margin-right": "0.5rem"}
                                        }),
                                'история заказов'
        ]));
        return h('div', {
            key: "sti-" + this.store.id,
            class: "sk-store-details"
        }, conte);
    }
};
</script>
<style lang="scss" scoped>
    @import "~/assets/index.scss";
    
    .sk-store-details{
        margin-top: 1rem;

        & .sk-links {
            margin-top: 1rem;
            line-height: 1.5;
            & a {
                text-decoration: none;
                display: block;
                & svg {
                    width: 0.75rem;
                    height: 0.75rem;
                    margin-right: 0.35rem;
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
    }
</style>    