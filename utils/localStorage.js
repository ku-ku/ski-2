/**
 * Read data from localStorage
 * @param {String} itemName
 * @param {String} key
 * @return {*}
 */
export function read(itemName, key) {
    var res = null, 
        item = window.localStorage.getItem(itemName);
    try {
        item = JSON.parse(item);
        if (!!item) {
            res =  (!!key) ? item[key] : item;
        }
    }catch(e){
    }
    return res;
}

/**
 * Write data to localStorage
 * @param {String} itemName
 * @param {Object} obj
 */
export function write(itemName, obj) {
  let item = window.localStorage.getItem(itemName);

  item = JSON.parse(item);

  if (item) {
    Object.assign(item, obj);
  } else {
    item = obj;
  }

  window.localStorage.setItem(itemName, JSON.stringify(item));
}


export function del(itemName) {
  window.localStorage.removeItem(itemName);
}
