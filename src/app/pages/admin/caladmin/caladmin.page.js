import { __decorate } from "tslib";
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { IconComponent } from '../../../shared/icon/icon.component';
const DIAS_ES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const DIAS_LARGO = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
];
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
let CaladminPage = class CaladminPage {
    session = inject(SessionService);
    api = inject(ApiService);
    router = inject(Router);
    semana = signal([]);
    diaSeleccionado = signal('');
    fechaLabel = signal('');
    tituloMes = signal('');
    clases = signal([]);
    cargando = signal(false);
    sinClases = signal(false);
    mensajeError = signal('');
    totalClases = computed(() => this.clases().length);
    offsetSemana = 0;
    ngOnInit() {
        this.diaSeleccionado.set(keyOf(new Date()));
        this.construirSemana();
        this.cargarClases();
    }
    get esCoach() {
        return this.session.isCoach();
    }
    // ─── Semana (misma máquina que calalumno) ───────────────
    lunesDeLaSemana(base) {
        const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
        const dow = (d.getDay() + 6) % 7; // lunes = 0
        d.setDate(d.getDate() - dow + this.offsetSemana * 7);
        return d;
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
    parseKey(key) {
        if (!key)
            return null;
        const p = key.split('-');
        if (p.length !== 3)
            return null;
        return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
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
        const fecha = this.diaSeleccionado();
        const sociedad = this.session.sociedad();
        if (!fecha || !sociedad) {
            this.clases.set([]);
            this.sinClases.set(true);
            return;
        }
        this.cargando.set(true);
        this.sinClases.set(false);
        this.mensajeError.set('');
        this.clases.set([]);
        const peticion = this.session.isCoach()
            ? this.api.getClasesPorFechaProfesor(fecha, this.session.idUsuario() ?? 0, sociedad)
            : this.api.getClasesActivasAdmin(fecha, sociedad);
        peticion.subscribe({
            next: (res) => {
                this.cargando.set(false);
                if (res.codigo === 200) {
                    const lista = Array.isArray(res.respuesta) ? res.respuesta : [];
                    this.clases.set(lista);
                    this.sinClases.set(lista.length === 0);
                }
                else {
                    this.sinClases.set(false);
                    this.mensajeError.set(res.descripcion || res.mensaje || 'No se pudieron cargar las clases');
                }
            },
            error: () => {
                this.cargando.set(false);
                this.clases.set([]);
                this.sinClases.set(false);
                this.mensajeError.set('No se pudieron cargar las clases');
            },
        });
    }
    verClase(clase) {
        this.router.navigate(['/asistentes', clase.idClase], {
            queryParams: {
                nombre: clase.nombre,
                profesor: clase.profesor,
                fechaf: this.diaSeleccionado(),
                profesorNombre: clase.profesorNombre ?? '',
                descripcionHorario: clase.descripcionHorario ?? '',
            },
        });
    }
    // ─── Helpers ────────────────────────────────────────────
    iconoHorario(horario) {
        if (horario === 'V')
            return 'moon';
        if (horario === 'M')
            return 'sun';
        return 'dumbbell';
    }
    tieneLugares(clase) {
        const v = this.textoLugares(clase.lugaresDisponibles);
        return v !== '' && !v.startsWith('0') && v !== 'CLASE LLENA';
    }
    claseLlena(clase) {
        return this.textoLugares(clase.lugaresDisponibles) === 'CLASE LLENA';
    }
    /** La API puede devolver lugares como número o como texto ('CLASE LLENA'). */
    textoLugares(valor) {
        return valor == null ? '' : String(valor);
    }
};
CaladminPage = __decorate([
    Component({
        selector: 'app-caladmin',
        standalone: true,
        imports: [IconComponent],
        templateUrl: './caladmin.page.html',
        styleUrl: './caladmin.page.scss',
    })
], CaladminPage);
export { CaladminPage };
