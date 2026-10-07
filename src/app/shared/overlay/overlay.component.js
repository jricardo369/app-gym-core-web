import { __decorate } from "tslib";
import { Component, inject } from '@angular/core';
import { UiService } from '../../core/services/ui.service';
import { IconComponent } from '../icon/icon.component';
/** Overlays globales: toasts, alerta/confirmación y loader. */
let OverlayComponent = class OverlayComponent {
    ui = inject(UiService);
    iconoToast(tipo) {
        if (tipo === 'success')
            return 'check';
        if (tipo === 'error')
            return 'alert';
        if (tipo === 'warning')
            return 'alert';
        return 'info';
    }
};
OverlayComponent = __decorate([
    Component({
        selector: 'app-overlay',
        standalone: true,
        imports: [IconComponent],
        template: `
    <!-- Toasts -->
    <div class="toasts" role="status" aria-live="polite">
      @for (t of ui.toasts(); track t.id) {
        <div class="toast" [class]="t.tipo">
          <app-icon [name]="iconoToast(t.tipo)" [size]="18" />
          <span>{{ t.mensaje }}</span>
        </div>
      }
    </div>

    <!-- Alerta / confirmación -->
    @if (ui.alerta(); as a) {
      <div class="modal-overlay">
        <div
          class="modal"
          role="alertdialog"
          aria-modal="true"
          [attr.aria-label]="a.titulo"
          (keydown.escape)="ui.cerrarAlerta(false)"
        >
          <h3>{{ a.titulo }}</h3>
          @if (a.mensaje) {
            <p class="modal-body mb-0">{{ a.mensaje }}</p>
          }
          <div class="modal-actions">
            @if (!a.soloAceptar) {
              <button type="button" class="btn btn-secondary btn-sm" (click)="ui.cerrarAlerta(false)">
                {{ a.cancelarTexto || 'Cancelar' }}
              </button>
            }
            <button
              type="button"
              class="btn btn-primary btn-sm"
              (click)="ui.cerrarAlerta(true)"
            >
              {{ a.confirmarTexto || 'Aceptar' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Loader -->
    @if (ui.cargando(); as msg) {
      <div class="loading-overlay" role="alert" aria-busy="true">
        <div class="loading-box">
          <div class="spinner"></div>
          <span>{{ msg }}</span>
        </div>
      </div>
    }
  `,
    })
], OverlayComponent);
export { OverlayComponent };
