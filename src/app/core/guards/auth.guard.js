import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
/** Bloquea rutas autenticadas si no hay sesión. */
export const authGuard = () => {
    const session = inject(SessionService);
    const router = inject(Router);
    session.init();
    return session.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
