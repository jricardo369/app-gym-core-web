import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';
let RegistroPage = class RegistroPage {
    fb = inject(FormBuilder);
    api = inject(ApiService);
    session = inject(SessionService);
    ui = inject(UiService);
    router = inject(Router);
    enviando = signal(false);
    mostrarPass = signal(false);
    roles = [
        { valor: '1', etiqueta: 'Administrador' },
        { valor: '2', etiqueta: 'Usuario' },
        { valor: '3', etiqueta: 'Entrenador' },
    ];
    form = this.fb.nonNullable.group({
        rol: ['', Validators.required],
        usuario: ['', Validators.required],
        contrasenia: ['', Validators.required],
        nombre: ['', Validators.required],
        sexo: ['', Validators.required],
        correoElectronico: ['', [Validators.required, Validators.email]],
        telefono: ['', Validators.required],
    });
    togglePass() {
        this.mostrarPass.update((v) => !v);
    }
    seleccionarSexo(sexo) {
        this.form.controls.sexo.setValue(sexo);
    }
    async onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.ui.toast('Todos los campos son necesarios', 'warning');
            return;
        }
        const v = this.form.getRawValue();
        this.enviando.set(true);
        this.ui.mostrarCarga('Agregando usuario…');
        try {
            const res = await firstValueFrom(this.api.crearUsuario({
                idRol: Number(v.rol),
                usuario: v.usuario,
                contrasenia: v.contrasenia,
                nombre: v.nombre,
                sexo: v.sexo,
                correoElectronico: v.correoElectronico,
                telefono: v.telefono,
                peso: 0,
                altura: 0,
                imc: '--',
                nivel: '10',
                estatus: 1,
                intentos: 0,
                sociedad: this.session.sociedad(),
            }));
            if (res.codigo === 500) {
                this.ui.toast(res.descripcion || 'Usuario ya registrado', 'error');
                return;
            }
            await this.ui.cargaTemporal('Usuario agregado', 1200);
            this.form.reset();
            this.router.navigate(['/perfil']);
        }
        catch {
            this.ui.toast('No se pudo contactar al servidor. Intenta de nuevo.', 'error');
        }
        finally {
            this.enviando.set(false);
            this.ui.ocultarCarga();
        }
    }
    atras() {
        this.router.navigate(['/perfil']);
    }
};
RegistroPage = __decorate([
    Component({
        selector: 'app-registro',
        standalone: true,
        imports: [ReactiveFormsModule, IconComponent],
        templateUrl: './registro.page.html',
        styleUrl: './registro.page.scss',
    })
], RegistroPage);
export { RegistroPage };
