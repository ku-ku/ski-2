<template>
    <v-app>
        <v-app-bar fixed app>
            <v-btn icon to="/" class="mr-3"><v-icon>mdi-chevron-left</v-icon></v-btn>
            {{ $nuxt.APP_TITLE }}
        </v-app-bar>
        <v-container class="fill-height">
            <div v-if="(error.statusCode === 404)" class="fill-height sk-404"></div>
            <div v-else>
                {{ otherError }}
            </div>    
        </v-container>
    </v-app>
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
  data () {
    return {
      pageNotFound: '404 страница не найдена',
      otherError: 'An error occurred'
    };
  },
  head () {
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
        height: 100%;
        min-width: 100%;
    }
    @media screen and (max-width: 600px) {
        .sk-404{
            min-height: calc(100vh - 64px);
            background-size: contain;
        }
    }
    
</style>