const KNOWN_ROLES = {
    "anonymous": "e7f9e9ab-4d83-4b5d-9ede-0910e8d4644e"
};

const USER_DEFS = {
    id: null,
    login: null,
    password: null,
    name: '',
    isAuthenticated: false,
    isAnonymous: true,
    adds: null,
    addrs: null,
    roles: {}
};

export const state = ()=>({
    user: $utils.lsRead('auth') || USER_DEFS,
    lastAccess: null
});

export const mutations = {
  setFlag(state, payload) {
      state.user.isAuthenticated = payload.isAuthenticated;
  },
  setSubject(state, payload) {
        const user = {
            id: payload.id,
            tenantId: payload.tenantId,
            login: payload.name,
            name: payload.title,
            isAuthenticated: true,
            roles: payload.roles
        };
        if (!!payload.roles){
            user.isAnonymous = Object.keys(payload.roles).filter((r)=>{return r===KNOWN_ROLES.anonymous;}).length > 0;
        } else {
            user.isAnonymous = true;
        }
        state.user = user;
        state.lastAccess = new Date();
        window["ski"].onUser(user);
    
        if (!user.isAnonymous){
            //clone & local saving
            var _user = Object.assign({
                password: $utils.utf8ToB64(payload.password),                
            }, user);
            delete _user.roles;
            delete _user.tenantId;
            delete _user.isAuthenticated;
            $utils.lsSave('auth', _user);
        }
    },
    
    /**
     * set additional form db
     */
    setAdds: function(state, adds){
        state.user.adds = adds;
        state.lastAccess = new Date();
    },
    /**
     * set additional form db
     */
     setAddrs: function(state, addrs){
        state.user.addrs = addrs;
    },   
    /**
     * set additional info form payment`s | profile saving
     */
    setUserInfo: function(state, info){
        state.user.name = info.name;
        if (typeof state.user.adds === "undefined"){
            state.user.adds = {};
        }
        state.user.adds.phone = info.phone;
        state.user.adds.self  = info.self;
        state.user.adds.pay   = info.pay;
        if (!$utils.isEmpty(info.title)){
            state.user.name = info.title;  //rewrite
        }
        if (!$utils.isEmpty(info.email)){
            state.user.adds.email = info.email;
        }
        if (!$utils.isEmpty(info.phone)){
            state.user.adds.phone = info.phone;
        }
        if (!$utils.isEmpty(info.addrstring)){
            state.user.adds.addrstring = info.addrstring;
        }
        state.lastAccess = new Date();
    },
    removeCredentials(state) {
        state.user = USER_DEFS;
        $utils.lsDel('auth');
    }
};

