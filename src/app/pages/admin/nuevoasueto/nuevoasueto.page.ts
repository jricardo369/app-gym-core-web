import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Clase } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

/** Opción de clase para el select (incluye etiqueta de presentación). */
interface ClaseOpcion extends Clase {
  descCorta?: string;
  diaDescripcion?: string;
}

@Component({
  selector: 'app-nuevoasueto',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './nuevoasueto.page.html',
  styleUrl: './nuevoasueto.page.scss',
})
export class NuevoasuetoPage implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private session = inject(SessionService);
  private ui = inject(UiService);
  private router = inject(Router);

  readonly clases = signal<ClaseOpcion[]>([]);
  readonly cargandoClases = signal(true);
  readonly enviando = signal(false);

  readonly na = this.fb.group({
    fecha: ['', Validators.required],
    idClase: [null as number | null, Validators.required],
    tipo: ['1', Validators.required],
  });

  ngOnInit(): void {
    this.cargarClases();
  }

  cargarClases(): void {
    this.cargandoClases.set(true);
    this.api.getClases(this.session.sociedad()).subscribe({
      next: (res) => {
        this.cargandoClases.set(false);
        if (res.codigo === 200) {
          this.clases.set((res.respuesta ?? []) as ClaseOpcion[]);
        } else {
          this.ui.toast('No se pudieron cargar las clases', 'error');
        }
      },
      error: () => {
        this.cargandoClases.set(false);
        this.ui.toast('No se pudieron cargar las clases', 'error');
      },
    });
  }

  async onSubmit(): Promise<void> {
    if (this.na.invalid) {
      this.na.markAllAsTouched();
      this.ui.toast('Todos los campos son necesarios', 'warning');
      return;
    }

    const raw = this.na.getRawValue();
    if (!raw.idClase) {
      this.ui.toast('Selecciona una clase', 'warning');
      return;
    }

    this.enviando.set(true);
    try {
      const res = await firstValueFrom(
        this.api.crearAsueto({
          fecha: (raw.fecha ?? '').substring(0, 10),
          idClase: raw.idClase,
          tipo: raw.tipo ?? '1',
          sociedad: this.session.sociedad(),
        })
      );

      if (res.codigo === 500) {
        await this.ui.confirmar({
          titulo: 'Asueto existente',
          mensaje: res.mensaje || res.descripcion || 'El asueto ya existe para esa fecha',
          soloAceptar: true,
          confirmarTexto: 'OK',
        });
        return;
      }

      if (res.codigo !== 200) {
        await this.ui.confirmar({
          titulo: 'No se pudo crear el asueto',
          mensaje: res.mensaje || res.descripcion || 'Intenta de nuevo',
          soloAceptar: true,
          confirmarTexto: 'OK',
        });
        return;
      }

      const msg =
        typeof res.respuesta === 'string' && res.respuesta
          ? res.respuesta
          : res.mensaje || 'Asueto creado';
      await this.ui.cargaTemporal(msg, 1000);
      this.na.reset({ fecha: '', idClase: null, tipo: '1' });
      this.router.navigate(['/asuetos']);
    } catch {
      this.ui.toast('Error de conexión', 'error');
    } finally {
      this.enviando.set(false);
    }
  }

  etiquetaClase(clase: ClaseOpcion): string {
    if (clase.descCorta) return clase.descCorta;
    const dia = clase.diaDescripcion || clase.dia;
    return dia ? `${clase.nombre} · ${dia}` : clase.nombre;
  }

  atras(): void {
    this.router.navigate(['/asuetos']);
  }
}
