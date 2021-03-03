<template>
    <v-dialog
      v-model="$show"
      width="95%"
    >
        <v-card>
            <v-card-title>
                <div class="mr-3">Уважаемый пользователь, для того, чтобы использовать все возможности нашего приложения, необходимо:</div>
                <v-btn 
                    x-small 
                    fab
                    text
                    @click="$show = false">
                    <sk-svg xref="#close" />
                </v-btn>
            </v-card-title>
            <v-card-text>
                <div class="d-flex flex-column mt-5 text-center">
                    <v-btn
                        outlined
                        rounded
                        @click="goAuth">
                        <sk-svg xref="#ico-signin" class="mr-2" />
                        авторизоваться
                    </v-btn> 
                    <div class="my-3">или</div>
                    <v-btn 
                        text
                        @click="goReg">
                        зарегистрироваться
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import SkSvg from '~/components/SkSvg';
    
export default {
    props: ['show'],
    computed: {
        $show: {
            get(){return this.show;},
            set(val){
                this.$emit((val) ? 'show' : 'hide');
            }
        }
    },
    methods: {
        goAuth(){
            this.$show = false;
            this.$router.replace({path: '/profile/auth'});
        },
        goReg(){
            this.$show = false;
            this.$router.replace({path: '/profile/register'});
        }
    }
}
</script>
<style lang="scss" scoped>
    @import "~/assets/index.scss";
    
    .v-card{
        & .v-card__title{
            flex-wrap: nowrap;
            align-items:flex-start;
            word-break: normal;
            font-size:  1rem;
            line-height:1.25rem;
            font-weight:300;
        }
        & .v-card__text{
            & .v-btn{
                color: $red-color !important;
                caret-color: $red-color !important;
            }
        }
    }
</style> 
    
    