// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

Vue.prototype.$api = {
  baseWebUrl: 'https://progressbar-cowork.netlify.com/',
  subscribers: '',
  newSubscriber: 'emailSubscribe/',
  verify: 'verify/',
  order: 'order/'
}
if (process.env.NODE_ENV === 'development') {
  Vue.prototype.$api.base = 'http://localhost:8170/yangwao/progressbar-coweb/'
}

if (process.env.NODE_ENV === 'production') {
  Vue.prototype.$api.base = 'https://yangwao.lib.id/progressbar-coweb@dev/'
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
