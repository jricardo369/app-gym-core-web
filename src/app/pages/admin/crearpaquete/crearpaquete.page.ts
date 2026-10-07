import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Respuesta } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

/** Fila devuelta por `Inscripciones?idUsuario=...&sociedad=...` */
interface InscripcionItem {
  idInscripcion?: number;
  idUsuario?: number;
  tipoPago?: number | string;
  tipoInscripcion?: number | string;
  fechaInicio?: string;
  comentario?: string;
  tipoInscripcionDesc?: string;
  descripcionTipoPago?: string;
  vencimiento?: string;
}

@Component({
  selector: 'app-crearpaquete',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './crearpaquete.page.html',
  styleUrl: './crearpaquete.page.scss',
})
export class CrearpaquetePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private ui = inject(UiService);

  readonly idUsuario = signal('');
  readonly sociedad = signal('');
  readonly idRol = signal<number | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly inscripciones = signal<InscripcionItem[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('idUsuario') ?? '';
    const soc = this.route.snapshot.paramMap.get('sociedad') ?? '';
    const rol = this.route.snapshot.queryParamMap.get('idRol');

    this.idUsuario.set(id);
    this.sociedad.set(soc);
    this.idRol.set(rol != null && rol !== '' ? Number(rol) : null);
    this.cargar();
  }

  get puedeAgregar(): boolean {
    const rol = this.idRol();
    return rol === null || rol === 2;
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api.getInscripciones(this.idUsuario(), this.sociedad()).subscribe({
      next: (res) => this.aplicar(res),
      error: () => {
        this.inscripciones.set([]);
        this.cargando.set(false);
        this.error.set('No se pudo cargar el historial de paquetes.');
      },
    });
  }

  private aplicar(res: Respuesta<InscripcionItem[]>): void {
    this.cargando.set(false);
    if (res.codigo !== 200) {
      this.inscripciones.set([]);
      this.error.set(res.descripcion || res.mensaje || 'No se pudo cargar el historial.');
      return;
    }
    const filas = res.respuesta;
    this.inscripciones.set(Array.isArray(filas) ? (filas as InscripcionItem[]) : []);
  }

  agregarPaquete(): void {
    this.router.navigate(['/paquetes', this.idUsuario(), this.sociedad()], {
      queryParams: this.idRol() != null ? { idRol: String(this.idRol()) } : undefined,
    });
  }

  volver(): void {
    this.router.navigate(['/editarperfil', this.idUsuario()]);
  }

  nombrePaquete(item: InscripcionItem): string {
    return item.tipoInscripcionDesc || 'Membresía';
  }
}
