import { eventBus } from '@/utils/eb';

export default async function ({ app }) {
    const PING_TM = 10*60*1000;
    
    var _hTimer = false;        //ping timer for cli-checking
    var _hwsTimer = false;      //ping timer for ws-checking
    
    var sock = null;
    
    document.addEventListener('deviceready', function(){
        return true;
    });
    
    if (!app.mixins) {
        app.mixins = [];
    }
    app.mixins.push({
        computed: {
            APP_TITLE(){
                return this.context.env.APP_TITLE;
            }
        },
        beforeCreate(){
            if (!!window){
                window["ski"] = this;
            }
            this.$store.commit("settings/setEnv", app.context.env);
            this.$store.dispatch("geo/current");
            const _auth = async (u)=>{
                try {
                    await this.$store.dispatch("profile/check", u);
                } catch(e) {
                    if (typeof u === "undefined"){
                        this.$router.replace("/profile/auth");
                    } else {
                        _auth();
                    }
                }
            };
            _auth( $utils.lsRead("auth") );
            this.$store.dispatch("settings/initPushes");
        },
        beforeDestroy() {
            this.$store.dispatch("settings/destroy");
        },
        methods: {
            async _check_sock(){
                const self = this;
                return new Promise((resolve, reject)=>{
                    if (!!sock){
                        try {
                            if (sock.readyState !== sock.OPEN){
                                sock.close();
                                throw 'sock closed';
                            }
                            sock.send('ping');  //TODO: reconnect
                        } catch(e) {
                            sock = null;
                            console.log('WS ping error at:', new Date(), e);
                        }
                    }
                    if (!!sock){
                        resolve();
                    } else {
                        console.log('ws: opening at ', self.context.env.wsUrl);
                        sock = new WebSocket(self.context.env.wsUrl);
                        sock.onclose = e => {
                            console.log('ws: closed', e);
                        };
                        sock.onmessage = (e)=>{
                            console.log('MSG:', e.data);
                            try {
                                var msg = /^\{+/.test(e.data) ? JSON.parse(e.data) : null;
                                if ((!!msg) && !$utils.isEmpty(msg.type)){
                                    switch(msg.type) {
                                        case 'chat':
                                            eventBus.$emit('chat', msg.text);
                                            break;
                                        case 'order':
                                            eventBus.$emit('order', msg.text);
                                            break;
                                    }
                                }
                            } catch(e) {
                                console.log('MSG err:', e);
                            }
                        };  //sock.onmessage
                        sock.onopen = ()=>{
                            (async ()=>{
                                var info = { uid: self.$store.getters["profile/id"] };
                                if (!!self.$store.state.settings.notifi.fcmId){
                                    info.regId = self.$store.state.settings.notifi.fcmId;
                                }
                                try {
                                    sock.send(JSON.stringify(info));
                                    resolve();
                                    console.log('ws: opened ');
                                }catch(e){
                                    console.log('ERR: ws user-init:', e);
                                    reject();
                                }
                            })();
                        };  //sock.onopen
                    }
                });
            },  //_check_sock
            /*
             * Callback when user authenticated
             * (re)init ping's
             */
            onUser(user){
                const self = this;
                //session
                if (!!_hTimer){ clearInterval(this._hTimer); }
                _hTimer = setInterval(async ()=>{
                    const opts = {
                        type: 'auth',
                        basicAuth: 'Basic ' + btoa('ping:' + (new Date()).getTime())
                    };
                    try {
                        var resp = await this.$http.post(opts);
                        if (!!resp.error){
                            throw resp.error;
                        }
                        }catch(e){
                            //TODO: this.$router.replace({name: 'signin'});
                            //this.pingFail();
                        }
                }, PING_TM);
                
                //WS: opening when user avail
                if (!!_hwsTimer){ clearInterval(_hwsTimer);}
                _hwsTimer = setInterval(()=>{this._check_sock();}, PING_TM);
                this._check_sock();
            },   //onUser
            msg(){
                //TODO:
            },
            async tryWs(id){
                try {
                    await this._check_sock();
                    sock.send((!!id) ? JSON.stringify({uid: id}) : 'ping');
                } catch(e) {
                    console.log('ERR (sock)', e);
                }
            }
        }
    });
};