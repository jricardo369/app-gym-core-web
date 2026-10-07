import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';
let PaquetesPage = class PaquetesPage {
    fb = inject(FormBuilder);
    route = inject(ActivatedRoute);
    router = inject(Router);
    api = inject(ApiService);
    ui = inject(UiService);
    session = inject(SessionService);
    idUsuario = signal('');
    sociedad = signal('');
    cargando = signal(true);
    error = signal('');
    tiposInscripcion = signal([]);
    tiposPago = signal([]);
    enviando = signal(false);
    form = this.fb.nonNullable.group({
        tipoPago: ['', Validators.required],
        tipoInscripcion: ['', Validators.required],
        fechaInicio: ['', Validators.required],
        comentario: ['', Validators.required],
    });
    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('idUsuario') ?? '';
        const soc = this.route.snapshot.paramMap.get('sociedad') ?? this.session.sociedad() ?? '';
        this.idUsuario.set(id);
        this.sociedad.set(soc);
        this.cargarCatalogos();
    }
    cargarCatalogos() {
        const soc = this.sociedad();
        forkJoin({
            inscripciones: this.api.tiposInscripcion(soc),
            pagos: this.api.tiposPago(soc),
        }).subscribe({
            next: ({ inscripciones, pagos }) => {
                this.tiposInscripcion.set(inscripciones.codigo === 200 && Array.isArray(inscripciones.respuesta)
                    ? inscripciones.respuesta
                    : []);
                this.tiposPago.set(pagos.codigo === 200 && Array.isArray(pagos.respuesta)
                    ? pagos.respuesta
                    : []);
                this.cargando.set(false);
                if (inscripciones.codigo !== 200 || pagos.codigo !== 200) {
                    this.error.set('No se pudieron cargar todos los catálogos.');
                }
            },
            error: () => {
                this.cargando.set(false);
                this.error.set('No se pudieron cargar los tipos de pago e inscripción.');
            },
        });
    }
    async onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.ui.toast('Todos los campos son necesarios', 'warning');
            return;
        }
        const idUsuario = Number(this.idUsuario());
        if (!Number.isFinite(idUsuario) || idUsuario <= 0) {
            this.ui.toast('Falta el usuario destinatario del paquete.', 'error');
            return;
        }
        const v = this.form.getRawValue();
        const fecha = (v.fechaInicio ?? '').substring(0, 10);
        const obj = {
            idUsuario,
            tipoPago: v.tipoPago,
            tipoInscripcion: v.tipoInscripcion,
            fechaInicio: fecha,
            comentario: v.comentario,
            sociedad: this.sociedad(),
        };
        this.enviando.set(true);
        this.ui.mostrarCarga('Guardando paquete…');
        try {
            const res = await firstValueFrom(this.api.crearPaquete(obj, fecha, this.session.idUsuario() ?? 0));
            this.ui.ocultarCarga();
            if (res.codigo === 500) {
                await this.ui.confirmar({
                    titulo: 'No se pudo crear el paquete',
                    mensaje: res.mensaje || res.descripcion || 'Verifica los datos e intenta de nuevo.',
                    soloAceptar: true,
                    confirmarTexto: 'OK',
                });
                return;
            }
            await this.ui.cargaTemporal(this.mensajeDe(res), 1100);
            this.form.reset({
                tipoPago: '',
                tipoInscripcion: '',
                fechaInicio: '',
                comentario: '',
            });
            this.router.navigate(['/perfil']);
        }
        catch {
            this.ui.ocultarCarga();
            this.ui.toast('No se pudo conectar con el servidor.', 'error');
        }
        finally {
            this.enviando.set(false);
            this.ui.ocultarCarga();
        }
    }
    volver() {
        this.router.navigate(['/perfil']);
    }
    invalido(control) {
        const c = this.form.controls[control];
        return c.touched && c.invalid;
    }
    mensajeDe(res) {
        const r = res.respuesta;
        if (typeof r === 'string' && r.trim())
            return r;
        if (typeof res.descripcion === 'string' && res.descripcion.trim())
            return res.descripcion;
        if (typeof res.mensaje === 'string' && res.mensaje.trim())
            return res.mensaje;
        return 'Paquete creado correctamente.';
    }
};
PaquetesPage = __decorate([
    Component({
        selector: 'app-paquetes',
        standalone: true,
        imports: [ReactiveFormsModule, IconComponent],
        templateUrl: './paquetes.page.html',
        styleUrl: './paquetes.page.scss',
    })
], PaquetesPage);
export { PaquetesPage };
