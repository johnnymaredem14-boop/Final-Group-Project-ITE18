<template>
  <div class="page">
    <div class="panel login-box">
      <h1 class="page-title">Employee Leave Management System</h1>

      <div class="logo-box">
        <img src="../assets/logo.svg" alt="ELMS Logo" />
      </div>

      <p class="subtitle">Login Account</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email Address</label>
          <input v-model="email" type="email" placeholder="Enter email address" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="Enter password" />
        </div>

        <button class="btn" type="submit">Login</button>

        <p v-if="errorMessage" class="note warning-text">
          {{ errorMessage }}
        </p>
      </form>



      <p class="note">
          <br />
    <strong></strong> Please contact your system administrator to request access.<br />
      </p>
      <p class="note">
        <br />
        © 2026 ELMS Version 1.0.0 | Developed by Johnny, Lloyd, Leo
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value)

  if (!success) {
    errorMessage.value = 'Invalid email or password.'
    return
  }

  if (authStore.currentUser.role === 'admin') {
    router.push('/admin-dashboard')
  } else {
    router.push('/employee-dashboard')
  }
}
</script>
