import geo from '@/utils/geo';

const EMPTY_CAT = {
        at: null,
        cats: null,
        items: null
};

export const state = () => ({
    store: null,
    actions: null,
    groups: null,   //actions groups
    banners: null,
    fills: null,
    fill: null,
    catalog: Object.assign({}, EMPTY_CAT),
    prod: null
});

const mutations = {
    //reset's all
    empty(state) {
        state.store  = null;
        state.banners= null;
        state.actions= null;
        state.groups = null;
        state.fills  = null; 
        state.fill   = null;
        state.prod   = null;
        state.catalog= Object.assign({}, EMPTY_CAT);
    },
    setStore(state, payload) {
        state.store  = payload;
        //reset's
        state.banners= null;
        state.actions= null;
        state.groups = null;
        state.fills  = null; 
        state.fill   = null;
        state.prod   = null;
        state.catalog= Object.assign({}, EMPTY_CAT);
    },
    setAdds(state, payload) {
        if (!!payload.actions){
            state.actions = payload.actions;
        } else if (!!payload.groups){
            state.groups = payload.groups;
        } else if (!!payload.banners){
            state.banners = payload.banners;
        } else if (!!payload.fills){
            state.fills = payload.fills;
        } else if (!!payload.fill){
            state.fill  = payload.fill;
        }
    },
    setCatalog(state, payload) {
        if (!(!!state.catalog)){
            state.catalog = Object.assign({}, EMPTY_CAT);
        }
        if (!!payload.cats){
            state.catalog.cats = payload.cats;
        }
        state.catalog.at = new Date();
    },
    setAction(state, prod){
        state.prod = prod;
    },
    setStoreFill(state, payload) {
        state.fill = payload;
    },
    setLatLon(state, ll){
        state.store.lat = ll.lat;
        state.store.lon = ll.lon;
    }
};

