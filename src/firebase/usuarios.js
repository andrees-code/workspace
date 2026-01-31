import { db } from './config'
import { doc, setDoc, getDoc } from 'firebase/firestore'

// Crear o actualizar perfil de usuario
export const guardarPerfilUsuario = async (usuarioId, datosPerfil) => {
  try {
    const docRef = doc(db, 'usuarios', usuarioId)
    await setDoc(docRef, datosPerfil)

    return { ok: true }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

// Obtener perfil de usuario
export const obtenerPerfilUsuario = async (usuarioId) => {
  try {
    const docRef = doc(db, "usuarios", usuarioId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { ok: true, perfil: { id: docSnap.id, ...docSnap.data() } }
    } else {
      return { ok: false, error: "No existe el usuario" }
    }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
