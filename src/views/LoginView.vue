<template>
  <div class="login-container">
    <transition name="fade" appear>
      <div class="login-card">
        <h2>Iniciar Sesión</h2>

        <form @submit.prevent="handleLogin" class="form">
          <input v-model="email" type="email" placeholder="Correo" required />
          <input v-model="password" type="password" placeholder="Contraseña" required />
          <button type="submit">Entrar</button>
        </form>

        <p v-if="error" class="error">{{ error }}</p>

        <p class="link">
          ¿No tienes cuenta?
          <router-link to="/register">Regístrate</router-link>
        </p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loggearUsuario } from '@/firebase/auth'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''

  try {
    const res = await loggearUsuario(email.value, password.value)

    if (res.ok) {
      router.push('/')
    } else {
      error.value = res.error
    }
  } catch (err) {
    console.error(err)
    error.value = 'Error al iniciar sesión'
  }
}
</script>
<style lang="sass">
.login-container
  min-height: 100vh
  display: flex
  align-items: center
  justify-content: center
  background-color: #f3f4f6
  padding: 1.5rem

.login-card
  background: #ffffff
  padding: 2.5rem
  border-radius: 16px
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05)
  width: 100%
  max-width: 400px

  h2
    margin: 0 0 1.5rem 0
    font-size: 1.75rem
    font-weight: 800
    color: #111827
    text-align: center

.form
  display: flex
  flex-direction: column
  gap: 1.25rem

  input
    width: 100%
    padding: 0.75rem 1rem
    border: 1px solid #d1d5db
    border-radius: 8px
    font-size: 1rem
    transition: all 0.2s ease
    box-sizing: border-box

    &:focus
      outline: none
      border-color: #2563eb
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)

  button
    width: 100%
    padding: 0.75rem
    background-color: #2563eb
    color: white
    border: none
    border-radius: 8px
    font-size: 1rem
    font-weight: 600
    cursor: pointer
    transition: background-color 0.2s ease

    &:hover
      background-color: #1d4ed8

    &:active
      transform: scale(0.98)

.error
  color: #dc2626
  margin-top: 1.25rem
  font-weight: 500
  font-size: 0.875rem
  background-color: #fef2f2
  padding: 0.75rem
  border-radius: 6px
  border: 1px solid #fee2e2
  text-align: center

.link
  margin-top: 1.5rem
  text-align: center
  font-size: 0.875rem
  color: #6b7280

  a
    color: #2563eb
    text-decoration: none
    font-weight: 600
    margin-left: 0.25rem
    &:hover
      text-decoration: underline

// Animación de entrada
.fade-enter-active
  transition: all 0.4s ease-out

.fade-enter-from
  opacity: 0
  transform: translateY(20px)
</style>
