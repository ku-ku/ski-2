var PushController;

import { DISP_MODES } from '@/utils';

export const state = ()=>({
    notifi: {
        fcmId: undefined
    },
    env: undefined,
    dispMode: DISP_MODES.none
});

export const mutations = {
    setEnv(state, payload){
        state.env = payload;
    },
    setPush(state, payload) {
      const {fcmId, value} = payload;
      state.notifi.fcmId = fcmId;
    },
    setDispMode(state, mode){
        state.dispMode = mode;
    }
};  //mutations 

export const actions = {
    async initPushes({getters, commit}){
        const senderId = getters["env"]("pushSndId");
        
        const _p = (resolve, reject) => {
            if (typeof window.PushNotification === 'undefined') {
                reject({error:'No push`s available'});
            } else {
                const opts = {
                    android: {
                        senderID: senderId,
                        forceShow: 'true'
                    },
                    ios: {
                        senderID: senderId,
                        gcmSandbox: 'false',
                        alert: 'true',
                        badge: 'true',
                        sound: 'true'
                    }
                };
                PushController = window.PushNotification.init(opts);
                PushController.on('notification', (data)=>{
                    console.log('PUSH.onNotification', data);
                });
                PushController.on('error', (err)=>{
                    console.log('PUSH.onError', err);
                });
                PushController.on('registration', (data)=>{
                    const {registrationId} = data;
                    commit('setPush', {
                      fcmId: registrationId,
                      value: true
                    });
                    resolve(registrationId);
                });
            }
        };
        
        return new Promise(_p);
    },   //initPushes
    
    destroy({commit}) {
        if (!!PushController) {
            PushController.unregister(function(){
                commit('setPush', {
                    fcmId: undefined,
                    value: false
                });
            }, function(err){
                console.log('PUSH.onUnregisterError', err);
            });
        }
    }
};

export const getters = {
    env: state => q =>{
        return (!!q) ? state.env[q] : state.env;
    }
};