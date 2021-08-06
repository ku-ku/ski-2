<template>
    <v-row class="sk-profile"
           :dark="has('error')"
           v-bind:class="{error: has('error')}">
        <v-col cols="11" sm="6">
            <v-form v-on:submit="on_auth($event)" 
                    action="#" v-if="has('auth')" 
                    v-model="valid">
                <v-card class="elevation-2">
                    <v-card-title class="justify-space-between">
                        {{modName}}
                        <v-avatar tile
                                  size="96">
                            <v-img src="/auth.png" contain />
                        </v-avatar>
                    </v-card-title>
                    <v-card-text>
                        <v-text-field
                            label="Ваш e-mail"
                            name="eml"
                            type="text"
                            v-model="user.eml"
                            required>
                            <v-icon small slot="prepend">mdi-emoticon-happy-outline</v-icon>
                        </v-text-field>
                        <v-text-field
                            label="Пароль"
                            name="p"
                            type="password"
                            v-model="user.pwd"
                            :messages="pwMessage"
                            required>
                            <v-icon small slot="prepend">mdi-asterisk</v-icon>
                        </v-text-field>
                        <v-alert color="warning" dark class="my-5" v-show="!/^$/.test(error)">
                            {{ error }}
                        </v-alert>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn rounded 
                               type="submit" 
                               :loading="sending"
                               dark color="red darken-4">Войти</v-btn>
                        <v-btn text small 
                               class="ref-register" 
                               to="/profile/register">
                            зарегистрироваться
                        </v-btn>
                        <v-btn text small to="/profile/forgot">забыли пароль?</v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
            <v-form v-else-if="has('register')" 
                    v-model="valid" 
                    v-on:submit="on_register($event)" 
                    action="#">
                <v-card class="elevation-4">
                    <v-card-title class="justify-space-between">
                        {{modName}}
                        <v-avatar tile
                                  size="96">
                            <v-img src="/auth-register.png" contain />
                        </v-avatar>
                    </v-card-title>
                    <v-card-text>
                        <v-text-field
                            name="u"
                            type="text"
                            v-model="user.title"
                            required>
                            <v-icon small 
                                    slot="prepend">
                                mdi-emoticon-happy-outline
                            </v-icon>
                            <template v-slot:label>
                                Имя&nbsp;<b class="red--text">*</b>
                            </template>
                        </v-text-field>
                        <v-text-field
                            name="eml"
                            type="text"
                            v-model="user.eml"
                            required
                            :rules="emailRules">
                            <v-icon small slot="prepend">mdi-at</v-icon>
                            <template v-slot:label>
                                E-mail&nbsp;<b class="red--text">*</b>
                            </template>
                        </v-text-field>
                        <v-text-field
                            label="Телефон"
                            name="tel"
                            type="tel"
                            v-model="user.tel"
                            required
                            :rules="telRules">
                            <v-icon small slot="prepend">mdi-cellphone-iphone</v-icon>
                        </v-text-field>
                        <v-switch v-model="user.agree">
                            <template v-slot:label>
                                <div style="font-size:0.75rem;line-height:1.125;">
                                    Отправляя данную форму, я согласен&nbsp;<b class="red--text">*</b><br />
                                    <a href='//i.xn--80apggkpo6e.xn--p1ai/terms-of-use/' target="_blank">с правилами использования данного приложения</a>
                                </div>     
                            </template>
                        </v-switch>
                        <v-alert :type="alert"
                                 class="my-5" 
                                 v-show="has('error')">
                            <div v-html="error"></div>
                            <div class="text-right" v-if="has('error-reset')">
                                <v-btn color="orange accent-4" 
                                       class="mt-3"
                                       small
                                       rounded 
                                       to="/profile/forgot">
                                    сбросить&nbsp;
                                    <v-icon small>mdi-account-reactivate-outline</v-icon>
                                </v-btn>
                            </div>
                            <div class="text-right" v-if="has('after-register')">
                                <v-btn color="primary" 
                                       class="mt-3"
                                       rounded 
                                       to="{path:'/profile/auth',query:{from: 'register'}}">
                                    авторизоваться&nbsp;
                                    <v-icon small>mdi-login</v-icon>
                                </v-btn>
                            </div>
                        </v-alert>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn type="submit" 
                               rounded dark 
                               color="red darken-4"
                               :loading="sending">
                            зарегистрироваться
                        </v-btn>
                        <v-btn v-if="!has('user')" 
                               text 
                               small 
                               class="ref-auth" 
                               to="/profile/auth">
                            авторизоваться
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
            <v-form v-else-if="has('forgot')" v-on:submit="on_forgot($event)" action="#">
                <v-card class="elevation-4"
                        color="#f4f4f4">
                    <v-card-title class="justify-space-between">
                        {{modName}}
                        <v-avatar tile
                                  size="96">
                            <v-img src="/auth-reset.png" contain />
                        </v-avatar>
                    </v-card-title>
                    <v-card-text>
                        <v-text-field
                            name="eml"
                            type="text"
                            v-model="user.eml"
                            required
                            messages="Введите e-mail, указанный Вами при регистрации"
                            :readonly="has('forgotted')"
                            :rules="emailRules">
                            <v-icon small slot="prepend">mdi-at</v-icon>
                            <template v-slot:label>
                                E-mail&nbsp;<b class="red--text">*</b>
                            </template>
                        </v-text-field>
                        <div v-if="has('reset')" class="mt-3">
                            <v-text-field
                                label="код"
                                name="code"
                                type="text"
                                v-model="user.code"
                                required
                                messages="Введите код, отправленный Вам на e-mail"
                                :rules="codeRules">
                                <v-icon small slot="prepend">mdi-email-receive-outline</v-icon>
                            </v-text-field>
                            <v-text-field
                                label="Пароль"
                                name="p1"
                                type="password"
                                v-model="user.pwd"
                                required>
                                <v-icon small slot="prepend">mdi-asterisk</v-icon>
                            </v-text-field>
                            <v-text-field
                                label="Повторите пароль"
                                name="p2"
                                type="password"
                                v-model="user.pwd2"
                                required>
                                <v-icon small slot="prepend">mdi-asterisk</v-icon>
                            </v-text-field>
                        </div>
                        <v-alert :type="alert"  class="my-5" v-show="!/^$/.test(error)">
                            <div v-html="error"></div>
                        </v-alert>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn type="submit" 
                               rounded dark 
                               width="14rem" 
                               :loading="sending"
                               color="red darken-4">Сбросить пароль</v-btn>
                        <v-btn text small class="ref-auth" to="/profile/auth">авторизоваться</v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </v-col>
    </v-row>
