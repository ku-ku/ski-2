<template>
    <v-container class="fill-height">
        <v-app-bar fixed app>
            <v-btn icon 
                   to="/" 
                   replace
                   class="mr-3"><v-icon>mdi-chevron-left</v-icon></v-btn>
            {{ $nuxt.APP_TITLE }}
        </v-app-bar>
        <div v-if="(error.statusCode === 404)" class="fill-height sk-404"></div>
        <div v-else v-html="otherError"></div>    
    </v-container>
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  data(){
    return {
        pageNotFound: '404 страница не найдена',
        otherError: 'Ошибка'
    };
  },
  mounted(){
        console.log(this.error);
        var s = "<h3>Ошибка</h3>";
        if (!!this.error.message){
            s += `<div class="text-muted">информация для технической поддержки: Error #${ this.error.statusCode } ${ this.error.message }</div>`;
        }
        this.otherError = s;
  },
  head(){
    return {
        title:  (this.error.statusCode === 404) ? this.pageNotFound : this.otherError
    };
  }
}
</script>
<style lang="scss">
    .sk-404{
        background: #fff url('/404.png') center center scroll no-repeat;
        min-height: 527px;
        height: calc(100% - 64px);
        min-width: 100%;
    }
    @media screen and (max-width: 600px) {
        .sk-404{
            min-height: calc(100vh - 64px);
            background-size: contain;
        }
    }
    
</style>