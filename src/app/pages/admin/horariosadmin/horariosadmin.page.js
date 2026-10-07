import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';
let HorariosadminPage = class HorariosadminPage {
    session = inject(SessionService);
    api = inject(ApiService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    ui = inject(UiService);
    fechaf = this.route.snapshot.paramMap.get('fechaf') ?? '';
    clases = signal([]);
    cargando = signal(true);
    ngOnInit() {
        this.cargar();
    }
    get esAdmin() {
        return this.session.isAdmin();
    }
    cargar() {
        if (!this.fechaf) {
            this.errorClases();
            return;
        }
        this.cargando.set(true);
        const sociedad = this.session.sociedad();
        const peticion = this.session.isCoach()
            ? this.api.getClasesPorFechaProfesor(this.fechaf, this.session.idUsuario() ?? 0, sociedad)
            : this.api.getClasesActivasAdmin(this.fechaf, sociedad);
        peticion.subscribe({
            next: (res) => {
                this.cargando.set(false);
                if (res.codigo === 200) {
                    this.clases.set(Array.isArray(res.respuesta) ? res.respuesta : []);
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
    atras() {
        this.router.navigate(['/caladmin']);
    }
    verClase(clase) {
        this.router.navigate(['/asistentes', clase.idClase], {
            queryParams: {
                nombre: clase.nombre,
                profesor: clase.profesor,
                fechaf: this.fechaf,
                profesorNombre: clase.profesorNombre ?? '',
                descripcionHorario: clase.descripcionHorario ?? '',
            },
        });
    }
    iconoHorario(horario) {
        if (horario === 'V')
            return 'moon';
        if (horario === 'M')
            return 'sun';
        return 'dumbbell';
    }
    lugaresTexto(clase) {
        const v = this.textoLugares(clase.lugaresDisponibles);
        return v === '' ? '—' : v;
    }
    lugaresBadge(clase) {
        const v = this.textoLugares(clase.lugaresDisponibles);
        if (v === 'CLASE LLENA')
            return 'badge badge-danger';
        if (v === '')
            return 'badge badge-muted';
        return v.startsWith('0') ? 'badge badge-warning' : 'badge badge-success';
    }
    /** La API puede devolver lugares como número o como texto ('CLASE LLENA'). */
    textoLugares(valor) {
        return valor == null ? '' : String(valor);
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
            .then(() => this.router.navigate(['/caladmin']));
    }
};
HorariosadminPage = __decorate([
    Component({
        selector: 'app-horariosadmin',
        standalone: true,
        imports: [IconComponent],
        templateUrl: './horariosadmin.page.html',
        styleUrl: './horariosadmin.page.scss',
    })
], HorariosadminPage);
export { HorariosadminPage };
