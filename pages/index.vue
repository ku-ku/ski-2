<template>
    <v-container>
        <v-row v-if="is.user" class="justify-center">
          <v-col cols="12" sm="8" class="pa-5">
              <v-expansion-panels :value="pane" accordion focusable>
                  <v-expansion-panel key="my-cards-pane">
                      <v-expansion-panel-header disable-icon-rotate>
                          <v-badge :content="(counts.my > 0) ? counts.my : null" 
                                   :class="{'no-info': (counts.my < 1)}"
                                   color='orange'
                                   class="justify-start"
                                   inline>мои подписки</v-badge>
                          <template v-slot:actions>
                              <v-icon color="orange">mdi-playlist-star</v-icon>
                          </template>
                      </v-expansion-panel-header>
                      <v-expansion-panel-content eager>
                        <sk-my @load="myLoad" />
                      </v-expansion-panel-content>
                  </v-expansion-panel>
              </v-expansion-panels>
          </v-col>
        </v-row>
        <v-row v-if="is.auth" class="justify-center">
          <v-col cols="12" sm="8" class="pa-5">
              <v-row v-if="is.anon" class="my-anon">
                  <v-col cols="12">
                      <h3>Вы не авторизованы</h3>
                      <p class="text-muted">чать функций приложения будет недоступна</p>
                      <!-- at: https://www.uplabs.com/depotvisual -->
                      <v-img src="/auth.png" 
                             class="my-anon__image" 
                             contain
                             max-height="320" />
                      <v-btn small
                             dark
                             rounded
                             color="#e3404a"
                             replace
                             :to="{name:'profile-all', params:{pathMatch:'auth'}}">
                          авторизоваться&nbsp;<v-icon>mdi-chevron-right</v-icon>
                      </v-btn>
                  </v-col>
              </v-row>
              <sk-near  />
              <sk-tops />
              <sk-actions />
          </v-col>
        </v-row>
        <v-row v-else class="justify-center">
            <v-col cols="12" sm="6" class="pa-5">
                <v-skeleton-loader type="list-item-avatar@3"></v-skeleton-loader>
            </v-col>
        </v-row>
    </v-container>    
</template>

<script>
import { MODES } from "~/utils/index.js";
import SkMy from "~/components/SkMy";
import SkNear from "~/components/SkNear";
import SkActions from "~/components/SkActions";
import SkTops from "~/components/SkTops";

export default {
    components: {
        SkMy,
        SkNear,
        SkActions,
        SkTops
    },
    data(){
        return {
            mode: MODES.none,
            pane: -1,
            counts: {
                my: -1
            }
        };
    },
    computed: {
        user(){
            return this.$store.state.profile.user;
        },
        is(){
            const user = this.user;
            var res = {
                auth: user.isAuthenticated,
                anon: user.isAnonymous,
                at: this.$store.state.profile.lastAccess
            };
            res.user = (res.auth && !res.anon);
            return res;
        }
    },
    activated(){
        this.$store.commit("active/empty"); 
    },
    methods: {
        myLoad(n){
            this.counts.my = n;
            if ( n < 6 ){
                this.pane = 0;
            }
        }
    },
    watch: {
        is(attrs){
            if (attrs.user){
                this.mode = MODES.default;
            }
        }
    }
}
</script>
<style lang="scss">
    .v-badge{
        &.no-info{
            & .v-badge__badge{
                display: none;
            }
        }
    }
</style>
<style lang="scss" scoped>
    @import "~/assets/index.scss";
    
    $light-gray: lighten($gray-text, 30%);
    
    .v-expansion-panel--active {
        & > .v-expansion-panel-header{
            min-height: unset;
        }
    }
    .v-expansion-panel-header{
        transition: all 0.33s ease;
        &--active{
            background-color: $red-color !important;
            color: #fff;
        }
    }
    
    .my-anon{
        position: relative;
        & h3{
            color: #e3404a;
            font-weight: 300;
        }
        & .v-btn{
            position: absolute;
            right: 1rem;
            bottom: 1rem;
        }
    }
</style>