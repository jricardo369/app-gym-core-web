import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './terminos.page.html',
  styleUrl: './terminos.page.scss',
})
export class TerminosPage implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private session = inject(SessionService);
  private ui = inject(UiService);
  private router = inject(Router);

  readonly cargandoConfig = signal(true);
  readonly horasCancelacion = signal('');
  readonly enviando = signal(false);

  readonly form = this.fb.nonNullable.group({
    acepto: [false, Validators.requiredTrue],
  });

  readonly avisos: string[] = [
    'Las clases tienen una duración de 45 min., solo cuentas con 5 minutos de tolerancia para poder ingresar.',
    'Los paquetes son intransferibles y tienen vigencia.',
    'Uso de calcetines obligatorio.',
    'Si tiene alguna lesión o enfermedad que presente un riesgo para la práctica del ejercicio físico y para su salud, favor de comunicarlo a la coach.',
    'LUA Studio no se responsabiliza por lesiones, daños o accidentes dentro de nuestras instalaciones.',
    'Cuida y mantén limpio tu lugar, respeta tu lugar reservado en clase.',
  ];

  ngOnInit(): void {
    this.api.getConfigHorasCancelacion().subscribe({
      next: (res) => {
        this.horasCancelacion.set(String(res.respuesta?.[0]?.valorAbajo ?? ''));
        this.cargandoConfig.set(false);
      },
      error: () => this.cargandoConfig.set(false),
    });
  }

  async aceptar(): Promise<void> {
    const control = this.form.controls.acepto;
    if (control.invalid) {
      control.markAsTouched();
      this.ui.toast(
        'Es necesario aceptar los terminos y condiciones para poder continuar',
        'warning'
      );
      return;
    }

    const id = this.session.idUsuario();
    this.enviando.set(true);

    try {
      if (id != null) {
        await firstValueFrom(this.api.aceptarTerminos(id));
      }
      await this.ui.cargaTemporal('¡Bienvenido!', 700);
      this.router.navigate(['/admin']);
    } catch {
      this.ui.toast('No se pudo guardar tu aceptación. Intenta de nuevo.', 'error');
    } finally {
      this.enviando.set(false);
      this.ui.ocultarCarga();
    }
  }
}
