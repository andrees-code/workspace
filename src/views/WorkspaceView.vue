<template>
  <div class="p-6 max-w-4xl mx-auto">
    <header class="flex justify-between items-center mb-8 border-b pb-4">
      <h1 class="text-2xl font-bold text-blue-700">Mi Área de Trabajo</h1>
      <div class="flex gap-4">
        <router-link to="/" class="text-gray-600 hover:text-black">← Volver al Tablón</router-link>
        <button @click="handleLogout" class="text-red-500 hover:underline">Cerrar Sesión</button>
      </div>
    </header>

    <div v-if="loading" class="text-gray-500">Cargando tus tareas...</div>

    <div v-else-if="myTasks.length === 0" class="text-center py-10 bg-gray-50 rounded">
      <p class="text-gray-600 mb-4">No tienes tareas asignadas.</p>
      <router-link to="/" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Ir a buscar tareas
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="task in myTasks"
        :key="task.id"
        class="bg-white border-l-4 border-blue-500 shadow p-4 rounded flex justify-between items-center"
      >
        <div>
          <h3 class="font-bold">Tarea #{{ task.id }}</h3>
          <p class="text-gray-700">{{ task.todo }}</p>
        </div>
        <div class="text-sm text-gray-500">En progreso</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signOut } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

const myTasks = ref([])
const loading = ref(true)
const router = useRouter()
const auth = getAuth()
const db = getFirestore()

const fetchMyWorkspace = async () => {
  if (!auth.currentUser) return

  try {
    const userRef = doc(db, 'users', auth.currentUser.uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists() && userSnap.data().tasks) {
      myTasks.value = userSnap.data().tasks
    } else {
      myTasks.value = []
    }
  } catch (e) {
    console.error('Error cargando workspace:', e)
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  await signOut(auth)
  router.push('/login')
}

onMounted(() => {
  // Pequeña espera para asegurar que auth.currentUser está listo si venimos de recarga
  // En una app real, usaríamos onAuthStateChanged, pero para simplificar dentro de la vista:
  if (auth.currentUser) {
    fetchMyWorkspace()
  } else {
    // Si firebase aún está inicializando, podemos esperar un poco o redirigir
    setTimeout(() => {
      if (auth.currentUser) fetchMyWorkspace()
      else router.push('/login')
    }, 500)
  }
})
</script>
<style lang="sass">
.p-6
  padding: 1.5rem
  max-width: 900px
  margin: 0 auto
  font-family: 'Segoe UI', system-ui, sans-serif

header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 2rem
  border-bottom: 1px solid #e5e7eb
  padding-bottom: 1.5rem

  h1
    font-size: 1.75rem
    color: #1d4ed8
    font-weight: 800

  .flex
    display: flex
    align-items: center
    gap: 1.5rem

    a
      text-decoration: none
      color: #4b5563
      font-weight: 500
      transition: color 0.2s
      &:hover
        color: #000

    button
      background: none
      border: none
      color: #ef4444
      font-weight: 600
      cursor: pointer
      padding: 0
      &:hover
        text-decoration: underline

// Estado vacío (Empty State)
.text-center
  text-align: center
  padding: 4rem 2rem
  background-color: #f9fafb
  border-radius: 12px
  border: 2px dashed #e5e7eb

  p
    color: #6b7280
    font-size: 1.1rem
    margin-bottom: 1.5rem

  a
    display: inline-block
    background-color: #2563eb
    color: white
    padding: 0.75rem 1.5rem
    border-radius: 8px
    text-decoration: none
    font-weight: 600
    transition: background 0.2s
    &:hover
      background-color: #1d4ed8

// Lista de tareas
.space-y-4
  display: flex
  flex-direction: column
  gap: 1rem

.bg-white
  background-color: #ffffff
  border: 1px solid #e5e7eb
  border-left: 4px solid #3b82f6 // El borde azul acentuado
  border-radius: 8px
  padding: 1.25rem
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
  display: flex
  justify-content: space-between
  align-items: center
  transition: transform 0.1s ease

  &:hover
    transform: scale(1.01)

  div
    h3
      font-size: 0.9rem
      color: #3b82f6
      text-transform: uppercase
      letter-spacing: 0.05em
      margin: 0 0 0.25rem 0

    p
      font-size: 1.1rem
      color: #1f2937
      font-weight: 500
      margin: 0

  .text-sm
    font-size: 0.8rem
    background-color: #eff6ff
    color: #1e40af
    padding: 0.4rem 0.8rem
    border-radius: 999px
    font-weight: 600
    white-space: nowrap

// Mensajes de carga
.text-gray-500
  text-align: center
  padding: 2rem
  color: #6b7280
  font-style: italic
</style>
