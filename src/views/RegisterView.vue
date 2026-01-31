<template>
  <div class="login-container">
    <transition name="fade" appear>
      <div class="login-card">
        <h2>Registro</h2>

        <form @submit.prevent="handleRegistro" class="form">
          <input v-model="email" type="email" placeholder="Correo" required />
          <input v-model="password" type="password" placeholder="Contraseña" required />

          <button type="submit">Registrar</button>
        </form>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="mensaje" class="success">{{ mensaje }}</p>

        <p class="link">
          ¿Ya tienes cuenta?
          <router-link to="/login">Inicia sesión</router-link>
        </p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registrarUsuario, verificarUsuario } from '@/firebase/auth'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const mensaje = ref('')

const handleRegistro = async () => {
  console.log('Iniciando registro...') // Para ver en consola si entra
  error.value = ''
  mensaje.value = ''

  try {
    const res = await registrarUsuario(email.value, password.value)

    if (!res || !res.ok) {
      error.value = res?.error || 'Error al registrar usuario'
      return
    }

    const usuario = res.usuario

    const resEmail = await verificarUsuario(usuario)

    if (!resEmail.ok) {
      error.value = 'No se pudo enviar el correo de verificación'
      return
    }

    // ✅ Mensaje de éxito
    mensaje.value = '¡Usuario registrado! Revisa tu correo y confirma tu email.'

    // Redirige al login después de 3 segundos
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (err) {
    console.error(err)
    error.value = 'Ocurrió un error inesperado durante el registro'
  }
}
</script>

<style lang="sass">
/* CORRECCIÓN 2: Agregada la clase .error que faltaba */
.login-container
  min-height: 100vh
  display: flex
  align-items: center
  justify-content: center
  background-color: #f3f4f6
  padding: 1.5rem

.login-card
  background: white
  padding: 2.5rem
  border-radius: 16px
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05)
  width: 100%
  max-width: 400px

  h2
    margin-top: 0
    margin-bottom: 1.5rem
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
    transition: border-color 0.2s, box-shadow 0.2s
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
    transition: background-color 0.2s

    &:hover
      background-color: #1d4ed8

.error
  color: #dc2626
  margin-top: 1rem
  font-weight: 500
  font-size: 0.875rem
  background-color: #fef2f2
  padding: 0.75rem
  border-radius: 6px
  border: 1px solid #fee2e2
  text-align: center

.success
  color: #16a34a
  margin-top: 1rem
  font-weight: 500
  font-size: 0.875rem
  background-color: #f0fdf4
  padding: 0.75rem
  border-radius: 6px
  border: 1px solid #dcfce7
  text-align: center

.link
  margin-top: 1.5rem
  text-align: center
  font-size: 0.875rem
  color: #6b7280

  router-link, a
    color: #2563eb
    text-decoration: none
    font-weight: 600
    margin-left: 0.25rem
    &:hover
      text-decoration: underline

// Transiciones de Vue
.fade-enter-active, .fade-leave-active
  transition: opacity 0.5s ease, transform 0.5s ease

.fade-enter-from
  opacity: 0
  transform: translateY(10px)
</style>
