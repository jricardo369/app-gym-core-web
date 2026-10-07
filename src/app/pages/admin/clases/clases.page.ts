import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Clase } from '../../../core/models';
import { FiltroPipe } from '../../../core/pipes/filtro.pipe';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

/** Catálogo de clases: incluye campos de presentación que devuelve la API. */
interface ClaseCatalogo extends Clase {
  diaDescripcion?: string;
  descCorta?: string;
}

@Component({
  selector: 'app-clases',
  standalone: true,
  imports: [IconComponent, FiltroPipe],
  templateUrl: './clases.page.html',
  styleUrl: './clases.page.scss',
})
export class ClasesPage implements OnInit {
  readonly session = inject(SessionService);
  private api = inject(ApiService);
  private router = inject(Router);
  private ui = inject(UiService);

  readonly textoBuscar = signal('');
  readonly cargando = signal(true);
  readonly clases = signal<ClaseCatalogo[]>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.api.getClases(this.session.sociedad()).subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res.codigo === 200) {
          this.clases.set((res.respuesta ?? []) as ClaseCatalogo[]);
        } else {
          this.errorClases();
        }
      },
      error: () => {
        this.cargando.set(false);
        this.errorClases();
      },
    });
  }

  buscar(event: Event): void {
    const el = event.target as HTMLInputElement | null;
    this.textoBuscar.set(el && el.value ? el.value : '');
  }

  editar(clase: ClaseCatalogo): void {
    this.router.navigate(['/editarclase', clase.idClase], {
      queryParams: {
        horaInicio: clase.horaInicio,
        horaFin: clase.horaFin,
        horario: clase.horario,
        nombre: clase.nombre,
        profesor: clase.profesor,
        personas: clase.personas,
        estatus: clase.estatus ?? '1',
        dia: clase.dia,
      },
    });
  }

  irCrear(): void {
    this.router.navigate(['/crearclase']);
  }

  atras(): void {
    this.router.navigate(['/admin']);
  }

  // ─── Helpers ────────────────────────────────────────────
  diaTexto(clase: ClaseCatalogo): string {
    return clase.diaDescripcion || clase.dia;
  }

  esActiva(clase: ClaseCatalogo): boolean {
    return String(clase.estatus ?? '') === '1';
  }

  iconoHorario(horario?: string): string {
    if (horario === 'V') return 'moon';
    if (horario === 'M') return 'sun';
    return 'dumbbell';
  }

  horarioTexto(clase: ClaseCatalogo): string {
    return clase.horario === 'V' ? 'Vespertino' : 'Matutino';
  }

  private errorClases(): void {
    this.clases.set([]);
    void this.ui
      .confirmar({
        titulo: 'Error',
        mensaje: 'Error al mostrar las clases',
        soloAceptar: true,
        confirmarTexto: 'OK',
      })
      .then(() => this.router.navigate(['/admin']));
  }
}
