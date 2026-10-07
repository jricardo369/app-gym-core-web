import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

@Component({
  selector: 'app-cambiarpass',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './cambiarpass.page.html',
  styleUrl: './cambiarpass.page.scss',
})
export class CambiarpassPage {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private session = inject(SessionService);
  private ui = inject(UiService);
  private router = inject(Router);

  readonly enviando = signal(false);

  readonly form = this.fb.nonNullable.group({
    contraseniaAnterior: ['', Validators.required],
    contraseniaNueva: ['', [Validators.required, Validators.maxLength(11)]],
    confirmar: ['', [Validators.required, Validators.maxLength(11)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.ui.toast('Todos los campos son necesarios', 'warning');
      return;
    }

    const v = this.form.getRawValue();
    if (v.contraseniaNueva !== v.confirmar) {
      this.form.controls.confirmar.markAsTouched();
      this.ui.toast('Las contraseñas no coinciden.', 'error');
      return;
    }

    const id = this.session.idUsuario();
    if (id == null) {
      this.ui.toast('No hay una sesión activa.', 'error');
      return;
    }

    this.enviando.set(true);
    this.ui.mostrarCarga('Actualizando…');

    try {
      const res = await firstValueFrom(
        this.api.cambiarContrasenia({
          idUsuario: id,
          contraseniaAnterior: v.contraseniaAnterior,
          contraseniaNueva: v.contraseniaNueva,
        })
      );

      if (res.codigo === 200) {
        await this.ui.cargaTemporal(
          res.descripcion || 'Contraseña actualizada',
          700
        );
        this.session.logout();
        return;
      }

      await this.ui.confirmar({
        titulo: 'No se pudo cambiar la contraseña',
        mensaje: res.descripcion || 'Verifica tu contraseña anterior.',
        soloAceptar: true,
        confirmarTexto: 'OK',
      });
      this.form.reset();
    } catch {
      this.ui.toast('No se pudo contactar al servidor. Intenta de nuevo.', 'error');
    } finally {
      this.enviando.set(false);
      this.ui.ocultarCarga();
    }
  }

  atras(): void {
    this.router.navigate(['/user']);
  }
}
