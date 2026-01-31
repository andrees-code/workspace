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

// Mis estados locales
const myTasks = ref([])
const loading = ref(true)
const router = useRouter()
const auth = getAuth()
const db = getFirestore()

// Función para ir a buscar mis datos a mi "cajón" personal de Firestore
const fetchMyWorkspace = async () => {
  if (!auth.currentUser) return

  try {
    // Apunto directamente a mi documento usando mi UID único
    const userRef = doc(db, 'users', auth.currentUser.uid)
    const userSnap = await getDoc(userRef)

    // Si el documento existe y tiene tareas, las cargo en mi variable reactiva
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

// Para cerrar la sesión y mandarme de vuelta al login
const handleLogout = async () => {
  await signOut(auth)
  router.push('/login')
}

onMounted(() => {
  // Truco: a veces Firebase tarda un pelo en reconocer al usuario al refrescar.
  // Si no está listo, espero medio segundo antes de pedir las tareas o echar al usuario.
  if (auth.currentUser) {
    fetchMyWorkspace()
  } else {
    setTimeout(() => {
      if (auth.currentUser) fetchMyWorkspace()
      else router.push('/login')
    }, 500)
  }
})
</script>

<style lang="sass">
/* Estilos Sass: aquí le doy el look de "lista profesional" */
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

// El "Empty State" con bordes punteados para que sepa que ahí falta algo
.text-center
  text-align: center
  padding: 4rem 2rem
  background-color: #f9fafb
  border-radius: 12px
  border: 2px dashed #e5e7eb

// Mis tarjetas de tareas con un borde lateral azul para que destaquen
.bg-white
  background-color: #ffffff
  border: 1px solid #e5e7eb
  border-left: 4px solid #3b82f6
  border-radius: 8px
  padding: 1.25rem
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
  display: flex
  justify-content: space-between
  align-items: center
  transition: transform 0.1s ease
  &:hover
    transform: scale(1.01) // Pequeño efecto al pasar el ratón

  div
    h3
      font-size: 0.9rem
      color: #3b82f6
      text-transform: uppercase
      margin: 0 0 0.25rem 0
    p
      font-size: 1.1rem
      color: #1f2937
      font-weight: 500

.text-sm
  background-color: #eff6ff
  color: #1e40af
  padding: 0.4rem 0.8rem
  border-radius: 999px
  font-weight: 600
</style>
