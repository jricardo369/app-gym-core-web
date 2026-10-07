import { __decorate } from "tslib";
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ROL } from '../models';
const STORAGE_KEY = 'DatosUsuario';
let SessionService = class SessionService {
    router = inject(Router);
    _usuario = signal(null);
    _cargando = signal(false);
    usuario = this._usuario.asReadonly();
    cargando = this._cargando.asReadonly();
    isLoggedIn = computed(() => this._usuario() !== null);
    isAdmin = computed(() => this._usuario()?.idRol === ROL.ADMIN);
    isUser = computed(() => this._usuario()?.idRol === ROL.ALUMNO);
    isCoach = computed(() => this._usuario()?.idRol === ROL.COACH);
    nombre = computed(() => this._usuario()?.nombre ?? '');
    rol = computed(() => this._usuario()?.idRol ?? null);
    idUsuario = computed(() => this._usuario()?.idUsuario ?? null);
    sociedad = computed(() => this._usuario()?.sociedad ?? '');
    constructor() {
        this.init();
    }
    init() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw)
                return;
            const datos = JSON.parse(raw);
            if (datos?.respuesta) {
                this._usuario.set(datos.respuesta);
            }
        }
        catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }
    setSesion(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        this._usuario.set(data.respuesta);
    }
    setUsuario(u) {
        this._usuario.set(u);
    }
    setCargando(v) {
        this._cargando.set(v);
    }
    logout() {
        localStorage.removeItem(STORAGE_KEY);
        this._usuario.set(null);
        this.router.navigate(['/login']);
    }
    /** Nombre de pila / iniciales para avatares */
    iniciales() {
        const n = this.nombre().trim();
        if (!n)
            return '?';
        const partes = n.split(/\s+/);
        return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase();
    }
    getRol() {
        return this._usuario()?.idRol ?? null;
    }
};
SessionService = __decorate([
    Injectable({ providedIn: 'root' })
], SessionService);
export { SessionService };
