import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import pinia from './pinia'
import PrimeVue from 'primevue/config'
import Material from '@primeuix/themes/material'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import {
  Avatar,
  Button,
  Card,
  Dialog,
  Drawer,
  IconField,
  InputIcon,
  InputText,
  Menu,
  Message,
  Select,
  Skeleton,
  Toolbar,
  Tooltip
} from 'primevue'

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(i18n)
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Material
  }
})

// Register PrimeVue components with 'pv-' prefix (as in catchup and learning-center)
app.component('pv-avatar', Avatar)
app.component('pv-button', Button)
app.component('pv-card', Card)
app.component('pv-dialog', Dialog)
app.component('pv-drawer', Drawer)
app.component('pv-icon-field', IconField)
app.component('pv-input-icon', InputIcon)
app.component('pv-input-text', InputText)
app.component('pv-menu', Menu)
app.component('pv-message', Message)
app.component('pv-select', Select)
app.component('pv-skeleton', Skeleton)
app.component('pv-toolbar', Toolbar)

// Also register standard PrimeVue component names for flexibility
app.component('Avatar', Avatar)
app.component('Button', Button)
app.component('Card', Card)
app.component('Dialog', Dialog)
app.component('Drawer', Drawer)
app.component('IconField', IconField)
app.component('InputIcon', InputIcon)
app.component('InputText', InputText)
app.component('Menu', Menu)
app.component('Message', Message)
app.component('Select', Select)
app.component('Skeleton', Skeleton)
app.component('Toolbar', Toolbar)

app.directive('tooltip', Tooltip)

app.mount('#app')
