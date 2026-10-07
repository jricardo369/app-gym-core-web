import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';
let CrearpaquetePage = class CrearpaquetePage {
    route = inject(ActivatedRoute);
    router = inject(Router);
    api = inject(ApiService);
    ui = inject(UiService);
    idUsuario = signal('');
    sociedad = signal('');
    idRol = signal(null);
    cargando = signal(true);
    error = signal('');
    inscripciones = signal([]);
    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('idUsuario') ?? '';
        const soc = this.route.snapshot.paramMap.get('sociedad') ?? '';
        const rol = this.route.snapshot.queryParamMap.get('idRol');
        this.idUsuario.set(id);
        this.sociedad.set(soc);
        this.idRol.set(rol != null && rol !== '' ? Number(rol) : null);
        this.cargar();
    }
    get puedeAgregar() {
        const rol = this.idRol();
        return rol === null || rol === 2;
    }
    cargar() {
        this.cargando.set(true);
        this.error.set('');
        this.api.getInscripciones(this.idUsuario(), this.sociedad()).subscribe({
            next: (res) => this.aplicar(res),
            error: () => {
                this.inscripciones.set([]);
                this.cargando.set(false);
                this.error.set('No se pudo cargar el historial de paquetes.');
            },
        });
    }
    aplicar(res) {
        this.cargando.set(false);
        if (res.codigo !== 200) {
            this.inscripciones.set([]);
            this.error.set(res.descripcion || res.mensaje || 'No se pudo cargar el historial.');
            return;
        }
        const filas = res.respuesta;
        this.inscripciones.set(Array.isArray(filas) ? filas : []);
    }
    agregarPaquete() {
        this.router.navigate(['/paquetes', this.idUsuario(), this.sociedad()], {
            queryParams: this.idRol() != null ? { idRol: String(this.idRol()) } : undefined,
        });
    }
    volver() {
        this.router.navigate(['/editarperfil', this.idUsuario()]);
    }
    nombrePaquete(item) {
        return item.tipoInscripcionDesc || 'Membresía';
    }
};
CrearpaquetePage = __decorate([
    Component({
        selector: 'app-crearpaquete',
        standalone: true,
        imports: [IconComponent],
        templateUrl: './crearpaquete.page.html',
        styleUrl: './crearpaquete.page.scss',
    })
], CrearpaquetePage);
export { CrearpaquetePage };
