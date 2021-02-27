<template>
    <v-bottom-sheet 
        hide-overlay 
        v-model="sheet">
        <div class="sk-bottom">
            <div class="sk-touch"
                 v-touch="{
                      up: ($event) => swipe('up', $event),
                      down: ($event) => swipe('down', $event)
                    }"><b></b></div>
            <slot></slot>
        </div>
    </v-bottom-sheet>
</template>
<script>
   
import { VBottomSheet } from 'vuetify/lib';
import touch from 'vuetify/lib/directives/touch';
import {eventBus} from '~/utils/eb';
    
export default{
    name: 'SkBottom',
    props: ['show'],
    directives: {touch},
    data(){
        return {
            sheet: false,
            h: -1  ///initial size
        };
    },
    methods:{
        swipe(dir, e){
            var h, b = $('.sk-bottom');
            if ('down'===dir){
                h = b.height() - e.offsetY;
                if ( h < this.h){
                    this.sheet = false;
                    return;
                }
            } else if ('up'===dir){
                h = b.height() + (0 - e.offsetY);
            }
            b.animate({'height': h}, 400, ()=>{
                eventBus.$emit('resize', h);
            });
        }
    },
    watch: {
        show(val){
            if (!!val){
                this.sheet = (new Date()).getTime();
                if (this.h < 100){
                    setTimeout(()=>{
                        this.h = $('.sk-bottom').height() || 280;
                    }, 600);
                }
            } else {
                this.sheet = false;
            }
        }
    }
}
</script>
<style lang="scss" scoped>
    @import "~/assets/index.scss";
    
    $border-radius: 18px 18px 0 0;
    
    .sk-bottom{
        min-height: 200px;
        & .sk-touch{
            height: 42px;
            line-height: 38px;
            text-align: center;
            background: #fff;
            border-top: 1px solid transparent;
            border-radius: $border-radius;
            & b{
                display: inline-block;
                height: 4px;
                width: 56px;
                background: lighten($gray-color, 30%);
                border-radius: 500px;
                margin: 0 auto;
                box-shadow: 0 2px 2px rgba(0,0,0,0.22);
                border: 1px solid lighten($gray-color, 20%);
            }
        }
    }
    
    .v-bottom-sheet{
        &.v-dialog{
            border-top: 1px solid transparent;
            border-radius: $border-radius !important;
        }
    }
</style>    