import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Respuesta, Usuario } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

/** Campos extra que devuelve el listado `Usuarios/` y no están en el modelo base */
export interface UsuarioLista extends Usuario {
  membresia?: string;
  vencimiento?: string;
  tipoPaquete?: string;
  clasesRestantes?: string | number;
}

export type SegmentoFiltro = 'usuarios' | 'coaches';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './perfil.page.html',
  styleUrl: './perfil.page.scss',
})
export class PerfilPage implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private ui = inject(UiService);
  readonly session = inject(SessionService);

  /** Igual que la móvil (infinite scroll pageSize=30): en web con botón "Cargar más" */
  readonly pageSize = 30;

  readonly cargando = signal(true);
  readonly error = signal('');
  readonly usuarios = signal<UsuarioLista[]>([]);
  readonly texto = signal('');
  readonly filtro = signal<SegmentoFiltro>('usuarios');
  readonly visibles = signal(this.pageSize);

  readonly filtrados = computed(() => {
    const rol = this.filtro() === 'coaches' ? 3 : 2;
    const t = this.texto().trim().toLowerCase();
    return this.usuarios().filter(
      (u) =>
        Number(u.idRol) === rol &&
        (!t || (u.nombre ?? '').toLowerCase().includes(t))
    );
  });

  readonly lista = computed(() => this.filtrados().slice(0, this.visibles()));
  readonly hayMas = computed(() => this.visibles() < this.filtrados().length);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api.getUsuarios().subscribe({
      next: (res) => {
        const filas = res.respuesta;
        this.usuarios.set(Array.isArray(filas) ? (filas as UsuarioLista[]) : []);
        this.visibles.set(this.pageSize);
        this.cargando.set(false);
        if (res.codigo !== 200) {
          this.error.set(res.descripcion || res.mensaje || 'No se pudo cargar el listado.');
        }
      },
      error: () => {
        this.usuarios.set([]);
        this.cargando.set(false);
        this.error.set('No se pudo conectar con el servidor.');
      },
    });
  }

  setFiltro(f: SegmentoFiltro): void {
    this.filtro.set(f);
    this.visibles.set(this.pageSize);
  }

  setTexto(e: Event): void {
    this.texto.set((e.target as HTMLInputElement).value);
    this.visibles.set(this.pageSize);
  }

  cargarMas(): void {
    this.visibles.update((v) => v + this.pageSize);
  }

  // ─── Acciones por usuario ────────────────────────────────
  activar(u: UsuarioLista): void {
    this.ui
      .confirmar({
        titulo: 'Activar usuario',
        mensaje: `¿Desea activar a ${u.nombre}?`,
        confirmarTexto: 'Activar',
      })
      .then((ok) => {
        if (!ok) return;
        this.api.activarUser(u.idUsuario).subscribe({
          next: (res) => {
            this.ui.toast(this.mensajeDe(res), res.codigo === 200 ? 'success' : 'error');
            if (res.codigo === 200) this.cargar();
          },
          error: () => this.ui.toast('No se pudo activar el usuario.', 'error'),
        });
      });
  }

  desactivar(u: UsuarioLista): void {
    this.ui
      .confirmar({
        titulo: 'Desactivar usuario',
        mensaje: `¿Desea desactivar a ${u.nombre}?`,
        confirmarTexto: 'Desactivar',
        cancelarTexto: 'Cancelar',
      })
      .then((ok) => {
        if (!ok) return;
        this.api.desactivarUser(u.idUsuario).subscribe({
          next: (res) => {
            this.ui.toast(this.mensajeDe(res), res.codigo === 200 ? 'success' : 'error');
            if (res.codigo === 200) this.cargar();
          },
          error: () => this.ui.toast('No se pudo desactivar el usuario.', 'error'),
        });
      });
  }

  bPago(u: UsuarioLista): void {
    this.ui
      .confirmar({
        titulo: 'Falta de pago',
        mensaje: `¿Marcar falta de pago a ${u.nombre}? Quedará bloqueado.`,
        confirmarTexto: 'Marcar',
      })
      .then((ok) => {
        if (!ok) return;
        this.api.faltaDePago(u.idUsuario).subscribe({
          next: (res) => {
            this.ui.toast(this.mensajeDe(res), res.codigo === 200 ? 'success' : 'error');
            if (res.codigo === 200) this.cargar();
          },
          error: () => this.ui.toast('No se pudo actualizar el pago.', 'error'),
        });
      });
  }

  // ─── Navegación ──────────────────────────────────────────
  abrir(u: UsuarioLista): void {
    const q: Record<string, string> = { usuario: u.usuario ?? '' };
    const soc = u.sociedad || this.session.sociedad();
    if (soc) q['sociedad'] = soc;
    this.router.navigate(['/editarperfil', u.idUsuario], { queryParams: q });
  }

  registro(): void {
    this.router.navigate(['/registro']);
  }

  volver(): void {
    this.router.navigate(['/admin']);
  }

  // ─── Presentación ───────────────────────────────────────
  nombreCorto(nombre?: string): string {
    const n = (nombre ?? '').toString().trim();
    return n.length > 30 ? n.slice(0, 30) + '…' : n;
  }

  iniciales(nombre?: string): string {
    const n = (nombre ?? '').trim();
    if (!n) return '?';
    const partes = n.split(/\s+/);
    return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase();
  }

  subtitulo(u: UsuarioLista): string {
    const rol = Number(u.idRol);
    if (rol === 1) return 'Administrador';
    if (rol === 3) return 'Coach';
    return u.membresia || u.membresiaDesc || 'Alumno';
  }

  estatusInfo(u: UsuarioLista): { cls: string; texto: string } {
    const estatus = Number(u.estatus ?? 0);
    if (estatus === 1) return { cls: 'badge badge-success', texto: 'Activo' };
    if (estatus === 3) return { cls: 'badge badge-warning', texto: 'Falta de pago' };
    return { cls: 'badge badge-danger', texto: 'Inactivo' };
  }

  esAlumno(u: UsuarioLista): boolean {
    return Number(u.idRol) === 2;
  }

  private mensajeDe(res: Respuesta): string {
    const r = res.respuesta as unknown;
    if (typeof r === 'string' && r.trim()) return r;
    if (typeof res.descripcion === 'string' && res.descripcion.trim()) return res.descripcion;
    if (typeof res.mensaje === 'string' && res.mensaje.trim()) return res.mensaje;
    return 'Operación completada.';
  }
}
