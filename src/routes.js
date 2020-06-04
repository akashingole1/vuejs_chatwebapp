/* eslint-disable */
import Login from './components/Login'
import HelloWorld from './components/HelloWorld'
import Signup from './components/Signup'
import Chat from './components/Chat'
import Profile from './components/Profile'

export default [
    { path: '/', component: Login },
    { path: '/signup', component: Signup },
    { path: '/hello', component: HelloWorld },
    { path: '/chat', component: Chat },
    { path: '/profile', component: Profile }
]