</template>

<script>
    
const modes = {
    AM_NONE:     0,
    AM_AUTH:     1,
    AM_REGISTER: 2,
    AM_FORGOT:   3,
    AM_RESET:    4
};  //modes

const names = {};
names[modes.AM_NONE]     = {id: modes.AM_NONE,     name: "none",     title: "...", inp: 'input[name="u"]'};
names[modes.AM_AUTH]     = {id: modes.AM_AUTH,     name: "auth",     title: "авторизация", inp: 'input[name="eml"]'};
names[modes.AM_REGISTER] = {id: modes.AM_REGISTER, name: "register", title: "регистрация", inp: 'input[name="u"]'};
names[modes.AM_FORGOT]   = {id: modes.AM_FORGOT,   name: "forgot",   title: "сброс пароля", inp: 'input[name="eml"]'};
names[modes.AM_RESET]    = {id: modes.AM_RESET,    name: "reset",    title: "сброс пароля", inp: 'input[name="code"]'};

const USER_DEFS = {
    id: null,
    title: '',  //user title
    pwd: '',
    pwd2: '',
    tel: '',
    eml: '',
    code: '',
    agree: false
};

export default {
  name: 'ViewSignIn',
  data() {
    return {
            mode: modes.AM_NONE,
            valid: false,
            user: Object.assign({}, USER_DEFS),
            telRules: [
                v => /^[\+]?\d{2,}?[(]?\d{2,}[)]?[-\s\.]?\d{2,}?[-\s\.]?\d{2,}[-\s\.]?\d{0,9}$/im.test(v) || 'укажите Ваш телефон для связи'
            ],
            emailRules: [
                v => ($utils.isEmpty(v) || /.+@.+/.test(v)) || 'укажите корректный e-mail адрес'
            ],
            codeRules: [
                v => /^(\d{4,})+$/.test(v) || 'укажите код, отправленный Вам на e-mail'
            ],
            error: '',
            alert: 'warning',    //for messages, TODO:
            sending: false,
            succeess: false,
            pwMessage: ''
        };
    },
    head(){
        return {
            title: this.modName
        };
    },
    activated(){
        var pm = this.$route.params.pathMatch;
        if ($utils.isEmpty(pm)){
            pm = 'auth';
        }
        var hasReset = true;
        switch(pm){
            case 'auth':
                this.mode = modes.AM_AUTH;
                hasReset = false;
                break;
            case 'register':
                this.mode = modes.AM_REGISTER;
                break;
            case 'forgot':
              this.mode = modes.AM_FORGOT;
              break;
            case 'reset':
              this.mode = modes.AM_RESET;
              break;
            default:
              this.mode = modes.AM_AUTH;
        }
        if (hasReset){
            this.resetData();
        }
        var n = names[this.mode];
        if (!!n){
            this.$nextTick(() => {
                $(this.$el).find(n.inp).trigger('focus');
            });
        }
    },
    computed: {
        modName(){
            return names[this.mode].title;
        }
    },
    methods: {
        has: function(q){
            switch(q){
                case 'auth':
                    return (this.mode === modes.AM_AUTH);
                case 'after-register':
                    return /(mail)+.*(парол)+/i.test(this.error);
                case 'register':
                    return (this.mode === modes.AM_REGISTER);
                case 'forgot':
                    return (this.mode === modes.AM_FORGOT) 
                         ||(this.mode === modes.AM_RESET);
                case 'reset':
                    return (this.mode === modes.AM_RESET);
                case 'error':
                    return !$utils.isEmpty(this.error);
                case 'error-reset':
                    return /(сбросить)+.*(пароль)+/i.test(this.error);
                case 'user':
                    return !$utils.isEmpty(this.user.id); //see resetData when mode switch
                default:
                    return false;
            }
        },
        resetData(){
            this.valid = true;
            this.error = '';
            this.alert = 'warning';
            var u = Object.assign({}, USER_DEFS);
            if (    
                    this.$store.getters["profile/isAuthenticated"] 
                && !this.$store.getters["profile/isAnonymous"]
               ){
                const user = this.$store.state.profile.user;
                u.id = user.id;
                u.title = user.name;
                if (!!user.adds){
                    u.eml = user.adds.email;
                    u.tel = user.adds.phone;
                }
            }
            this.user = u;
            console.log('Profile by', u);
        },
        on_auth: function(e){
            e.preventDefault();
            const {eml, pwd} = this.user;
            if ($utils.isEmpty(eml) || $utils.isEmpty(pwd)) {
                this.valid = false;
                this.error = 'Для входа необходимо ввести Ваши e-mail и пароль';
                $('input[name="eml"]').trigger('focus');
                return false;
            }
            this.success = false;
            this.error = '';
            this.sending = true;
            (async ()=>{
                try {
                    const u = { login: eml, password: pwd };
                    const res = await this.$store.dispatch('profile/login', {user: u});
                    this.sending = false;
                    this.success = true;
                    this.$forceUpdate();
                    setTimeout(()=>{
                        this.$router.replace({name: 'index'});
                    }, 1000);
                } catch(e) {
                    console.log(e);
                    this.sending = false;
                    this.success = false;
                    if ( /^(unauthorized)+/i.test(e.statusText) ){
                        this.error = 'Логин или пароль неверный';
                    } else {
                        this.error = `Ошибка авторизации: ${e.statusText}`;
                    }
                }
            })();
            return false;
        },     //on_auth
        async on_register(e){
            e.preventDefault();
            this.error = '';
            if ( $utils.isEmpty(this.user.title) ){
                this.valid = false;
                this.error = 'для регистрации необходимо заполнить Ваше имя';
                $('input[name="u"]').trigger('focus');
                return false;
            }
            if ( $utils.isEmpty(this.user.eml) ) {
                this.valid = false;
                this.error = 'для регистрации необходимо заполнить Ваше e-mail';
                $('input[name="eml"]').trigger('focus');
                return false;
            }
            if (!this.user.agree){
                this.error = 'Вы должны согласиться с правилами использования нашего приложения';
                return false;
            }
        
            this.sending = true;
        
            const client = {
                        "name": this.user.eml,
                        "title": this.user.title,
                        "email": this.user.eml
            };
            
            if ( !$utils.isEmpty(this.user.tel) ){
                client.phone = this.user.tel;
            }

            try {
                await this.$store.dispatch("profile/register", client);
                this.sending = false;
                this.alert = "info";
                this.error = "На указанный Вами e-mail отправлено сообщение с паролем для входа - используйте его для авторизации";
            } catch(e) {
                console.log('ERR on register', e);
                this.sending = false;
                if (/^(поль).{1,}(существ)+/i.test(e.message)){
                    this.error = 'Пользователь уже зарегистрирован, возможно стоит попытаться сбросить пароль';
                } else {
                    this.error = 'Возникла ошибка при регистрации&nbsp;- попробуйте повторить попытку позднее.<br />'
                                +'<small>Дополнительная информация: ' + e.message + '</small>';
                }
            }
        },    //on_register
        async _get_code(){
            if ( $utils.isEmpty(this.user.eml)) {
                this.valid = false;
                this.error = 'для регистрации необходимо заполнить Ваш e-mail';
                $('input[name="eml"]').trigger('focus');
                return false;
            }
            this.sending = true;
            try {
                var res = await this.$store.dispatch("profile/resetPass", {"email": this.user.eml, "mode":"reset"});
                console.log('send forgot:', res);
                if (res.success){
                    this.$router.replace({path: '/profile/reset'});
                } else {
                    throw {message:'пользователь с указанным e-mail не существует'};
                }
                this.sending = false;
            } catch(e){
                console.log('ERR on get code:', e);
                this.sending = false;
                this.valid = false;
                this.error = 'Возникла ошибка.<br />' 
                            + ((e)&&(e.message) 
                                ? '<small>Дополнительная информация: ' + e.message + '</small>' : 'Попробуйте еще раз.');
            }
        },    //_get_code
        async _reset_pw(){
            if (    $utils.isEmpty(this.user.pwd)
                 || $utils.isEmpty(this.user.pwd2)
                 || $utils.isEmpty(this.user.code)
                ) {
                this.valid = false;
                this.error = 'для сброса пароля необходимо заполнить все данные';
                $('input[name="code"]').trigger('focus');
                return false;
            }
            if (this.user.pwd!==this.user.pwd2){
                this.valid = false;
                this.error = 'пароли не совпадают';
                $('input[name="p2"]').trigger('focus');
                return false;
            }
            
            this.sending = true;
            try {
                var res = await this.$store.dispatch("profile/resetPass", {"mode":"newpass", "email": this.user.eml, "code": this.user.code, "password": this.user.pwd});
                this.sending = false;
                console.log('send pass:', res);
                if (!!res.success){
                    this.alert = 'success';
                    this.error = 'Пароль успешно изменен. Вы можете авторизоваться с новым паролем.';
                    setTimeout(()=>{
                        this.$router.replace({path:'profile/auth'});
                    }, 3000);
                } else {
                    throw {message: 'Неверный код подтверждения'};
                }
            } catch(e){
                console.log('ERR on reset:', e);
                this.sending = false;
                this.valid = false;
                this.error = 'Возникла ошибка.<br />' 
                            + ((e)&&(e.message) 
                                ? '<small>Дополнительная информация: ' + e.message + '</small>' : 'Попробуйте еще раз.');
            }
        },    //_reset_pw
        on_forgot(e){
            e.preventDefault();
            if ( $utils.isEmpty(this.user.eml) ) {
                this.valid = false;
                this.error = 'Введите Ваш e-mail';
                $('input[name="eml"]').trigger('focus');
                return false;
            }
            switch( this.mode ) {
                case modes.AM_FORGOT:
                    this._get_code();
                    break;
                case modes.AM_RESET:
                    this._reset_pw();
                    break;
            }
            return false;
        }
    }   //methods
};
</script>

<style lang="scss" scoped>
    .sk-profile{
        min-height: calc(100vh - 44px);
        align-content: center;
        align-items: center;
        justify-content: center;
        & .v-card {
            &__title{
                text-transform: uppercase;
                font-weight: 300;
            }
            &__actions{
                text-align: center;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                & .v-btn{
                    width:14rem;
                    margin-bottom: 1rem;
                }
            }
            & .v-input{
                & svg{
                    width: 16px;
                    height: 16px;
                    color: #bdbdbd;
                }
            }   /* .v-card */
        }
        & .v-alert{
            line-height: 1.125;
        }
    }
</style>
