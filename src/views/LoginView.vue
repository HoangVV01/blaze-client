<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Blaze Chat</h1>
        <p>Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="loginForm.email"
            required
            placeholder="Enter your email"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="loginForm.password"
            required
            placeholder="Enter your password"
            class="form-input"
          />
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="isLoading"> <font-awesome-icon icon="spinner" spin /> Signing in... </span>
          <span v-else> <font-awesome-icon icon="sign-in-alt" /> Sign In </span>
        </button>
      </form>

      <div v-if="error" class="error-message">
        <font-awesome-icon icon="exclamation-circle" /> {{ error }}
      </div>

      <div class="forgot-password-link">
        <p><router-link to="/forgot-password">Forgot your password?</router-link></p>
      </div>

      <div class="register-link">
        <p>Don't have an account? <router-link to="/register">Sign up here</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/auth'

const router = useRouter()

// Form data
const loginForm = ref({
  email: '',
  password: '',
})

// Loading state
const isLoading = ref(false)

// Error message
const error = ref('')

// Handle login
const handleLogin = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // Make API call to login endpoint
    const response = await login(loginForm.value)

    // Store token and user data in localStorage
    localStorage.setItem('jwt_token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))

    // Redirect to channels page
    router.push('/')
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Login failed. Please check your credentials.'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #667eea;
  padding: 0;
  width: 100%;
}

.login-card {
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
  .login-card {
    max-width: 500px;
    height: auto;
    min-height: 500px;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
}

/* Mobile view - truly full screen */
@media (max-width: 767px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 1.5rem;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #333;
  font-size: 2rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.login-header p {
  color: #666;
  font-size: 0.95rem;
}

.login-form {
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

.login-button {
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.forgot-password-link {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 5px;
}

.forgot-password-link a {
  color: #667eea;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
}

.forgot-password-link a:hover {
  text-decoration: underline;
}

.register-link {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin-top: 15px;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 1.5rem;
  }
}
</style>
