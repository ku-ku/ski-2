<script>
export default {
    name: 'SkQr',
    props: {
        cardId: {
            type: String,
            required: true
        }
    },
    async fetch(){
        try {
            var data = await this.$http.post({
                    type: 'api-call',
                    url: '/skidosapi/get-qr',
                    method: 'POST',
                    contentType: 'application/json;charset=utf-8',
                    dataType: 'text',
                    processData: false,
                    cache: false,
                    data: JSON.stringify({id: this.cardId})
            });
            this.qr_bin_data = 'data:image/png;base64,'+ data; 
        } catch(err) {
            console.log('ERR on qr-code', err);
        }
    },
    data(){
        return {
            qr_bin_data: null
        };
    },
    methods: {
        qr_load_image(e){
            const i = $(e.target);
            i.animate({opacity:1});
        }
    },
    render(h){
        return h('div', {class: {'sk-qr-place': true}}, [
                    (!!this.qr_bin_data)
                        ? h('img', {
                                    attrs: {
                                                src: this.qr_bin_data,
                                                id: this.cardId
                                            },
                                    class: {'sk-qr': true},
                                    style: {opacity: 0},
                                    on: {load: this.qr_load_image}
                                }) 
                        : null
        ]);
    }
}
</script>
<style lang="scss" scoped>
    .sk-qr-place{
                text-align: center;
                max-width: 220px;
                margin: 0 auto;
                & > *{
                    margin: 0 auto;
                    width: 100%;
                    height: auto;
                }
    }
</style>    