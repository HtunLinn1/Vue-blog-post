<template>
  <v-container class="pt-15">
    <h1>Sign Up</h1>
    <v-alert
      v-if="message"
      border="top"
      color="red lighten-2"
      dark
    >
      {{ message }}
    </v-alert>
    <v-form ref="signup_form">
      <v-text-field
        v-model="name"
        type="text"
        label="Name"
        :rules="[required]"
        prepend-icon="mdi-account"
      />
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
        type="password"
        :rules="rules.password"
        prepend-icon="mdi-lock"
      />
      <v-text-field
        v-model="confirmPassword"
        label="Confirm Password"
        type="password"
        :rules="[required]"
        prepend-icon="mdi-lock"
        class="pb-2"
      />
      <v-btn @click="signUp">
        Signup
      </v-btn>
    </v-form>
  </v-container>
</template>

<script>
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../plugins/firebase'

export default {
  name: 'SignupPage',
  data () {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      message: '',
      rules: {
        password: [
          value => !!value || '必須です',
          value => (value && value.length >= 8) || '短すぎです',
          value => (value && value.length <= 20) || '長すぎです',
          value => (value && value.match(/^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))([a-zA-Z0-9])+$/)) ||
          'Password must contain at least 1 upper case letter, 1 lower case letter'
        ]
      },
      required: value => !!value || '必須です'
    }
  },
  methods: {
    signUp () {
      if (this.$refs.signup_form.validate()) {
        if (this.password === this.confirmPassword) {
          createUserWithEmailAndPassword(auth, this.email, this.password)
            .then((userCredential) => {
              const user = userCredential.user
              updateProfile(user, { displayName: this.name })
                .then(() => {
                  const user = auth.currentUser
                  this.message = 'アカウントが作成されました : ' + (user.displayName || user.uid)
                  this.$router.push('/login')
                })
            })
            .catch((err) => {
              this.message = err.message
            })
        } else {
          this.message = 'パスワードが同じじゃない'
        }
      } else {
        this.message = '入力エラーがあります'
      }
    }
  }
}
</script>

<style scoped>

</style>
