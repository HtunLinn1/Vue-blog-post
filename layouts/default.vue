<template>
  <v-app>
    <global-nav />
    <nuxt />
    <global-footer />
  </v-app>
</template>

<script>
import GlobalNav from '@/components/GlobalNavBar'
import GlobalFooter from '@/components/GlobalFooter'
export default {
  name: 'LayoutDefault',
  components: {
    GlobalNav,
    GlobalFooter
  }
}
</script>
