define(['Vue'],function(Vue) {
    Vue.component('r-dialog', {
      props: {
          title: {
            type: String,
            required: true
          },
          showFooter: {
            type: Boolean,
            required: false,
            default: false
          }
      },   
      template: `
        <div class="panel panel-primary dialog">
          <div class="panel-heading">
           {{title}}<span style="cursor: pointer;" class="glyphicon glyphicon-remove pull-right" @click="$emit('dismiss-dialog')"></span>
          </div>
          <div class="panel-body">
            <slot>
              <p>DEFAULT</p>
            </slot>
          </div>
          <div class="panel-footer" v-show="showFooter">
            <slot name="footer"></slot>
          </div>
        </div>
      `
    })
  })