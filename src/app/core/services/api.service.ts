import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay } from 'rxjs';
import { API_URL } from '../app-config';
import {
  AsistenciaHistorial,
  Asueto,
  Clase,
  Configuracion,
  DetalleAsistencia,
  Inscripcion,
  LugaresRespuesta,
  Respuesta,
  Usuario,
} from '../models';

export interface LoginPayload {
  usuario: string;
  contrasenia: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // ─── Genérico ───────────────────────────────────────────
  getData<T = unknown>(url: string): Observable<Respuesta<T>> {
    return this.http.get<Respuesta<T>>(url);
  }

  // ─── Sesión ─────────────────────────────────────────────
  login(payload: LoginPayload): Observable<Respuesta<Usuario>> {
    return this.http.post<Respuesta<Usuario>>(`${API_URL}IniciarSesion/iniciar-sesion`, payload);
  }

  // ─── Usuarios ───────────────────────────────────────────
  getUsuarios(): Observable<Respuesta<Usuario[]>> {
    return this.http.get<Respuesta<Usuario[]>>(`${API_URL}Usuarios/`).pipe(delay(400));
  }

  getUsuario(idUsuario: number | string): Observable<Respuesta<Usuario>> {
    return this.http.get<Respuesta<Usuario>>(`${API_URL}Usuarios/id_usuario/${idUsuario}`);
  }

  getUsuarioPorNombre(usuario: string): Observable<Respuesta<Usuario>> {
    return this.http.get<Respuesta<Usuario>>(`${API_URL}Usuarios/usuario/${usuario}`);
  }

  getEntrenadores(sociedad: string | number): Observable<Respuesta<Usuario[]>> {
    return this.http.get<Respuesta<Usuario[]>>(`${API_URL}Usuarios/entrenadores?sociedad=${sociedad}`);
  }

