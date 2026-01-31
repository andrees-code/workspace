<template>
  <div class="p-6 max-w-4xl mx-auto">
    <header class="flex justify-between items-center mb-8 border-b pb-4">
      <h1 class="text-2xl font-bold">Tablón de Tareas Global</h1>
      <div class="flex gap-4">
        <router-link to="/workspace" class="text-blue-600 hover:underline"
          >Ir a mi Workspace</router-link
        >
        <button @click="handleLogout" class="text-red-500 hover:underline">Cerrar Sesión</button>
      </div>
    </header>

    <div class="mb-6">
      <label class="block mb-2 font-semibold">Filtrar tareas:</label>
      <select v-model="filterStatus" class="border p-2 rounded w-full md:w-1/3">
        <option value="all">Todas las tareas</option>
        <option value="completed">Solo Finalizadas</option>
        <option value="pending">Solo Pendientes</option>
        <option value="assigned">Asignadas a algún usuario</option>
      </select>
    </div>

    <div v-if="loading" class="text-gray-500">Cargando tareas...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>

    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="border p-4 rounded shadow-sm bg-white flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start">
            <h3 class="font-bold text-lg text-gray-800">#{{ task.id }}</h3>
            <span
              class="px-2 py-1 text-xs rounded-full"
              :class="
                task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              "
            >
              {{ task.completed ? 'Completada' : 'Pendiente' }}
            </span>
          </div>
          <p class="mt-2 text-gray-600">{{ task.todo }}</p>
        </div>

        <div class="mt-4 pt-4 border-t">
          <div v-if="task.completed" class="text-gray-400 text-sm italic text-center">
            Tarea finalizada (No disponible)
          </div>

          <div v-else-if="assignmentsMap[task.id]">
            <div
              v-if="assignmentsMap[task.id] === auth.currentUser?.uid"
              class="text-blue-600 font-bold text-sm text-center"
            >
              ✅ Esta tarea ya es tuya
            </div>
            <div v-else class="text-orange-500 font-semibold text-sm text-center">
              🔒 Asignada a otro usuario
            </div>
          </div>

          <button
            v-else
            @click="addToMyWorkspace(task)"
            :disabled="addingId === task.id"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full transition"
          >
            {{ addingId === task.id ? 'Agregando...' : 'Agregar al Workspace' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { getAuth, signOut } from 'firebase/auth'
import { getFirestore, doc, arrayUnion, setDoc, collection, onSnapshot } from 'firebase/firestore'

const todos = ref([])
const assignmentsMap = ref({}) // Mapa de { id_tarea: uid_usuario }
const loading = ref(true)
const error = ref(null)
const filterStatus = ref('all')
const addingId = ref(null)

const router = useRouter()
const auth = getAuth()
const db = getFirestore()

// 1. Obtener tareas de la API
const fetchTodos = async () => {
  try {
    const res = await axios.get('https://dummyjson.com/todos?limit=50')
    todos.value = res.data.todos
  } catch (err) {
    error.value = 'Error cargando las tareas.'
  } finally {
    loading.value = false
  }
}

// 2. Escuchar cambios en Firebase para saber qué tareas están ocupadas
const subscribeToGlobalAssignments = () => {
  const q = collection(db, 'users')
  onSnapshot(q, (snapshot) => {
    const mapping = {}
    snapshot.docs.forEach((doc) => {
      const userId = doc.id // El ID del documento es el UID de Firebase
      const data = doc.data()
      if (data.tasks && Array.isArray(data.tasks)) {
        data.tasks.forEach((t) => {
          mapping[t.id] = userId // Guardamos quién es el dueño de la tarea
        })
      }
    })
    assignmentsMap.value = mapping
  })
}

const filteredTasks = computed(() => {
  if (filterStatus.value === 'all') return todos.value
  if (filterStatus.value === 'completed') return todos.value.filter((t) => t.completed)
  if (filterStatus.value === 'pending') return todos.value.filter((t) => !t.completed)
  if (filterStatus.value === 'assigned') {
    return todos.value.filter((t) => assignmentsMap.value[t.id])
  }
  return todos.value
})

const addToMyWorkspace = async (task) => {
  if (!auth.currentUser) return

  addingId.value = task.id
  const userRef = doc(db, 'users', auth.currentUser.uid)

  try {
    const taskData = {
      id: task.id,
      todo: task.todo,
      completed: task.completed,
      assignedAt: new Date().toISOString(),
    }

    // Guardamos en Firebase (REQUISITO EXAMEN)
    await setDoc(
      userRef,
      {
        email: auth.currentUser.email,
        tasks: arrayUnion(taskData),
      },
      { merge: true },
    )
  } catch (e) {
    console.error(e)
    alert('Error al asignar')
  } finally {
    addingId.value = null
  }
}

const handleLogout = async () => {
  await signOut(auth)
  router.push('/login')
}

onMounted(() => {
  fetchTodos()
  subscribeToGlobalAssignments()
})
</script>

<style lang="sass">
// Estilo Sass Indentado
.p-6
  padding: 1.5rem
  max-width: 900px
  margin: 0 auto
  font-family: system-ui, sans-serif

header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 2rem
  border-bottom: 1px solid #e5e7eb
  padding-bottom: 1rem
  h1
    font-size: 1.5rem
    font-weight: 700
  .flex
    display: flex
    gap: 1rem
    a, button
      font-size: 0.875rem
      cursor: pointer
      text-decoration: none
      border: none
      background: none
    .text-blue-600
      color: #2563eb
    .text-red-500
      color: #ef4444

.mb-6
  margin-bottom: 1.5rem
  select
    width: 100%
    padding: 0.5rem
    border-radius: 6px
    border: 1px solid #d1d5db
    @media (min-width: 768px)
      width: 33%

.grid
  display: grid
  grid-template-columns: 1fr
  gap: 1.5rem
  @media (min-width: 768px)
    grid-template-columns: repeat(2, 1fr)

.border
  border: 1px solid #e5e7eb
  border-radius: 12px
  padding: 1.5rem
  background-color: #fff
  box-shadow: 0 1px 3px rgba(0,0,0,0.1)
  display: flex
  flex-direction: column
  justify-content: space-between
  .bg-green-100
    background-color: #dcfce7
    color: #166534
  .bg-yellow-100
    background-color: #fef9c3
    color: #854d0e

.mt-4
  margin-top: 1.25rem
  padding-top: 1.25rem
  border-top: 1px solid #f3f4f6
  button
    background-color: #2563eb
    color: white
    padding: 0.6rem
    border-radius: 6px
    font-weight: 600
    border: none
    width: 100%
    &:disabled
      background-color: #9ca3af
</style>
