<template>
  <v-app>
    <global-nav />
    <nuxt />
  </v-app>
</template>

<script>
import GlobalNav from '@/components/GlobalNavBar'
export default {
  name: 'LayoutDefault',
  components: {
    GlobalNav
  }
}
</script>