  crearUsuario(usuario: Partial<Usuario>): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${API_URL}Usuarios/`, usuario);
  }

  editarUsuario(usuario: Partial<Usuario>): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${API_URL}Usuarios`, usuario);
  }

  editarDatosPerfil(datos: {
    idUsuario: number;
    telefono?: string;
    correoElectronico?: string;
    fechaNacimiento?: string;
  }): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${API_URL}Usuarios/actualizar-datos-perfil`, datos);
  }

  activarUser(idUsuario: number): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${API_URL}Usuarios/${idUsuario}/1`, {});
  }

  desactivarUser(idUsuario: number): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${API_URL}Usuarios/${idUsuario}/0`, {});
  }

  faltaDePago(idUsuario: number): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${API_URL}Usuarios/falta-pago/${idUsuario}`, {});
  }

  bloqueoPorPago(idUsuario: number | string): Observable<Respuesta> {
    return this.http.get<Respuesta>(`${API_URL}Usuarios/bloqueo-por-pago/${idUsuario}`);
  }

  usuarioConMensaje(idUsuario: number | string, sociedad: string): Observable<Respuesta> {
    return this.http.get<Respuesta>(
      `${API_URL}Usuarios/usuario-con-mensaje/${idUsuario}?sociedad=${sociedad}`
    );
  }

  recuperarContrasenia(email: string): Observable<Respuesta> {
    return this.http.get<Respuesta>(`${API_URL}Usuarios/${email}`);
  }

  cambiarContrasenia(payload: {
    idUsuario: number;
    contraseniaAnterior: string;
    contraseniaNueva: string;
  }): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${API_URL}Usuarios/cambio-contrasenia/`, payload);
  }

  aceptarTerminos(idUsuario: number): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${API_URL}Usuarios/terminos/${idUsuario}`, {});
  }

  // ─── Multas / faltas ────────────────────────────────────
  agregarFalta(
    idUsuario: number,
    idUsuarioModificante: number,
    lugar: number | string,
    idClase: number,
    fecha: string,
    tipo: 'I' | 'CFC'
  ): Observable<Respuesta> {
    return this.http.put<Respuesta>(
      `${API_URL}Usuarios/multas/${idUsuario}?idUsuarioModificante=${idUsuarioModificante}&funcion=${tipo}&idClase=${idClase}&lugar=${lugar}&fecha=${fecha}`,
      {}
    );
  }

  eliminarFaltas(idUsuario: number, idUsuarioModificante: number): Observable<Respuesta> {
    return this.http.put<Respuesta>(
      `${API_URL}Usuarios/multas/${idUsuario}?idUsuarioModificante=${idUsuarioModificante}&funcion=E`,
      {}
    );
  }

  ajustarFalta(
    idUsuario: number,
    idUsuarioModificante: number,
    tipo: 'I' | 'E'
  ): Observable<Respuesta> {
    return this.http.put<Respuesta>(
      `${API_URL}Usuarios/faltas/${idUsuario}?idUsuarioModificante=${idUsuarioModificante}&funcion=${tipo}`,
      {}
    );
  }

  // ─── Inscripciones / paquetes ───────────────────────────
  getInscripciones(idUsuario: number | string, sociedad: string): Observable<Respuesta<Inscripcion[]>> {
    return this.http
      .get<Respuesta<Inscripcion[]>>(
        `${API_URL}Inscripciones?idUsuario=${idUsuario}&sociedad=${sociedad}`
      )
      .pipe(delay(400));
  }

  crearPaquete(
    paquete: Partial<Inscripcion>,
    fecha: string,
    idUsuarioCreador: number | string
  ): Observable<Respuesta> {
    return this.http.post<Respuesta>(
      `${API_URL}Inscripciones?fecha=${fecha}&idUsuario=${idUsuarioCreador}`,
      paquete
    );
  }

  tiposInscripcion(sociedad: string): Observable<Respuesta<Inscripcion[]>> {
    return this.http.get<Respuesta<Inscripcion[]>>(
      `${API_URL}Inscripciones/tipos-inscripcion?sociedad=${sociedad}`
    );
  }

  tiposPago(sociedad: string): Observable<Respuesta<Inscripcion[]>> {
    return this.http.get<Respuesta<Inscripcion[]>>(
      `${API_URL}Inscripciones/tipos-pago?sociedad=${sociedad}`
    );
  }

  // ─── Clases ─────────────────────────────────────────────
  getClases(sociedad?: string): Observable<Respuesta<Clase[]>> {
    const url = sociedad != null && sociedad !== ''
      ? `${API_URL}Clases?sociedad=${sociedad}`
      : `${API_URL}Clases`;
    return this.http.get<Respuesta<Clase[]>>(url);
  }

  getClasesPorFecha(fecha: string, idUsuario: number | string): Observable<Respuesta<Clase[]>> {
    return this.http.get<Respuesta<Clase[]>>(`${API_URL}Clases/por-fecha/${fecha}/${idUsuario}`);
  }

  getClasesPorFechaProfesor(
    fecha: string,
    idProfesor: number | string,
    sociedad: string
  ): Observable<Respuesta<Clase[]>> {
    return this.http.get<Respuesta<Clase[]>>(
      `${API_URL}Clases/por-fecha/profesor/${fecha}/${idProfesor}?sociedad=${sociedad}`
    );
  }

  getClasesActivasAdmin(fecha: string, sociedad: string): Observable<Respuesta<Clase[]>> {
    return this.http.get<Respuesta<Clase[]>>(
      `${API_URL}Clases/activas-para-admin/${fecha}?sociedad=${sociedad}`
    );
  }

  estaEnClase(
    idClase: number,
    idUsuario: number | string,
    fecha: string
  ): Observable<Respuesta<DetalleAsistencia>> {
    return this.http.get<Respuesta<DetalleAsistencia>>(
      `${API_URL}Clases/esta-en-clase/${idClase}/${idUsuario}/${fecha}`
    );
  }

  crearClase(clase: Partial<Clase>): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${API_URL}Clases`, clase);
  }

  editarClase(clase: Partial<Clase>): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${API_URL}Clases`, clase);
  }

  eliminarClase(idClase: number): Observable<Respuesta> {
    return this.http.delete<Respuesta>(`${API_URL}Clases/${idClase}`);
  }

  // ─── Asistencias ────────────────────────────────────────
  getLugares(idClase: number, fecha: string): Observable<Respuesta<LugaresRespuesta>> {
    return this.http
      .get<Respuesta<LugaresRespuesta>>(
        `${API_URL}AsistenciaClases/lugares/${idClase}?fecha=${fecha}`
      )
      .pipe(delay(300));
  }

  getAsistentes(
    idClase: number,
    fecha: string,
    sociedad: string
  ): Observable<Respuesta<DetalleAsistencia>> {
    return this.http.get<Respuesta<DetalleAsistencia>>(
      `${API_URL}AsistenciaClases/${idClase}?fecha=${fecha}&sociedad=${sociedad}`
    );
  }

  getAsistenciasUsuario(idUsuario: number | string): Observable<Respuesta<AsistenciaHistorial[]>> {
    return this.http.get<Respuesta<AsistenciaHistorial[]>>(
      `${API_URL}AsistenciaClases/asistencias-usuario/${idUsuario}`
    );
  }

  apartarLugar(
    idClase: number,
    idUsuario: number | string,
    fecha: string,
    lugar: number | string
  ): Observable<Respuesta> {
    return this.http.post<Respuesta>(
      `${API_URL}AsistenciaClases/${idClase}/${idUsuario}?fecha=${fecha}&lugar=${lugar}`,
      {}
    );
  }

  cancelarAsistencia(
    idClase: number,
    idUsuario: number | string,
    fecha: string
  ): Observable<Respuesta> {
    return this.http.delete<Respuesta>(
      `${API_URL}AsistenciaClases/${idClase}/${idUsuario}?fecha=${fecha}`
    );
  }

  agregarListaEspera(
    idClase: number,
    idUsuario: number | string,
    fecha: string
  ): Observable<Respuesta> {
    return this.http.post<Respuesta>(
      `${API_URL}lista-espera/${idClase}/${idUsuario}?fecha=${fecha}`,
      {}
    );
  }

  quitarListaEspera(
    idClase: number,
    idUsuario: number | string,
    fecha: string
  ): Observable<Respuesta> {
    return this.http.delete<Respuesta>(
      `${API_URL}lista-espera/${idClase}/${idUsuario}?fecha=${fecha}`
    );
  }

  // ─── Asuetos ────────────────────────────────────────────
  getAsuetos(): Observable<Respuesta<Asueto[]>> {
    return this.http.get<Respuesta<Asueto[]>>(`${API_URL}Asuetos`);
  }

  crearAsueto(asueto: Partial<Asueto>): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${API_URL}Asuetos`, asueto);
  }

  eliminarAsueto(fecha: string): Observable<Respuesta> {
    return this.http.delete<Respuesta>(`${API_URL}Asuetos?fecha=${fecha}`);
  }

  // ─── Configuraciones ────────────────────────────────────
  getConfigHorasCancelacion(): Observable<Respuesta<Configuracion[]>> {
    return this.http.get<Respuesta<Configuracion[]>>(
      `${API_URL}Configuraciones/por-identificado/HORAS-PERMITIDAS-CANCELACION`
    );
  }
}
