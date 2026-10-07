import { __decorate } from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { delay } from 'rxjs';
import { API_URL } from '../app-config';
let ApiService = class ApiService {
    http = inject(HttpClient);
    // ─── Genérico ───────────────────────────────────────────
    getData(url) {
        return this.http.get(url);
    }
    // ─── Sesión ─────────────────────────────────────────────
    login(payload) {
        return this.http.post(`${API_URL}IniciarSesion/iniciar-sesion`, payload);
    }
    // ─── Usuarios ───────────────────────────────────────────
    getUsuarios() {
        return this.http.get(`${API_URL}Usuarios/`).pipe(delay(400));
    }
    getUsuario(idUsuario) {
        return this.http.get(`${API_URL}Usuarios/id_usuario/${idUsuario}`);
    }
    getUsuarioPorNombre(usuario) {
        return this.http.get(`${API_URL}Usuarios/usuario/${usuario}`);
    }
    getEntrenadores(sociedad) {
        return this.http.get(`${API_URL}Usuarios/entrenadores?sociedad=${sociedad}`);
    }
    crearUsuario(usuario) {
        return this.http.post(`${API_URL}Usuarios/`, usuario);
    }
    editarUsuario(usuario) {
        return this.http.put(`${API_URL}Usuarios`, usuario);
    }
    editarDatosPerfil(datos) {
        return this.http.put(`${API_URL}Usuarios/actualizar-datos-perfil`, datos);
    }
    activarUser(idUsuario) {
        return this.http.put(`${API_URL}Usuarios/${idUsuario}/1`, {});
    }
    desactivarUser(idUsuario) {
        return this.http.put(`${API_URL}Usuarios/${idUsuario}/0`, {});
    }
    faltaDePago(idUsuario) {
        return this.http.put(`${API_URL}Usuarios/falta-pago/${idUsuario}`, {});
    }
    bloqueoPorPago(idUsuario) {
        return this.http.get(`${API_URL}Usuarios/bloqueo-por-pago/${idUsuario}`);
    }
    usuarioConMensaje(idUsuario, sociedad) {
        return this.http.get(`${API_URL}Usuarios/usuario-con-mensaje/${idUsuario}?sociedad=${sociedad}`);
    }
    recuperarContrasenia(email) {
        return this.http.get(`${API_URL}Usuarios/${email}`);
    }
    cambiarContrasenia(payload) {
        return this.http.put(`${API_URL}Usuarios/cambio-contrasenia/`, payload);
    }
    aceptarTerminos(idUsuario) {
        return this.http.put(`${API_URL}Usuarios/terminos/${idUsuario}`, {});
    }
    // ─── Multas / faltas ────────────────────────────────────
    agregarFalta(idUsuario, idUsuarioModificante, lugar, idClase, fecha, tipo) {
        return this.http.put(`${API_URL}Usuarios/multas/${idUsuario}?idUsuarioModificante=${idUsuarioModificante}&funcion=${tipo}&idClase=${idClase}&lugar=${lugar}&fecha=${fecha}`, {});
    }
    eliminarFaltas(idUsuario, idUsuarioModificante) {
        return this.http.put(`${API_URL}Usuarios/multas/${idUsuario}?idUsuarioModificante=${idUsuarioModificante}&funcion=E`, {});
    }
    ajustarFalta(idUsuario, idUsuarioModificante, tipo) {
        return this.http.put(`${API_URL}Usuarios/faltas/${idUsuario}?idUsuarioModificante=${idUsuarioModificante}&funcion=${tipo}`, {});
    }
    // ─── Inscripciones / paquetes ───────────────────────────
    getInscripciones(idUsuario, sociedad) {
        return this.http
            .get(`${API_URL}Inscripciones?idUsuario=${idUsuario}&sociedad=${sociedad}`)
            .pipe(delay(400));
    }
    crearPaquete(paquete, fecha, idUsuarioCreador) {
        return this.http.post(`${API_URL}Inscripciones?fecha=${fecha}&idUsuario=${idUsuarioCreador}`, paquete);
    }
    tiposInscripcion(sociedad) {
        return this.http.get(`${API_URL}Inscripciones/tipos-inscripcion?sociedad=${sociedad}`);
    }
    tiposPago(sociedad) {
        return this.http.get(`${API_URL}Inscripciones/tipos-pago?sociedad=${sociedad}`);
    }
    // ─── Clases ─────────────────────────────────────────────
    getClases(sociedad) {
        const url = sociedad != null && sociedad !== ''
            ? `${API_URL}Clases?sociedad=${sociedad}`
            : `${API_URL}Clases`;
        return this.http.get(url);
    }
    getClasesPorFecha(fecha, idUsuario) {
        return this.http.get(`${API_URL}Clases/por-fecha/${fecha}/${idUsuario}`);
    }
    getClasesPorFechaProfesor(fecha, idProfesor, sociedad) {
        return this.http.get(`${API_URL}Clases/por-fecha/profesor/${fecha}/${idProfesor}?sociedad=${sociedad}`);
    }
    getClasesActivasAdmin(fecha, sociedad) {
        return this.http.get(`${API_URL}Clases/activas-para-admin/${fecha}?sociedad=${sociedad}`);
    }
    estaEnClase(idClase, idUsuario, fecha) {
        return this.http.get(`${API_URL}Clases/esta-en-clase/${idClase}/${idUsuario}/${fecha}`);
    }
    crearClase(clase) {
        return this.http.post(`${API_URL}Clases`, clase);
    }
    editarClase(clase) {
        return this.http.put(`${API_URL}Clases`, clase);
    }
    eliminarClase(idClase) {
        return this.http.delete(`${API_URL}Clases/${idClase}`);
    }
    // ─── Asistencias ────────────────────────────────────────
    getLugares(idClase, fecha) {
        return this.http
            .get(`${API_URL}AsistenciaClases/lugares/${idClase}?fecha=${fecha}`)
            .pipe(delay(300));
    }
    getAsistentes(idClase, fecha, sociedad) {
        return this.http.get(`${API_URL}AsistenciaClases/${idClase}?fecha=${fecha}&sociedad=${sociedad}`);
    }
    getAsistenciasUsuario(idUsuario) {
        return this.http.get(`${API_URL}AsistenciaClases/asistencias-usuario/${idUsuario}`);
    }
    apartarLugar(idClase, idUsuario, fecha, lugar) {
        return this.http.post(`${API_URL}AsistenciaClases/${idClase}/${idUsuario}?fecha=${fecha}&lugar=${lugar}`, {});
    }
    cancelarAsistencia(idClase, idUsuario, fecha) {
        return this.http.delete(`${API_URL}AsistenciaClases/${idClase}/${idUsuario}?fecha=${fecha}`);
    }
    agregarListaEspera(idClase, idUsuario, fecha) {
        return this.http.post(`${API_URL}lista-espera/${idClase}/${idUsuario}?fecha=${fecha}`, {});
    }
    quitarListaEspera(idClase, idUsuario, fecha) {
        return this.http.delete(`${API_URL}lista-espera/${idClase}/${idUsuario}?fecha=${fecha}`);
    }
    // ─── Asuetos ────────────────────────────────────────────
    getAsuetos() {
        return this.http.get(`${API_URL}Asuetos`);
    }
    crearAsueto(asueto) {
        return this.http.post(`${API_URL}Asuetos`, asueto);
    }
    eliminarAsueto(fecha) {
        return this.http.delete(`${API_URL}Asuetos?fecha=${fecha}`);
    }
    // ─── Configuraciones ────────────────────────────────────
    getConfigHorasCancelacion() {
        return this.http.get(`${API_URL}Configuraciones/por-identificado/HORAS-PERMITIDAS-CANCELACION`);
    }
};
ApiService = __decorate([
    Injectable({ providedIn: 'root' })
], ApiService);
export { ApiService };
