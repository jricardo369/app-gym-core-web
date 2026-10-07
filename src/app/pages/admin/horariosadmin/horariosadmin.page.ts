import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Clase } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

@Component({
  selector: 'app-horariosadmin',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './horariosadmin.page.html',
  styleUrl: './horariosadmin.page.scss',
})
export class HorariosadminPage implements OnInit {
  readonly session = inject(SessionService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ui = inject(UiService);

  readonly fechaf = this.route.snapshot.paramMap.get('fechaf') ?? '';
  readonly clases = signal<Clase[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    this.cargar();
  }

  get esAdmin(): boolean {
    return this.session.isAdmin();
  }

  cargar(): void {
    if (!this.fechaf) {
      this.errorClases();
      return;
    }

    this.cargando.set(true);
    const sociedad = this.session.sociedad();
    const peticion = this.session.isCoach()
      ? this.api.getClasesPorFechaProfesor(this.fechaf, this.session.idUsuario() ?? 0, sociedad)
      : this.api.getClasesActivasAdmin(this.fechaf, sociedad);

    peticion.subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res.codigo === 200) {
          this.clases.set(Array.isArray(res.respuesta) ? res.respuesta : []);
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

  atras(): void {
    this.router.navigate(['/caladmin']);
  }

  verClase(clase: Clase): void {
    this.router.navigate(['/asistentes', clase.idClase], {
      queryParams: {
        nombre: clase.nombre,
        profesor: clase.profesor,
        fechaf: this.fechaf,
        profesorNombre: clase.profesorNombre ?? '',
        descripcionHorario: clase.descripcionHorario ?? '',
      },
    });
  }

  iconoHorario(horario?: string): string {
    if (horario === 'V') return 'moon';
    if (horario === 'M') return 'sun';
    return 'dumbbell';
  }

  lugaresTexto(clase: Clase): string {
    const v = this.textoLugares(clase.lugaresDisponibles);
    return v === '' ? '—' : v;
  }

  lugaresBadge(clase: Clase): string {
    const v = this.textoLugares(clase.lugaresDisponibles);
    if (v === 'CLASE LLENA') return 'badge badge-danger';
    if (v === '') return 'badge badge-muted';
    return v.startsWith('0') ? 'badge badge-warning' : 'badge badge-success';
  }

  /** La API puede devolver lugares como número o como texto ('CLASE LLENA'). */
  private textoLugares(valor: unknown): string {
    return valor == null ? '' : String(valor);
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
      .then(() => this.router.navigate(['/caladmin']));
  }
}
