<template>
  <v-app-bar
    app
    color="gray"
    flat
  >
    <v-avatar
      class="mr-3"
      color="grey darken-1"
      size="48"
    >
      <img
        max-height="150"
        max-width="250"
        src="@/assets/blog.jpg"
      >
    </v-avatar>
    <div class="pl-3">
      <nuxt-link to="/">
        <h3>Blog Post</h3>
      </nuxt-link>
    </div>
    <v-spacer />
    <div v-if="$store.getters.isAuthenticated" class="pt-4 pr-3">
      <p>
        <v-icon>
          mdi-account
        </v-icon>
        {{ user.displayName }}
      </p>
    </div>
    <v-responsive max-width="100">
      <v-btn
        v-if="$store.getters.isAuthenticated"
        rounded
        depressed
        @click="logout"
      >
        Logout
      </v-btn>
      <v-btn
        v-if="!$store.getters.isAuthenticated"
        rounded
        depressed
        @click="login"
      >
        Login
      </v-btn>
    </v-responsive>
  </v-app-bar>
</template>

<script>
import { signOut } from 'firebase/auth'
import { auth } from '../plugins/firebase'

export default {
  data () {
    return {
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  methods: {
    logout () {
      signOut(auth).then(() => {
        this.$store.dispatch('setUser', null)
      })
    },
    login () {
      this.$router.push('/login')
    }
  }
}
</script>

<style>
a.nuxt-link-exact-active {
    font-weight: bold;
}

a,
a:visited {
  text-decoration: none;
  color: inherit;
}
</style>
