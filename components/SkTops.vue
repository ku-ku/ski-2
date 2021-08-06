<template>
    <div class="sk-tops">
        <template v-if="has('tops')">
            <h3><v-icon color="accent">mdi-shopping-outline</v-icon>&nbsp;Сейчас покупают</h3>
            <v-row v-if="has('store')" 
                   class="sk-tops__store">
                <v-col cols="12">
                    <v-parallax :src="store.src"
                                height="200"
                                v-on:click="gostore">
                        <h2 v-html="store.name"></h2>
                    </v-parallax>
                </v-col>
            </v-row>
            <v-row v-if="has('prods')"
                   class="sk-tops__prods">
                <v-col v-for="(p, n) in prods"
                       :key="'prod-' + n"
                       cols="4">
                    <v-img :src="p.src" 
                           v-on:click="goprod(p)" />
                </v-col>
            </v-row>
        </template>
    </div>
</template>
<script>
export default {
    name: 'SkTops',
    data(){
        return {
            tops: []
        };
    },
    created(){
        this.$fetch();
    },
    computed:{
        store(){
            var s = false;
            this.tops.filter((t)=>{
                return (1 == t[0]);
            }).map((t)=>{
                s = {
                        id: t[2],
                        name: t[3],
                        src: `${ this.$http.env.rpcUrl }/static/model/view/${ t[1] }`
                    }
            });
            return s;
        },
        prods(){
            var a = [];
            this.tops.filter((t)=>{
                return 2 == t[0];
            }).map((t)=>{
                a.push({
                    id: t[2],
                    name: t[3],
                    src: `${ this.$http.env.rpcUrl }/static/model/view/${ t[1] }`
                });
            });
            return a;
        }
    },
    async fetch(){
        this.tops = await this.$store.dispatch("loadInfos");
        this.$nextTick(()=>{
            console.log('store', this.store);
            console.log('prods', this.prods);
        });
    },
    methods: {
        has(q){
            switch(q){
                case "prods":
                    return (this.prods.length > 0);
                case "store":
                    return !!this.store;
                case "tops":
                    return this.tops?.length > 0;
                default:
                    return false;
            }
        },
        gostore(){
            this.$router.push({name: 'stores-id', params:{id: this.store.id}});
        },
        async goprod(p){
            try {
                const prod = await this.$store.dispatch("active/getProd", p);
                console.log('prod:', prod);
                this.$router.push({
                    name: 'stores-id-catalog-id', 
                    params: {id: prod.id}
                });
            } catch(e){
                console.log('ERR (goprod)', e);
            }
        }
    }
}
</script>
<style lang="scss" scoped>
    .sk-tops{
        & h3{
            font-weight: 400;
            margin: 2rem 0 1rem 0;
        }
        &__store{
            & h2 {
                position: absolute;
                bottom: 0;
                left: 0;
                font-weight: 400;
                font-size: 2rem;
                line-height: 1.125;
                color: #fff;
                background-color: rgba(0,0,0,0.18);
                width: 100%;
                padding: 0.5rem 1rem;
                margin: 0;
                text-shadow: 0 2px 4px rgba(0,0,0,0.18);
            }
        }
    }
</style>