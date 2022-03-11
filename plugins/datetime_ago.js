import Vue from 'vue'
import moment from 'moment'

Vue.filter('datetime', function (value) {
  const datetime = moment(value)
  return moment(datetime).fromNow()
})
