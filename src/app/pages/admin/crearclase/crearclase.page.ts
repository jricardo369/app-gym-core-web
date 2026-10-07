import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Usuario } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

const HORA = /^([0-9]|1[0-9]|2[0-3])$/;
const PERSONAS = /^\d{1,3}$/;

@Component({
  selector: 'app-crearclase',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './crearclase.page.html',
  styleUrl: './crearclase.page.scss',
})
export class CrearclasePage implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private session = inject(SessionService);
  private ui = inject(UiService);
  private router = inject(Router);

  readonly entrenadores = signal<Usuario[]>([]);
  readonly cargandoEntrenadores = signal(true);
  readonly enviando = signal(false);

  readonly nc = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(60)]],
    horaInicio: ['', [Validators.required, Validators.pattern(HORA)]],
    horaFin: ['', [Validators.required, Validators.pattern(HORA)]],
    horario: ['M', Validators.required],
    personas: ['', [Validators.required, Validators.pattern(PERSONAS)]],
    profesor: [null as number | null, Validators.required],
    dia: ['', Validators.required],
  });

  ngOnInit(): void {
    this.cargarEntrenadores();
  }

  cargarEntrenadores(): void {
    this.cargandoEntrenadores.set(true);
    this.api.getEntrenadores(this.session.sociedad() || 1).subscribe({
      next: (res) => {
        this.cargandoEntrenadores.set(false);
        if (res.codigo === 200) {
          this.entrenadores.set(res.respuesta ?? []);
        } else {
          this.ui.toast('No se pudieron cargar los entrenadores', 'error');
        }
      },
      error: () => {
        this.cargandoEntrenadores.set(false);
        this.ui.toast('No se pudieron cargar los entrenadores', 'error');
      },
    });
  }

  async onSubmit(): Promise<void> {
    if (this.nc.invalid) {
      this.nc.markAllAsTouched();
      this.ui.toast('Todos los campos son necesarios', 'warning');
      return;
    }

    const raw = this.nc.getRawValue();
    if (!raw.profesor) {
      this.ui.toast('Selecciona un coach', 'warning');
      return;
    }

    this.enviando.set(true);
    try {
      const res = await firstValueFrom(
        this.api.crearClase({
          nombre: raw.nombre ?? '',
          horaInicio: raw.horaInicio ?? '',
          horaFin: raw.horaFin ?? '',
          horario: (raw.horario ?? 'M') as 'M' | 'V',
          personas: Number(raw.personas ?? 0),
          profesor: raw.profesor,
          dia: raw.dia ?? '',
          sociedad: this.session.sociedad(),
        })
      );

      if (res.codigo === 200) {
        const msg =
          typeof res.respuesta === 'string' && res.respuesta
            ? res.respuesta
            : res.mensaje || 'Clase creada';
        await this.ui.cargaTemporal(msg, 900);
        this.nc.reset({
          nombre: '',
          horaInicio: '',
          horaFin: '',
          horario: 'M',
          personas: '',
          profesor: null,
          dia: '',
        });
        this.router.navigate(['/clases']);
      } else {
        await this.ui.confirmar({
          titulo: 'No se pudo crear la clase',
          mensaje: res.mensaje || res.descripcion || 'Revisa los datos e intenta de nuevo',
          soloAceptar: true,
          confirmarTexto: 'OK',
        });
      }
    } catch {
      this.ui.toast('Error de conexión', 'error');
    } finally {
      this.enviando.set(false);
    }
  }

  setHorario(valor: 'M' | 'V'): void {
    this.nc.controls.horario.setValue(valor);
  }

  atras(): void {
    this.router.navigate(['/clases']);
  }
}
