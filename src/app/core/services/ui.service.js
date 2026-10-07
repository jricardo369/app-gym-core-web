import { __decorate } from "tslib";
import { Injectable, signal } from '@angular/core';
/**
 * Reemplazo web de AlertController / LoadingController / ToastController de Ionic.
 * Renderizado por <app-overlay> en el raíz de la app.
 */
let UiService = class UiService {
    toasts = signal([]);
    alerta = signal(null);
    cargando = signal(null);
    seq = 0;
    resolverConfirm = null;
    toast(mensaje, tipo = 'info', ms = 2800) {
        const id = ++this.seq;
        this.toasts.update((t) => [...t, { id, mensaje, tipo }]);
        setTimeout(() => {
            this.toasts.update((t) => t.filter((x) => x.id !== id));
        }, ms);
    }
    /** Alerta con confirmación (resuelve true/false) o botón único */
    confirmar(config) {
        this.alerta.set(config);
        return new Promise((resolve) => {
            this.resolverConfirm = resolve;
        });
    }
    cerrarAlerta(resultado) {
        this.alerta.set(null);
        this.resolverConfirm?.(resultado);
        this.resolverConfirm = null;
    }
    mostrarCarga(mensaje = 'Cargando…') {
        this.cargando.set(mensaje);
    }
    ocultarCarga() {
        this.cargando.set(null);
    }
    /** Muestra loader, espera `ms` y lo oculta (patrón de la app móvil) */
    async cargaTemporal(mensaje, ms = 900) {
        this.mostrarCarga(mensaje);
        await new Promise((r) => setTimeout(r, ms));
        this.ocultarCarga();
    }
};
UiService = __decorate([
    Injectable({ providedIn: 'root' })
], UiService);
export { UiService };
