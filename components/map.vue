<template>
    <div class="sk-map fill-height" id="sk-map"></div>
</template>
<script>
    /* global mapboxgl*/
    //import MapBoxGL from 'mapbox-gl';
    import {eventBus} from '~/utils/eb';
    const pointImage = new Image();
    pointImage.src = require('~/assets/imgs/map-marker.png');
    const pointImageBlue = new Image();
    pointImageBlue.src = require('~/assets/imgs/map-marker-blue.png');
    
    var map;    //global
    
    class pulsingDot {
        static get size(){
            return 200;
        }
        constructor(map){
            this.map = map;
            this.width = pulsingDot.size;
            this.height= pulsingDot.size;
            this.data = new Uint8Array(this.width * this.height * 4);
        }
        onAdd() {
            var canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
        }
        render() {
            var duration = 1500;
            var t = (performance.now() % duration) / duration;

            var radius = (pulsingDot.size / 2) * 0.3;
            var outerRadius = (pulsingDot.size / 2) * 0.7 * t + radius;
            var context = this.context;

            // draw outer circle
            context.clearRect(0, 0, this.width, this.height);
            context.beginPath();
            context.arc(
                    this.width / 2,
                    this.height / 2,
                    outerRadius,
                    0,
                    Math.PI * 2
            );
            context.fillStyle = 'rgba(240, 120, 120,' + (1 - t) + ')';
            context.fill();

            // draw inner circle
            context.beginPath();
            context.arc(
                    this.width / 2,
                    this.height / 2,
                    radius,
                    0,
                    Math.PI * 2
            );
            context.fillStyle = 'rgba(240, 120, 120, 1)';
            context.strokeStyle = 'white';
            context.lineWidth = 2 + 4 * (1 - t);
            context.fill();
            context.stroke();

            // update this image's data with data from the canvas
            this.data = context.getImageData(0, 0, this.width, this.height).data;
            // continuously repaint the map, resulting in the smooth animation of the dot
            this.map.triggerRepaint();
            return true;
        }   //render
    }      //pulsingDot
    
    export default {
        name: 'SkMap',
        props: {
            center: {
                type: Object,   /*shop object*/
                required: true
            }
        },
        data(){
            return {
            };
        },
        created(){
            eventBus.$on('resize', ()=>{
                if (!!map){
                    map.resize();
                }
            });
        },
        mounted(){
            this.$nextTick(()=>{
                this.mapInit();
            });
        },
        beforeDestroy(){
            if (!!map){
                map.remove();
                map = null;
            }
        },
        watch: {
            center(o){
                this.toCenter(o);
            }   //center
        },
        methods: {
            toCenter(o){
                if ((!!map)&&(!!o.lon)&&(!!o.lat)){
                    const coords = [o.lon, o.lat];
                    map.setCenter(coords);
                    var src = map.getSource('points');
                    if (!!src){
                        src.setData({type: 'FeatureCollection',
                                     features: [{
                                                    type: 'Feature', 
                                                    geometry: {'type': 'Point','coordinates': coords},
                                                    properties: {
                                                        n: 0,
                                                        id: o.id,
                                                        shop: o,
                                                        current: o.current
                                                    }
                                                }]
                        });
                    }
                }
            },
            mapInit(){
                const self = this,
                      coords = ((!!this.center) && (!!this.center.lon) && (!!this.center.lat))
                                ? [this.center.lon, this.center.lat]
                                : [this.$store.state.geo.ll.lon, this.$store.state.geo.ll.lat];
                mapboxgl.accessToken = 'pk.eyJ1IjoidGhlbGl4IiwiYSI6ImNrYXRoNWc3MjB0ZnkzN29jcHkydjd1NmUifQ.5y-ik3c3U5eGPV_mW7zxaw';
                map = new mapboxgl.Map({
                    container: $(self.$el).get(0),
                    style: 'mapbox://styles/thelix/ckathyj992krv1ins0b3ucdrm',
                    center: coords,
                    zoom: 14,
                    maxZoom: 18,
                    pitchWithRotate: false,
                    antialias: true
                });
                $('.mapboxgl-ctrl-bottom-left').css({display:'none'});
                map.on('load', function(){
                    console.log('MAP LOADED!', map);
                    var nav = new mapboxgl.NavigationControl({showCompass:false,showZoom:true,visualizePitch:false});
                    map.addControl(nav, 'top-right');
                    if (!map.hasImage('store-point')){
                        map.addImage('store-point', pointImage);
                    }
                    if (!map.hasImage('store-point-blue')){
                        map.addImage('store-point-blue', pointImageBlue);
                    }
                    if (!map.hasImage('pulsing')){
                        var pd = new pulsingDot(map);
                        map.addImage('pulsing', pd, { pixelRatio: 2 });
                    }
                    if (!map.getSource('points')){
                        map.addSource('points', {
                                'type': 'geojson',
                                'data': {
                                    'type': 'FeatureCollection',
                                    'features': []
                        }});    //map.addSource('point'...
                    }
                    if (!map.getLayer('pulsing')){
                        map.addLayer({
                                'id': 'pulsing',
                                'type': 'symbol',
                                'source': 'points',
                                'layout': {
                                    'icon-image': 'pulsing',
                                    'icon-anchor': 'top',
                                    'icon-allow-overlap': true,
                                    'icon-offset': [0, -54]
                                },
                                'filter': ['==', ['boolean', ['get', 'current']], true]
                        });
                    }
                    
                    if (!map.getLayer('center')){
                        map.addLayer({
                                'id': 'center',
                                'type': 'symbol',
                                'source': 'points',
                                'layout': {
                                    'icon-image': 'store-point',
                                    'icon-size': 0.15,
                                    'icon-anchor': 'bottom',
                                    'icon-allow-overlap': true
                                },
                                'filter': ['==', ['number', ['get', 'n']], 0]
                        });
                    }
                    if (!map.getLayer('others')){
                        map.addLayer({
                                'id': 'others',
                                'type': 'symbol',
                                'source': 'points',
                                'layout': {
                                    'icon-image': 'store-point-blue',
                                    'icon-size': 0.15,
                                    'icon-anchor': 'bottom',
                                    'icon-allow-overlap': true
                                },
                                'filter': ['>', ['number', ['get', 'n']], 0]
                        });
                    }
                    const _go_shop = function(e){
                        const f = e.features[0];
                        var all = map.queryRenderedFeatures({ layers: ['center', 'others'] });
                        all.map((_f)=>{
                            _f.properties['current'] = false;
                        });
                        f.properties['current'] = true;
                        self.$emit('click', f.properties.shop);
                    };
                    map.on('click', 'center', _go_shop);
                    map.on('click', 'others', _go_shop);
                    if (!!this.center){
                        self.toCenter(this.center);
                    }
                }); //map.on('load'...
            },
            addPoints(points){
                if (!((!!points)&&(points.length>0))){
                    return;
                }
                const self = this;
                var n = 0,
                    _set_points = function(){
                        var features = [],
                            src =  map.getSource('points'),
                            bounds = null;

                        points.map((p, i)=>{
                            if (!((!!p.lat)&&(!!p.lon))){
                                return;
                            }
                            features.push({
                                            type: 'Feature',
                                            properties: {
                                                n: i,
                                                id: p.id,
                                                shop: p,
                                                current: p.current
                                            },
                                            geometry: {
                                                 type: 'Point',
                                                 coordinates: [p.lon, p.lat]
                                           }
                                       });
                            if (!!bounds){
                                if (p.distance < 5000.0){
                                    bounds.extend([p.lon, p.lat]);
                                }
                            } else {
                                bounds = new mapboxgl.LngLatBounds(
                                    [p.lon, p.lat],
                                    [p.lon, p.lat]
                                );
                            }
                        });
                        src.setData({
                                'type': 'FeatureCollection',
                                'features': features
                        });
                        if (features.length > 0){
                            map.setCenter(features[0].geometry.coordinates);
                            if ((bounds)&&(features.length > 2)){
                                map.fitBounds(bounds, {padding: 50});
                            }
                        }
                };  //_set_points
                var _watch = function(){
                    n++;
                    if (n > 100){
                        return;
                    }
                    if ((!!map)&&(!!map.getSource('points'))){
                        _set_points();
                    } else {
                        setTimeout(_watch, 200);
                    }
                };  //_watch
                _watch();
            }
        }   //methods
    }
</script>

<style lang="scss" scoped>
    .sk-map{
        width: 100%;
        min-height: 280px;
        background: #ece1cb;
    }
</style>
    