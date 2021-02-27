<template>
    <div class="sk-messages">
        <div class="sk-messages-conte">
            <v-list v-if="hasMessages">
                <v-list-item 
                    v-for="item in msgs.data"
                    :key="item[ci('botmsgs.id')]"
                    :data-item-id="item[ci('botmsgs.id')]"
                    >
                    <v-list-item-content>
                        <v-list-item-subtitle>
                            <div class="sk-my" 
                                 :style="{'background-color':brandColor}">
                                {{ item[ci('botmsgs.message')] }}
                                <div class="sk-dt">
                                    {{ fmt_dt(item[ci('botmsgs.regdt')]) }}
                                </div>
                            </div>
                            <div v-if="!isEmpty(item[ci('botmsgs.replmsg')])" class="sk-reply">
                                {{ item[ci('botmsgs.replmsg')] }}
                                <div class="sk-dt">
                                    {{ fmt_dt(item[ci('botmsgs.repldate')]) }}
                                </div>
                            </div>
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </div>
        <v-bottom-navigation
            absolute
            height="auto"
            width="100%"
            class="sk-send-bottom"
            >
            <v-textarea
                label="написать"
                rows="2"
                v-model="s"
                :loading="sending"
                :error="sendErr"
                @focus="adjust($event)"
                @blur="adjust($event)"
            >
                <template v-slot:append>
                    <v-btn text small class="sk-send" @click="send"
                           :style="{'color':brandColor}">
                        <svg viewBox="0 0 512 512"><use xlink:href="#ico-send-plane" /></svg>
                    </v-btn>
                </template>
            </v-textarea>
        </v-bottom-navigation>
    </div><!--.sk-messages-->
</template>
<script>
/*
botmsgs.id	0
botmsgs.message	5
botmsgs.regdt	6
botmsgs.repldate8
botmsgs.replmsg	7
 */    
import {eventBus} from '~/utils/eb';

export default{
        name: 'SkChat',
        data(){
            return {
               s: '',
               sending: false,
               sendErr: false,
               msgs: null
            };
        },
        created(){
            $(window).resize(()=>{
                this.adjust();
            });
            eventBus.$on('chat', ()=>{this.load(null);});  //TODO: by id
        },
        activated(){
            this.load();
            this.$nextTick(()=>{
                window.scrollTo(1, 0);
                this.adjust();
            });
        },
        computed: {
            hasMessages(){
                return (!!this.msgs) && (this.msgs.data) && (this.msgs.data.length>0);
            },
            store(){
                return this.$store.state.active.store;
            },
            userId(){
                return this.$store.state.profile.user.id;
            },
            brandColor(){
                return ((this.store)&&(this.store.brand)&&!$utils.isEmpty(this.store.brand.color)) 
                        ? this.store.brand.color 
                        : '';
            }
        },
        methods: {
            adjust(e){
                if (!/chat$/.test(this.$route.path)){
                    return;
                }
                if ((!!e)&&("blur"===e.type)){
                    window.scrollTo(1, 0);
                }
                
                var h1 = $(window).height(),
                    h2 = 0,
                    h3 = 0;
            
                var pane = $('.sk-messages'),
                    bottom=$('.sk-send-bottom');
                bottom.find('textarea').trigger('focus');
                h2 = pane.offset().top;
                h3 = bottom.height();
                pane.css({height: (h1-h2-h3-1) + 'px'});
                bottom.find('.v-input__append-inner').css({margin:'0',padding:'0', 'align-self': 'stretch', 'align-items': 'stretch'});
            },
            ci(name){
                return (!!this.msgs) ? this.msgs.columnIndexes[name] : -1;
            },
            isEmpty(s){
                return $utils.isEmpty(s);
            },
            fmt_dt(d){
                const dt = $utils.formatDate(d, 'dd.MM.yyyy HH:mm'),
                      now= $utils.formatDate((new Date()).getTime(), 'dd.MM.yyyy HH:mm');
                if (dt.substr(0,10)===now.substr(0,10)){
                    return dt.substr(11);
                }
                return dt;
            },
            scrollLast(){
                const conte = $('.sk-messages-conte');
                conte.animate({scrollTop: conte[0].scrollHeight}, 600);
            },
            back(){
                this.$emit('exit');
                this.$router.go(-1);
            },
            async load(id){
                const opts = {
                    type: 'core-read',
                    query: 'sin2:/v:57ebbbce-4e15-4e97-a54f-ab3d3c54969e?filter='
                },  isNew = !$utils.isEmpty(id);
                if (isNew){
                    opts.query += 'eq(field(".id"), param("' + id + '", "id"))';
                } else {
                    opts.query += 'and(eq(field(".userId"), param("' + this.userId + '", "id")),';
                    opts.query += 'eq(field(".tenantId"), param("' + this.store.id + '", "id")))';
                    opts.query += '&sort=botmessages.redDt';
                }
                
                try {
                    var res = await this.$http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    if (!!this.msgs){
                        if (isNew) {
                            if ((res.result.data)&&(res.result.data.length>0)){
                                this.msgs.data.push(res.result.data[0]);
                            }
                        } else {
                            this.msgs = res.result;
                        }
                    } else {
                        this.msgs = res.result;
                    }
                    this.$nextTick(()=>{
                        this.scrollLast();
                    });
                } catch(e){
                    console.log(e);
                }
            },  //load
            async send(e){
                e.preventDefault();
                if ($utils.isEmpty(this.s)){
                    $('.sk-messages').find('textarea').trigger('focus');
                    this.sendErr = true;
                    setTimeout(()=>{this.sendErr = false;}, 2000);
                    return false;
                }
                const id = $utils.uuidv4();
                const opts = {
                    type: 'core-create',
                    query: 'sin2:/v:8db0cf44-8d7d-425d-936d-7c4f78c07554',
                        params: [
                            {id: 'id', type:'id', value: id},
                            {id: 'userID', type:'id', value: this.userId},
                            {id: 'tenantID', type:'id', value: this.store.id},
                            {id: 'regDt', type: 'dateTime', value: new Date()},
                            {id: 'Message', type: 'string', value: this.s}
                        ]
                };
                this.sending = true;
                try {
                    var res = await this.$http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    this.load(id);
                    this.$nextTick(()=>{this.s = '';});
                } catch(e){
                    ski.msg({text:'Сообщение не отправлено, попробуйте еще раз', color:'warning'});
                }
                this.sending = false;
            }   //send
        }
    }
