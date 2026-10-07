import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SessionService } from '../../core/services/session.service';
import { UiService } from '../../core/services/ui.service';
import { ApiService } from '../../core/services/api.service';
import { navInferiorPorRol, navPorRol } from '../nav.config';
import { IconComponent } from '../../shared/icon/icon.component';
import { EMPRESA_PORTAL, VERSION_PORTAL } from '../../core/app-config';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  readonly session = inject(SessionService);
  private router = inject(Router);
  private ui = inject(UiService);
  private api = inject(ApiService);

  readonly url = signal(this.router.url);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((e) => this.url.set(e.urlAfterRedirects));
  }

  ngOnInit(): void {
    this.verificarBloqueo();
  }

  /** Bloqueo por falta de pago (central, equivalente al guard de la app móvil) */
  private verificarBloqueo(): void {
    const id = this.session.idUsuario();
    if (!id) return;
    this.api.bloqueoPorPago(id).subscribe({
      next: async (res) => {
        if (res.codigo === 500) {
          await this.ui.confirmar({
            titulo: 'Cuenta bloqueada',
            mensaje: res.descripcion || 'Su membresía está bloqueada por falta de pago.',
            soloAceptar: true,
            confirmarTexto: 'Entendido',
          });
          this.session.logout();
        }
      },
      error: () => undefined,
    });
  }


  get navItems() {
    return navPorRol(this.session.rol());
  }

  get navBottom() {
    return navInferiorPorRol(this.session.rol());
  }

  get version() {
    return VERSION_PORTAL;
  }

  get empresa() {
    return EMPRESA_PORTAL;
  }

  iniciales(): string {
    return this.session.iniciales();
  }

  rolTexto(): string {
    if (this.session.isAdmin()) return 'Administrador';
    if (this.session.isCoach()) return 'Entrenador';
    return 'Alumno';
  }

  async cerrarSesion(): Promise<void> {
    const ok = await this.ui.confirmar({
      titulo: 'Cerrar sesión',
      mensaje: '¿Seguro que desea cerrar sesión?',
      confirmarTexto: 'Cerrar sesión',
    });
    if (!ok) return;
    await this.ui.cargaTemporal('Cerrando sesión…', 700);
    this.session.logout();
  }
}
