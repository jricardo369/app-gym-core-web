import { ROL } from '../core/models';

export interface NavItem {
  label: string;
  ruta: string;
  icon: string;
}

/** Navegación lateral (desktop) según rol */
export function navPorRol(rol: number | null): NavItem[] {
  switch (rol) {
    case ROL.ADMIN:
      return [
        { label: 'Inicio', ruta: '/admin', icon: 'home' },
        { label: 'Calendario', ruta: '/caladmin', icon: 'calendar' },
        { label: 'Clases', ruta: '/clases', icon: 'dumbbell' },
        { label: 'Usuarios', ruta: '/perfil', icon: 'users' },
        { label: 'Asuetos', ruta: '/asuetos', icon: 'calendar-x' },
      ];
    case ROL.COACH:
      return [
        { label: 'Inicio', ruta: '/admin', icon: 'home' },
        { label: 'Calendario', ruta: '/caladmin', icon: 'calendar' },
        { label: 'Mi perfil', ruta: '/user', icon: 'user' },
      ];
    case ROL.ALUMNO:
    default:
      return [
        { label: 'Inicio', ruta: '/admin', icon: 'home' },
        { label: 'Calendario', ruta: '/calalumno', icon: 'calendar' },
        { label: 'Mis clases', ruta: '/clasesalumnos', icon: 'clipboard' },
        { label: 'Mi perfil', ruta: '/user', icon: 'user' },
      ];
  }
}

/** Navegación inferior (móvil, ≤4 items + salir) */
export function navInferiorPorRol(rol: number | null): NavItem[] {
  const items = navPorRol(rol);
  if (rol === ROL.ADMIN) {
    return [items[0], items[1], items[2], items[3]];
  }
  if (rol === ROL.ALUMNO) {
    return [items[0], items[1], items[2], items[3]];
  }
  return items.slice(0, 3);
}
