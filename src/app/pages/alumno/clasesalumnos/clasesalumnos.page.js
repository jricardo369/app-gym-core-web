import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';
let ClasesalumnosPage = class ClasesalumnosPage {
    api = inject(ApiService);
    session = inject(SessionService);
    ui = inject(UiService);
    router = inject(Router);
    clases = signal([]);
    cargando = signal(true);
    mensajeError = signal('');
    ngOnInit() {
        this.cargar();
    }
    cargar() {
        this.cargando.set(true);
        this.mensajeError.set('');
        this.clases.set([]);
        this.api.getClases(this.session.sociedad()).subscribe({
            next: async (res) => {
                this.cargando.set(false);
                if (res.codigo === 200) {
                    this.clases.set(Array.isArray(res.respuesta) ? res.respuesta : []);
                }
                else {
                    const msg = res.descripcion || res.mensaje || 'No se pudieron cargar las clases.';
                    this.mensajeError.set(msg);
                    await this.ui.confirmar({
                        titulo: 'No se pudieron cargar las clases',
                        mensaje: msg,
                        soloAceptar: true,
                        confirmarTexto: 'OK',
                    });
                }
            },
            error: () => {
                this.cargando.set(false);
                this.mensajeError.set('No se pudo conectar con el servidor.');
            },
        });
    }
    abrir(clase) {
        this.router.navigate(['/asisalumno', clase.idClase], {
            queryParams: {
                nombre: clase.nombre,
                profesor: clase.profesorNombre || String(clase.profesor ?? ''),
            },
        });
    }
    // ─── Helpers de vista ───────────────────────────────────
    diaTexto(clase) {
        return clase.diaDescripcion || clase.dia || '';
    }
    profesorTexto(clase) {
        return clase.profesorNombre || String(clase.profesor ?? '');
    }
    horarioIcono(clase) {
        return clase.horario === 'M' ? 'sun' : 'moon';
    }
};
ClasesalumnosPage = __decorate([
    Component({
        selector: 'app-clasesalumnos',
        standalone: true,
        imports: [IconComponent],
        templateUrl: './clasesalumnos.page.html',
        styleUrl: './clasesalumnos.page.scss',
    })
], ClasesalumnosPage);
export { ClasesalumnosPage };
