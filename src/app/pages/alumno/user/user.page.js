import { __decorate } from "tslib";
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';
let UserPage = class UserPage {
    fb = inject(FormBuilder);
    api = inject(ApiService);
    session = inject(SessionService);
    ui = inject(UiService);
    router = inject(Router);
    perfil = signal(null);
    cargando = signal(true);
    mensajeError = signal('');
    guardando = signal(false);
    form = this.fb.nonNullable.group({
        telefono: ['', Validators.required],
        correoElectronico: ['', [Validators.required, Validators.email]],
        fechaNacimiento: ['', Validators.required],
    });
    multas = computed(() => {
        const p = this.perfil();
        const s = this.session.usuario();
        const desdePerfil = p ? p.totalMultas : null;
        const desdeSesion = s ? s.totalMultas : null;
        return Number(desdePerfil ?? desdeSesion ?? 0);
    });
    faltas = computed(() => {
        const p = this.perfil();
        const s = this.session.usuario();
        const desdePerfil = p ? p.contadorFaltas : null;
        const desdeSesion = s ? s.contadorFaltas : null;
        return Number(desdePerfil ?? desdeSesion ?? 0);
    });
    conMultas = computed(() => this.multas() !== 0 || this.faltas() !== 0);
    mensajeMultas = computed(() => this.conMultas()
        ? 'Cuentas con ' + this.multas() + ' multas y ' + this.faltas() + ' faltas'
        : 'No tienes multas ni faltas');
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
        this.api.getUsuario(id).subscribe({
            next: (res) => {
                this.cargando.set(false);
                if (res.codigo !== 200 || !res.respuesta) {
                    this.mensajeError.set(res.descripcion || res.mensaje || 'No se pudo cargar tu perfil.');
                    return;
                }
                const u = Array.isArray(res.respuesta)
                    ? res.respuesta[0]
                    : res.respuesta;
                if (!u) {
                    this.mensajeError.set('No se pudo cargar tu perfil.');
                    return;
                }
                this.perfil.set(u);
                this.form.patchValue({
                    telefono: u.telefono ?? '',
                    correoElectronico: u.correoElectronico ?? '',
                    fechaNacimiento: (u.fechaNacimiento ?? '').substring(0, 10),
                });
            },
            error: () => {
                this.cargando.set(false);
                this.mensajeError.set('No se pudo conectar con el servidor.');
            },
        });
    }
    async guardar() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.ui.toast('Todos los campos son necesarios', 'warning');
            return;
        }
        const id = this.session.idUsuario();
        if (id == null) {
            this.ui.toast('No hay una sesión activa.', 'error');
            return;
        }
        const v = this.form.getRawValue();
        this.guardando.set(true);
        this.ui.mostrarCarga('Guardando…');
        try {
            const res = await firstValueFrom(this.api.editarDatosPerfil({
                idUsuario: id,
                telefono: v.telefono,
                correoElectronico: v.correoElectronico,
                fechaNacimiento: v.fechaNacimiento,
            }));
            if (res.codigo === 200) {
                this.ui.toast('Datos actualizados correctamente', 'success');
                this.cargar();
            }
            else {
                this.ui.toast(res.descripcion || res.mensaje || 'No se pudieron guardar los datos.', 'error');
            }
        }
        catch {
            this.ui.toast('No se pudo contactar al servidor.', 'error');
        }
        finally {
            this.guardando.set(false);
            this.ui.ocultarCarga();
        }
    }
    cambiarpass() {
        this.router.navigate(['/cambiarpass']);
    }
    verAsistencias() {
        this.router.navigate(['/asistenciasusuario']);
    }
    // ─── Helpers de vista ───────────────────────────────────
    get nombre() {
        return this.perfil()?.nombre || this.session.nombre() || 'Mi perfil';
    }
    get usuario() {
        return this.perfil()?.usuario || '';
    }
    get membresia() {
        return this.perfil()?.membresiaDesc ?? '';
    }
    get sexoTexto() {
        const s = this.perfil()?.sexo;
        if (s === 'M')
            return 'Hombre';
        if (s === 'F')
            return 'Mujer';
        return s ?? '';
    }
};
UserPage = __decorate([
    Component({
        selector: 'app-user',
        standalone: true,
        imports: [ReactiveFormsModule, IconComponent],
        templateUrl: './user.page.html',
        styleUrl: './user.page.scss',
    })
], UserPage);
export { UserPage };
