const webpack = require('webpack');
const path = require('path');
const YM_ID = 71129278;
const APP_TITLE = "моикарты.рф";

export default {
  ssr: false,
  generate: {
    dir: "www"
  },
  head: {
    titleTemplate: `%s - ${ APP_TITLE }`,
    title: APP_TITLE,
    htmlAttrs: {
      lang: 'ru'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui' },
      { name: 'apple-mobile-web-app-capable', content: 'yes'},
      { name: 'mobile-web-app-capable', content: 'yes'},
      { hid: 'description', name: 'description', content: 'моикарты,акции,скидки,ecommerce,online-продажи' },
      {
       'http-equiv': 'Content-Security-Policy',
       content:
         "default-src * ;img-src * 'self' data: blob: ;font-src 'self' data: https: ;style-src * 'self' 'unsafe-inline' 'unsafe-eval' ; worker-src blob: ; child-src blob: gap://ready ; connect-src * 'self' https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com ; script-src * 'self' 'unsafe-inline' 'unsafe-eval' ; frame-src * gap://ready 'self' 'nonce-lots-of-digits' ;"
     }
    ],
    link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "stylesheet",  href: "https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.css" }
    ],
    script: [
        { src: "https://code.jquery.com/jquery-3.5.1.min.js", integrity: "sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=", crossorigin: "anonymous" },
        { src: "https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.js" },
        { src: "cordova.js" }
    ]
  },

  css: [

  ],

  plugins: [
    '~/plugins/extend-app.js',
    '~/plugins/http.js'
  ],

  components: true,

  buildModules: [
    '@nuxtjs/vuetify'
  ],

  modules: [
      '@nuxtjs/proxy',
      '@nuxtjs/style-resources',
      ['@nuxtjs/yandex-metrika', {
        id: YM_ID,
        webvisor: true,
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true
      }]
  ],
  env: {
      APP_TITLE,
      rpcUrl:  (/^dev/.test(process.env.NODE_ENV)) ? '/rpc' : 'https://моикарты.рф/rpc',
      backUrl: (/^dev/.test(process.env.NODE_ENV)) ? '/wp'  : 'https://i.моикарты.рф',
      apiUrl:  (/^dev/.test(process.env.NODE_ENV)) ? '/api' : 'https://моикарты.рф/api/skidosapi',
      wsUrl: 'wss://моикарты.рф/notice',
      pushSndId: 349717391015,
      YM_ID
  },
  proxy: {
        "/api": {
            target: 'https://xn--80apggkpo6e.xn--p1ai'
        },
        "/rpc": {
            target: 'https://xn--80apggkpo6e.xn--p1ai'
        },
        "^/wp": {
            target: 'http://192.168.61.192',
            pathRewrite: {'^/static': ''}
        }
  },    /*proxy*/


  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        dark: {
        },
        light:{
            accent: "#ad0900"
        }
      }
    }
  },

build: {
    publicPath: "/nuxt/",
    plugins: [
        new webpack.ProvidePlugin({
          '$utils': path.resolve(__dirname, 'utils/index.js'),
          'options': {
            rules:[{
                    test: '/\.scss$/',
                    use: [
                        'vue-style-loader',
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                sassOptions: {
                                    indentedSyntax: true
                                }
                            }
                        }
                    ]
                }
            ]}
        })
    ]
  } ,
router: {
  mode: "hash"
}
}
