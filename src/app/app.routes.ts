import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'login',
        title: 'Iniciar sesión — LUA Studio',
        loadComponent: () => import('./pages/auth/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'registro',
        title: 'Registro — LUA Studio',
        loadComponent: () =>
          import('./pages/auth/registro/registro.page').then((m) => m.RegistroPage),
      },
      {
        path: 'recuperar',
        title: 'Recuperar contraseña — LUA Studio',
        loadComponent: () =>
          import('./pages/auth/recuperar/recuperar.page').then((m) => m.RecuperarPage),
      },
      {
        path: 'terminos',
        title: 'Aviso del estudio — LUA Studio',
        loadComponent: () =>
          import('./pages/auth/terminos/terminos.page').then((m) => m.TerminosPage),
      },
    ],
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      // ─── General / dashboard por rol ─────────────────────
      {
        path: 'admin',
        title: 'Inicio — LUA Studio',
        loadComponent: () => import('./pages/admin/admin.page').then((m) => m.AdminPage),
      },
      {
        path: 'cambiarpass',
        title: 'Cambiar contraseña — LUA Studio',
        loadComponent: () =>
          import('./pages/auth/cambiarpass/cambiarpass.page').then((m) => m.CambiarpassPage),
      },

      // ─── Calendarios ─────────────────────────────────────
      {
        path: 'caladmin',
        title: 'Calendario — LUA Studio',
        loadComponent: () => import('./pages/admin/caladmin/caladmin.page').then((m) => m.CaladminPage),
      },
      {
        path: 'calalumno',
        title: 'Calendario — LUA Studio',
        loadComponent: () =>
          import('./pages/alumno/calalumno/calalumno.page').then((m) => m.CalalumnoPage),
      },

      // ─── Alumno ──────────────────────────────────────────
      {
        path: 'user',
        title: 'Mi perfil — LUA Studio',
        loadComponent: () => import('./pages/alumno/user/user.page').then((m) => m.UserPage),
      },
      {
        path: 'horarios/:fechaf',
        title: 'Clases — LUA Studio',
        loadComponent: () =>
          import('./pages/alumno/horarios/horarios.page').then((m) => m.HorariosPage),
      },
      {
        path: 'lugares/:fechaf/:idClase',
        title: 'Lugares — LUA Studio',
        loadComponent: () => import('./pages/alumno/lugares/lugares.page').then((m) => m.LugaresPage),
      },
      {
        path: 'clasesalumnos',
        title: 'Mis clases — LUA Studio',
        loadComponent: () =>
          import('./pages/alumno/clasesalumnos/clasesalumnos.page').then((m) => m.ClasesalumnosPage),
      },
      {
        path: 'asisalumno/:idClase',
        title: 'Asistencia — LUA Studio',
        loadComponent: () =>
          import('./pages/alumno/asisalumno/asisalumno.page').then((m) => m.AsisalumnoPage),
      },
      {
        path: 'asistenciasusuario',
        title: 'Mis asistencias — LUA Studio',
        loadComponent: () =>
          import('./pages/alumno/asistenciasusuario/asistenciasusuario.page').then(
            (m) => m.AsistenciasusuarioPage
          ),
      },

      // ─── Admin / Coach ───────────────────────────────────
      {
        path: 'horariosadmin/:fechaf',
        title: 'Clases — LUA Studio',
        loadComponent: () =>
          import('./pages/admin/horariosadmin/horariosadmin.page').then((m) => m.HorariosadminPage),
      },
      {
        path: 'asistentes/:idClase',
        title: 'Asistentes — LUA Studio',
        loadComponent: () =>
          import('./pages/admin/asistentes/asistentes.page').then((m) => m.AsistentesPage),
      },
      {
        path: 'clases',
        title: 'Clases — LUA Studio',
        loadComponent: () => import('./pages/admin/clases/clases.page').then((m) => m.ClasesPage),
      },
      {
        path: 'crearclase',
        title: 'Nueva clase — LUA Studio',
        loadComponent: () =>
          import('./pages/admin/crearclase/crearclase.page').then((m) => m.CrearclasePage),
      },
      {
        path: 'editarclase/:idClase',
        title: 'Editar clase — LUA Studio',
        loadComponent: () =>
          import('./pages/admin/editarclase/editarclase.page').then((m) => m.EditarclasePage),
      },
      {
        path: 'asuetos',
        title: 'Asuetos — LUA Studio',
        loadComponent: () => import('./pages/admin/asuetos/asuetos.page').then((m) => m.AsuetosPage),
      },
      {
        path: 'nuevoasueto',
        title: 'Nuevo asueto — LUA Studio',
        loadComponent: () =>
          import('./pages/admin/nuevoasueto/nuevoasueto.page').then((m) => m.NuevoasuetoPage),
      },
      {
        path: 'perfil',
        title: 'Usuarios — LUA Studio',
        loadComponent: () => import('./pages/admin/perfil/perfil.page').then((m) => m.PerfilPage),
      },
      {
        path: 'editarperfil/:idUsuario',
        title: 'Editar perfil — LUA Studio',
        loadComponent: () =>
          import('./pages/admin/editarperfil/editarperfil.page').then((m) => m.EditarperfilPage),
      },
      {
        path: 'paquetes/:idUsuario/:sociedad',
        title: 'Paquetes — LUA Studio',
        loadComponent: () =>
          import('./pages/admin/paquetes/paquetes.page').then((m) => m.PaquetesPage),
      },
      {
        path: 'crearpaquete/:idUsuario/:sociedad',
        title: 'Historial de paquetes — LUA Studio',
        loadComponent: () =>
          import('./pages/admin/crearpaquete/crearpaquete.page').then((m) => m.CrearpaquetePage),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
