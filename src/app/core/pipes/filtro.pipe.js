import { __decorate } from "tslib";
import { Pipe } from '@angular/core';
/** Filtra una lista por texto libre (nombre, descripción o fecha). */
let FiltroPipe = class FiltroPipe {
    transform(arreglo, texto) {
        if (!arreglo)
            return [];
        const t = (texto ?? '').trim().toLowerCase();
        if (!t)
            return arreglo;
        const campos = ['nombre', 'descripcion', 'fechaDescripcion', 'diaDescripcion', 'usuario'];
        return arreglo.filter((item) => {
            const fila = item;
            return campos.some((k) => String(fila?.[k] ?? '')
                .toLowerCase()
                .includes(t));
        });
    }
};
FiltroPipe = __decorate([
    Pipe({ name: 'filtro', standalone: true })
], FiltroPipe);
export { FiltroPipe };