const actions = {
    async getFills(store){
        const distFn = store.rootGetters["geo/distance"];
        const current = store.state.fill;
        const p = (resolve, reject) => {
/** TODO:            
            if (    (!!store.state.store)
                 && (!!store.state.fills) ){
                store.state.fills.map((fill, i)=>{
                    fill.current = (!!current) ? (current.id===fill.id) : (i===0);
                });
                resolve(store.state.fills);
            }
   
*/
            if (!!store.state.fills){
                resolve(store.state.fills);
                return;
            }
            const magaz = store.state.store;
            
            (async ()=>{
                try {
                    if (!(!!magaz)){
                        throw {message: "No store avail"};
                    }
                    const opts = {
                        type: 'core-read',
                        query: 'sin2:/v:2c697aa3-0ad1-4b0c-85ef-a3b7616167ee?filter=eq(field(".parentId"), param("' + magaz.id + '", "id"))'
                    };
                    var res = await this.$http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    var fills = $utils.sin2objA(res.result.columnIndexes, res.result.data);
                    fills.map((fil)=>{
                            fil.distance = distFn(fil);
                            fil.address  = geo.a2s(fil.location);
                    });
                    store.commit('setAdds', {fills: fills.sort((_f1, _f2)=>{return (_f1.distance - _f2.distance);})});
                    resolve(store.state.fills);
                } catch(e) {
                    console.log('On fills read:', e);
                    reject(e);
                }
            })();
        };
        
        return new Promise(p);
    },   //getFills
    async getBanners(store){
        return new Promise((resolve, reject)=>{
            if (!!store.state.banners){
                resolve(store.state.banners);
                return;
            }
            const magaz = store.state.store;
            
            (async ()=>{
                try {
                    if (!(!!magaz)){
                        throw {message: "No store avail"};
                    }
                    const opts = {
                                type: 'core-read',
                                query: 'sin2:/v:c1de84bd-de9a-45cb-b775-5e8b233e25e8?filter=eq(field(".mainOrgId")'
                                       + ',param("' + magaz.id + '", "id"))&sort=-userpromotions.startdt'
                    };
                    var res = await this.$http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    var banners = $utils.sin2objA(res.result.columnIndexes, res.result.data);
                    store.commit('setAdds', {banners: banners});
                    resolve(banners);
                }catch(e){
                    reject(e);
                }
            })();
        });
    },   //getBanners(
    async getActions(store){
        return new Promise((resolve, reject)=>{
            if (!!store.state.actions){
                resolve(store.state.actions);
                return;
            }
            const magaz = store.state.store;
            
            (async ()=>{
                try {
                    if (!(!!magaz)){
                        throw {message: "No store avail"};
                    }
                    const opts = {
                                type: 'core-read',
                                query: 'sin2:/v:9d6c4649-cf13-45b6-9b6a-b1af97513204?filter=eq(field(".mainOrgId")'
                                        + ',param("' + magaz.id + '","id"))'
                    };
                    var res = await this.$http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    var acts = $utils.sin2objA(res.result.columnIndexes, res.result.data);
                    acts.map((a)=>{
                        a.num = (!!a.num) ? Number(a.num) : 99999; //for sorting by category
                    });
                    store.commit('setAdds', {actions: acts});

                    //buils action groups
                    var n, _cats = [];
                    acts.map( (a)=>{
                            if ($utils.isEmpty(a.kindid)){return;}
                            n = _cats.filter((c)=>{ return ( c.id === a.kindid); });
                            if (n.length < 1){
                                _cats.push({id: a.kindid, name: a.kindname, n: a.num});
                            }
                    });
                    //set a cat image (first by action)
                    _cats.map((c)=>{
                        acts.filter((a)=>{
                            return ((!!a.promoimage)&&(c.id === a.kindid)); 
                        }).map((a, n)=>{
                                if (n===0){
                                c.img = a.promoimage.id;
                            }
                        });
                    });
                    _cats = _cats.sort((c1, c2)=>{
                        return (c1.n === c2.n) 
                                ? c1.name.localeCompare(c2.name)
                                : c1.n < c2.n ? -1 : 1;
                    });
                    store.commit('setAdds', {groups: _cats});
                    
                    resolve(acts);
                }catch(e){
                    reject(e);
                }
            })();
        });
    },    //getActions
    async getCats(store, parent){
        return new Promise((resolve, reject)=>{
            const magaz = store.state.store;
            
            (async ()=>{
                try {
                    if (!(!!magaz)){
                        throw {message: "No store avail"};
                    }
                    const opts = {
                        type: "core-read",
                        query: 'sin2:/v:e81bbfce-0211-4dd3-81fa-4377955db00a?filter='
                    };
                    if (!!parent){
                        opts.query +='eq(field(".parentId"),param("' + parent.id + '", "id"))';
                    } else {
                        opts.query +='and(eq(field(".tenantId"),param("' + magaz.tenantid + '", "id")),isnull(field(".parentId"))))';
                    }
                    opts.query += '&sort=promoKinds.sortnum,promoKinds.kindname';
                    var res = await this.$http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    var cats = $utils.sin2objA(res.result.columnIndexes, res.result.data);
                    cats.map((o)=>{
                        o.level = (!!parent) ? parent.level + 1 : 0;
                        o.parent = parent;
                        if (o.childcount > 0){
                            o.childs = [];
                            o.loaded = false;   //must child`s load later
                        } else {
                            o.loaded = true;
                        }
                    });
                    if (!!parent){
                        parent.childs = cats;
                        parent.loaded = true;
                    }
                    
                    
                    if (!(!!parent)){
                        //TODO: all lvl
                        store.commit('setCatalog', {cats: cats});
                    }
                    resolve(cats);
                }catch(e){
                    reject(e);
                }
            })();
        });
    },     //getCategs
    async getProd(store, payload){
        return new Promise((resolve, reject)=>{
            var magaz = store.state.store;
            
            (async ()=>{
                try {
                    const opts = {
                        type: "core-read",
                        query: 'sin2:/v:286cf6de-309f-4eba-b335-25a46591463b?filter=eq(field(".nameId"),param("' + payload.id + '", "id"))'
                    };
                    var res = await this.$http.post(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    if (res.result.data.length < 1){
                        throw {message: 'No prod by #' + payload.id};
                    }
                    var p = $utils.sin2obj(res.result.columnIndexes, res.result.data[0]);
                    if (!(!!magaz)){
                        magaz = await store.dispatch("loadStore", {id: p.tenantid}, {root:true});
                        store.commit("setStore", magaz);
                    }
                    resolve(p);
                }catch(e){
                    reject(e);
                }
            })();
        });
    },       //getProd
    async getLatLon(store){
        return new Promise((resolve, reject)=>{
            const magaz = store.state.store;
            if (!(!!magaz)){
                reject('no active store');
                return;
            }
            if ((!!magaz.lat)&&(!!magaz.lon)){
                resolve({lat: magaz.lat, lon: magaz.lon});
            } else {
                if (!!magaz.location){
                    const distFn = store.rootGetters["geo/distance"];
                    (async ()=>{
                        try {
                            var data = await geo.lookup(magaz.location);
                            console.log('geo data', data);
                            if (data.length > 0){
                                const ll = data
                                            .map((d)=>{d.distance = distFn(d); return d;})
                                            .sort((d1,d2)=>{ return d1.distance - d2.distance;})[0];
                                console.log('coords', ll);
                                store.commit("setLatLon", ll);
                                resolve(ll);
                            } else {
                                throw {message: 'no coords'};
                            }
                        } catch(e){
                            reject(e);
                        }
                    })();
                } else {
                    reject('no store location');
                }
            }
        });
    }
};       //actions

const getters = {
    hasActiveStore(state){
        return (!!state.store) && !$utils.isEmpty(state.store.id);
    },
    hasActiveStoreFills(state){
        if ((!!state.store) && !$utils.isEmpty(state.store.id)) {
            return (!!state.store.pointscount) && (Number(state.store.pointscount)>0);
        }
        return false;
    },
    hasActiveAction(state){
        return (!!state.action) && !$utils.isEmpty(state.action.id);
    },
    brand: state => q =>{
        switch(q){
            case "color":
                return (!!state.store)&&(!!state.store.brandcolor) ? state.store.brandcolor : "#78909C";
                break;
            case "ava":
                return (!!state.store)&&(!!state.store.brandavatar) 
                        ? ski.$http.env.rpcUrl + '/static/model/view/' + state.store.brandavatar.id
                        : "/my-logo.png";
                    
        }
    }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};