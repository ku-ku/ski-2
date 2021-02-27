import geo from '@/utils/geo';

const API_URL = 'http://api.ipstack.com/';
const API_KEY = '739747a9f6f716d960608c3ee375b337';

export const state = ()=>({
    ll: {
        fine: false,    //false by geo-ip | true-by GPS
        lat: 45.035470, //Krd-center (city-sq)
        lon: 38.975313
    },
    addr: null,         //string address
    last: new Date()
});

export const mutations = {
    setPos(state, payload = {}) {
        state.ll = payload;
        state.last = new Date();
        state.addr = null;
    },
    setAddr(state, payload = {}) {
        state.addr = payload;
    }
};

export const actions = {
    addr(store){
        geo.addr(store.state.ll).then((data)=>{
            store.commit('setAddr', data);
        });
    },
    current(store){
        var ll = {};
        
        const p = (resolve, reject) => {
            const _by_ip = function(){
                $.getJSON(API_URL + 'check?access_key=' + API_KEY, (data)=>{
                    console.log('GEO by ip:', data);
                    ll = {
                        fine: false,
                        lat: data.latitude,
                        lon: data.longitude
                    };
                    store.commit('setPos', ll);
                    store.dispatch('addr');
                    resolve(ll);
                }).fail((err)=>{
                    console.log('by ip error:', err );
                    reject(err);
                });
            };
            if (!!navigator.geolocation){
                var hTm = setTimeout(_by_ip, 5050);
                navigator.geolocation.getCurrentPosition(function(pos){
                        console.log('GEO by geolocation (fine):', pos.coords);
                        ll = {
                            fine: true,
                            lat: pos.coords.latitude,
                            lon: pos.coords.longitude
                        };
                        clearTimeout(hTm);
                        store.commit('setPos', ll);
                        store.dispatch('addr');
                        resolve(ll);
                    }, 
                    function(err){
                        clearTimeout(hTm);
                        console.log('GEO ERR by geolocation:', err);
                        _by_ip();
                    },
                    {maximumAge: 180000, timeout: 5000, enableHighAccuracy: true}
                );
            } else {
                _by_ip();
            }
        };
        
        return new Promise(p);
    }
};

export const getters = {
    distance: state => ll => {
            return geo.distance(state.ll, ll);
    },
    city: state => {
        if ((!!state.addr)&&(state.addr.address)){
            return state.addr.address.city || '';
        }
        return '';
    }
};
