import Vue from 'vue'
import App from './App.vue'
import moment from 'moment'

Vue.config.productionTip = false

Vue.filter('formatDate', function(value) {
  if (value) {
    if(typeof value === 'string' || value instanceof String) {
      return moment.utc(String(value).replace(/\[.+\]/gm, '')).format('DD/MM/YYYY');
    }
    else {
      return moment(value).format('DD/MM/YYYY');
    }
  }
})

new Vue({
  render: h => h(App),
}).$mount('#app')
