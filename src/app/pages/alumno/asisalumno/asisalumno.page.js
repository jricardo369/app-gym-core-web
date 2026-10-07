import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';
function hoyKey() {
    const d = new Date();
    const pad = (n) => (n < 10 ? '0' + n : String(n));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
let AsisalumnoPage = class AsisalumnoPage {
    api = inject(ApiService);
    session = inject(SessionService);
    ui = inject(UiService);
    router = inject(Router);
    route = inject(ActivatedRoute);
    idClase = Number(this.route.snapshot.paramMap.get('idClase') ?? 0);
    nombre = this.route.snapshot.queryParamMap.get('nombre') ?? 'Clase';
    profesor = this.route.snapshot.queryParamMap.get('profesor') ?? '';
    fecha = signal(hoyKey());
    asistentes = signal([]);
    lugares = signal('');
    cargando = signal(true);
    mensajeError = signal('');
    procesando = signal(false);
    ngOnInit() {
        this.cargar();
    }
    cargar() {
        this.cargando.set(true);
        this.mensajeError.set('');
        this.asistentes.set([]);
        this.api.getAsistentes(this.idClase, this.fecha(), this.session.sociedad()).subscribe({
            next: (res) => {
                this.cargando.set(false);
                if (res.codigo === 200) {
                    const det = res.respuesta;
                    this.asistentes.set(det?.usuarios ?? []);
                    this.lugares.set(det?.lugares != null ? String(det.lugares) : '');
                }
                else {
                    this.mensajeError.set(res.descripcion || res.mensaje || 'No se pudo cargar la lista de asistentes.');
                }
            },
            error: () => {
                this.cargando.set(false);
                this.mensajeError.set('No se pudo conectar con el servidor.');
            },
        });
    }
    cambiarFecha(ev) {
        const valor = ev.target.value;
        if (!valor)
            return;
        this.fecha.set(valor.substring(0, 10));
        this.cargar();
    }
    asistir() {
        this.router.navigate(['/lugares', this.fecha(), this.idClase], {
            queryParams: {
                descripcionHorario: this.nombre,
                asistencia: 'false',
                claseLlena: 'false',
                isListaEspera: 'false',
            },
        });
    }
    async quitarPropia() {
        const id = this.session.idUsuario();
        if (id == null) {
            this.ui.toast('No hay una sesión activa.', 'error');
            return;
        }
        await this.quitar(id, 'tu asistencia');
    }
    async quitarAsistente(asistente) {
        await this.quitar(asistente.idUsuario, 'la asistencia de ' + asistente.nombre);
    }
    async quitar(idAsistente, que) {
        const ok = await this.ui.confirmar({
            titulo: 'Quitar asistencia',
            mensaje: '¿Seguro que deseas quitar ' +
                que +
                ' del día ' +
                this.fecha() +
                '?',
            confirmarTexto: 'Aceptar',
            cancelarTexto: 'Cancelar',
        });
        if (!ok)
            return;
        this.procesando.set(true);
        this.api.cancelarAsistencia(this.idClase, idAsistente, this.fecha()).subscribe({
            next: (res) => {
                this.procesando.set(false);
                if (res.codigo === 200) {
                    this.ui.toast('Asistencia eliminada', 'success');
                }
                else {
                    this.ui.toast(res.descripcion || res.mensaje || 'No se pudo quitar la asistencia.', 'error');
                }
                this.cargar();
            },
            error: () => {
                this.procesando.set(false);
                this.ui.toast('No se pudo contactar al servidor.', 'error');
            },
        });
    }
    atras() {
        this.router.navigate(['/clasesalumnos']);
    }
    // ─── Helpers de vista ───────────────────────────────────
    esYo(asistente) {
        return asistente.idUsuario === this.session.idUsuario();
    }
    yoEstoy() {
        const id = this.session.idUsuario();
        return this.asistentes().some((a) => a.idUsuario === id);
    }
    asistio(asistente) {
        return String(asistente.asistio ?? '') === 'A';
    }
};
AsisalumnoPage = __decorate([
    Component({
        selector: 'app-asisalumno',
        standalone: true,
        imports: [IconComponent],
        templateUrl: './asisalumno.page.html',
        styleUrl: './asisalumno.page.scss',
    })
], AsisalumnoPage);
export { AsisalumnoPage };
