(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{645:function(e,t,r){"use strict";(function(e){r(67),r(27),r(21),r(44),r(24),r(45);var n=r(5),o=r(92),l=0,d=1,c=2,m=3,v=4,f={};f[l]={id:l,name:"none",title:"...",inp:'input[name="u"]'},f[d]={id:d,name:"auth",title:"авторизация",inp:'input[name="eml"]'},f[c]={id:c,name:"register",title:"регистрация",inp:'input[name="u"]'},f[m]={id:m,name:"forgot",title:"сброс пароля",inp:'input[name="eml"]'},f[v]={id:v,name:"reset",title:"сброс пароля",inp:'input[name="code"]'};var h={id:null,title:"",pwd:"",pwd2:"",tel:"",eml:"",code:"",agree:!1};t.a={name:"ViewSignIn",components:{SkSvg:o.default},data:function(){return{mode:l,valid:!1,user:Object.assign({},h),telRules:[function(e){return/^[\+]?\d{2,}?[(]?\d{2,}[)]?[-\s\.]?\d{2,}?[-\s\.]?\d{2,}[-\s\.]?\d{0,9}$/im.test(e)||"укажите Ваш телефон для связи"}],emailRules:[function(t){return e.isEmpty(t)||/.+@.+/.test(t)||"укажите корректный e-mail адрес"}],codeRules:[function(e){return/^(\d{5,})+$/.test(e)||"укажите код, отправленный Вам на e-mail"}],error:"",alert:"warning",sending:!1}},head:function(){return{title:this.modName}},activated:function(){var t=this,r=this.$route.params.pathMatch;switch(e.isEmpty(r)&&(r="auth"),r){case"auth":this.mode=d;break;case"register":this.mode=c;break;case"forgot":this.mode=m;break;case"reset":this.mode=v;break;default:this.mode=d}this.resetData();var n=f[this.mode];n&&this.$nextTick((function(){$(t.$el).find(n.inp).trigger("focus")}))},computed:{modName:function(){return f[this.mode].title}},methods:{has:function(q){switch(q){case"user":return!e.isEmpty(this.user.id)}},is:function(e){switch(e){case"auth":return this.mode===d;case"register":return this.mode===c;case"forgot":return this.mode===m||this.mode===v;case"reset":return this.mode===v;default:return!1}},resetData:function(){this.valid=!0,this.error="",this.alert="warning";var u=Object.assign({},h);if(this.$store.getters["profile/isAuthenticated"]&&!this.$store.getters["profile/isAnonymous"]){var e=this.$store.state.profile.user;u.id=e.id,u.title=e.name,e.adds&&(u.eml=e.adds.email,u.tel=e.adds.phone)}this.user=u,console.log("Profile by",u)},on_auth:function(t){var r=this;t.preventDefault();var o=this.user,l=o.eml,d=o.pwd;return e.isEmpty(l)||e.isEmpty(d)?(this.valid=!1,this.error="Для входа необходимо ввести Ваши e-mail и пароль",$('input[name="eml"]').trigger("focus"),!1):(this.error="",this.sending=!0,Object(n.a)(regeneratorRuntime.mark((function e(){var u;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,u={login:l,password:d},e.next=4,r.$store.dispatch("profile/login",{user:u});case 4:e.sent,r.sending=!1,r.$router.replace({name:"index"}),e.next=14;break;case 9:e.prev=9,e.t0=e.catch(0),console.log(e.t0),r.sending=!1,r.error="Логин или пароль неверный";case 14:case"end":return e.stop()}}),e,null,[[0,9]])})))(),!1)},on_register:function(t){var r=this;return Object(n.a)(regeneratorRuntime.mark((function n(){var o;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(t.preventDefault(),r.error="",!(e.isEmpty(r.user.title)||e.isEmpty(r.user.pwd)||e.isEmpty(r.user.tel)||e.isEmpty(r.user.eml))){n.next=7;break}return r.valid=!1,r.error="для регистрации необходимо заполнить все данные",$('input[name="u"]').trigger("focus"),n.abrupt("return",!1);case 7:if(r.user.pwd===r.user.pwd2){n.next=12;break}return r.valid=!1,r.error="пароли не совпадают",$('input[name="p2"]').trigger("focus"),n.abrupt("return",!1);case 12:if(r.user.agree){n.next=15;break}return r.error="Вы должны согласиться с правилами использования нашего приложения",n.abrupt("return",!1);case 15:return r.sending=!0,o={name:r.user.eml,title:r.user.title,password:r.user.pwd,email:r.user.eml,phone:r.user.tel},n.prev=17,n.next=20,r.$store.dispatch("profile/register",o);case 20:r.$router.replace({name:"index"}),r.sending=!1,n.next=29;break;case 24:n.prev=24,n.t0=n.catch(17),console.log("ERR on register",n.t0),r.sending=!1,r.error="Возникла ошибка при регистрации - попробуйте повторить попытку позднее.<br /><small>Дополнительная информация: "+n.t0.message+"</small>";case 29:case"end":return n.stop()}}),n,null,[[17,24]])})))()},_get_code:function(){var t=this;return Object(n.a)(regeneratorRuntime.mark((function r(){var n;return regeneratorRuntime.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:if(!e.isEmpty(t.user.eml)){r.next=5;break}return t.valid=!1,t.error="для регистрации необходимо заполнить Ваш e-mail",$('input[name="eml"]').trigger("focus"),r.abrupt("return",!1);case 5:return t.sending=!0,r.prev=6,r.next=9,t.$store.dispatch("profile/resetPass",{email:t.user.eml,mode:"reset"});case 9:if(n=r.sent,console.log("send forgot:",n),!n.success){r.next=15;break}t.$router.replace({path:"/profile/reset"}),r.next=16;break;case 15:throw{message:"пользователь с указанным e-mail не существует"};case 16:t.sending=!1,r.next=25;break;case 19:r.prev=19,r.t0=r.catch(6),console.log("ERR on get code:",r.t0),t.sending=!1,t.valid=!1,t.error="Возникла ошибка.<br />"+(r.t0&&r.t0.message?"<small>Дополнительная информация: "+r.t0.message+"</small>":"Попробуйте еще раз.");case 25:case"end":return r.stop()}}),r,null,[[6,19]])})))()},_reset_pw:function(){var t=this;return Object(n.a)(regeneratorRuntime.mark((function r(){var n;return regeneratorRuntime.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:if(!(e.isEmpty(t.user.pwd)||e.isEmpty(t.user.pwd2)||e.isEmpty(t.user.code))){r.next=5;break}return t.valid=!1,t.error="для сброса пароля необходимо заполнить все данные",$('input[name="code"]').trigger("focus"),r.abrupt("return",!1);case 5:if(t.user.pwd===t.user.pwd2){r.next=10;break}return t.valid=!1,t.error="пароли не совпадают",$('input[name="p2"]').trigger("focus"),r.abrupt("return",!1);case 10:return t.sending=!0,r.prev=11,r.next=14,t.$store.dispatch("profile/resetPass",{mode:"newpass",email:t.user.eml,code:t.user.code,password:t.user.pwd});case 14:if(n=r.sent,t.sending=!1,console.log("send pass:",n),!n.success){r.next=23;break}t.alert="success",t.error="Пароль успешно изменен. Вы можете авторизоваться с новым паролем.",setTimeout((function(){t.$router.replace({path:"profile/auth"})}),3e3),r.next=24;break;case 23:throw{message:"Неверный код подтверждения"};case 24:r.next=32;break;case 26:r.prev=26,r.t0=r.catch(11),console.log("ERR on reset:",r.t0),t.sending=!1,t.valid=!1,t.error="Возникла ошибка.<br />"+(r.t0&&r.t0.message?"<small>Дополнительная информация: "+r.t0.message+"</small>":"Попробуйте еще раз.");case 32:case"end":return r.stop()}}),r,null,[[11,26]])})))()},on_forgot:function(t){if(t.preventDefault(),e.isEmpty(this.user.eml))return this.valid=!1,this.error="для регистрации необходимо заполнить все данные",$('input[name="eml"]').trigger("focus"),!1;switch(this.mode){case m:this._get_code();break;case v:this._reset_pw()}return!1}}}}).call(this,r(13))},669:function(e,t,r){var content=r(757);"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,r(9).default)("b68c01c8",content,!0,{sourceMap:!1})},756:function(e,t,r){"use strict";r(669)},757:function(e,t,r){(t=r(8)(!1)).push([e.i,".sk-profile[data-v-7305efd2]{min-height:calc(100vh - 56px);align-content:center;align-items:center;justify-content:center}.sk-profile .v-card__title[data-v-7305efd2]{text-transform:uppercase;font-weight:300}.sk-profile .v-card__actions[data-v-7305efd2]{text-align:center;flex-direction:column;align-items:center;justify-content:center}.sk-profile .v-card__actions .v-btn[data-v-7305efd2]{width:14rem;margin-bottom:1rem}.sk-profile .v-card .v-input svg[data-v-7305efd2]{width:16px;height:16px;color:#bdbdbd}",""]),e.exports=t},794:function(e,t,r){"use strict";r.r(t);var n=r(645).a,o=(r(756),r(29)),l=r(73),d=r.n(l),c=r(579),m=r(108),v=r(167),f=r(80),h=r(624),x=r(601),w=r(625),k=r(784),_=r(584),component=Object(o.a)(n,(function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("v-row",{staticClass:"sk-profile"},[r("v-col",{attrs:{cols:"11",sm:"8",md:"4"}},[e.is("auth")?r("v-form",{attrs:{action:"#"},on:{submit:function(t){return e.on_auth(t)}},model:{value:e.valid,callback:function(t){e.valid=t},expression:"valid"}},[r("v-card",{staticClass:"elevation-2"},[r("v-card-title",[e._v(e._s(e.modName))]),e._v(" "),r("v-card-text",[r("v-text-field",{attrs:{label:"Ваш e-mail",name:"eml",type:"text",required:""},model:{value:e.user.eml,callback:function(t){e.$set(e.user,"eml",t)},expression:"user.eml"}},[r("sk-svg",{attrs:{slot:"prepend",xref:"#ico-morda"},slot:"prepend"})],1),e._v(" "),r("v-text-field",{attrs:{label:"Пароль",name:"p",type:"password",required:""},model:{value:e.user.pwd,callback:function(t){e.$set(e.user,"pwd",t)},expression:"user.pwd"}},[r("sk-svg",{attrs:{slot:"prepend",xref:"#ico-asterisk"},slot:"prepend"})],1),e._v(" "),r("v-alert",{directives:[{name:"show",rawName:"v-show",value:!/^$/.test(e.error),expression:"!/^$/.test(error)"}],staticClass:"my-5",attrs:{color:"warning",dark:""}},[e._v("\n                        "+e._s(e.error)+"\n                    ")])],1),e._v(" "),r("v-card-actions",[r("v-btn",{attrs:{rounded:"",type:"submit",loading:e.sending,dark:"",color:"red darken-4"}},[e._v("Войти")]),e._v(" "),r("v-btn",{staticClass:"ref-register",attrs:{text:"",small:"",to:"/profile/register"}},[e._v("\n                        "+e._s(e.has("user")?"редактировать профиль":"зарегистрироваться")+"\n                    ")]),e._v(" "),r("v-btn",{attrs:{text:"",small:"",to:"/profile/forgot"}},[e._v("забыли пароль?")])],1)],1)],1):e.is("register")?r("v-form",{attrs:{action:"#"},on:{submit:function(t){return e.on_register(t)}},model:{value:e.valid,callback:function(t){e.valid=t},expression:"valid"}},[r("v-card",{staticClass:"elevation-4"},[r("v-card-title",[e._v(e._s(e.modName))]),e._v(" "),r("v-card-text",[r("v-text-field",{attrs:{label:"Имя",name:"u",type:"text",required:""},model:{value:e.user.title,callback:function(t){e.$set(e.user,"title",t)},expression:"user.title"}},[r("sk-svg",{attrs:{slot:"prepend",xref:"#ico-morda"},slot:"prepend"})],1),e._v(" "),r("v-text-field",{attrs:{label:"Пароль",name:"p1",type:"password",required:""},model:{value:e.user.pwd,callback:function(t){e.$set(e.user,"pwd",t)},expression:"user.pwd"}},[r("sk-svg",{attrs:{slot:"prepend",xref:"#ico-asterisk"},slot:"prepend"})],1),e._v(" "),r("v-text-field",{attrs:{label:"Повторите пароль",name:"p2",type:"password",required:""},model:{value:e.user.pwd2,callback:function(t){e.$set(e.user,"pwd2",t)},expression:"user.pwd2"}},[r("sk-svg",{attrs:{slot:"prepend",xref:"#ico-asterisk"},slot:"prepend"})],1),e._v(" "),r("v-text-field",{attrs:{label:"e-mail",name:"eml",type:"text",required:"",rules:e.emailRules},model:{value:e.user.eml,callback:function(t){e.$set(e.user,"eml",t)},expression:"user.eml"}},[r("sk-svg",{attrs:{slot:"prepend",xref:"#ico-at"},slot:"prepend"})],1),e._v(" "),r("v-text-field",{attrs:{label:"Телефон",name:"tel",type:"tel",required:"",rules:e.telRules},model:{value:e.user.tel,callback:function(t){e.$set(e.user,"tel",t)},expression:"user.tel"}},[r("sk-svg",{attrs:{slot:"prepend",xref:"#ico-mobile"},slot:"prepend"})],1),e._v(" "),r("v-switch",{scopedSlots:e._u([{key:"label",fn:function(){return[e._v("Отправляя данную форму, я согласен")]},proxy:!0}]),model:{value:e.user.agree,callback:function(t){e.$set(e.user,"agree",t)},expression:"user.agree"}}),e._v(" "),r("a",{attrs:{href:"//i.xn--80apggkpo6e.xn--p1ai/terms-of-use/",target:"_blank"}},[e._v("с правилами использования данного приложения")]),e._v(" "),r("v-alert",{directives:[{name:"show",rawName:"v-show",value:!/^$/.test(e.error),expression:"!/^$/.test(error)"}],staticClass:"my-5",attrs:{type:"warning"}},[r("div",{domProps:{innerHTML:e._s(e.error)}})])],1),e._v(" "),r("v-card-actions",[r("v-btn",{attrs:{type:"submit",rounded:"",dark:"",color:"red darken-4",loading:e.sending}},[e._v("\n                        "+e._s(e.has("user")?"изменить данные":"зарегистрироваться")+"\n                    ")]),e._v(" "),e.has("user")?e._e():r("v-btn",{staticClass:"ref-auth",attrs:{text:"",small:"",to:"/profile/auth"}},[e._v("авторизоваться")])],1)],1)],1):e.is("forgot")?r("v-form",{attrs:{action:"#"},on:{submit:function(t){return e.on_forgot(t)}}},[r("v-card",{staticClass:"elevation-4"},[r("v-card-title",[e._v(e._s(e.modName))]),e._v(" "),r("v-card-text",[r("v-text-field",{attrs:{label:"e-mail",name:"eml",type:"text",required:"",messages:"Введите e-mail, указанный Вами при регистрации",readonly:e.is("forgotted"),rules:e.emailRules},model:{value:e.user.eml,callback:function(t){e.$set(e.user,"eml",t)},expression:"user.eml"}},[r("sk-svg",{attrs:{slot:"prepend",xref:"#ico-at"},slot:"prepend"})],1),e._v(" "),e.is("reset")?r("div",{staticClass:"mt-3"},[r("v-text-field",{attrs:{label:"код",name:"code",type:"text",required:"",messages:"Введите код, отправленный Вам на e-mail",rules:e.codeRules},model:{value:e.user.code,callback:function(t){e.$set(e.user,"code",t)},expression:"user.code"}},[r("sk-svg",{attrs:{slot:"prepend",xref:"#ico-envel-open"},slot:"prepend"})],1),e._v(" "),r("v-text-field",{attrs:{label:"Пароль",name:"p1",type:"password",required:""},model:{value:e.user.pwd,callback:function(t){e.$set(e.user,"pwd",t)},expression:"user.pwd"}},[r("sk-svg",{attrs:{slot:"prepend",xref:"#ico-asterisk"},slot:"prepend"})],1),e._v(" "),r("v-text-field",{attrs:{label:"Повторите пароль",name:"p2",type:"password",required:""},model:{value:e.user.pwd2,callback:function(t){e.$set(e.user,"pwd2",t)},expression:"user.pwd2"}},[r("sk-svg",{attrs:{slot:"prepend",xref:"#ico-asterisk"},slot:"prepend"})],1)],1):e._e(),e._v(" "),r("v-alert",{directives:[{name:"show",rawName:"v-show",value:!/^$/.test(e.error),expression:"!/^$/.test(error)"}],staticClass:"my-5",attrs:{type:e.alert}},[r("div",{domProps:{innerHTML:e._s(e.error)}})])],1),e._v(" "),r("v-card-actions",[r("v-btn",{attrs:{type:"submit",rounded:"",dark:"",width:"14rem",loading:e.sending,color:"red darken-4"}},[e._v("Сбросить пароль")]),e._v(" "),r("v-btn",{staticClass:"ref-auth",attrs:{text:"",small:"",to:"/profile/auth"}},[e._v("авторизоваться")])],1)],1)],1):e._e()],1)],1)}),[],!1,null,"7305efd2",null);t.default=component.exports;d()(component,{SkSvg:r(92).default}),d()(component,{VAlert:c.a,VBtn:m.a,VCard:v.a,VCardActions:f.a,VCardText:f.b,VCardTitle:f.c,VCol:h.a,VForm:x.a,VRow:w.a,VSwitch:k.a,VTextField:_.a})}}]);