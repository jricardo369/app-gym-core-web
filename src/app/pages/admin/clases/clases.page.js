import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FiltroPipe } from '../../../core/pipes/filtro.pipe';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';
let ClasesPage = class ClasesPage {
    session = inject(SessionService);
    api = inject(ApiService);
    router = inject(Router);
    ui = inject(UiService);
    textoBuscar = signal('');
    cargando = signal(true);
    clases = signal([]);
    ngOnInit() {
        this.cargar();
    }
    cargar() {
        this.cargando.set(true);
        this.api.getClases(this.session.sociedad()).subscribe({
            next: (res) => {
                this.cargando.set(false);
                if (res.codigo === 200) {
                    this.clases.set((res.respuesta ?? []));
                }
                else {
                    this.errorClases();
                }
            },
            error: () => {
                this.cargando.set(false);
                this.errorClases();
            },
        });
    }
    buscar(event) {
        const el = event.target;
        this.textoBuscar.set(el && el.value ? el.value : '');
    }
    editar(clase) {
        this.router.navigate(['/editarclase', clase.idClase], {
            queryParams: {
                horaInicio: clase.horaInicio,
                horaFin: clase.horaFin,
                horario: clase.horario,
                nombre: clase.nombre,
                profesor: clase.profesor,
                personas: clase.personas,
                estatus: clase.estatus ?? '1',
                dia: clase.dia,
            },
        });
    }
    irCrear() {
        this.router.navigate(['/crearclase']);
    }
    atras() {
        this.router.navigate(['/admin']);
    }
    // ─── Helpers ────────────────────────────────────────────
    diaTexto(clase) {
        return clase.diaDescripcion || clase.dia;
    }
    esActiva(clase) {
        return String(clase.estatus ?? '') === '1';
    }
    iconoHorario(horario) {
        if (horario === 'V')
            return 'moon';
        if (horario === 'M')
            return 'sun';
        return 'dumbbell';
    }
    horarioTexto(clase) {
        return clase.horario === 'V' ? 'Vespertino' : 'Matutino';
    }
    errorClases() {
        this.clases.set([]);
        void this.ui
            .confirmar({
            titulo: 'Error',
            mensaje: 'Error al mostrar las clases',
            soloAceptar: true,
            confirmarTexto: 'OK',
        })
            .then(() => this.router.navigate(['/admin']));
    }
};
ClasesPage = __decorate([
    Component({
        selector: 'app-clases',
        standalone: true,
        imports: [IconComponent, FiltroPipe],
        templateUrl: './clases.page.html',
        styleUrl: './clases.page.scss',
    })
], ClasesPage);
export { ClasesPage };
