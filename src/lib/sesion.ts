import { CLAVE_PERSONAL, USUARIO_PERSONAL } from '../constants/personal';
import type { ResultadoLogin } from '../types';

//el mismo mensaje para usuario o clave incorrectos: no revela cual de los dos fallo
export function validarCredenciales(usuario: string, clave: string): ResultadoLogin {
  const usuarioLimpio = usuario.trim();
  if (usuarioLimpio.length === 0 || clave.length === 0) {
    return { ok: false, motivo: 'vacios' };
  }
  if (usuarioLimpio.toLowerCase() !== USUARIO_PERSONAL || clave !== CLAVE_PERSONAL) {
    return { ok: false, motivo: 'incorrectas' };
  }
  return { ok: true, sesion: { usuario: usuarioLimpio.toLowerCase() } };
}
