import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private session = inject(SessionService);
  private ui = inject(UiService);
  private router = inject(Router);

  readonly mostrarPass = signal(false);
  readonly enviando = signal(false);

  readonly form = this.fb.nonNullable.group({
    usuario: ['', Validators.required],
    contrasenia: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.session.isLoggedIn()) {
      this.irPorRol();
    }
  }

  togglePass(): void {
    this.mostrarPass.update((v) => !v);
  }

  async onSubmit(): Promise<void> {
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
    } catch {
      this.ui.ocultarCarga();
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

  private irPorRol(): void {
    const u = this.session.usuario();
    if (!u) return;
    if (u.idRol === 2 && u.terminos !== 'aceptados') {
      this.router.navigate(['/terminos']);
    } else {
      this.router.navigate(['/admin']);
    }
  }
}
