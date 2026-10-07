import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AsistenteClase, Clase } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

@Component({
  selector: 'app-asistentes',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './asistentes.page.html',
  styleUrl: './asistentes.page.scss',
})
export class AsistentesPage implements OnInit {
  readonly session = inject(SessionService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ui = inject(UiService);

  private readonly query = this.route.snapshot.queryParamMap;

  readonly idClase = Number(this.route.snapshot.paramMap.get('idClase') ?? '0');
  readonly nombreClase = this.query.get('nombre') ?? '';
  readonly fechaf = this.query.get('fechaf') ?? '';
  readonly profesorNombre = this.query.get('profesorNombre') ?? '';
  readonly descripcionHorario = this.query.get('descripcionHorario') ?? '';

  readonly asistentes = signal<AsistenteClase[]>([]);
  readonly clase = signal<Partial<Clase>>({});
  readonly fecha = signal('');
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly mensajeError = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(silencioso = false): void {
    if (!this.idClase) {
      this.cargando.set(false);
      this.mensajeError.set('Clase no encontrada');
      return;
    }
    if (!silencioso) this.cargando.set(true);
    this.mensajeError.set('');

    this.api.getAsistentes(this.idClase, this.fechaf, this.session.sociedad()).subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res.codigo === 200 && res.respuesta) {
          this.asistentes.set(res.respuesta.usuarios || []);
          this.clase.set(res.respuesta.clase || {});
          this.fecha.set(res.respuesta.fecha || this.fechaf);
        } else {
          this.asistentes.set([]);
          this.mensajeError.set(
            res.descripcion || res.mensaje || 'No se pudo cargar la lista de asistentes'
          );
        }
      },
      error: () => {
        this.cargando.set(false);
        this.asistentes.set([]);
        this.mensajeError.set('No se pudo cargar la lista de asistentes');
      },
    });
  }

  atras(): void {
    if (this.fechaf) {
      this.router.navigate(['/horariosadmin', this.fechaf]);
    } else {
      this.router.navigate(['/caladmin']);
    }
  }

  async ponerFalta(
    idUsuario: number,
    nombre: string,
    lugar: number | string,
    asistio?: string
  ): Promise<void> {
    if (this.guardando()) return;

    if (asistio === 'A') {
      const ok = await this.ui.confirmar({
        titulo: '¿Marcó asistencia?',
        mensaje: `Se registrará una falta para ${nombre} en el lugar L${lugar}.`,
        confirmarTexto: 'Registrar falta',
        cancelarTexto: 'Cancelar',
      });
      if (!ok) return;
      await this.aplicarFalta(idUsuario, lugar, 'I');
    } else {
      const ok = await this.ui.confirmar({
        titulo: 'Quitar falta',
        mensaje: `¿Deseas quitar la falta a ${nombre}?`,
        confirmarTexto: 'Quitar falta',
        cancelarTexto: 'Cancelar',
      });
      if (!ok) return;
      await this.aplicarFalta(idUsuario, lugar, 'CFC');
    }
  }

  private async aplicarFalta(
    idUsuario: number,
    lugar: number | string,
    tipo: 'I' | 'CFC'
  ): Promise<void> {
    this.guardando.set(true);
    try {
      const res = await firstValueFrom(
        this.api.agregarFalta(
          idUsuario,
          this.session.idUsuario() ?? 0,
          lugar,
          this.idClase,
          this.fecha() || this.fechaf,
          tipo
        )
      );
      if (res.codigo === 200) {
        this.ui.toast(res.descripcion || res.mensaje || 'Asistencia actualizada', 'success');
      } else {
        this.ui.toast(res.descripcion || res.mensaje || 'No se pudo actualizar', 'warning');
      }
      this.cargar(true);
    } catch {
      this.ui.toast('Error de conexión', 'error');
    } finally {
      this.guardando.set(false);
    }
  }

  // ─── Helpers ────────────────────────────────────────────
  iniciales(nombre: string): string {
    const partes = (nombre || '').trim().split(/\s+/);
    if (!partes[0]) return '?';
    const segunda = partes.length > 1 ? partes[1].charAt(0) : '';
    return (partes[0].charAt(0) + segunda).toUpperCase();
  }

  estatusBadge(): string {
    const estatus = String(this.clase().estatus ?? '1');
    return estatus === '1' ? 'badge badge-success' : 'badge badge-muted';
  }

  estatusTexto(): string {
    return String(this.clase().estatus ?? '1') === '1' ? 'Activa' : 'Inactiva';
  }
}
