import Vue from 'vue';
import App from './App.vue';
import store from './store';
import moment from 'moment';
import router from './router';

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
  store,
  router,
  render: h => h(App)
}).$mount('#app')
