<template>
    <v-row class="justify-center pt-sm-5">
        <v-col cols="12" sm="8">
            <v-form v-model="valid" v-on:submit="on_profile($event)" action="#">
                <v-card class="pb-5">
                    <v-card-text>
                        <v-text-field
                            label="Ваше имя"
                            name="u"
                            type="text"
                            v-model="title"
                            required
                        >
                            <sk-svg slot="prepend" xref="#ico-morda" />
                        </v-text-field>
                        <v-text-field
                            label="Пароль"
                            name="p1"
                            type="password"
                            v-model="pwd"
                            required
                        >
                            <sk-svg slot="prepend" xref="#ico-asterisk" />
                        </v-text-field>
                        <v-text-field
                            label="Повторите пароль"
                            name="p2"
                            type="password"
                            v-model="pwd2"
                            required
                        >
                            <sk-svg slot="prepend" xref="#ico-asterisk" />
                        </v-text-field>
                        <v-text-field
                            label="e-mail"
                            name="eml"
                            type="text"
                            v-model="eml"
                            required
                            :rules="emailRules"
                        >
                            <sk-svg slot="prepend" xref="#ico-at" />
                        </v-text-field>
                        <v-text-field
                            label="Телефон"
                            name="tel"
                            type="tel"
                            v-model="tel"
                            required
                            :rules="telRules"
                        >
                            <sk-svg slot="prepend" xref="#ico-mobile" />
                        </v-text-field>
                        <v-text-field
                            label="адрес"
                            name=addr
                            type="text"
                            v-model="addr"
                            messages="адрес, используемый для доставки"
                        >
                            <sk-svg slot="prepend" xref="#ico-map-marker" />
                        </v-text-field>
                        <a class="mt-3" 
                           href="//i.xn--80apggkpo6e.xn--p1ai/terms-of-use/" 
                           target="_blank">
                            <v-icon>mdi-card-text-outline</v-icon>&nbsp;правила использования данного приложения
                        </a>
                        <v-alert :type="alert"  class="my-3" v-show="!/^$/.test(error)">
                            <div v-html="error"></div>
                        </v-alert>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn type="submit" 
                               rounded 
                               dark 
                               width="14rem" 
                               color="red darken-4"
                               :loading="loading"
                               >Изменить данные</v-btn>
                        <div class="d-flex mt-3 justify-center justify-space-between" style="width:14rem;">
                            <v-btn small text @click="$router.replace({path:'/'})">На главную</v-btn>
                            <v-btn small text v-on:click.stop="signout">
                                <sk-svg xref="#ico-signout" />
                            </v-btn>
                        </div>
                    </v-card-actions>
                </v-card>
            </v-form>
        </v-col>
    </v-row>
</template>

<script>
import { MODES } from "~/utils/index.js";
import SkSvg from "~/components/SkSvg";

const stub_pwd = 'stub_XXX';

