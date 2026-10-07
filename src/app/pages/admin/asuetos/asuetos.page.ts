import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Asueto } from '../../../core/models';
import { FiltroPipe } from '../../../core/pipes/filtro.pipe';
import { ApiService } from '../../../core/services/api.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

/** Asuetos con datos de presentación que devuelve la API. */
interface AsuetoItem extends Asueto {
  claseDescripcion?: string;
}

@Component({
  selector: 'app-asuetos',
  standalone: true,
  imports: [IconComponent, FiltroPipe],
  templateUrl: './asuetos.page.html',
  styleUrl: './asuetos.page.scss',
})
export class AsuetosPage implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private ui = inject(UiService);

  readonly asuetos = signal<AsuetoItem[]>([]);
  readonly textoBuscar = signal('');
  readonly cargando = signal(true);
  readonly eliminando = signal(false);
  readonly mensajeError = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.mensajeError.set('');
    this.api.getAsuetos().subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res.codigo === 200) {
          this.asuetos.set((res.respuesta ?? []) as AsuetoItem[]);
        } else {
          this.errorAsuetos();
        }
      },
      error: () => {
        this.cargando.set(false);
        this.errorAsuetos();
      },
    });
  }

  buscar(event: Event): void {
    const el = event.target as HTMLInputElement | null;
    this.textoBuscar.set(el && el.value ? el.value : '');
  }

  async eliminar(fecha: string): Promise<void> {
    if (this.eliminando()) return;
    const ok = await this.ui.confirmar({
      titulo: 'Eliminar asueto',
      mensaje: '¿Desea eliminar el asueto?',
      confirmarTexto: 'Eliminar',
      cancelarTexto: 'Cancelar',
    });
    if (!ok) return;

    this.eliminando.set(true);
    try {
      const res = await firstValueFrom(this.api.eliminarAsueto(fecha));
      if (res.codigo === 200) {
        this.ui.toast(res.descripcion || res.mensaje || 'Asueto eliminado', 'success');
        this.cargar();
      } else {
        this.ui.toast(res.descripcion || res.mensaje || 'No se pudo eliminar', 'error');
      }
    } catch {
      this.ui.toast('Error de conexión', 'error');
    } finally {
      this.eliminando.set(false);
    }
  }

  irNuevo(): void {
    this.router.navigate(['/nuevoasueto']);
  }

  atras(): void {
    this.router.navigate(['/admin']);
  }

  // ─── Helpers ────────────────────────────────────────────
  tipoTexto(tipo?: number | string): string {
    const t = String(tipo ?? '1');
    if (t === '7') return 'Semanal';
    if (t === '14') return 'Quincenal';
    return 'Diario';
  }

  private errorAsuetos(): void {
    this.asuetos.set([]);
    this.mensajeError.set('Error al mostrar asuetos');
    void this.ui
      .confirmar({
        titulo: 'Error',
        mensaje: 'Error al mostrar asuetos',
        soloAceptar: true,
        confirmarTexto: 'OK',
      })
      .then(() => this.router.navigate(['/caladmin']));
  }
}
