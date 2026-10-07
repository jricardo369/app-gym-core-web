import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsistenteClase, DetalleAsistencia } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

/** `AsistenciaClases/{idClase}` incluye además el total de lugares */
interface DetalleLugares extends Partial<DetalleAsistencia> {
  lugares?: number | string;
}

function hoyKey(): string {
  const d = new Date();
  const pad = (n: number): string => (n < 10 ? '0' + n : String(n));
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

@Component({
  selector: 'app-asisalumno',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './asisalumno.page.html',
  styleUrl: './asisalumno.page.scss',
})
export class AsisalumnoPage implements OnInit {
  private api = inject(ApiService);
  readonly session = inject(SessionService);
  private ui = inject(UiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly idClase = Number(this.route.snapshot.paramMap.get('idClase') ?? 0);
  readonly nombre = this.route.snapshot.queryParamMap.get('nombre') ?? 'Clase';
  readonly profesor = this.route.snapshot.queryParamMap.get('profesor') ?? '';

  readonly fecha = signal(hoyKey());
  readonly asistentes = signal<AsistenteClase[]>([]);
  readonly lugares = signal('');
  readonly cargando = signal(true);
  readonly mensajeError = signal('');
  readonly procesando = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.mensajeError.set('');
    this.asistentes.set([]);

    this.api.getAsistentes(this.idClase, this.fecha(), this.session.sociedad()).subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res.codigo === 200) {
          const det = res.respuesta as DetalleLugares | undefined;
          this.asistentes.set(det?.usuarios ?? []);
          this.lugares.set(det?.lugares != null ? String(det.lugares) : '');
        } else {
          this.mensajeError.set(
            res.descripcion || res.mensaje || 'No se pudo cargar la lista de asistentes.'
          );
        }
      },
      error: () => {
        this.cargando.set(false);
        this.mensajeError.set('No se pudo conectar con el servidor.');
      },
    });
  }

  cambiarFecha(ev: Event): void {
    const valor = (ev.target as HTMLInputElement).value;
    if (!valor) return;
    this.fecha.set(valor.substring(0, 10));
    this.cargar();
  }

  asistir(): void {
    this.router.navigate(['/lugares', this.fecha(), this.idClase], {
      queryParams: {
        descripcionHorario: this.nombre,
        asistencia: 'false',
        claseLlena: 'false',
        isListaEspera: 'false',
      },
    });
  }

  async quitarPropia(): Promise<void> {
    const id = this.session.idUsuario();
    if (id == null) {
      this.ui.toast('No hay una sesión activa.', 'error');
      return;
    }
    await this.quitar(id, 'tu asistencia');
  }

  async quitarAsistente(asistente: AsistenteClase): Promise<void> {
    await this.quitar(asistente.idUsuario, 'la asistencia de ' + asistente.nombre);
  }

  private async quitar(idAsistente: number | string, que: string): Promise<void> {
    const ok = await this.ui.confirmar({
      titulo: 'Quitar asistencia',
      mensaje:
        '¿Seguro que deseas quitar ' +
        que +
        ' del día ' +
        this.fecha() +
        '?',
      confirmarTexto: 'Aceptar',
      cancelarTexto: 'Cancelar',
    });
    if (!ok) return;

    this.procesando.set(true);
    this.api.cancelarAsistencia(this.idClase, idAsistente, this.fecha()).subscribe({
      next: (res) => {
        this.procesando.set(false);
        if (res.codigo === 200) {
          this.ui.toast('Asistencia eliminada', 'success');
        } else {
          this.ui.toast(res.descripcion || res.mensaje || 'No se pudo quitar la asistencia.', 'error');
        }
        this.cargar();
      },
      error: () => {
        this.procesando.set(false);
        this.ui.toast('No se pudo contactar al servidor.', 'error');
      },
    });
  }

  atras(): void {
    this.router.navigate(['/clasesalumnos']);
  }

  // ─── Helpers de vista ───────────────────────────────────
  esYo(asistente: AsistenteClase): boolean {
    return asistente.idUsuario === this.session.idUsuario();
  }

  yoEstoy(): boolean {
    const id = this.session.idUsuario();
    return this.asistentes().some((a) => a.idUsuario === id);
  }

  asistio(asistente: AsistenteClase): boolean {
    return String(asistente.asistio ?? '') === 'A';
  }
}
