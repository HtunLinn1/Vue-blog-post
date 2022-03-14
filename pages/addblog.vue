<template>
  <v-container class="pt-15">
    <h1 class="pt-5">
      Add Blog
    </h1>
    <v-alert
      v-if="message"
      border="top"
      color="red lighten-2"
      dark
    >
      {{ message }}
    </v-alert>
    <v-form ref="add_blog_form" @submit.prevent="add">
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="name"
            label="Blog Name"
            :rules="[required]"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="description"
            outlined
            name="input-7-4"
            label="Description"
            :rules="[required]"
          />
        </v-col>
        <v-col cols="12">
          <v-btn type="submit" color="primary">
            add
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../plugins/firebase'
const blogsCollectionRef = collection(db, 'blogs')

export default {
  name: 'AddBlog',
  middleware: 'authenticated',
  data () {
    return {
      name: '',
      description: '',
      required: value => !!value || '必須です',
      message: ''
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  methods: {
    add () {
      if (this.$refs.add_blog_form.validate()) {
        addDoc(blogsCollectionRef, {
          name: this.name,
          description: this.description,
          created_by: this.user.email,
          blogger: this.user.displayName,
          created_at: new Date()
        }).then(() => {
          this.$router.push({ name: 'index', params: { success: this.name + 'を作成しました' } })
          this.name = ''
          this.description = ''
        })
      } else {
        this.message = '入力エラーがあります'
      }
    }
  }
}
</script>

<style>

</style>
