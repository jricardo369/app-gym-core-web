import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Clase } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

interface ClaseCatalogo extends Clase {
  diaDescripcion?: string;
}

@Component({
  selector: 'app-clasesalumnos',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './clasesalumnos.page.html',
  styleUrl: './clasesalumnos.page.scss',
})
export class ClasesalumnosPage implements OnInit {
  private api = inject(ApiService);
  private session = inject(SessionService);
  private ui = inject(UiService);
  private router = inject(Router);

  readonly clases = signal<ClaseCatalogo[]>([]);
  readonly cargando = signal(true);
  readonly mensajeError = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.mensajeError.set('');
    this.clases.set([]);

    this.api.getClases(this.session.sociedad()).subscribe({
      next: async (res) => {
        this.cargando.set(false);
        if (res.codigo === 200) {
          this.clases.set(
            Array.isArray(res.respuesta) ? (res.respuesta as ClaseCatalogo[]) : []
          );
        } else {
          const msg = res.descripcion || res.mensaje || 'No se pudieron cargar las clases.';
          this.mensajeError.set(msg);
          await this.ui.confirmar({
            titulo: 'No se pudieron cargar las clases',
            mensaje: msg,
            soloAceptar: true,
            confirmarTexto: 'OK',
          });
        }
      },
      error: () => {
        this.cargando.set(false);
        this.mensajeError.set('No se pudo conectar con el servidor.');
      },
    });
  }

  abrir(clase: ClaseCatalogo): void {
    this.router.navigate(['/asisalumno', clase.idClase], {
      queryParams: {
        nombre: clase.nombre,
        profesor: clase.profesorNombre || String(clase.profesor ?? ''),
      },
    });
  }

  // ─── Helpers de vista ───────────────────────────────────
  diaTexto(clase: ClaseCatalogo): string {
    return clase.diaDescripcion || clase.dia || '';
  }

  profesorTexto(clase: ClaseCatalogo): string {
    return clase.profesorNombre || String(clase.profesor ?? '');
  }

  horarioIcono(clase: ClaseCatalogo): string {
    return clase.horario === 'M' ? 'sun' : 'moon';
  }
}
