<script>
import SkSvg from '~/components/SkSvg';
import { 
        VAlert,
        VDialog,
        VCard,
        VCardText,
        VCardTitle,
        VCardActions,
        VBtn,
        VSpacer
    } from 'vuetify/lib';


export default {
    name: 'SkConfirm',
    components: { 
        VAlert,
        VDialog,
        VCard,
        VCardText,
        VCardTitle,
        VCardActions,
        VBtn,
        VSpacer,
        SkSvg 
    },
    data: () => ({
                    title: null,
                    type: null,     // info, warning, error
                    msg: '',
                    show: false,
                    help: null,
                    p: null         // Promise.resolve(): see confirm()
    }),
    methods: {
    /*
     * show confirm-dialog:
     * @param {type} msg Object {?type: info,warning,etc..., ?title: head, ?help:, msg: text }
     */
    confirm(msg) {
        if ((typeof msg === 'string') || (msg instanceof String)) {
            this.title = null;
            this.help = null;
            this.type = null;
            this.msg = msg;
        } else {
            this.title = msg.title;
            this.msg = msg.msg;
            this.type = msg.type;
            this.help = msg.help;
        }
        return new Promise(resolve => {
            this.p = resolve;
            this.show = (new Date()).getTime();
        });
    }
    },
    render(h) {
        const self = this;
        return h('v-dialog', {
            props: {
              value: this.show,
              'max-width': "90%"
            }
        },
        (!!this.show) ? [
            $utils.isEmpty(this.title) 
                ? null
                : h('v-toolbar', {props: {dark: true, color: this.type}}, [
                    h('v-toolbar-title', this.title)
                ]),
            h('v-card', {
                props: {flat: true, tile: true},
                class: {'sk-confirm': true}
            }, [
                h('v-card-text', [
                  $utils.isEmpty(this.type)
                    ? h('div', {domProps: {innerHTML: this.msg}})
                    : h('v-alert', {
                            props: {
                              type: this.type,
                              border: 'left',
                              'colored-border': true,
                              elevation: 2
                            }
                          }, [
                              h('div', {domProps: {innerHTML: this.msg}})
                          ]
                        )
                ]),
                h('v-card-actions', [
                    $utils.isEmpty(this.help)
                      ? null
                      : h('div', {class: {'text--secondary': true}}, [
                        this.help
                      ]),
                    h('v-spacer'),
                    h('v-btn', { props: {small: true, outlined: true, color: 'secondary'}, 
                                 class: {'sk-cancel': true},
                                 on: {
                                        click: () => {
                                          if (!!self.p) {
                                            self.p(false);
                                          }
                                          this.show = false;
                                        }
                                }
                    }, 'отмена'),
                    h('v-btn', { props: {color: this.type || 'primary', small: true, outlined: true},
                                 class: {'sk-ok': true},
                                 on: {
                                        click: () => {
                                          if (!!self.p) {
                                            self.p(true);
                                          }

                                          this.show = false;
                                        }
                                }
                    },  'ok'
                )
            ])
        ])
      ] : null
    );
  }
}
</script>
<style lang="scss" scoped>
    .sk-confirm {
        & .v-card__text{
            padding-top: 2rem;
        }
        & .sk-cancel, & .sk-ok {
            width: 6rem;
        }
        & svg {
            margin-right: 0.5rem;
        }
  }
</style>
