<template>
  <v-container class="pt-15" fluid>
    <v-row class="mb-6 pt-3">
      <v-col cols="12" sm="6" md="4" />
      <v-col cols="12" sm="6" md="4">
        <h1 class="text-center pt-3 pb-3">
          Blogs
        </h1>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field v-model="searchBlogName" label="Search">
          <template #append-outer>
            <v-btn icon @click="searchBlog()">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </v-col>
    </v-row>
    <v-alert
      v-if="success"
      border="top"
      type="success"
      dark
    >
      {{ success }}
    </v-alert>
    <div class="blogs">
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
              <v-btn icon color="primary" :to="{ name: 'blog', hash: '#comments', query: { id: blog.id }}">
                <v-icon color="success" small>
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
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              color="green"
              rounded
              class="add_blog"
              v-bind="attrs"
              @click="addBlog"
              v-on="on"
            >
              <v-icon e-large color="white">
                mdi-plus
              </v-icon>
            </v-btn>
          </template>
          <span>add blog</span>
        </v-tooltip>
      </div>
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
      selectedComments: [],
      success: this.$route.params.success,
      searchBlogName: ''
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  created () {
    setTimeout(() => {
      this.success = false
    }, 2000)
  },
  updated () {
    if (this.searchBlogName === '') {
      this.onSnapShotBlogs()
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
    searchBlog () {
      if (this.searchBlogName.trim()) {
        this.blogs = this.blogs.filter(blog => blog.name.toUpperCase().includes(this.searchBlogName.trim().toUpperCase()))
      } else if (this.searchBlogName.trim() === '') {
        this.onSnapShotBlogs()
      }
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
        this.success = ''
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

.add_blog {
  position: fixed;
  bottom: 100px;
  right: 40px;
}

.blogs {
  position: relative;
}
</style>
