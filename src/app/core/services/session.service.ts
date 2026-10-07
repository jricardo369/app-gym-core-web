import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatosSesion, ROL, Usuario } from '../models';

const STORAGE_KEY = 'DatosUsuario';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private router = inject(Router);

  private readonly _usuario = signal<Usuario | null>(null);
  private readonly _cargando = signal(false);

  readonly usuario = this._usuario.asReadonly();
  readonly cargando = this._cargando.asReadonly();

  readonly isLoggedIn = computed(() => this._usuario() !== null);
  readonly isAdmin = computed(() => this._usuario()?.idRol === ROL.ADMIN);
  readonly isUser = computed(() => this._usuario()?.idRol === ROL.ALUMNO);
  readonly isCoach = computed(() => this._usuario()?.idRol === ROL.COACH);

  readonly nombre = computed(() => this._usuario()?.nombre ?? '');
  readonly rol = computed(() => this._usuario()?.idRol ?? null);
  readonly idUsuario = computed(() => this._usuario()?.idUsuario ?? null);
  readonly sociedad = computed(() => this._usuario()?.sociedad ?? '');

  constructor() {
    this.init();
  }

  init(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const datos: DatosSesion | null = JSON.parse(raw);
      if (datos?.respuesta) {
        this._usuario.set(datos.respuesta);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  setSesion(data: DatosSesion): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    this._usuario.set(data.respuesta);
  }

  setUsuario(u: Usuario): void {
    this._usuario.set(u);
  }

  setCargando(v: boolean): void {
    this._cargando.set(v);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._usuario.set(null);
    this.router.navigate(['/login']);
  }

  /** Nombre de pila / iniciales para avatares */
  iniciales(): string {
    const n = this.nombre().trim();
    if (!n) return '?';
    const partes = n.split(/\s+/);
    return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase();
  }

  getRol(): number | null {
    return this._usuario()?.idRol ?? null;
  }
}
