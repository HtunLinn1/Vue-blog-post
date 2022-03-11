import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../plugins/firebase'

export default function ({ store, redirect }) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      store.dispatch('setUser', {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email
      }).then(() => {
        if (!store.getters.isAuthenticated) {
          return redirect('/login')
        }
      })
    } else {
      return redirect('/login')
    }
  })
}
