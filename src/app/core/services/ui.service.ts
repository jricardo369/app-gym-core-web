import { Injectable, signal } from '@angular/core';

export type ToastTipo = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: ToastTipo;
}

export interface AlertaConfig {
  titulo: string;
  mensaje?: string;
  confirmarTexto?: string;
  cancelarTexto?: string;
  soloAceptar?: boolean;
}

/**
 * Reemplazo web de AlertController / LoadingController / ToastController de Ionic.
 * Renderizado por <app-overlay> en el raíz de la app.
 */
@Injectable({ providedIn: 'root' })
export class UiService {
  readonly toasts = signal<Toast[]>([]);
  readonly alerta = signal<AlertaConfig | null>(null);
  readonly cargando = signal<string | null>(null);

  private seq = 0;
  private resolverConfirm: ((ok: boolean) => void) | null = null;

  toast(mensaje: string, tipo: ToastTipo = 'info', ms = 2800): void {
    const id = ++this.seq;
    this.toasts.update((t) => [...t, { id, mensaje, tipo }]);
    setTimeout(() => {
      this.toasts.update((t) => t.filter((x) => x.id !== id));
    }, ms);
  }

  /** Alerta con confirmación (resuelve true/false) o botón único */
  confirmar(config: AlertaConfig): Promise<boolean> {
    this.alerta.set(config);
    return new Promise((resolve) => {
      this.resolverConfirm = resolve;
    });
  }

  cerrarAlerta(resultado: boolean): void {
    this.alerta.set(null);
    this.resolverConfirm?.(resultado);
    this.resolverConfirm = null;
  }

  mostrarCarga(mensaje = 'Cargando…'): void {
    this.cargando.set(mensaje);
  }

  ocultarCarga(): void {
    this.cargando.set(null);
  }

  /** Muestra loader, espera `ms` y lo oculta (patrón de la app móvil) */
  async cargaTemporal(mensaje: string, ms = 900): Promise<void> {
    this.mostrarCarga(mensaje);
    await new Promise((r) => setTimeout(r, ms));
    this.ocultarCarga();
  }
}
