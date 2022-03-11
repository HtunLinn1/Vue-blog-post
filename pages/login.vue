<template>
  <v-container class="pt-15" fluid-width>
    <h1 class="pt-3">
      Login
    </h1>
    <v-alert
      v-if="message"
      border="top"
      color="red lighten-2"
      dark
    >
      {{ message }}
    </v-alert>
    <v-form ref="login_form">
      <v-text-field
        v-model="email"
        type="email"
        label="Email"
        :rules="[required]"
        prepend-icon="mdi-email"
      />
      <v-text-field
        v-model="password"
        label="Password"
        :rules="[required, min_length, max_length]"
        prepend-icon="mdi-lock"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :type="showPassword ? 'text' : 'password'"
        @click:append="showPassword = !showPassword"
      />
      <v-btn color="primary" @click="login">
        Login
      </v-btn>
      <div class="pt-4">
        <nuxt-link to="/signup">
          <v-icon color="primary" small>
            mdi-account-plus
          </v-icon>
          Create Account
        </nuxt-link>
      </div>
    </v-form>
  </v-container>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../plugins/firebase'

export default {
  name: 'LoginPage',
  data () {
    return {
      email: '',
      password: '',
      message: '',
      showPassword: false,
      required: value => !!value || '必須です',
      min_length: value => value.length >= 8 || '短すぎです',
      max_length: value => value.length <= 20 || '長すぎです'
    }
  },
  methods: {
    login () {
      if (this.$refs.login_form.validate()) {
        signInWithEmailAndPassword(auth, this.email, this.password)
          .then((userCredential) => {
            const user = userCredential.user
            this.$store.dispatch('setUser', {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email
            })
            this.$router.push('/')
          })
          .catch(() => {
            this.message = 'ログインできません'
          })
      } else {
        this.message = '入力エラーがあります'
      }
    }
  }
}
</script>

<style scoped>

</style>
