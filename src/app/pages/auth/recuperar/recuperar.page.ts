import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './recuperar.page.html',
  styleUrl: './recuperar.page.scss',
})
export class RecuperarPage {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private ui = inject(UiService);
  private router = inject(Router);

  readonly enviando = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.ui.toast('Ingresa un correo electrónico válido', 'warning');
      return;
    }

    this.enviando.set(true);
    this.ui.mostrarCarga('Enviando…');

    try {
      const res = await firstValueFrom(
        this.api.recuperarContrasenia(this.form.getRawValue().email)
      );

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
    } catch {
      await this.ui.confirmar({
        titulo: 'Error de conexión',
        mensaje: 'No se pudo contactar al servidor. Intenta de nuevo.',
        soloAceptar: true,
        confirmarTexto: 'OK',
      });
    } finally {
      this.enviando.set(false);
      this.ui.ocultarCarga();
    }
  }

  atras(): void {
    this.router.navigate(['/login']);
  }
}
