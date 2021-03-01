const $moment = require('moment');

import {
    read as lsRead,
    write as lsSave,
    del as lsDel
} from './localStorage';

const MODES = {
    "none":    0,
    "default": 1,
    "loading": 2,
    "saving":  3,
    "success": 4,
    "payment": 5,
    "error": 9
};

const DISP_MODES = {
    "none": 0,
    "list": 1,
    "cards": 2
};

/* modes for store view */
const ST_MODES = {
    "none": -1,
    "def":   0, /* actions */
    "qr" :   1,
    "info":  2,
    "fils":  3,
    "find":  4,
    "share": 5,
    "chat":  6
};


/**
 * @param {Sting} val
 * @return {Boolean}
 */
function isEmpty(val) {
    if (!!val){
        return /^$/.test(val);
    }
    return true;
}


function tod(){
    var s, h = (new Date()).getHours();
    if (((h >= 21)&&(h<24)) || ((h >= 0)&&(h<5))){
        s = 'Доброй ночи';
    } else if ((h>=5) && (h<12)){
        s = 'Доброго утра';
    } else if ((h>=12) && (h<18)){
        s = 'Доброго дня';
    } else if ((h>=18) && (h<21)){
        s = 'Доброго вечера';
    }
    return s;
}   //tod



/**
 * @param {String} value
 * @param {Number} size
 * @return {String}
 */
function setPadding(value, size) {
  let s = String(value);
  while (s.length < (size || 2)) {
    s = `0${s}`;
  }
  return s;
}

/**
 * @param {Number|String|Date} d
 * @param {String} format
 * @return {String}
 */
function formatDate(d, format) {
  d = new Date(d) || new Date();
  return $moment(d).format(format || 'DD.MM.YYYY');
}

/**
 * Convert address Object->String
 * @param {Object} address
 * @return {String}
 */
function formatAddress(address, cityOnly) {
    var _a = [];
    if (!!address){
        if (!!address.city){
            _a.push(address.city.name);
        }
        if (!(!!cityOnly)){
            if (!!address.street){
                _a.push(address.street.name);
            }
            if (!!address.number){
                _a.push(address.number);
            }
        }
    }
    return _a.join(', ');
}

function short(s){
    var res, n = s.indexOf(' ');
    if ( n > 0 ){
        res = s.charAt(0) + s.charAt(n + 1);
    } else if (s.length > 2){
        res = s.substr(0, 2);
    } else {
        res = s;
    }
    return res.toUpperCase();
}

/**
 * Convert object to encode body for 'application/x-www-form-urlencoded'
 * request
 * @param {Object} obj
 * @return {String}
 */
function encode(obj) {
  /**
   * Transform array function
   * @param {String} key
   * @return {String}
   */
  function transform(key) {
    return `${ encodeURIComponent(key) }=${ encodeURIComponent(obj[key]) }`;
  }

  const keys = Object.keys(obj);
  const array = keys.map(transform);

  return array.join('&');
}

/**
 * Convert utf8 to base64
 * @param {String} str
 * @return {String}
 */
function utf8ToB64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

/**
 * Convert base64 to utf64
 * @param {String} str
 * @return {String}
 */
function b64ToUtf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function sin2obj(cols, data){
    const keys = Object.keys(cols) || [];
    var s, n, o = {};
    keys.map((key)=>{
            n = /^(_sec_attrs\.\w)+/.test(key) ? -1 : key.lastIndexOf('.');
            s = (n < 0) ? key : key.substr(n + 1);
            if (!o.hasOwnProperty(s)){  //don`t rewrite existing
                o[s] = data[cols[key]];
            }
    });
    return o;
}   //sin2obj

function sin2objA(cols, data){
    var res = [];
    data.map((item)=>{ res.push(sin2obj(cols, item)); });
    return res;
}   //sin2objA


export {
    MODES,
    DISP_MODES,
    ST_MODES,
    isEmpty,
    tod,
    formatDate,
    formatAddress,
    short,
    encode,
    utf8ToB64,
    b64ToUtf8,
    uuidv4,
    sin2obj,
    sin2objA,
    lsRead,
    lsSave,
    lsDel,
    $moment
};
