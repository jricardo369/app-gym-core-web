import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SessionService } from '../../core/services/session.service';
import { ROL } from '../../core/models';
import { IconComponent } from '../../shared/icon/icon.component';

interface Acceso {
  ruta: string;
  icon: string;
  titulo: string;
  sub: string;
  cta: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.scss',
})
export class AdminPage implements OnInit {
  readonly session = inject(SessionService);
  private api = inject(ApiService);
  private router = inject(Router);

  readonly mensaje = signal<string>('');
  readonly ROL = ROL;

  ngOnInit(): void {
    const id = this.session.idUsuario();
    const sociedad = this.session.sociedad() ?? '';
    if (id == null) return;

    this.api.usuarioConMensaje(id, sociedad).subscribe({
      next: (res) => {
        const fila = Array.isArray(res.respuesta) ? res.respuesta[0] : res.respuesta;
        this.mensaje.set(fila?.mensaje ?? '');
      },
      error: () => undefined,
    });
  }

  get nombre(): string {
    return this.session.nombre() || 'Atleta';
  }

  get esAlumno(): boolean {
    return this.session.isUser();
  }

  get accesos(): Acceso[] {
    const rol = this.session.rol();
    if (rol === ROL.ADMIN) {
      return [
        { ruta: '/caladmin', icon: 'calendar', titulo: 'Calendario', sub: 'Clases y horarios del día', cta: 'Abrir' },
        { ruta: '/clases', icon: 'dumbbell', titulo: 'Clases', sub: 'Catálogo y horarios', cta: 'Abrir' },
        { ruta: '/perfil', icon: 'users', titulo: 'Usuarios', sub: 'Perfiles, pagos y faltas', cta: 'Abrir' },
        { ruta: '/asuetos', icon: 'calendar-x', titulo: 'Asuetos', sub: 'Días bloqueados', cta: 'Abrir' },
      ];
    }
    if (rol === ROL.COACH) {
      return [
        { ruta: '/caladmin', icon: 'calendar', titulo: 'Calendario', sub: 'Mis clases asignadas', cta: 'Abrir' },
        { ruta: '/user', icon: 'user', titulo: 'Perfil', sub: 'Mis datos personales', cta: 'Abrir' },
      ];
    }
    return [
      { ruta: '/calalumno', icon: 'calendar', titulo: 'Calendario', sub: 'Reserva tu clase', cta: 'Empezar' },
      { ruta: '/clasesalumnos', icon: 'clipboard', titulo: 'Mis clases', sub: 'Próximas reservas', cta: 'Ver' },
      { ruta: '/user', icon: 'user', titulo: 'Perfil', sub: 'Mis datos y progreso', cta: 'Abrir' },
      { ruta: '/asistenciasusuario', icon: 'list-check', titulo: 'Asistencias', sub: 'Historial de clases', cta: 'Ver' },
    ];
  }

  get etiquetaRol(): string {
    if (this.session.isAdmin()) return 'Panel admin';
    if (this.session.isCoach()) return 'Coach';
    return 'Mi entreno';
  }

  get rutaCalendario(): string {
    return this.esAlumno ? '/calalumno' : '/caladmin';
  }

  ir(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
