import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LugaresRespuesta, LugarSlot, Respuesta } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

interface Slot extends LugarSlot {
  numero?: number;
}

interface LugarItem {
  numero: number;
  ocupado: boolean;
}

const COLS = ['l1', 'l2', 'l3', 'l4', 'l5'] as const;

@Component({
  selector: 'app-lugares',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './lugares.page.html',
  styleUrl: './lugares.page.scss',
})
export class LugaresPage implements OnInit {
  private api = inject(ApiService);
  private session = inject(SessionService);
  private ui = inject(UiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly fechaf = this.route.snapshot.paramMap.get('fechaf') ?? '';
  readonly idClase = Number(this.route.snapshot.paramMap.get('idClase') ?? 0);
  private qp = this.route.snapshot.queryParamMap;

  readonly descripcionHorario = this.qp.get('descripcionHorario') ?? '';
  readonly asiste = this.qp.get('asistencia') === 'true';
  readonly lugarReservado = this.qp.get('lugar') ?? '';
  readonly claseLlena = this.qp.get('claseLlena') === 'true';
  readonly enListaEspera = this.qp.get('isListaEspera') === 'true';

  readonly lugares = signal<LugarItem[]>([]);
  readonly horasCancelacion = signal('');
  readonly cargando = signal(true);
  readonly mensajeError = signal('');
  readonly procesando = signal(false);

  readonly disponibles = computed(
    () => this.lugares().filter((l) => !l.ocupado).length
  );
  readonly mostrarGrid = computed(() => !this.asiste && !this.claseLlena);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.mensajeError.set('');

    this.api.getLugares(this.idClase, this.fechaf).subscribe({
      next: (res) => this.procesarLugares(res),
      error: () => {
        this.cargando.set(false);
        this.mensajeError.set('No se pudo conectar con el servidor.');
      },
    });

    this.api.getConfigHorasCancelacion().subscribe({
      next: (res) => {
        this.horasCancelacion.set(res.respuesta?.[0]?.valorAbajo ?? '');
      },
      error: () => undefined,
    });
  }

  private procesarLugares(res: Respuesta<LugaresRespuesta>): void {
    this.cargando.set(false);

    if (res.codigo !== 200 || !res.respuesta) {
      this.mensajeError.set(
        res.descripcion || res.mensaje || 'No se pudieron cargar los lugares.'
      );
      return;
    }

    const mapa = new Map<number, boolean>();
    for (const key of COLS) {
      const arr = res.respuesta[key] as Slot[] | undefined;
      for (const slot of arr ?? []) {
        const numero = slot.lugar ?? slot.numero;
        if (numero == null) continue;
        mapa.set(numero, mapa.get(numero) === true || slot.seleccionado === true);
      }
    }

    const items: LugarItem[] = [...mapa.entries()]
      .map(([numero, ocupado]) => ({ numero, ocupado }))
      .sort((a, b) => a.numero - b.numero);

    if (items.length === 0) {
      this.mensajeError.set('No se pudieron cargar los lugares.');
      return;
    }

    this.lugares.set(items);
  }

  // ─── Acciones ───────────────────────────────────────────
  async apartar(lugar: number): Promise<void> {
    const id = this.session.idUsuario();
    if (id == null) {
      this.ui.toast('No hay una sesión activa.', 'error');
      return;
    }

    const ok = await this.ui.confirmar({
      titulo: 'Apartar lugar',
      mensaje:
        '¿Seguro que deseas apartar el lugar ' +
        lugar +
        ', de la clase de ' +
        this.descripcionHorario +
        ' del día ' +
        this.fechaf +
        '?',
      confirmarTexto: 'Aceptar',
      cancelarTexto: 'Cancelar',
    });
    if (!ok) return;

    this.ejecutar(this.api.apartarLugar(this.idClase, id, this.fechaf, lugar), 'Lugar apartado');
  }

  async eliminarAsistencia(): Promise<void> {
    const id = this.session.idUsuario();
    if (id == null) {
      this.ui.toast('No hay una sesión activa.', 'error');
      return;
    }

    const ok = await this.ui.confirmar({
      titulo: 'Eliminar asistencia',
      mensaje:
        '¿Seguro que deseas eliminar tu asistencia, de la clase de ' +
        this.descripcionHorario +
        ' del día ' +
        this.fechaf +
        '?',
      confirmarTexto: 'Aceptar',
      cancelarTexto: 'Cancelar',
    });
    if (!ok) return;

    this.ejecutar(this.api.cancelarAsistencia(this.idClase, id, this.fechaf), 'Asistencia eliminada');
  }

  async agregarListaEspera(): Promise<void> {
    const id = this.session.idUsuario();
    if (id == null) {
      this.ui.toast('No hay una sesión activa.', 'error');
      return;
    }

    const ok = await this.ui.confirmar({
      titulo: 'Lista de espera',
      mensaje:
        '¿Seguro que deseas agregarte a la lista de espera, de la clase de ' +
        this.descripcionHorario +
        ' del día ' +
        this.fechaf +
        '?',
      confirmarTexto: 'Aceptar',
      cancelarTexto: 'Cancelar',
    });
    if (!ok) return;

    this.ejecutar(
      this.api.agregarListaEspera(this.idClase, id, this.fechaf),
      'Agregado a la lista de espera'
    );
  }

  async quitarListaEspera(): Promise<void> {
    const id = this.session.idUsuario();
    if (id == null) {
      this.ui.toast('No hay una sesión activa.', 'error');
      return;
    }

    const ok = await this.ui.confirmar({
      titulo: 'Lista de espera',
      mensaje:
        '¿Seguro que deseas quitarte de la lista de espera, de la clase de ' +
        this.descripcionHorario +
        ' del día ' +
        this.fechaf +
        '?',
      confirmarTexto: 'Aceptar',
      cancelarTexto: 'Cancelar',
    });
    if (!ok) return;

    this.ejecutar(
      this.api.quitarListaEspera(this.idClase, id, this.fechaf),
      'Quitado de la lista de espera'
    );
  }

  private ejecutar(obs: Observable<Respuesta>, okMensaje: string): void {
    this.procesando.set(true);

    obs.subscribe({
      next: (res) => {
        this.procesando.set(false);
        if (res.codigo === 200) {
          this.ui.toast(this.textoRespuesta(res) || okMensaje, 'success');
          this.router.navigate(['/calalumno']);
        } else {
          this.ui.toast(this.textoRespuesta(res) || 'No se pudo completar la acción.', 'error');
        }
      },
      error: () => {
        this.procesando.set(false);
        this.ui.toast('No se pudo contactar al servidor.', 'error');
      },
    });
  }

  private textoRespuesta(res: Respuesta): string {
    const r = res.respuesta;
    if (typeof r === 'string' && r.trim() !== '') return r;
    return res.descripcion || res.mensaje || '';
  }

  atras(): void {
    this.router.navigate(['/calalumno']);
  }
}
