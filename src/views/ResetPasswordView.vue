<template>
  <div class="reset-container">
    <div class="reset-card">
      <div class="reset-header">
        <h1>Blaze Chat</h1>
        <p>Reset your password</p>
      </div>

      <div v-if="!passwordReset" class="reset-body">
        <p class="reset-description">Enter your new password below.</p>

        <form @submit.prevent="handleResetPassword" class="reset-form">
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              v-model="newPassword"
              required
              minlength="6"
              placeholder="Enter your new password"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              required
              minlength="6"
              placeholder="Confirm your new password"
              class="form-input"
            />
          </div>

          <button type="submit" class="reset-button" :disabled="isLoading">
            <span v-if="isLoading"> <font-awesome-icon icon="spinner" spin /> Resetting... </span>
            <span v-else> <font-awesome-icon icon="key" /> Reset Password </span>
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
        <h2>Password reset successful!</h2>
        <p>
          Your password has been changed successfully. You can now sign in with your new password.
        </p>
        <router-link to="/login" class="login-now-button">
          <font-awesome-icon icon="sign-in-alt" /> Sign In Now
        </router-link>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { resetPassword } from '../api/auth'

const route = useRoute()

const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')
const passwordReset = ref(false)
const token = ref('')

onMounted(() => {
  token.value = (route.query.token as string) || ''
  if (!token.value) {
    error.value = 'Invalid or missing reset token. Please request a new password reset link.'
  }
})

const handleResetPassword = async () => {
  error.value = ''

  if (newPassword.value.length < 6) {
    error.value = 'Password must be at least 6 characters long.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  if (!token.value) {
    error.value = 'Invalid reset token. Please request a new password reset link.'
    return
  }

  isLoading.value = true

  try {
    await resetPassword({ token: token.value, newPassword: newPassword.value })
    passwordReset.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to reset password. Please try again.'
    console.error('Reset password error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #667eea;
  padding: 0;
  width: 100%;
}

.reset-card {
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
  .reset-card {
    max-width: 500px;
    height: auto;
    min-height: 450px;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 767px) {
  .reset-card {
    padding: 30px 20px;
  }

  .reset-header h1 {
    font-size: 1.5rem;
  }
}

.reset-header {
  text-align: center;
  margin-bottom: 30px;
}

.reset-header h1 {
  color: #333;
  font-size: 2rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.reset-header p {
  color: #666;
  font-size: 0.95rem;
}

.reset-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
  text-align: center;
  line-height: 1.5;
}

.reset-form {
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

.reset-button {
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

.reset-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.reset-button:disabled {
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

.login-now-button {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 12px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.login-now-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
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
