const $moment = require('moment');

import { MODES } from '~/utils';

const state = () => ({
    at:    new Date(),  //for watch changes
    order: null,        //num-order
    error: null,
    confirmClear: false,
    processing: MODES.none,
    basket: {
        prods: []
    }
});

const mutations = {
    fix(state, basket){
        state.at = new Date();
        state.basket = basket;
        //resetting
        state.error = null;
        state.order = null;
        state.confirmClear = false;
        state.processing = MODES.none;
    },
    add(state, prod){
        const { basket } = state;
        var found = false;
        basket.prods.map((p)=>{
            if (p.id===prod.id) {
                found = true;
                p.num   = prod.num;
                p.total = prod.total;
                p.self  = prod.self;
                p.note  = prod.note;
            }
        });
        if (!found){
            basket.prods.push(prod);
        }
        state.at = new Date();
        state.error = null;
        state.processing = MODES.none;
        
    },
    rm(state, prod){
        if ( (!state.basket)
           ||(!state.basket.prods)){
           return;
        }
        var i = 0,
            basket = state.basket;
        
        while (i < basket.prods.length) {
            if(basket.prods[i].id === prod.id) {
                basket.prods.splice(i, 1);
                break;
            } else {
                ++i;
            }
        }
    },
    complete(state, n){
        state.at     = new Date();
        state.error  = null;
        state.order  = n;
        state.basket = {prods:[]};
        state.processing = MODES.success;
    },
    error(state, e){
        state.at    = new Date();
        state.error = e;
        state.processing = (!!e) 
                            ? MODES.error 
                            : (!!state.basket) && (state.basket.length>0) ? MODES.default : MODES.none;
    },
    confirm(state, mode){
        if (mode==='clear'){
            state.confirmClear = true;
        } else {    //TODO: for others
            
        }
    },
    ordering(state, order){
        state.at     = new Date();
        state.error  = null;
        state.order  = order;
        state.processing = MODES.payment;
    },
    processing(state, mode){
        state.processing = mode;
    }
};

const actions = {
    add({ commit, state },  payload) {
        var basket = state.basket;
        if (!(!!basket)){
            basket = { };
        }
        if (!(!!basket.prods)){
            basket.prods = [];
        }
        commit('fix', basket);
        commit('add', payload);
    },
    rm({ commit },  payload){
        commit('rm', payload);
    },
    clear({commit}) {
        commit('fix',  {prods:[]});
        commit('processing', MODES.none);
    },
    save(store){
        console.log('saving: ', store);
        const http = this.$http;
        const { commit, state } = store;
        const { basket } = state;
        const { user } = store.rootState.profile;
        const userId = user.id;
        const isUser = store.rootGetters["profile/is"]("user");
        
        console.log('saving for #userId: ' + userId, basket);
        if ((!!basket)&&(!!basket.prods)&&(basket.prods.length>0)){
            commit('processing', MODES.saving);
            
            
            var b = {
                "userid": userId,
                "pay":    (!!user.adds)&&(!!user.adds.pay),
                "goods" : []
            };
            var total = 0;
            basket.prods.map( (p)=>{
                b.tenantid = p.store.id;
                b.goods.push({
                    "productid": p.id,
                    "amount":    p.num,
                    "opersum":   p.total,
                    "note":      p.note,
                    "self":      p.self,
                    "delivarydate": $moment($moment.now()).format('YYYY-MM-DD HH:mm:ss')
                });
                total += p.total;
            });
              
            const opts = {
                type: 'query',
                query: '793a6cc2-b8f8-42bf-9936-dc8e0f2401c1.regOrder',
                params: {order: JSON.stringify(b)}
            };
            return new Promise( (resolve, reject)=>{
                (async ()=>{ 
                    try {
                        if (!isUser){
                            throw {message: "no user"};  //TODO: for anonymous
                        }
                        var res = await http.post(opts);
                        console.log('ORDER: ', res);
                        if (!!res.result){
                            const order = {
                                            n: res.result.data[0][0],
                                            id: res.result.data[0][1],
                                            total: total,
                                            name: user.name
                            };
                            if (!!user.adds){
                                order.tel = user.adds.phone;
                                order.email = user.adds.email;
                            }
                            
                            if ((!!user.adds)&&(!!user.adds.pay)){
                                order.pay = true;
                                order.payLink = await http.post({
                                    url: '/skidosapi/pay',
                                    type: 'api-call',
                                    method: "POST",
                                    processData: false,
                                    contentType: 'application/json;charset=utf-8',
                                    dataType: 'text',
                                    data: JSON.stringify(order)
                                });
                                commit('ordering', order);
                            } else {
                                commit('complete', order);
                            }
                            resolve(order);
                        } else {
                            throw res.error || {message: 'unknown error'};
                        }
                    }catch(e){
                        commit('error', e);
                        reject(e);
                    }
                })();
            } );
        } else {
            console.log('Don`t save: empty basket');
        }
    }   //save
};

const getters = {
    numof({basket}){
        if ((!!basket)&&(!!basket.prods)){
            return basket.prods.length;
        }
        return 0;
    },
    total({basket}){
        var _t = 0;
        if ((!!basket)&&(!!basket.prods)) {
            basket.prods.map((p)=>{
                _t += p.total;
            });
        }
        return _t;
    },
    has(state){
        return (id) => {
            var found = ((!!state.basket)&&(!!state.basket.prods)) 
                ? state.basket.prods.filter((p)=>{
                    return (p.id===id) 
                        || ((!!p.store)&&(p.store.id===id));
                })
                : [];
            return found.length;
        };
    },
    basket(state){
        return (storeId) => {
            return ((!!state.basket)&&(!!state.basket.prods)) 
                ? state.basket.prods.filter((p)=>{
                    return (p.store.id===storeId);
                })
                : [];
        };
    },
    self(state){
        return (storeId) => {
            var prods = ((!!state.basket)&&(!!state.basket.prods)) 
                            ? state.basket.prods.filter((p)=>{
                                return (p.store.id===storeId)&&(!!p.self);
                              })
                            : [];
            return prods.length > 0;
        };
    },
    at(state){
        return state.at;
    }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
