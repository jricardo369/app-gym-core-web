// Modelos de la API (clock-in-api) — formatos usados por la app móvil

/** Envoltorio genérico de todas las respuestas de la API */
export interface Respuesta<T = unknown> {
  codigo: number;
  mensaje?: string;
  descripcion?: string;
  respuesta?: T;
}

export interface Usuario {
  idUsuario: number;
  usuario: string;
  idRol: number;
  nombre: string;
  correoElectronico?: string;
  telefono?: string;
  sexo?: string;
  contrasenia?: string;
  estatus?: number;
  sociedad?: string;
  terminos?: string;
  peso?: number;
  altura?: number;
  imc?: string;
  nivel?: string;
  fechaNacimiento?: string;
  membresiaDesc?: string;
  totalMultas?: number;
  contadorFaltas?: number;
  intentos?: number;
}

export interface DatosSesion {
  respuesta: Usuario;
}

export interface Clase {
  idClase: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  horario: 'M' | 'V';
  personas: number;
  profesor: number;
  profesorNombre?: string;
  dia: string;
  estatus?: number | string;
  sociedad?: string;
  descripcionHorario?: string;
  // Clases por fecha (alumno/admin)
  lugaresDisponibles?: number;
  asistencia?: string | null;
  lugar?: number | string | null;
  claseLlena?: boolean;
  isListaEspera?: boolean;
}

export interface Inscripcion {
  idInscripcion?: number;
  idUsuario: number;
  tipoPago: number | string;
  tipoInscripcion: number | string;
  fechaInicio: string;
  fecha?: string;
  comentario?: string;
  sociedad?: string;
  // catálogos
  id?: number;
  descripcion?: string;
}

export interface AsistenteClase {
  idUsuario: number;
  nombre: string;
  usuario?: string;
  lugar?: number | string | null;
  asistio?: string;
  sexo?: string;
}

export interface DetalleAsistencia {
  usuarios: AsistenteClase[];
  clase?: Partial<Clase>;
  fecha?: string;
}

export interface LugaresRespuesta {
  l1?: LugarSlot[];
  l2?: LugarSlot[];
  l3?: LugarSlot[];
  l4?: LugarSlot[];
  l5?: LugarSlot[];
}

export interface LugarSlot {
  lugar?: number;
  seleccionado?: boolean;
  idUsuario?: number;
  [k: string]: unknown;
}

export interface Asueto {
  fecha: string;
  fechaDescripcion?: string;
  idClase?: number | string;
  tipo?: number | string;
  sociedad?: string;
}

export interface Configuracion {
  valorAbajo?: string;
  valor?: string;
  [k: string]: unknown;
}

/** Historial de asistencias de un usuario (asistencias-usuario) */
export interface AsistenciaHistorial {
  horario?: 'M' | 'V';
  asistio?: 'A' | 'F';
  descripcionHorario?: string;
  dia?: string;
  lugar?: number | string;
  profesorNombre?: string;
  nombre?: string;
}

export const ROL = {
  ADMIN: 1,
  ALUMNO: 2,
  COACH: 3,
} as const;
