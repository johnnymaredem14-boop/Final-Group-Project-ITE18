<template>
  <div class="page-header">
    <div class="header-brand">
      <img src="../assets/logo.svg" alt="ELMS Logo" />
      <h1 class="page-title">{{ title }}</h1>
    </div>

    <button v-if="showLogout" class="btn secondary" @click="logout">Logout</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

defineProps({
  title: {
    type: String,
    required: true
  },
  showLogout: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>
