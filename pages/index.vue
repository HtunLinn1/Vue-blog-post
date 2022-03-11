<template>
  <v-container class="pt-15">
    <h1 class="text-center pt-3 pb-3">
      Blog List
    </h1>
    <v-row v-if="blogs.length != 0">
      <v-col v-for="blog in blogs" :key="blog.id" cols="12" sm="6" md="4">
        <v-card>
          <v-card-title>
            <nuxt-link :to="{ name: 'blog', query: { id: blog.id }}">
              {{ blog.name }}
            </nuxt-link>
          </v-card-title>
          <v-card-subtitle class="description">
            {{ blog.description.trim() }}
          </v-card-subtitle>
          <v-card-actions>
            <v-btn icon color="primary" :to="{ name: 'blog', query: { id: blog.id }}">
              <v-icon color="primary" small>
                mdi-comment-processing
              </v-icon>
            </v-btn>
            <p v-if="blog.commentCount != 0" class="caption">
              {{ blog.commentCount }}
            </p>
            <v-spacer />
            <v-btn v-if="$store.getters.isAuthenticated && blog.created_by == $store.state.user.email" icon color="primary" @click="edit(blog)">
              <v-icon small>
                mdi-book-edit
              </v-icon>
            </v-btn>
            <v-btn v-if="$store.getters.isAuthenticated && blog.created_by == $store.state.user.email" icon color="error" @click="remove(blog)">
              <v-icon small>
                mdi-delete
              </v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else class="text-center">
      <v-col>
        <v-card>
          <v-card-title>
            Blog is empty!
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-spacer />
    <div v-if="$store.getters.isAuthenticated" class="pt-5">
      <v-btn color="primary" @click="addBlog">
        Add Blog
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import { onAuthStateChanged } from 'firebase/auth'
import { collection, doc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { db, auth } from '../plugins/firebase'
const blogsCollectionRef = collection(db, 'blogs')
const commentsCollectionRef = collection(db, 'comments')

export default {
  name: 'IndexPage',
  data () {
    return {
      blogs: [],
      tempBlogs: [],
      name: '',
      email: '',
      selectedComments: []
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  mounted () {
    this.onAuthStateChanged()
    this.onSnapShotBlogs()
  },
  methods: {
    onAuthStateChanged () {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.$store.dispatch('setUser', {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email
          })
        }
      })
    },
    onSnapShotBlogs () {
      // Real time
      onSnapshot(blogsCollectionRef, (querySnapshot) => {
        const selectedBlogs = querySnapshot.docs.map(doc =>
          ({ ...doc.data(), id: doc.id })
        )
        this.tempBlogs = selectedBlogs.sort((a, b) => a.created_at > b.created_at ? -1 : 1)

        onSnapshot(commentsCollectionRef, (querySnapshot) => {
          this.selectedComments = []
          this.selectedComments = querySnapshot.docs.map(doc =>
            ({ ...doc.data(), id: doc.id })
          )

          this.tempBlogs.forEach((blog) => {
            let count = 0
            this.selectedComments.forEach((comment) => {
              if (blog.id === comment.blogRef.id) {
                count = count + 1
              }
            })
            blog.commentCount = count
          })
          this.blogs = this.tempBlogs
        })
      })
    },
    remove (blog) {
      if (confirm(blog.name + 'を削除よろしいですか?')) {
        const blogDocumentRef = doc(db, 'blogs', blog.id)

        onSnapshot(commentsCollectionRef, (querySnapshot) => {
          let selectedComments = []
          selectedComments = querySnapshot.docs.map(doc =>
            ({ ...doc.data(), id: doc.id })
          )
          selectedComments.forEach((element) => {
            if (element.blogRef.path === blogDocumentRef.path) {
              const commentDocumentRef = doc(db, 'comments', element.id)
              deleteDoc(commentDocumentRef)
            }
          })
        })
        deleteDoc(blogDocumentRef)
        // updateDoc(userDocumentRef, { address: 'Yokohama' })
      }
    },
    addBlog () {
      this.$router.push('/addblog')
    },
    edit (blog) {
      this.$router.push({ name: 'editblog', query: { id: blog.id } })
    }
  }
}
</script>

<style>
.description {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
