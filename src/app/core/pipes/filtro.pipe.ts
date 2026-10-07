import { Pipe, PipeTransform } from '@angular/core';

/** Filtra una lista por texto libre (nombre, descripción o fecha). */
@Pipe({ name: 'filtro', standalone: true })
export class FiltroPipe implements PipeTransform {
  transform<T>(arreglo: T[] | null | undefined, texto: string): T[] {
    if (!arreglo) return [];
    const t = (texto ?? '').trim().toLowerCase();
    if (!t) return arreglo;
    const campos = ['nombre', 'descripcion', 'fechaDescripcion', 'diaDescripcion', 'usuario'];
    return arreglo.filter((item) => {
      const fila = item as Record<string, unknown>;
      return campos.some((k) =>
        String(fila?.[k] ?? '')
          .toLowerCase()
          .includes(t)
      );
    });
  }
}
