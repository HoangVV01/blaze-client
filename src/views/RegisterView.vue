<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>Blaze Chat</h1>
        <p>Create your account</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="registerForm.email"
            required
            placeholder="Enter your email"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="registerForm.username"
            required
            placeholder="Enter your username"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="registerForm.password"
            required
            placeholder="Enter your password"
            class="form-input"
          />
        </div>

        <button type="submit" class="register-button" :disabled="isLoading">
          <span v-if="isLoading">
            <font-awesome-icon icon="spinner" spin /> Creating account...
          </span>
          <span v-else> <font-awesome-icon icon="user-plus" /> Sign Up </span>
        </button>
      </form>

      <div v-if="error" class="error-message">
        <font-awesome-icon icon="exclamation-circle" /> {{ error }}
      </div>

      <div class="login-link">
        <p>Already have an account? <router-link to="/login">Sign in here</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/auth'
import type { RegisterRequest, RegisterResponse } from '../types/auth'

const router = useRouter()

// Form data
const registerForm = ref<RegisterRequest>({
  email: '',
  username: '',
  password: '',
  avatar: '',
})

// Loading state
const isLoading = ref(false)

// Error message
const error = ref('')

// Handle register
const handleRegister = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // Make API call to register endpoint
    const response: RegisterResponse = await register(registerForm.value)

    // Store token and user data in localStorage
    localStorage.setItem('jwt_token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))

    // Redirect to channels page
    router.push('/')
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Registration failed. Please check your information.'
    console.error('Registration error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #667eea;
  padding: 0;
  width: 100%;
}

.register-card {
  background: white;
  border-radius: 0;
  box-shadow: none;
  padding: 40px;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Responsive design for larger screens */
@media (min-width: 768px) {
  .register-card {
    max-width: 500px;
    height: auto;
    min-height: 500px;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
}

/* Mobile view - truly full screen */
@media (max-width: 767px) {
  .register-card {
    padding: 30px 20px;
  }

  .register-header h1 {
    font-size: 1.5rem;
  }
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: #333;
  font-size: 2rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.register-header p {
  color: #666;
  font-size: 0.95rem;
}

.register-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.register-button {
  width: 100%;
  padding: 14px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.register-button:active:not(:disabled) {
  transform: translateY(0);
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-link {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
