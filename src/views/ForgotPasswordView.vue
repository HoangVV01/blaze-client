<template>
  <div class="forgot-container">
    <div class="forgot-card">
      <div class="forgot-header">
        <h1>Blaze Chat</h1>
        <p>Forgot your password?</p>
      </div>

      <div v-if="!emailSent" class="forgot-body">
        <p class="forgot-description">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form @submit.prevent="handleForgotPassword" class="forgot-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              placeholder="Enter your email"
              class="form-input"
            />
          </div>

          <button type="submit" class="forgot-button" :disabled="isLoading">
            <span v-if="isLoading"> <font-awesome-icon icon="spinner" spin /> Sending... </span>
            <span v-else> <font-awesome-icon icon="paper-plane" /> Send Reset Link </span>
          </button>
        </form>

        <div v-if="error" class="error-message">
          <font-awesome-icon icon="exclamation-circle" /> {{ error }}
        </div>
      </div>

      <div v-else class="success-body">
        <div class="success-icon">
          <font-awesome-icon icon="check-circle" />
        </div>
        <h2>Check your email</h2>
        <p>
          If an account exists for <strong>{{ email }}</strong
          >, you will receive a password reset link shortly.
        </p>
        <button class="back-button" @click="emailSent = false">
          <font-awesome-icon icon="arrow-left" /> Try another email
        </button>
      </div>

      <div class="login-link">
        <p>
          <router-link to="/login"
            ><font-awesome-icon icon="arrow-left" /> Back to Sign In</router-link
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { forgotPassword } from '../api/auth'

const email = ref('')
const isLoading = ref(false)
const error = ref('')
const emailSent = ref(false)

const handleForgotPassword = async () => {
  isLoading.value = true
  error.value = ''

  try {
    await forgotPassword({ email: email.value })
    emailSent.value = true
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to send reset link. Please try again.'
    console.error('Forgot password error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.forgot-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #667eea;
  padding: 0;
  width: 100%;
}

.forgot-card {
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

@media (min-width: 768px) {
  .forgot-card {
    max-width: 500px;
    height: auto;
    min-height: 400px;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 767px) {
  .forgot-card {
    padding: 30px 20px;
  }

  .forgot-header h1 {
    font-size: 1.5rem;
  }
}

.forgot-header {
  text-align: center;
  margin-bottom: 30px;
}

.forgot-header h1 {
  color: #333;
  font-size: 2rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.forgot-header p {
  color: #666;
  font-size: 0.95rem;
}

.forgot-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
  text-align: center;
  line-height: 1.5;
}

.forgot-form {
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

.forgot-button {
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

.forgot-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.forgot-button:disabled {
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

.success-body {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 3rem;
  color: #28a745;
  margin-bottom: 15px;
}

.success-body h2 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.success-body p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

.back-button {
  background: transparent;
  border: 2px solid #667eea;
  color: #667eea;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.back-button:hover {
  background: #667eea;
  color: white;
}

.login-link {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin-top: 20px;
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
