<template>
  <v-container class="pt-15">
    <h1 class="pt-5">
      Edit Blog
    </h1>
    <v-alert
      v-if="message"
      border="top"
      color="red lighten-2"
      dark
    >
      {{ message }}
    </v-alert>
    <v-form ref="add_blog_form" @submit.prevent="edit">
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
            Edit
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../plugins/firebase'

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
  mounted () {
    this.getBlog()
  },
  methods: {
    async getBlog () {
      const blogDocumentRef = doc(db, 'blogs', this.$route.query.id)
      const docSnap = await getDoc(blogDocumentRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        this.name = data.name
        this.description = data.description
      } else {
        this.$router.push('/')
      }
    },
    edit () {
      if (this.$refs.add_blog_form.validate()) {
        const blogDocumentRef = doc(db, 'blogs', this.$route.query.id)
        updateDoc(blogDocumentRef, {
          name: this.name,
          description: this.description
        })
        this.$router.push({ name: 'blog', query: { id: this.$route.query.id }, params: { success: this.name + 'を更新しました' } })
      } else {
        this.message = '入力エラーがあります'
      }
    }
  }
}
</script>

<style>

</style>
