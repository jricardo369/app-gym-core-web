import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';
const DIAS_LARGO = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES_LARGO = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
];
function hoyKey() {
    const d = new Date();
    const pad = (n) => (n < 10 ? '0' + n : String(n));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function fechaLarga(fechaf) {
    const p = fechaf.split('-');
    if (p.length !== 3)
        return fechaf;
    const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    if (isNaN(d.getTime()))
        return fechaf;
    return DIAS_LARGO[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES_LARGO[d.getMonth()];
}
let HorariosPage = class HorariosPage {
    api = inject(ApiService);
    session = inject(SessionService);
    ui = inject(UiService);
    router = inject(Router);
    route = inject(ActivatedRoute);
    fechaf = this.route.snapshot.paramMap.get('fechaf') ?? hoyKey();
    tituloFecha = fechaLarga(this.fechaf);
    clases = signal([]);
    cargando = signal(true);
    mensajeError = signal('');
    procesando = signal(null);
    ngOnInit() {
        this.cargar();
    }
    cargar() {
        const id = this.session.idUsuario();
        if (id == null) {
            this.cargando.set(false);
            this.mensajeError.set('No hay una sesión activa.');
            return;
        }
        this.cargando.set(true);
        this.mensajeError.set('');
        this.clases.set([]);
        this.api.getClasesPorFecha(this.fechaf, id).subscribe({
            next: (res) => {
                this.cargando.set(false);
                if (res.codigo === 200) {
                    this.clases.set(Array.isArray(res.respuesta) ? res.respuesta : []);
                }
                else {
                    this.mensajeError.set(res.descripcion || res.mensaje || 'No se pudieron cargar las clases.');
                }
            },
            error: () => {
                this.cargando.set(false);
                this.mensajeError.set('No se pudo conectar con el servidor.');
            },
        });
    }
    asistir(clase) {
        const id = this.session.idUsuario();
        if (id == null) {
            this.ui.toast('No hay una sesión activa.', 'error');
            return;
        }
        this.procesando.set(clase.idClase);
        this.api.estaEnClase(clase.idClase, id, this.fechaf).subscribe({
            next: (res) => {
                this.procesando.set(null);
                const det = res.respuesta;
                if (res.codigo === 200) {
                    this.ui.toast(det?.mensaje || res.mensaje || 'Asistencia registrada', 'success');
                    this.cargar();
                }
                else {
                    this.ui.toast(det?.descripcion || res.descripcion || res.mensaje || 'No se pudo registrar la asistencia.', 'error');
                }
            },
            error: () => {
                this.procesando.set(null);
                this.ui.toast('No se pudo contactar al servidor.', 'error');
            },
        });
    }
    async quitarAsistencia(clase) {
        const id = this.session.idUsuario();
        if (id == null) {
            this.ui.toast('No hay una sesión activa.', 'error');
            return;
        }
        const ok = await this.ui.confirmar({
            titulo: 'Quitar asistencia',
            mensaje: '¿Seguro que deseas quitar tu asistencia de ' +
                clase.nombre +
                ' (' +
                (clase.descripcionHorario || '') +
                ') del día ' +
                this.fechaf +
                '?',
            confirmarTexto: 'Aceptar',
            cancelarTexto: 'Cancelar',
        });
        if (!ok)
            return;
        this.procesando.set(clase.idClase);
        this.api.cancelarAsistencia(clase.idClase, id, this.fechaf).subscribe({
            next: (res) => {
                this.procesando.set(null);
                if (res.codigo === 200) {
                    this.ui.toast(typeof res.respuesta === 'string' ? res.respuesta : 'Asistencia eliminada', 'success');
                }
                else {
                    this.ui.toast(res.descripcion || res.mensaje || 'No se pudo quitar la asistencia.', 'error');
                }
                this.cargar();
            },
            error: () => {
                this.procesando.set(null);
                this.ui.toast('No se pudo contactar al servidor.', 'error');
            },
        });
    }
    irLugares(clase) {
        const queryParams = {
            descripcionHorario: clase.descripcionHorario ?? '',
            asistencia: String(clase.asistencia ?? 'false'),
            claseLlena: String(clase.claseLlena ?? 'false'),
            isListaEspera: String(clase.isListaEspera ?? 'false'),
        };
        if (clase.lugar != null)
            queryParams['lugar'] = String(clase.lugar);
        this.router.navigate(['/lugares', this.fechaf, clase.idClase], { queryParams });
    }
    atras() {
        this.router.navigate(['/calalumno']);
    }
    // ─── Helpers de vista ───────────────────────────────────
    iconoHorario(clase) {
        if (clase.horario === 'M')
            return 'sun';
        if (clase.horario === 'V')
            return 'moon';
        return 'dumbbell';
    }
    lugaresTexto(clase) {
        return clase.lugaresDisponibles == null ? '' : String(clase.lugaresDisponibles);
    }
    asiste(clase) {
        return String(clase.asistencia ?? '') === 'true';
    }
    tieneLugares(clase) {
        const v = this.lugaresTexto(clase);
        return v !== '' && !v.startsWith('0') && v !== 'CLASE LLENA';
    }
    esClaseLlena(clase) {
        return String(clase.claseLlena ?? '') === 'true' || this.lugaresTexto(clase) === 'CLASE LLENA';
    }
    ocupado(clase) {
        return this.procesando() === clase.idClase;
    }
};
HorariosPage = __decorate([
    Component({
        selector: 'app-horarios',
        standalone: true,
        imports: [IconComponent],
        templateUrl: './horarios.page.html',
        styleUrl: './horarios.page.scss',
    })
], HorariosPage);
export { HorariosPage };
