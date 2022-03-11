<template>
  <v-container class="pt-15" fluid-width>
    <v-row>
      <v-col cols="12">
        <h1 class="pt-3">
          {{ name }}
        </h1>
        <div class="content">
          {{ description.trim() }}
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h3>
          Comments <span v-if="comments.length != 0" class="caption">{{ comments.length }}</span>
        </h3>
        <div
          v-for="com in sliceComments"
          :key="com.id"
        >
          <span class="content">{{ com.comment }}</span>
          &nbsp;
          <span class="caption">
            {{ com.created_at.toDate() | datetime }}
          </span> &nbsp;
          <v-btn v-if="$store.getters.isAuthenticated && com.created_by == $store.state.user.email" icon color="error" @click="remove(com.id)">
            <v-icon small>
              mdi-delete
            </v-icon>
          </v-btn>
        </div>
        <div class="text-center">
          <v-btn v-if="arrowDown && comments.length > 2" color="primary" icon @click="clickArrowDown">
            <v-icon>
              mdi-arrow-down-bold-circle
            </v-icon>
          </v-btn>
          <v-btn v-if="arrowUp && comments.length > 2" color="primary" icon @click="clickArrowUp">
            <v-icon>
              mdi-arrow-up-circle
            </v-icon>
          </v-btn>
        </div>
        <v-alert
          v-if="message"
          border="top"
          color="red lighten-2"
          dark
        >
          {{ message }}
        </v-alert>
        <v-textarea
          v-model="comment"
          outlined
          rows="2"
          name="input-7-4"
          label="comment"
          class="pt-3"
        />
        <v-btn color="primary" @click="clickComment">
          comment
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, addDoc, onSnapshot, deleteDoc, query, where } from 'firebase/firestore'
import { auth, db } from '../plugins/firebase'
const commentsCollectionRef = collection(db, 'comments')
export default {
  name: 'BlogPage',
  data () {
    return {
      name: '',
      description: '',
      comment: '',
      message: '',
      comments: [],
      arrowUp: false,
      arrowDown: true,
      sliceComments: []
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  mounted () {
    this.onAuthStateChanged()
    this.getBlog()
    this.getComments()
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
    getComments () {
      const blogRef = doc(db, 'blogs', this.$route.query.id)
      const q = query(commentsCollectionRef, where('blogRef', '==', blogRef))
      onSnapshot(q, (querySnapshot) => {
        this.comments = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        this.comments = this.comments.sort((a, b) => a.created_at > b.created_at ? 1 : -1)
        this.clickArrowUp()
      })

      // this.comments = []
      // const blogRef = doc(db, 'blogs', this.$route.query.id)
      // onSnapshot(commentsCollectionRef, (querySnapshot) => {
      //   let selectedComments = []
      //   selectedComments = querySnapshot.docs.map(doc =>
      //     ({ ...doc.data(), id: doc.id })
      //   )
      //   selectedComments.forEach((element) => {
      //     if (element.blogRef.path === blogRef.path) {
      //       this.comments.push(element)
      //     }
      //   })
      //   this.comments = [
      //     ...new Map(this.comments.map(item => [item.id, item])).values()
      //   ]
      //   this.comments = this.comments.sort((a, b) => a.created_at > b.created_at ? 1 : -1)
      //   this.clickArrowUp()
      // })
    },
    clickComment () {
      if (this.user) {
        if (this.comment.trim()) {
          addDoc(commentsCollectionRef, {
            created_by: this.user.email,
            created_at: new Date(),
            comment: this.comment.trim(),
            blogRef: doc(db, 'blogs', this.$route.query.id)
          }).then(() => {
            this.comment = ''
            this.message = ''
            this.clickArrowDown()
          })
        } else {
          this.message = '入力してください'
        }
      } else {
        this.$router.push('/login')
      }
    },
    remove (id) {
      const blogDocumentRef = doc(db, 'comments', id)
      deleteDoc(blogDocumentRef)
      this.getComments()
      // updateDoc(userDocumentRef, { address: 'Yokohama' })
    },
    clickArrowDown () {
      this.sliceComments = this.comments
      this.arrowDown = false
      this.arrowUp = true
    },
    clickArrowUp () {
      this.sliceComments = this.comments.slice(0, 2)
      this.arrowDown = true
      this.arrowUp = false
    }
  }
}
</script>

<style scoped>
  .content {
   word-break: break-word;
   white-space: pre-wrap;
   -moz-white-space: pre-wrap;
  }
</style>
