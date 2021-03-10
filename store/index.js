import { eventBus } from '~/utils/eb';

export const state = () => ({
    cards: null,
    stores: null,
    acts: null
});

export const mutations = {
    setStores(state, payload){
        state[!!payload.my ? "cards" : "stores"] = payload.data;
    },   //setStores
    setActions(state, payload){
        state.acts = payload.data;
    }   //setActions
};

export const actions = {
    /**
     * loading my-cards (payload.my = true) or all-stores 
     * reload data by payload.reset
     * calc distance
     */
    async loadStores(store, payload){
        const {state, commit} = store;
        const my = ((!!payload)&&(!!payload.my));
        const fReset = ((!!payload)&&(!!payload.reset));
        const distance = store.rootGetters["geo/distance"];
        const opts = {
            type: 'core-read',
            query: 'sin2:/v:c2d6f08c-974a-4ff8-904a-57dab6b976cb?filter=and(eq(field("sscTenantsAdds.hasAccount"),param(false, "boolean")),eq(field("sscTenantsAdds.isTrader"),param(false, "boolean")))&sort=ssctenants.title'
        };
        if (my){
            opts.query = "sin2:/v:3dee7321-8e0c-4e79-99bb-f8b74a1c13ee?sort=ssctenants.title";
        }
        
        return new Promise((resolve, reject)=>{
            if (!fReset){
                const data = state[my ? "cards" : "stores"];
                if ( (!!data) && (data.length>0) ){
                    resolve(data);
                    return;
                }
            }
            (async ()=>{
                try {
                    var res = await this.$http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    const data = $utils.sin2objA(res.result.columnIndexes, res.result.data);
                    data.map((item)=>{
                        item.my = my;
                        item.distance = distance({lat: item.lat, lon: item.lon});
                    });
                    commit("setStores", {my: my, data: data});
                    resolve(data);
                } catch(e){
                    reject(e);
                }
            })();
        });
    },  //loadStores
    
    /**
     * loading my-cards (payload.my = true) or all-stores 
     * reload data by payload.reset
     */
    async loadActions(store, payload){
        const {state, commit} = store;
        const fReset = ((!!payload)&&(!!payload.reset));
        const opts = {
            type: 'core-read',
            query: 'sin2:/v:c1de84bd-de9a-45cb-b775-5e8b233e25e8'
        };
        return new Promise((resolve, reject)=>{
            if (!fReset){
                if ( (!!state.acts) && (state.acts.length>0) ){
                    resolve(state.acts);
                    return;
                }
            }
            (async ()=>{
                try {
                    var res = await this.$http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    const data = $utils.sin2objA(res.result.columnIndexes, res.result.data);
                    commit("setActions", {data: data});
                    resolve(data);
                } catch(e){
                    reject(e);
                }
            })();
        });
    },   //loadActions
    loadStore(store, payload){
        var opts = {
            type: 'core-read',
            query: 'sin2:/v:c4e208aa-a355-49bf-8c00-4175a9ed5006/?id=' + payload.id
        };
        return new Promise((resolve, reject)=>{
            (async ()=>{
                try {
                    var res = await this.$http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    if (res.result.data.length < 1){
                        throw 'No store by #' + payload.id;
                    }
                    const data = $utils.sin2obj(res.result.columnIndexes, res.result.data[0]);
                    resolve(data);
                } catch(e){
                    reject(e);
                }
            })();
        });
    },  //loadStore
    loadCard(store, payload){
        const opts = {
            type: 'core-read',
            query: 'sin2:/v:3dee7321-8e0c-4e79-99bb-f8b74a1c13ee?filter=eq(field(".id"), param("' + payload.id + '", "id"))'
        };
        
        switch(payload.by){
            case 'store':
            case 'tenant':
                opts.query = 'sin2:/v:3dee7321-8e0c-4e79-99bb-f8b74a1c13ee?filter=eq(field(".tenantId"), param("' + payload.id + '", "id"))';
                break;
        }
        
        const uid = store.rootGetters["profile/get"]("id"); 
        
        return new Promise((resolve, reject)=>{
            (async ()=>{
                try {
                    var res = await this.$http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    if (res.result.data.length > 0){
                        const card = $utils.sin2obj(res.result.columnIndexes, res.result.data[0]);
                        //refresh card bonuces
                        try {
                            var res = await this.$http.post({
                                type: 'api-call',
                                url: '/skidosapi/account',
                                contentType: 'application/json;charset=utf-8',
                                dataType: 'text',
                                data: JSON.stringify({userid: uid, tenantid: card.tenantid}),
                                processData: false
                            });
                            if ( !!res.success ) {
                                console.log('No card bonuces avail');
                            } else {
                                if ( Number(res.balance) > 0 ) {
                                    card.amount = res.balance;
                                }
                            }
                        } catch(e){
                            console.log('Err on refresh account balance:', e);
                        }
                        resolve(card);
                    } else {
                        resolve(null);
                    }
                } catch(e){
                    reject(e);
                }
            })();
        });
    },   //loadCard
    async takeCard(store, payload){
        const id_to_take = $utils.uuidv4();
        const userId = store.rootGetters["profile/id"];
        const params = {
                id: id_to_take,
                userid: userId,
                tenantid: payload.id
        };

        return new Promise((resolve, reject)=>{
            if (!store.rootGetters["profile/is"]("user")){
                reject("no user");
            } else {
                (async ()=>{
                    try {
                        var resp = await this.$http.post({
                            type: 'api-call',
                            url: '/skidosapi/account',
                            dataType: 'text',
                            data: JSON.stringify(params),
                            processData: false
                        });
                        if (!!resp.success) {
                            throw {message: 'no card registered'};
                        } else {
                            console.log(resp);
                            eventBus.$emit('new-store', id_to_take);
                            resolve({id: id_to_take});
                        }        
                    } catch(e) {
                        reject(e);
                    }
                })();
            }
        });
    },   //takeCard
    async loadFills(store, payload){
        const opts = {
                type: 'core-read',
                query: 'sin2:/v:2c697aa3-0ad1-4b0c-85ef-a3b7616167ee?filter=eq(field(".parentId"), param("' + payload.id + '", "id"))'
        };
        const distance = store.rootGetters["geo/distance"];
        return new Promise((resolve, reject)=>{
            (async ()=>{
                try {
                    var res = await this.$http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    const data = $utils.sin2objA(res.result.columnIndexes, res.result.data);
                    data.map((item)=>{
                        item.distance = distance({lat: item.lat, lon: item.lon});
                    });
                    resolve(data);
                }catch(e){
                    reject(e);
                }
            })();
        });
    },
    async loadBanners(store, payload){
        const opts = {
                    type: 'core-read',
                    query: 'sin2:/v:c1de84bd-de9a-45cb-b775-5e8b233e25e8?filter=eq(field(".mainOrgId")'
                           + ',param("' + payload.id + '", "id"))'
        };
        
        return new Promise((resolve, reject)=>{
            (async ()=>{
                try {
                    var res = await this.$http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    const data = $utils.sin2objA(res.result.columnIndexes, res.result.data);
                    resolve(data);
                }catch(e){
                    reject(e);
                }
            })();
        });
    }   //loadBanners
    
};

export const getters = {
    cards: state => {
        if (!(!!state.cards)){
            return [];
        }
        return state.cards;
    }
};