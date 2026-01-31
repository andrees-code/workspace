import { auth } from "./config";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut } from "firebase/auth";

export const registrarUsuario = async(email, password) => {
  try {
    const usuario = await createUserWithEmailAndPassword(auth, email, password)
    return {ok: true, usuario : usuario.user}

  } catch {
    print('ola')
  }
}
export const loggearUsuario = async(email, password) => {
  try {
    const usuario = await signInWithEmailAndPassword(auth, email, password)
    return {ok: true, usuario : usuario.user}

  } catch(error) {
    return {ok: false, error: error.message}
  }
}


export const cerrarSesion = async () => {
  try {
    await signOut(auth)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}



export const verificarUsuario = async (usuarioActual = null) => {
    try {
        const usuario = usuarioActual || auth.currentUser
        if (!usuario) throw new Error('Usuario no encontrado')

        if (usuario.emailVerified) {
            console.log('Email ya verificado')
            return { ok: true, mensaje: 'Email ya verificado' }
        }

        await sendEmailVerification(usuario, {
            url: window.location.origin + '/home'
        })

        console.log('Email de verificación enviado')
        return { ok: true, mensaje: 'Email de verificación enviado' }

    } catch (error) {
        console.error('Error al enviar el correo de verificación:', error)
        return { ok: false, error: error.message }
    }
}