export const actions = {
    async login(store, payload) {
        const { user } = payload,
              http = this.$http;
      
        return new Promise( (resolve, reject) => {
            const opts = {
                        type: 'auth',
                        basicAuth: 'Basic ' + btoa(user.login + ':' + user.password)
            };
            (async ()=>{
                try { await store.dispatch('logout'); }catch(e){}
                
                try {
                    const res = await http.post(opts);
                    console.log('login', res);
                    if (!!res.error) {
                        throw res.error;
                    }
                    res.result.password = user.password;  //for local saving
                    store.commit('setSubject', res.result);
                    await store.dispatch('readAdds', res.result.id);
                    await store.dispatch('readAddrs', res.result.id);
                    resolve(res);
                } catch(e){
                    console.log('ERR on login:', e);
                    store.commit('removeCredentials');
                    reject(e);
                }
            })();
        });
  },    //login
  readAdds(store, payload){
        const uid = payload;
        const opts = {
              type: 'core-read',
              query: 'sin2:/v:b841fde1-394a-4ab1-8ca7-48446f58c27e?id=' + uid
                      + '&fields=sscusersadds.addrstring,sscusersadds.email,sscusersadds.phone,sscusersadds.istrader'
        },
        http = this.$http,
        p = (resolve, reject)=>{
            (async ()=>{
                try {
                    var res = await http.post(opts);
                    if ( (!!res.result) && (res.result.data.length>0) ){
                        var adds = $utils.sin2obj(res.result.columnIndexes, res.result.data[0]);
                        store.commit('setAdds', adds);
                        resolve(adds);
                    } else {
                        throw 'No user adds #' + uid;
                    }
                }catch(e){
                    console.log('ERR on user', e);
                    reject(e);
                }
            })();
        };
        
        return new Promise(p);
  },    //readAdds
    readAddrs(store, payload){
        const uid = payload;
        const opts = {
            type: 'core-read',
            query: `sin2:/v:f290ffca-3e81-4a26-97fc-415d3eec3672?filter=eq(field(".userID"),param("${ uid }", "id"))`
        },
        http = this.$http,
        p = (resolve, reject)=>{
            (async ()=>{
                try {
                    var res = await http.post(opts);
                    if ( (!!res.result) && (res.result.data.length>0) ){
                        addrs = $utils.sin2objA(res.result.columnIndexes, res.result.data);
                        store.commit('setAddrs', addrs);
                    }
                }catch(e){
                    console.log('ERR on user', e);
                    reject(e);
                }
            })();
            resolve(addrs);
        };        
        var addrs = [];
        return new Promise(p);
    },    //readAddrs
  check: function(store, payload) {
    const { state } = store,
          http = this.$http;
  
    var pwd = '';
    
    const promise = (resolve, reject) => {
        const anon = "my-anonymous";
        const user = Object.assign(payload || {}, state.user);
        if ($utils.isEmpty(user.login) || 
            $utils.isEmpty(user.password)) {
            user.login = anon;
            pwd = "AC0DB0A3E3030E21E050007F01013DB8";
            console.log('Auth: using anonymous access');
        } else {
            pwd = $utils.b64ToUtf8(user.password);
        }
        
        const opts = {
            type: 'auth',
            basicAuth: 'Basic ' + btoa(user.login + ':' + pwd)
        };
        http.post(opts).then((res)=>{
            if ((res)&&(res.result)){
                res.result.password = pwd;
                store.commit('setSubject', res.result);
                if (anon!==user.login){
                    store.dispatch('readAdds', res.result.id);
                    store.dispatch('readAddrs', res.result.id);
                }
                resolve(res);
            } else {
                reject(res.error);
            }
        }).catch((err)=>{
            reject(err);
        });
        };
        return new Promise(promise);
    },
    async register({dispatch}, payload){
        const http = this.$http,
              opts = {
                        type: 'api-call',
                        url: '/skidosapi/reg-user',
                        dataType:'json',
                        method: 'POST',
                        contentType:'application/json;charset=utf-8',
                        data: JSON.stringify({client: payload})
                };
        return new Promise((resolve, reject)=>{
            (async ()=>{
                try {
                    var res = await http.post(opts);
                    if (!$utils.isEmpty(res.id)&&("null"!==res.id)){
                        //Don`t: res = await dispatch('login', {user: {login: payload.name, password: payload.password }});
                        resolve(res);
                    } else {
                        if ( ("1"==res.res) || ("2"==res.res)) {
                            throw {message:'пользователь уже существует'};
                        } else if ("3"==res.res) {
                            throw {message:'пользователь с таким телефоном уже существует'};
                        } else {
                            throw (res.error) ? res.error : res.res;
                        }
                    }
                } catch(e){
                    reject(e);
                }
            })();
        });
    },      //register
    async resetPass(store, payload){
        const http = this.$http,
              opts = {
                        type: 'api-call',
                        url: '/reset-pass',
                        dataType:'json',
                        method: 'POST',
                        contentType:'application/json;charset=utf-8',
                        data: JSON.stringify(payload)
                };
        return new Promise((resolve, reject)=>{
            (async ()=>{
                try {
                    var res = await http.post(opts);
                    resolve(res);
                } catch(e){
                    reject(e);
                }
            })();
        });
    },  //resetPass
    async saveShopper(store, payload){
        const {commit} = store;
        const http = this.$http,
              opts = {
                        type: 'api-call',
                        url: '/skidosapi/reg-user',
                        dataType:'json',
                        method: 'POST',
                        contentType:'application/json;charset=utf-8',
                        data: JSON.stringify({client: {
                                "id":         store.getters["get"]("id"),
                                "title":      payload.name,
                                "phone":      payload.phone
                        }})
                };
        commit('setUserInfo', payload);
        return new Promise((resolve, reject) => {
            if (!store.getters["is"]("user")){
                resolve();
            }
            (async ()=>{
                try {
                    var res = await http.post(opts);
                    resolve(res);
                } catch(e){
                    reject(e);
                }
            })();
        });
    },  //saveShopper
    async logout({ commit }){
        const http = this.$http;
        return new Promise((resolve, reject) => {
            http.post({type: 'logout'}).always(()=>{
                try {
                    document.cookie = 'JSESSIONID=;expires=Thu, 01 Jan 1970 00:00:01 GMT';
                }catch(e){
                }
                commit('removeCredentials');
                resolve();
            });
        });
    }
};

export const getters = {
  isAuthenticated(state){
    return (!!state.user) ? state.user.isAuthenticated : false;
  },
  isAnonymous(state){
      return (!!state.user) ? state.user.isAnonymous : true;
  },
  id(state){
      return state.user.id;
  },
  login(state){
    console.log('login is depricated, using get...');
    return $utils.isEmpty(state.user.login) ? '' : state.user.login;
  },
  name(state){
    console.log('name is depricated, using get...');
    return $utils.isEmpty(state.user.name) ? '' : state.user.name;
  },
  get: state => q =>{
      switch(q){
          case "id": 
            return state.user.id;
          case "login":
            return $utils.isEmpty(state.user.login) ? '' : state.user.login;
          case "name":
              return $utils.isEmpty(state.user.name) ? '' : state.user.name;
          default:
              return "";
      }
  },
  is: state => q => {
    switch(q){
        case "authenticated":
            return (!!state.user) ? state.user.isAuthenticated : false;
        case "anonymous":
            return (!!state.user) ? state.user.isAnonymous : true;
        case "user":
            return (!!state.user) && !state.user.isAnonymous;
        case "trader":
            return ((!!state.user.adds)&&(!!state.user.adds.istrader));
        default:
            return false;
    }
    return false;
  }
};

