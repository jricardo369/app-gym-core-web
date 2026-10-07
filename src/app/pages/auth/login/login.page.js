import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';
let LoginPage = class LoginPage {
    fb = inject(FormBuilder);
    api = inject(ApiService);
    session = inject(SessionService);
    ui = inject(UiService);
    router = inject(Router);
    mostrarPass = signal(false);
    enviando = signal(false);
    form = this.fb.nonNullable.group({
        usuario: ['', Validators.required],
        contrasenia: ['', Validators.required],
    });
    ngOnInit() {
        if (this.session.isLoggedIn()) {
            this.irPorRol();
        }
    }
    togglePass() {
        this.mostrarPass.update((v) => !v);
    }
    async onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.ui.toast('Todos los campos son necesarios', 'warning');
            return;
        }
        this.enviando.set(true);
        this.ui.mostrarCarga('Validando…');
        try {
            const res = await firstValueFrom(this.api.login(this.form.getRawValue()));
            this.ui.ocultarCarga();
            if (res.codigo !== 200 || !res.respuesta) {
                await this.ui.confirmar({
                    titulo: 'No se pudo iniciar sesión',
                    mensaje: res.descripcion || res.mensaje || 'Verifica tus credenciales.',
                    soloAceptar: true,
                    confirmarTexto: 'OK',
                });
                return;
            }
            this.session.setSesion({ respuesta: res.respuesta });
            await this.ui.cargaTemporal(`Bienvenido ${res.respuesta.usuario}`, 900);
            this.form.reset();
            this.irPorRol();
        }
        catch {
            this.ui.ocultarCarga();
            await this.ui.confirmar({
                titulo: 'Error de conexión',
                mensaje: 'No se pudo contactar al servidor. Intenta de nuevo.',
                soloAceptar: true,
                confirmarTexto: 'OK',
            });
        }
        finally {
            this.enviando.set(false);
            this.ui.ocultarCarga();
        }
    }
    irPorRol() {
        const u = this.session.usuario();
        if (!u)
            return;
        if (u.idRol === 2 && u.terminos !== 'aceptados') {
            this.router.navigate(['/terminos']);
        }
        else {
            this.router.navigate(['/admin']);
        }
    }
};
LoginPage = __decorate([
    Component({
        selector: 'app-login',
        standalone: true,
        imports: [ReactiveFormsModule, RouterLink, IconComponent],
        templateUrl: './login.page.html',
        styleUrl: './login.page.scss',
    })
], LoginPage);
export { LoginPage };
