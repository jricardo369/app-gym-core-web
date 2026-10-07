import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';
let RecuperarPage = class RecuperarPage {
    fb = inject(FormBuilder);
    api = inject(ApiService);
    ui = inject(UiService);
    router = inject(Router);
    enviando = signal(false);
    form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
    });
    async onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.ui.toast('Ingresa un correo electrónico válido', 'warning');
            return;
        }
        this.enviando.set(true);
        this.ui.mostrarCarga('Enviando…');
        try {
            const res = await firstValueFrom(this.api.recuperarContrasenia(this.form.getRawValue().email));
            if (res.codigo === 200) {
                await this.ui.confirmar({
                    titulo: 'Recuperación solicitada',
                    mensaje: res.descripcion || 'Revisa tu correo electrónico para continuar.',
                    soloAceptar: true,
                    confirmarTexto: 'OK',
                });
                this.form.reset();
                this.router.navigate(['/login']);
                return;
            }
            await this.ui.confirmar({
                titulo: 'No se pudo recuperar',
                mensaje: res.descripcion || 'Verifica tu correo electrónico.',
                soloAceptar: true,
                confirmarTexto: 'OK',
            });
        }
        catch {
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
    atras() {
        this.router.navigate(['/login']);
    }
};
RecuperarPage = __decorate([
    Component({
        selector: 'app-recuperar',
        standalone: true,
        imports: [ReactiveFormsModule, IconComponent],
        templateUrl: './recuperar.page.html',
        styleUrl: './recuperar.page.scss',
    })
], RecuperarPage);
export { RecuperarPage };