</script>
<style lang="scss" scoped>
$lighten-gray: #d7d9dc;
$lighten-gray-msg: lighten($lighten-gray, 10%);
$def-mgs-color: #5676ee;
.sk-messages {
    padding: 2rem 0 0 0;
    
    & .sk-top-bar{
        padding: 1rem;
        position: absolute;
        z-index: 4;
        top: 0;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        & .v-btn{
            border-radius: 50%;
            background: rgba(0,0,0, 0.18);
            width: 32px;
            height: 32px;
            line-height: 32px;
            text-align: center;
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
        }
    }
    
    
    & .sk-messages-conte{
        overflow: auto;
        height: 100%;
        & .v-list{
            padding:0 1rem 2rem 1rem;
            border-radius: 0;
            & .v-list-item{
                padding: 0;
                & .sk-my, & .sk-reply{
                    padding: 0.75rem;
                    white-space: normal;
                    height: auto;
                    min-height: 1.5rem;
                    & .sk-dt{
                        font-size: 0.6rem;
                        opacity: 0.7;
                        text-align: right;
                    }
                }
                & .sk-my{
                    background-color: $def-mgs-color;
                    margin: 0 0 8px 15%;
                    color: #fff;
                    border-radius: 6px 6px 0 6px;
                    box-shadow: -2px 2px 4px rgba(0,0,0,0.18);
                }
                & .sk-reply{
                    background-color: $lighten-gray-msg;
                    margin: 0 15% 8px 0;
                    color: #000;
                    border-radius: 6px 6px 6px 0;
                    border: 1px solid $lighten-gray;
                    box-shadow: 2px 2px 4px rgba(0,0,0,0.18);
                }
            }
        }
    }
}
.v-item-group.v-bottom-navigation.sk-send-bottom{
    box-shadow: none !important;
    padding: 0 0.5rem;
    background: $lighten-gray-msg;
    border-top: 1px solid $lighten-gray;
    & .sk-send{
        padding: 0 !important;
        margin:  0 !important;
        width: 42px;
        max-width: 42px;
        min-width: 42px;
        height: 42px;
        background: $lighten-gray-msg;
        border: 1px solid $lighten-gray;
        border-radius: 500px;
        color: $def-mgs-color;
        & svg{
            width: 16px;
            height: 16px;
        }
    }
}
.v-application--is-ltr {
    & .v-text-field {
        & .v-input__append-inner{
            margin: 0 !important;
            margin-left: 0 !important;
            padding:0 !important;
            padding-left: 0 !important;
            align-self: stretch;
            align-items: stretch;
        }
    }
}
</style>
