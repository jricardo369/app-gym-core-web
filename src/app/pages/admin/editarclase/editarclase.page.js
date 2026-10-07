import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';
const HORA = /^([0-9]|1[0-9]|2[0-3])$/;
const PERSONAS = /^\d{1,3}$/;
let EditarclasePage = class EditarclasePage {
    fb = inject(FormBuilder);
    api = inject(ApiService);
    session = inject(SessionService);
    ui = inject(UiService);
    router = inject(Router);
    route = inject(ActivatedRoute);
    query = this.route.snapshot.queryParamMap;
    idClase = Number(this.route.snapshot.paramMap.get('idClase') ?? '0');
    entrenadores = signal([]);
    cargandoEntrenadores = signal(true);
    enviando = signal(false);
    ec = this.fb.group({
        nombre: ['', [Validators.required, Validators.maxLength(60)]],
        horaInicio: ['', [Validators.required, Validators.pattern(HORA)]],
        horaFin: ['', [Validators.required, Validators.pattern(HORA)]],
        horario: ['M', Validators.required],
        personas: ['', [Validators.required, Validators.pattern(PERSONAS)]],
        profesor: [null, Validators.required],
        dia: ['', Validators.required],
        estatus: ['1', Validators.required],
    });
    ngOnInit() {
        this.ec.patchValue({
            nombre: this.query.get('nombre') ?? '',
            horaInicio: this.query.get('horaInicio') ?? '',
            horaFin: this.query.get('horaFin') ?? '',
            horario: this.query.get('horario') || 'M',
            personas: this.query.get('personas') ?? '',
            profesor: Number(this.query.get('profesor') ?? '0') || null,
            dia: this.query.get('dia') ?? '',
            estatus: this.query.get('estatus') ?? '1',
        });
        this.cargarEntrenadores();
    }
    cargarEntrenadores() {
        this.cargandoEntrenadores.set(true);
        this.api.getEntrenadores(this.session.sociedad() || 1).subscribe({
            next: (res) => {
                this.cargandoEntrenadores.set(false);
                if (res.codigo === 200) {
                    this.entrenadores.set(res.respuesta ?? []);
                }
                else {
                    this.ui.toast('No se pudieron cargar los entrenadores', 'error');
                }
            },
            error: () => {
                this.cargandoEntrenadores.set(false);
                this.ui.toast('No se pudieron cargar los entrenadores', 'error');
            },
        });
    }
    async onSubmit() {
        if (this.ec.invalid) {
            this.ec.markAllAsTouched();
            this.ui.toast('Todos los campos son necesarios', 'warning');
            return;
        }
        const raw = this.ec.getRawValue();
        if (!raw.profesor) {
            this.ui.toast('Selecciona un coach', 'warning');
            return;
        }
        this.enviando.set(true);
        try {
            const payload = {
                idClase: this.idClase,
                nombre: raw.nombre ?? '',
                horaInicio: raw.horaInicio ?? '',
                horaFin: raw.horaFin ?? '',
                horario: (raw.horario ?? 'M'),
                personas: Number(raw.personas ?? 0),
                profesor: raw.profesor,
                estatus: raw.estatus ?? '1',
                dia: raw.dia ?? '',
                sociedad: this.session.sociedad(),
            };
            const res = await firstValueFrom(this.api.editarClase(payload));
            if (res.codigo === 200) {
                const msg = typeof res.respuesta === 'string' && res.respuesta
                    ? res.respuesta
                    : res.mensaje || 'Clase actualizada';
                await this.ui.cargaTemporal(msg, 900);
                this.ui.toast('Clase actualizada', 'success');
                this.router.navigate(['/clases']);
            }
            else {
                await this.ui.confirmar({
                    titulo: 'No se pudo editar la clase',
                    mensaje: res.mensaje || res.descripcion || 'Revisa los datos e intenta de nuevo',
                    soloAceptar: true,
                    confirmarTexto: 'OK',
                });
            }
        }
        catch {
            this.ui.toast('Error de conexión', 'error');
        }
        finally {
            this.enviando.set(false);
        }
    }
    async eliminar() {
        const ok = await this.ui.confirmar({
            titulo: 'Eliminar clase',
            mensaje: 'Seguro que desea eliminar la clase',
            confirmarTexto: 'Eliminar',
            cancelarTexto: 'Cancelar',
        });
        if (!ok)
            return;
        this.enviando.set(true);
        try {
            const res = await firstValueFrom(this.api.eliminarClase(this.idClase));
            const msg = typeof res.respuesta === 'string' && res.respuesta
                ? res.respuesta
                : res.mensaje || 'Clase eliminada';
            await this.ui.cargaTemporal(msg, 800);
            this.ui.toast('Clase eliminada', 'success');
            this.router.navigate(['/clases']);
        }
        catch {
            this.ui.toast('Error de conexión', 'error');
        }
        finally {
            this.enviando.set(false);
        }
    }
    setHorario(valor) {
        this.ec.controls.horario.setValue(valor);
    }
    setEstatus(valor) {
        this.ec.controls.estatus.setValue(valor);
    }
    atras() {
        this.router.navigate(['/clases']);
    }
};
EditarclasePage = __decorate([
    Component({
        selector: 'app-editarclase',
        standalone: true,
        imports: [ReactiveFormsModule, IconComponent],
        templateUrl: './editarclase.page.html',
        styleUrl: './editarclase.page.scss',
    })
], EditarclasePage);
export { EditarclasePage };
