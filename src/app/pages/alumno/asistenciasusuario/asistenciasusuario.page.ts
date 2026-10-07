import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AsistenciaHistorial } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { IconComponent } from '../../../shared/icon/icon.component';

@Component({
  selector: 'app-asistenciasusuario',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './asistenciasusuario.page.html',
  styleUrl: './asistenciasusuario.page.scss',
})
export class AsistenciasusuarioPage implements OnInit {
  private api = inject(ApiService);
  private session = inject(SessionService);
  private router = inject(Router);

  readonly historial = signal<AsistenciaHistorial[]>([]);
  readonly cargando = signal(true);
  readonly mensajeError = signal('');

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
    this.historial.set([]);

    this.api.getAsistenciasUsuario(id).subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res.codigo === 200) {
          this.historial.set(Array.isArray(res.respuesta) ? res.respuesta : []);
        } else {
          this.mensajeError.set(
            res.descripcion || res.mensaje || 'No se pudo cargar tu historial.'
          );
        }
      },
      error: () => {
        this.cargando.set(false);
        this.mensajeError.set('No se pudo conectar con el servidor.');
      },
    });
  }

  atras(): void {
    this.router.navigate(['/user']);
  }

  // ─── Helpers de vista ───────────────────────────────────
  iconoHorario(item: AsistenciaHistorial): string {
    if (item.horario === 'M') return 'sun';
    if (item.horario === 'V') return 'moon';
    return 'dumbbell';
  }

  asistio(item: AsistenciaHistorial): boolean {
    return item.asistio === 'A';
  }

  titulo(item: AsistenciaHistorial): string {
    return item.descripcionHorario || item.nombre || 'Clase';
  }

  detalle(item: AsistenciaHistorial): string {
    const partes: string[] = [];
    if (item.dia) partes.push('El día ' + item.dia);
    if (item.lugar != null && item.lugar !== '') partes.push('en el lugar ' + item.lugar);
    if (item.nombre && item.descripcionHorario) partes.push(item.nombre);
    if (item.profesorNombre) partes.push('Coach ' + item.profesorNombre);
    return partes.join(' · ');
  }
}
