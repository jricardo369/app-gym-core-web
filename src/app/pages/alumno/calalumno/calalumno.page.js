import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { IconComponent } from '../../../shared/icon/icon.component';
const DIAS_ES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
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
function pad(n) {
    return n < 10 ? '0' + n : String(n);
}
function keyOf(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
let CalalumnoPage = class CalalumnoPage {
    session = inject(SessionService);
    api = inject(ApiService);
    router = inject(Router);
    semana = signal([]);
    diaSeleccionado = signal(keyOf(new Date()));
    fechaLabel = signal('');
    tituloMes = signal('');
    clases = signal([]);
    cargando = signal(true);
    mensajeError = signal('');
    offsetSemana = 0;
    ngOnInit() {
        this.construirSemana();
        this.cargarClases();
    }
    // ─── Semana ─────────────────────────────────────────────
    lunesDeLaSemana(base) {
        const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
        const dow = (d.getDay() + 6) % 7; // lunes = 0
        d.setDate(d.getDate() - dow + this.offsetSemana * 7);
        return d;
    }
    parseKey(key) {
        if (!key)
            return null;
        const p = key.split('-');
        if (p.length !== 3)
            return null;
        return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    }
    construirSemana() {
        const lunes = this.lunesDeLaSemana(new Date());
        const hoyKey = keyOf(new Date());
        const dias = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i);
            const k = keyOf(d);
            dias.push({ key: k, num: d.getDate(), dow: DIAS_ES[d.getDay()], esHoy: k === hoyKey });
        }
        this.semana.set(dias);
        const ref = this.parseKey(this.diaSeleccionado()) ?? new Date();
        this.fechaLabel.set(DIAS_LARGO[ref.getDay()] + ', ' + ref.getDate() + ' de ' + MESES_LARGO[ref.getMonth()]);
        const mid = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + 3);
        this.tituloMes.set(MESES_LARGO[mid.getMonth()] + ' ' + mid.getFullYear());
    }
    semanaAnterior() {
        this.offsetSemana--;
        this.construirSemana();
    }
    semanaSiguiente() {
        this.offsetSemana++;
        this.construirSemana();
    }
    irHoy() {
        this.offsetSemana = 0;
        this.diaSeleccionado.set(keyOf(new Date()));
        this.construirSemana();
        this.cargarClases();
    }
    seleccionarDia(dia) {
        if (this.diaSeleccionado() === dia.key)
            return;
        this.diaSeleccionado.set(dia.key);
        this.construirSemana();
        this.cargarClases();
    }
    // ─── Clases del día ─────────────────────────────────────
    cargarClases() {
        const id = this.session.idUsuario();
        if (id == null) {
            this.cargando.set(false);
            this.mensajeError.set('No hay una sesión activa.');
            return;
        }
        this.cargando.set(true);
        this.mensajeError.set('');
        this.clases.set([]);
        this.api.getClasesPorFecha(this.diaSeleccionado(), id).subscribe({
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
    verClase(clase) {
        const queryParams = {
            descripcionHorario: clase.descripcionHorario ?? '',
            asistencia: String(clase.asistencia ?? 'false'),
            claseLlena: String(clase.claseLlena ?? 'false'),
            isListaEspera: String(clase.isListaEspera ?? 'false'),
        };
        if (clase.lugar != null)
            queryParams['lugar'] = String(clase.lugar);
        this.router.navigate(['/lugares', this.diaSeleccionado(), clase.idClase], { queryParams });
    }
    irHorarios() {
        this.router.navigate(['/horarios', this.diaSeleccionado()]);
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
};
CalalumnoPage = __decorate([
    Component({
        selector: 'app-calalumno',
        standalone: true,
        imports: [IconComponent],
        templateUrl: './calalumno.page.html',
        styleUrl: './calalumno.page.scss',
    })
], CalalumnoPage);
export { CalalumnoPage };
