import { __decorate } from "tslib";
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionService } from '../../core/services/session.service';
import { IconComponent } from '../../shared/icon/icon.component';
/** Layout de pantallas sin sesión (login, registro, recuperar, términos). */
let AuthLayoutComponent = class AuthLayoutComponent {
    session = inject(SessionService);
    rolTexto() {
        if (this.session.isAdmin())
            return 'Administrador';
        if (this.session.isCoach())
            return 'Entrenador';
        return 'Alumno';
    }
};
AuthLayoutComponent = __decorate([
    Component({
        selector: 'app-auth-layout',
        standalone: true,
        imports: [RouterOutlet, IconComponent],
        templateUrl: './auth-layout.component.html',
        styleUrl: './auth-layout.component.scss',
    })
], AuthLayoutComponent);
export { AuthLayoutComponent };
