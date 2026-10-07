import { __decorate } from "tslib";
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';
let PerfilPage = class PerfilPage {
    api = inject(ApiService);
    router = inject(Router);
    ui = inject(UiService);
    session = inject(SessionService);
    /** Igual que la móvil (infinite scroll pageSize=30): en web con botón "Cargar más" */
    pageSize = 30;
    cargando = signal(true);
    error = signal('');
    usuarios = signal([]);
    texto = signal('');
    filtro = signal('usuarios');
    visibles = signal(this.pageSize);
    filtrados = computed(() => {
        const rol = this.filtro() === 'coaches' ? 3 : 2;
        const t = this.texto().trim().toLowerCase();
        return this.usuarios().filter((u) => Number(u.idRol) === rol &&
            (!t || (u.nombre ?? '').toLowerCase().includes(t)));
    });
    lista = computed(() => this.filtrados().slice(0, this.visibles()));
    hayMas = computed(() => this.visibles() < this.filtrados().length);
    ngOnInit() {
        this.cargar();
    }
    cargar() {
        this.cargando.set(true);
        this.error.set('');
        this.api.getUsuarios().subscribe({
            next: (res) => {
                const filas = res.respuesta;
                this.usuarios.set(Array.isArray(filas) ? filas : []);
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
    setFiltro(f) {
        this.filtro.set(f);
        this.visibles.set(this.pageSize);
    }
    setTexto(e) {
        this.texto.set(e.target.value);
        this.visibles.set(this.pageSize);
    }
    cargarMas() {
        this.visibles.update((v) => v + this.pageSize);
    }
    // ─── Acciones por usuario ────────────────────────────────
    activar(u) {
        this.ui
            .confirmar({
            titulo: 'Activar usuario',
            mensaje: `¿Desea activar a ${u.nombre}?`,
            confirmarTexto: 'Activar',
        })
            .then((ok) => {
            if (!ok)
                return;
            this.api.activarUser(u.idUsuario).subscribe({
                next: (res) => {
                    this.ui.toast(this.mensajeDe(res), res.codigo === 200 ? 'success' : 'error');
                    if (res.codigo === 200)
                        this.cargar();
                },
                error: () => this.ui.toast('No se pudo activar el usuario.', 'error'),
            });
        });
    }
    desactivar(u) {
        this.ui
            .confirmar({
            titulo: 'Desactivar usuario',
            mensaje: `¿Desea desactivar a ${u.nombre}?`,
            confirmarTexto: 'Desactivar',
            cancelarTexto: 'Cancelar',
        })
            .then((ok) => {
            if (!ok)
                return;
            this.api.desactivarUser(u.idUsuario).subscribe({
                next: (res) => {
                    this.ui.toast(this.mensajeDe(res), res.codigo === 200 ? 'success' : 'error');
                    if (res.codigo === 200)
                        this.cargar();
                },
                error: () => this.ui.toast('No se pudo desactivar el usuario.', 'error'),
            });
        });
    }
    bPago(u) {
        this.ui
            .confirmar({
            titulo: 'Falta de pago',
            mensaje: `¿Marcar falta de pago a ${u.nombre}? Quedará bloqueado.`,
            confirmarTexto: 'Marcar',
        })
            .then((ok) => {
            if (!ok)
                return;
            this.api.faltaDePago(u.idUsuario).subscribe({
                next: (res) => {
                    this.ui.toast(this.mensajeDe(res), res.codigo === 200 ? 'success' : 'error');
                    if (res.codigo === 200)
                        this.cargar();
                },
                error: () => this.ui.toast('No se pudo actualizar el pago.', 'error'),
            });
        });
    }
    // ─── Navegación ──────────────────────────────────────────
    abrir(u) {
        const q = { usuario: u.usuario ?? '' };
        const soc = u.sociedad || this.session.sociedad();
        if (soc)
            q['sociedad'] = soc;
        this.router.navigate(['/editarperfil', u.idUsuario], { queryParams: q });
    }
    registro() {
        this.router.navigate(['/registro']);
    }
    volver() {
        this.router.navigate(['/admin']);
    }
    // ─── Presentación ───────────────────────────────────────
    nombreCorto(nombre) {
        const n = (nombre ?? '').toString().trim();
        return n.length > 30 ? n.slice(0, 30) + '…' : n;
    }
    iniciales(nombre) {
        const n = (nombre ?? '').trim();
        if (!n)
            return '?';
        const partes = n.split(/\s+/);
        return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase();
    }
    subtitulo(u) {
        const rol = Number(u.idRol);
        if (rol === 1)
            return 'Administrador';
        if (rol === 3)
            return 'Coach';
        return u.membresia || u.membresiaDesc || 'Alumno';
    }
    estatusInfo(u) {
        const estatus = Number(u.estatus ?? 0);
        if (estatus === 1)
            return { cls: 'badge badge-success', texto: 'Activo' };
        if (estatus === 3)
            return { cls: 'badge badge-warning', texto: 'Falta de pago' };
        return { cls: 'badge badge-danger', texto: 'Inactivo' };
    }
    esAlumno(u) {
        return Number(u.idRol) === 2;
    }
    mensajeDe(res) {
        const r = res.respuesta;
        if (typeof r === 'string' && r.trim())
            return r;
        if (typeof res.descripcion === 'string' && res.descripcion.trim())
            return res.descripcion;
        if (typeof res.mensaje === 'string' && res.mensaje.trim())
            return res.mensaje;
        return 'Operación completada.';
    }
};
PerfilPage = __decorate([
    Component({
        selector: 'app-perfil',
        standalone: true,
        imports: [IconComponent],
        templateUrl: './perfil.page.html',
        styleUrl: './perfil.page.scss',
    })
], PerfilPage);
export { PerfilPage };
