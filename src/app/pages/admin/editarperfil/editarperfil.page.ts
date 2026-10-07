import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';
import { Respuesta, Usuario } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { SessionService } from '../../../core/services/session.service';
import { UiService } from '../../../core/services/ui.service';
import { IconComponent } from '../../../shared/icon/icon.component';

/** Campos extra que devuelve `Usuarios/...` y no están en el modelo base */
export interface UsuarioDetalle extends Usuario {
  membresia?: string;
  vencimiento?: string;
  tipoPaquete?: string;
  clasesRestantes?: string | number;
}

/** Payload de edición: idéntico al de la app móvil */
interface PayloadEditar extends Partial<Usuario> {
  clasesRestantes: string;
}

@Component({
  selector: 'app-editarperfil',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './editarperfil.page.html',
  styleUrl: './editarperfil.page.scss',
})
export class EditarperfilPage implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private ui = inject(UiService);
  readonly session = inject(SessionService);

  readonly cargando = signal(true);
  readonly error = signal('');
  readonly usuario = signal<UsuarioDetalle | null>(null);
  readonly totalMultas = signal(0);
  readonly contadorFaltas = signal(0);
  readonly mostrarClasesRestantes = signal(false);

  private sociedadParam = '';

  readonly roles = [
    { valor: '1', texto: 'Administrador' },
    { valor: '2', texto: 'Usuario' },
    { valor: '3', texto: 'Entrenador' },
  ];

  readonly estatusOpciones = [
    { valor: '1', texto: 'Activo' },
    { valor: '0', texto: 'Inactivo' },
    { valor: '3', texto: 'Falta de pago' },
  ];

  readonly form = this.fb.nonNullable.group({
    idRol: ['', Validators.required],
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    usuario: ['', [Validators.required, Validators.maxLength(60)]],
    contrasenia: [''],
    correoElectronico: ['', [Validators.required, Validators.email]],
    sexo: ['F', Validators.required],
    telefono: [''],
    estatus: ['', Validators.required],
    clasesRestantes: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('idUsuario');
    const usuarioQ = this.route.snapshot.queryParamMap.get('usuario') ?? '';
    this.sociedadParam = this.route.snapshot.queryParamMap.get('sociedad') ?? '';

    if (usuarioQ) {
      this.cargarPorNombre(usuarioQ, id);
    } else if (id) {
      this.cargarPorId(id);
    } else {
      this.cargando.set(false);
      this.error.set('No se recibió el usuario a editar.');
    }
  }

  private cargarPorNombre(usuario: string, idParam: string | null): void {
    this.api.getUsuarioPorNombre(usuario).subscribe({
      next: (res) => {
        if (res.codigo !== 200 && idParam) this.cargarPorId(idParam);
        else this.aplicar(res, idParam);
      },
      error: () => {
        if (idParam) this.cargarPorId(idParam);
        else this.fallo();
      },
    });
  }

  private cargarPorId(id: string): void {
    this.api.getUsuario(id).subscribe({
      next: (res) => this.aplicar(res, null),
      error: () => this.fallo(),
    });
  }

  private aplicar(res: Respuesta<Usuario>, idParam: string | null): void {
    const crudo = res.respuesta as unknown;
    const fila = (Array.isArray(crudo) ? crudo[0] : crudo) as UsuarioDetalle | null;
    if (!fila || res.codigo !== 200) {
      this.fallo(res.descripcion || 'No se encontró el usuario.');
      return;
    }

    if (idParam && !fila.idUsuario) fila.idUsuario = Number(idParam);
    this.usuario.set(fila);
    this.totalMultas.set(Number(fila.totalMultas ?? 0));
    this.contadorFaltas.set(Number(fila.contadorFaltas ?? 0));
    this.mostrarClasesRestantes.set(
      Number(fila.idRol) === 2 && fila.tipoPaquete !== 'Mensual'
    );
    if (!this.sociedadParam) this.sociedadParam = fila.sociedad ?? '';

    this.form.patchValue({
      idRol: String(fila.idRol ?? ''),
      nombre: fila.nombre ?? '',
      usuario: fila.usuario ?? '',
      contrasenia: fila.contrasenia ?? '',
      correoElectronico: fila.correoElectronico ?? '',
      sexo: fila.sexo === 'M' ? 'M' : 'F',
      telefono: fila.telefono ?? '',
      estatus: String(fila.estatus ?? ''),
      clasesRestantes: String(fila.clasesRestantes ?? ''),
    });
    this.form.markAsPristine();
    this.cargando.set(false);
    this.error.set('');
  }

  private fallo(msg = 'No se pudo cargar el usuario.'): void {
    this.cargando.set(false);
    this.error.set(msg);
  }

  // ─── Guardar ─────────────────────────────────────────────
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.ui.toast('Todos los campos son necesarios', 'warning');
      return;
    }

    const u = this.usuario();
    if (!u) return;
    const v = this.form.getRawValue();

    const obj: PayloadEditar = {
      idUsuario: u.idUsuario,
      idRol: Number(v.idRol),
      usuario: v.usuario,
      contrasenia: v.contrasenia.trim() ? v.contrasenia : (u.contrasenia ?? ''),
      nombre: v.nombre,
      sexo: v.sexo,
      correoElectronico: v.correoElectronico,
      peso: Number(u.peso ?? 0),
      altura: Number(u.altura ?? 0),
      imc: u.imc ?? '--',
      telefono: v.telefono,
      nivel: u.nivel ?? '10',
      estatus: Number(v.estatus),
      intentos: Number(u.intentos ?? 0),
      clasesRestantes: v.clasesRestantes,
    };

    this.ui.mostrarCarga('Guardando…');
    try {
      const res = await firstValueFrom(this.api.editarUsuario(obj));
      this.ui.ocultarCarga();
      const msg = this.mensajeDe(res);
      await this.ui.confirmar({
        titulo: res.codigo === 200 ? 'Perfil actualizado' : 'No se pudo guardar',
        mensaje: msg,
        soloAceptar: true,
        confirmarTexto: 'OK',
      });
      if (res.codigo === 200) this.router.navigate(['/perfil']);
    } catch {
      this.ui.ocultarCarga();
      this.ui.toast('No se pudo conectar con el servidor.', 'error');
    }
  }

  // ─── Acciones de estatus ─────────────────────────────────
  activarUser(): void {
    this.accionEstatus('Activar usuario', '¿Desea activar este perfil?', 'Activar', (id) =>
      this.api.activarUser(id)
    );
  }

  desactivarUser(): void {
    this.accionEstatus(
      'Desactivar usuario',
      '¿Desea desactivar este perfil?',
      'Desactivar',
      (id) => this.api.desactivarUser(id)
    );
  }

  faltaDePago(): void {
    this.accionEstatus(
      'Falta de pago',
      '¿Marcar falta de pago a este perfil? Quedará bloqueado.',
      'Marcar',
      (id) => this.api.faltaDePago(id)
    );
  }

  private accionEstatus(
    titulo: string,
    mensaje: string,
    confirmarTexto: string,
    llamada: (id: number) => Observable<Respuesta>
  ): void {
    const id = this.idUsuario();
    if (!id) return;
    this.ui.confirmar({ titulo, mensaje, confirmarTexto }).then((ok) => {
      if (!ok) return;
      llamada(id).subscribe({
        next: (res) => {
          this.ui.toast(this.mensajeDe(res), res.codigo === 200 ? 'success' : 'error');
          if (res.codigo === 200) this.cargarPorId(String(id));
        },
        error: () => this.ui.toast('No se pudo actualizar el usuario.', 'error'),
      });
    });
  }

  // ─── Faltas / multas ─────────────────────────────────────
  async eliminarFaltas(): Promise<void> {
    const u = this.usuario();
    const id = this.idUsuario();
    if (!u || !id) return;

    const ok = await this.ui.confirmar({
      titulo: 'Eliminar faltas',
      mensaje: `¿Seguro que desea eliminar las multas de ${u.nombre}?`,
      confirmarTexto: 'Eliminar',
    });
    if (!ok) return;

    const idModificante = this.session.idUsuario() ?? id;
    this.api.eliminarFaltas(id, idModificante).subscribe({
      next: (res) => {
        if (res.codigo === 500) {
          this.ui.toast(this.mensajeDe(res), 'warning');
        } else {
          this.totalMultas.set(Number((res.respuesta as Usuario | undefined)?.totalMultas ?? 0));
          this.ui.toast('Multas eliminadas', 'success');
        }
        this.cargarPorId(String(id));
      },
      error: () => this.ui.toast('No se pudieron eliminar las faltas.', 'error'),
    });
  }

  ajustarFalta(tipo: 'I' | 'E'): void {
    const id = this.idUsuario();
    if (!id) return;

    if (tipo === 'E') {
      const faltas = Number(this.contadorFaltas() ?? 0);
      const multas = Number(this.totalMultas() ?? 0);
      const disponibles = faltas > 0 ? faltas : multas;
      if (disponibles <= 0) {
        this.ui.toast('No puede quitar falta ya que no cuenta con una', 'warning');
        return;
      }
    }

    const idModificante = this.session.idUsuario() ?? id;
    this.api.ajustarFalta(id, idModificante, tipo).subscribe({
      next: (res) => {
        if (res.codigo === 500) {
          this.ui.toast(this.mensajeDe(res), 'warning');
        } else {
          const nueva = (res.respuesta as Usuario | undefined)?.contadorFaltas;
          if (nueva != null) this.contadorFaltas.set(Number(nueva));
          this.ui.toast(this.mensajeDe(res), 'success');
        }
        this.cargarPorId(String(id));
      },
      error: () => this.ui.toast('No se pudo ajustar la falta.', 'error'),
    });
  }

  // ─── Navegación ──────────────────────────────────────────
  verPaquetes(): void {
    const id = this.idUsuario();
    const sociedad = this.sociedad();
    if (!id) return;
    const q: Record<string, string> = {};
    const rol = this.usuario()?.idRol;
    if (rol != null) q['idRol'] = String(rol);
    this.router.navigate(['/crearpaquete', id, sociedad], { queryParams: q });
  }

  volver(): void {
    this.router.navigate(['/perfil']);
  }

  // ─── Helpers ─────────────────────────────────────────────
  idUsuario(): number | null {
    const id = this.usuario()?.idUsuario;
    if (id != null) return id;
    const param = Number(this.route.snapshot.paramMap.get('idUsuario'));
    return Number.isFinite(param) && param > 0 ? param : null;
  }

  sociedad(): string {
    return this.sociedadParam || this.usuario()?.sociedad || this.session.sociedad() || '';
  }

  esAlumno(): boolean {
    return Number(this.usuario()?.idRol) === 2;
  }

  invalido(control: 'nombre' | 'usuario' | 'correoElectronico' | 'idRol' | 'estatus'): boolean {
    const c = this.form.controls[control];
    return c.touched && c.invalid;
  }

  private mensajeDe(res: Respuesta): string {
    const r = res.respuesta as unknown;
    if (typeof r === 'string' && r.trim()) return r;
    if (typeof res.descripcion === 'string' && res.descripcion.trim()) return res.descripcion;
    if (typeof res.mensaje === 'string' && res.mensaje.trim()) return res.mensaje;
    return 'Operación completada.';
  }
}
