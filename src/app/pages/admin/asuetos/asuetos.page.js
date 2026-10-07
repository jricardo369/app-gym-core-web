import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FiltroPipe } from '../../../core/pipes/filtro.pipe';
import { ApiService } from '../../../core/services/api.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';
let AsuetosPage = class AsuetosPage {
    api = inject(ApiService);
    router = inject(Router);
    ui = inject(UiService);
    asuetos = signal([]);
    textoBuscar = signal('');
    cargando = signal(true);
    eliminando = signal(false);
    mensajeError = signal('');
    ngOnInit() {
        this.cargar();
    }
    cargar() {
        this.cargando.set(true);
        this.mensajeError.set('');
        this.api.getAsuetos().subscribe({
            next: (res) => {
                this.cargando.set(false);
                if (res.codigo === 200) {
                    this.asuetos.set((res.respuesta ?? []));
                }
                else {
                    this.errorAsuetos();
                }
            },
            error: () => {
                this.cargando.set(false);
                this.errorAsuetos();
            },
        });
    }
    buscar(event) {
        const el = event.target;
        this.textoBuscar.set(el && el.value ? el.value : '');
    }
    async eliminar(fecha) {
        if (this.eliminando())
            return;
        const ok = await this.ui.confirmar({
            titulo: 'Eliminar asueto',
            mensaje: '¿Desea eliminar el asueto?',
            confirmarTexto: 'Eliminar',
            cancelarTexto: 'Cancelar',
        });
        if (!ok)
            return;
        this.eliminando.set(true);
        try {
            const res = await firstValueFrom(this.api.eliminarAsueto(fecha));
            if (res.codigo === 200) {
                this.ui.toast(res.descripcion || res.mensaje || 'Asueto eliminado', 'success');
                this.cargar();
            }
            else {
                this.ui.toast(res.descripcion || res.mensaje || 'No se pudo eliminar', 'error');
            }
        }
        catch {
            this.ui.toast('Error de conexión', 'error');
        }
        finally {
            this.eliminando.set(false);
        }
    }
    irNuevo() {
        this.router.navigate(['/nuevoasueto']);
    }
    atras() {
        this.router.navigate(['/admin']);
    }
    // ─── Helpers ────────────────────────────────────────────
    tipoTexto(tipo) {
        const t = String(tipo ?? '1');
        if (t === '7')
            return 'Semanal';
        if (t === '14')
            return 'Quincenal';
        return 'Diario';
    }
    errorAsuetos() {
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
};
AsuetosPage = __decorate([
    Component({
        selector: 'app-asuetos',
        standalone: true,
        imports: [IconComponent, FiltroPipe],
        templateUrl: './asuetos.page.html',
        styleUrl: './asuetos.page.scss',
    })
], AsuetosPage);
export { AsuetosPage };
