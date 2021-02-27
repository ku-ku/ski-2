<script>
    export default {
        name: 'SkSvg',
        props: {
            height: {
                type: [String, Number],
                required: false
            },
            width: {
                type: [String, Number],
                required: false
            },
            /**
             * for xlink icon-id (see index.html, "#ico-info" - for exmpl)
             */
            xref: {
                type: String,
                required: true
            }
        },
        data(){
            return {
                vbx: null   //viewBox for svg-node
            };
        },
        created(){
            const n = $('svg ' + this.xref);
            this.vbx = n.parent().attr('viewBox') || '0 0 512 512';
        },
        render(h){
            return h('svg', {
                                attrs: {
                                            viewBox: this.vbx, 
                                            width: this.width || "18px", 
                                            height: this.height || "18px",
                                            xmlns: "http://www.w3.org/2000/svg"
                                        }, 
                                domProps: {innerHTML:'<use xlink:href="' + this.xref + '" />'}
                   });
        }
    };
</script>
