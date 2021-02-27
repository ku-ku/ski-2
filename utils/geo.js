function a2s(a){
    var _a = [];
    if (!!a){
        if (!!a.city){
            _a.push(a.city.name);
        }
        if (!!a.street){
            _a.push(a.street.name);
        }
        if (!!a.number){
            _a.push(a.number);
        }
    }
    return _a.join(', ');
}

function lookup(a){
    const p = (resolve, reject) => {
        if (!a){
            reject('no-addr');
        }
        const params = (withNum)=>{
            const _params = new URLSearchParams();
            _params.append('country', 'Россия');
            if (!!a.city){
                _params.append('city', a.city.name);
            }
            if (!!a.street){
                _params.append('street', a.street.name);
                if ((!!a.number)&&(withNum)){
                    _params.set('street', a.street.name + ' ' + a.number);
                }
            }
            _params.append('format', 'json');
            _params.append('limit', '3');
            return _params.toString();
        };
        
        $.getJSON('https://nominatim.openstreetmap.org/search?' + params(true), {timeout:5000})
            .then((data)=>{resolve(data);})
            .catch(()=>{
                $.getJSON('https://nominatim.openstreetmap.org/search?' + params(false), {timeout:5000})
                    .then((data)=>{resolve(data);})
                    .catch(()=>{reject('no-addr searching:' + params(false));});
        });
    };
    return new Promise(p);
}   //lookup

function addr(ll){
    if (!!ll){
        return $.getJSON('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + ll.lat + '&lon=' + ll.lon + '&zoom=18&addressdetails=1');
    } else {
        return new Promise((resolve, reject) => {
            reject('no-coords');
        });
    }
}   //addr

function distance(ll1, ll2){
    //радиус Земли
    const R = 6372795;
    if (  
            (!ll1) 
         || (!ll2)
         || !(!!ll1.lat) 
         || !(!!ll2.lat) 
        ){
        return R;
    }
    //перевод коордитат в радианы
    var lat1 = ll1.lat * Math.PI / 180,
        lat2 = ll2.lat * Math.PI / 180,
        long1 = ll1.lon * Math.PI / 180,
        long2 = ll2.lon * Math.PI / 180;
        //вычисление косинусов и синусов широт и разницы долгот
    var cl1 = Math.cos(lat1);
    var cl2 = Math.cos(lat2);
    var sl1 = Math.sin(lat1);
    var sl2 = Math.sin(lat2);
    var delta = long2 - long1;
    var cdelta = Math.cos(delta);
    var sdelta = Math.sin(delta);
    //вычисления длины большого круга
    var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));
    var x = sl1 * sl2 + cl1 * cl2 * cdelta;
    var ad = Math.atan2(y, x);
    var dist = ad * R; //расстояние между двумя координатами в метрах
    return Math.round(dist);
}   //distance

export default{
    a2s,
    addr,
    distance,
    lookup
}