<script>
import { VBtn,
         VList, 
         VSubheader,
         VListItem,
         VListItemGroup,
         VListItemIcon,
         VListItemContent,
         VListItemTitle,
         VListItemSubtitle,
         VListItemAction,
         VForm,
         VTextField,
         VSkeletonLoader
       } from 'vuetify/lib';
import SkSvg from '@/components/SkSvg';

/*eslint-disable */
require('@/utils/jquery.maskedinput.min');
/*eslint-enable */

const MSG_SHARE = {
    title: 'МоиКарты',
    msg: 'Google: https://play.google.com/store/apps/details?id=skidos.my.ru \n\n\n\n Apple: https://apps.apple.com/ru/app/%D0%BC%D0%BE%D0%B8%D0%BA%D0%B0%D1%80%D1%82%D1%8B-%D1%80%D1%84/id1510411658 \n\n\n\n'
};
const MSG_SEND = {
    'none': 0,
    'sending': 1,
    'success': 2,
    'error': 3
};

export default {
    name: 'SkStoreShare',
    props: {
        parent: {
            type: Object,
            required: true
        }
    },
    components: {
        VBtn,
        VList, 
        VSubheader,
        VListItem,
        VListItemGroup,
        VListItemIcon,
        VListItemContent,
        VListItemTitle,
        VListItemSubtitle,
        VListItemAction,
        VForm,
        VTextField,
        VSkeletonLoader,
        SkSvg
    },
    data(){
        return {
            tel: '',
            telValid: true,
            telSend: MSG_SEND.none
        };
    },
    created(){
        if ($("ya-share-script").length < 1){
            var s = $(document.createElement('script'));
            s.attr("src", "https://yastatic.net/share2/share.js");
            s.attr("id", "ya-share-script");
            s.appendTo('body');
        }
    },
    mounted(){
        if (!this.$store.getters["active/hasActiveStore"]){
            this.$router.replace({path:"/stores/"});
        }
        var inp = this.$refs["phone"];
        if (!!inp){
            this.$nextTick(()=>{
                const self = this,
                      _inp = $(inp.$el).find('input');
                if ($utils.isEmpty(_inp.attr("data-mask"))){
                    _inp.mask("+7(999) 999-9999", {
                        completed: function(){ 
                            self.tel = this.val(); 
                            console.log('tel:', self.tel);
                        }
                    });
                    _inp.attr("data-mask", "1");
                }
            });
        }
    },
    computed: {
        msg_text() {
            if (this.$store.getters["active/hasActiveStore"]){
                return this.$store.state.profile.user.name + ' предлагает Вам установить приложение "МоиКарты" и стать клиентом ' + 
                        this.$store.state.active.store.title + '\n' + MSG_SHARE.msg;
            } else {
                return "";
            }
        }
    },
    methods: {
        sendSms(){
            if ($utils.isEmpty(this.tel)){
                this.telValid = false;
                return;
            }
                                                    
            const msg = {
                        phoneNumber:this.tel,
                        textMessage: MSG_SHARE.title + '\n' + this.msg_text
                  },
                  inp = $(this.$refs["phone"].$el).find('input');
                                            
                                
            this.telSend = MSG_SEND.sending;
                            
            const isApple = /iPhone|iPod|iPad/gi.test(navigator.platform);
            var url = "sms:" + msg.phoneNumber;
            url += (isApple) ? "&" : "?";
            url += "body=" + encodeURIComponent(msg.textMessage);
            window.location.href = url;
            try{
                this.$http.post({
                    type: 'api-call',
                    url: '/skidosapi/share',
                    contentType: 'application/json;charset=utf-8',
                    dataType: 'text',
                    data: JSON.stringify({q:'app', phone: msg.phoneNumber, user: this.$store.state.profile.user.id}),
                    processData: false
                });
            } catch(e){
                console.log('ERR on call /share app:', e);
            }
            this.telSend = MSG_SEND.none;
        }
    },
    render: function(h){
        const self = this;
        var childs = [];
        if (this.loading){
            childs.push(h('v-list-item', [
                h('v-skeleton-loader', {props:{type:'list-item-three-line'}})
            ]));
        } else {
            childs.push(h('v-list-item', {key:'item-share-sms', class:{'mb-5':true}}, [
                h('v-list-item-content', [
                    h('v-form', {
                        on: {submit: (e)=>{
                                e.preventDefault();
                                this.sendSms();
                                return false;
                        }
                    }}, [h('v-text-field', {
                            props: {
                                type: 'tel',
                                label: "тлф. №",
                                outlined: true,
                                "hide-details": false,
                                autofocus: true,
                                error: (this.telSend === MSG_SEND.error),
                                "error-messages": (this.telSend === MSG_SEND.error) 
                                                    ? 'СМС не отправилась, попробуйте другим способом'
                                                    : null,
                                hint:  (this.telSend === MSG_SEND.error) 
                                            ? 'СМС не отправилась, попробуйте другим способом'
                                            : 'введите № телефона, чтобы поделиться приложением по CMC',
                                color: (this.telSend === MSG_SEND.error) 
                                            ? "orange lighten-1" 
                                            : "green lighten-1",
                                value: this.tel,
                                mask: "+7(999) 999-9999"
                            },
                            ref: "phone",
                            on: {
                                focus: ()=>{
                                    setTimeout(()=>{
                                        $([document.documentElement, document.body]).animate({
                                            scrollTop: $(self.$refs["phone"].$el).find('input').offset().top
                                        }, 600);
                                    }, 600);
                                }
                            }
                        }),
                        h('v-btn', {props: {
                                    color: 'green lighten-1', 
                                    dark: true,
                                    loading: (this.telSend === MSG_SEND.sending),
                                    type: 'submit',
                                    width: '100%'
                                   }
                            }, [
                            h('sk-svg', {props:{xref:"#ico-sms"}, class:{"mr-2":true}}),
                            'отправить SMS'
                        ])
                    ])
                ])
            ]));
            childs.push(h('v-list-item', {key:'item-share-ya'}, [
                h('v-list-item-content', [
                    h('div', {
                        class:{'ya-share2':true}, 
                        attrs: {
                            "data-services":"telegram,whatsapp,viber",
                            "data-title": MSG_SHARE.title,
                            "data-url": this.msg_text
                    }})
                ])
            ]));
        }
        return h('v-list', {class: {"mt-5": true}}, childs);
    }
}
</script>
<style lang="scss">
    .ya-share2__container{
        margin-top: 2rem;
        & ul{
            display: flex;
            padding: 0;
            width: 100%;
            justify-content: space-around;
            flex-wrap: wrap;
            & .ya-share2__item{
                margin: 0 0.5rem 2rem 0 !important;
                text-align: center;
                width: auto;
                & .ya-share2__link{
                    box-shadow: 0 2px 6px rgba(0,0,0,0.22);
                    border: 1px solid #fff;
                }
            }
            & .ya-share2__icon {
                height: 56px !important;
                width: 56px !important;
                background-size: 56px 56px !important;
            }
        }
    }
</style>
