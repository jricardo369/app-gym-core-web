import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Clase, DetalleAsistencia } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

/** `esta-en-clase` devuelve además de asistentes: estatus/mensaje/descripcion */
interface DetalleClase extends Partial<DetalleAsistencia> {
  estatus?: string | number | boolean;
  mensaje?: string;
  descripcion?: string;
}

const DIAS_LARGO = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES_LARGO = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

function hoyKey(): string {
  const d = new Date();
  const pad = (n: number): string => (n < 10 ? '0' + n : String(n));
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function fechaLarga(fechaf: string): string {
  const p = fechaf.split('-');
  if (p.length !== 3) return fechaf;
  const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  if (isNaN(d.getTime())) return fechaf;
  return DIAS_LARGO[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES_LARGO[d.getMonth()];
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './horarios.page.html',
  styleUrl: './horarios.page.scss',
})
export class HorariosPage implements OnInit {
  private api = inject(ApiService);
  private session = inject(SessionService);
  private ui = inject(UiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly fechaf = this.route.snapshot.paramMap.get('fechaf') ?? hoyKey();
  readonly tituloFecha = fechaLarga(this.fechaf);

  readonly clases = signal<Clase[]>([]);
  readonly cargando = signal(true);
  readonly mensajeError = signal('');
  readonly procesando = signal<number | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const id = this.session.idUsuario();
    if (id == null) {
      this.cargando.set(false);
      this.mensajeError.set('No hay una sesión activa.');
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');
    this.clases.set([]);

    this.api.getClasesPorFecha(this.fechaf, id).subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res.codigo === 200) {
          this.clases.set(Array.isArray(res.respuesta) ? res.respuesta : []);
        } else {
          this.mensajeError.set(res.descripcion || res.mensaje || 'No se pudieron cargar las clases.');
        }
      },
      error: () => {
        this.cargando.set(false);
        this.mensajeError.set('No se pudo conectar con el servidor.');
      },
    });
  }

  asistir(clase: Clase): void {
    const id = this.session.idUsuario();
    if (id == null) {
      this.ui.toast('No hay una sesión activa.', 'error');
      return;
    }

    this.procesando.set(clase.idClase);
    this.api.estaEnClase(clase.idClase, id, this.fechaf).subscribe({
      next: (res) => {
        this.procesando.set(null);
        const det = res.respuesta as DetalleClase | undefined;
        if (res.codigo === 200) {
          this.ui.toast(det?.mensaje || res.mensaje || 'Asistencia registrada', 'success');
          this.cargar();
        } else {
          this.ui.toast(
            det?.descripcion || res.descripcion || res.mensaje || 'No se pudo registrar la asistencia.',
            'error'
          );
        }
      },
      error: () => {
        this.procesando.set(null);
        this.ui.toast('No se pudo contactar al servidor.', 'error');
      },
    });
  }

  async quitarAsistencia(clase: Clase): Promise<void> {
    const id = this.session.idUsuario();
    if (id == null) {
      this.ui.toast('No hay una sesión activa.', 'error');
      return;
    }

    const ok = await this.ui.confirmar({
      titulo: 'Quitar asistencia',
      mensaje:
        '¿Seguro que deseas quitar tu asistencia de ' +
        clase.nombre +
        ' (' +
        (clase.descripcionHorario || '') +
        ') del día ' +
        this.fechaf +
        '?',
      confirmarTexto: 'Aceptar',
      cancelarTexto: 'Cancelar',
    });
    if (!ok) return;

    this.procesando.set(clase.idClase);
    this.api.cancelarAsistencia(clase.idClase, id, this.fechaf).subscribe({
      next: (res) => {
        this.procesando.set(null);
        if (res.codigo === 200) {
          this.ui.toast(typeof res.respuesta === 'string' ? res.respuesta : 'Asistencia eliminada', 'success');
        } else {
          this.ui.toast(res.descripcion || res.mensaje || 'No se pudo quitar la asistencia.', 'error');
        }
        this.cargar();
      },
      error: () => {
        this.procesando.set(null);
        this.ui.toast('No se pudo contactar al servidor.', 'error');
      },
    });
  }

  irLugares(clase: Clase): void {
    const queryParams: Record<string, string> = {
      descripcionHorario: clase.descripcionHorario ?? '',
      asistencia: String(clase.asistencia ?? 'false'),
      claseLlena: String(clase.claseLlena ?? 'false'),
      isListaEspera: String(clase.isListaEspera ?? 'false'),
    };
    if (clase.lugar != null) queryParams['lugar'] = String(clase.lugar);

    this.router.navigate(['/lugares', this.fechaf, clase.idClase], { queryParams });
  }

  atras(): void {
    this.router.navigate(['/calalumno']);
  }

  // ─── Helpers de vista ───────────────────────────────────
  iconoHorario(clase: Clase): string {
    if (clase.horario === 'M') return 'sun';
    if (clase.horario === 'V') return 'moon';
    return 'dumbbell';
  }

  lugaresTexto(clase: Clase): string {
    return clase.lugaresDisponibles == null ? '' : String(clase.lugaresDisponibles);
  }

  asiste(clase: Clase): boolean {
    return String(clase.asistencia ?? '') === 'true';
  }

  tieneLugares(clase: Clase): boolean {
    const v = this.lugaresTexto(clase);
    return v !== '' && !v.startsWith('0') && v !== 'CLASE LLENA';
  }

  esClaseLlena(clase: Clase): boolean {
    return String(clase.claseLlena ?? '') === 'true' || this.lugaresTexto(clase) === 'CLASE LLENA';
  }

  ocupado(clase: Clase): boolean {
    return this.procesando() === clase.idClase;
  }
}