export default {
    name: 'SkUserProfile',
    components: { SkSvg },
    data() {
      return {
          valid: false,
          title: '',
          pwd: stub_pwd,
          pwd2: stub_pwd,
          tel: '',
          telRules: [
              v => /^(\+)?\d{10,11}$/.test(v) || 'укажите Ваш телефон для связи'
          ],
          eml: '',
          emailRules: [
              v => /^.{1,}@{1}.{1,}\.+.{1,}/.test(v) || 'укажите корректный e-mail адрес'
          ],
          addr: '',
          error: '',
          agree: false,
          alert: 'warning',
          mode: MODES.default
      };
    },
    computed: {
        userId(){
            return this.$store.state.profile.user.id;
        },
        loading(){
            return (this.mode === MODES.loading) || (this.mode === MODES.saving);
        }
    },
    async fetch(){
        const opts = {
                    type: 'core-read',
                    query: 'sin2:/v:b841fde1-394a-4ab1-8ca7-48446f58c27e?id=' + this.userId
        };
        this.mode = MODES.loading;
        try{
            var resp = await this.$http.post(opts);
            if (resp.error){
                throw resp.error;
            } else if ((resp.result.data)&&(resp.result.data.length>0)){
                const u = $utils.sin2obj(resp.result.columnIndexes, resp.result.data[0]);
                this.title = $utils.isEmpty(u.title) ? u.name : u.title;
                this.pwd = stub_pwd;
                this.pwd2= stub_pwd;
                this.tel = u.phone;
                this.eml = u.email;
                this.addr= u.addrstring;
                this.error='';
                this.agree=false;
                if ($utils.isEmpty(this.eml)){
                    if (/^.{1,}@{1}.{1,}\.+.{1,}/.test(u.name)){
                        this.eml = u.name;
                    }
                }
            } else {
                throw {message: 'Данные профиля недоступны'};
            }
        } catch(e){
            console.log('ERR on profile read:', e);
            ski.msg({text:'Ошибка получения данных профиля, попробуйте получить позднее.', type:'warning'});
        }
        this.mode = MODES.default;
    },
    activated: function(){
        if (!this.$store.getters["profile/is"]("user")){
            ski.msg({text:"Необходимо авторизоваться", color: 'warning'});
            this.$router.replace({path:"/profile/auth"});
            return;
        }
        this.error = '';
        this.$nextTick(() => {
            $('input[name="u"]').trigger('focus');
        });
    },
    methods: {
        on_profile: function(e){
            const uid = this.userId;
            this.error = '';
            this.alert = 'warning';
            e.preventDefault();
            if ( $utils.isEmpty(this.title) || 
                 $utils.isEmpty(this.pwd)   ||
                 $utils.isEmpty(this.tel)   ||
                 $utils.isEmpty(this.eml)
                ) {
                this.valid = false;
                this.error = 'для регистрации необходимо заполнить все данные';
                $('input[name="u"]').trigger('focus');
                return false;
            }
            if (this.pwd!==this.pwd2){
                this.valid = false;
                this.error = 'пароли не совпадают';
                $('input[name="p1"]').trigger('focus');
                return false;
            }
            this.mode = MODES.saving;
            const clii = {
                    "id":         uid,
                    "name":       this.eml,
                    "title":      this.title,
                    "password":   (this.pwd === stub_pwd) ? null : this.pwd,
                    "email":      this.eml,
                    "phone":      this.tel,
                    "addrstring": this.addr
            };
            const opts = {
                type: 'api-call',
                url: '/skidosapi/reg-user',
                dataType:'json',
                method: 'POST',
                contentType:'application/json;charset=utf-8',
                data: JSON.stringify({client: clii})
            };
            (async ()=>{    //TODO: to store
                try{
                    var res = await this.$http.post(opts);
                    if (!!res.success){
                        this.alert = 'success';
                        this.error = 'данные профиля обновлены';
                        this.mode = MODES.default;
                    } else {
                        throw (res.error) ? res.error : {message: 'неопознанная ошибка'};
                    }
                    this.$store.commit('profile/setUserInfo', clii);
                }catch(e){
                    console.log(e);
                    this.mode = MODES.error;
                    this.alert = 'warning';
                    this.error = 'Возникла ошибка при обновлении профиля - попробуйте повторить попытку позднее.<br />'
                                +'<small>Дополнительная информация: ' + e.message + '</small>';
                }
            })();
        },    //on_profile
        signout(e){
            e.preventDefault();
            this.$store.dispatch('profile/logout').then(async ()=>{
                await this.$router.replace({name:'index'});
                setTimeout(()=>{window.location.reload();}, 300);
            });
            return false;
        }
    }
};
</script>

<style lang="scss" scoped>
    .v-card {
        & .v-card__actions{
            flex-direction: column;
            align-items: center;
            & .ref-auth, & .ref-register{
                font-size: 0.75rem;
                color: #777;
                text-decoration: none;
                margin: 1.5rem auto;
                &:hover{
                    color: blue;
                }
            }
        }
        & a{
            color: #777;
            text-decoration: none;
            display: block;
            margin: 1rem 0;
            & .v-icon{
                color: #bdbdbd;
            }
        }
    }
    
    .v-input{
        & svg{
            width: 16px;
            height: 16px;
            color: #bdbdbd;
        }
    }
</style>

