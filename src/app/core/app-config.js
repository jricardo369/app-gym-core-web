// Configuración global de la app (port de app.config.ts de la app móvil)
const pro = true;
const qas = false;
const urlPro = 'http://3.18.216.78:8080/clock-in-api/';
const urlQas = 'http://ec2-54-176-17-249.us-west-1.compute.amazonaws.com:8080/control_asistencias_api/';
const urlLocal = 'http://localhost:8080/clock-in-api/';
export const API_URL = pro ? urlPro : qas ? urlQas : urlLocal;
export const VERSION_PORTAL = 'Versión 2026.10.07-web';
export const EMPRESA_PORTAL = '© / 2026';
const compania = 'general';
export const COMPANIA = compania;
const assets = {
    general: {
        logo: 'logoGeneral.png',
        logoBlanco: 'logoGeneral.png',
        fondo: 'LUAstudioPhoto.png',
    },
    lua: {
        logo: 'luaLogo.png',
        logoBlanco: 'luaLogoWhite.png',
        fondo: 'LUAstudioPhoto.png',
    },
    iroda: {
        logo: 'iiroda.png',
        logoBlanco: 'iiroda.png',
        fondo: 'fondoLoginiRoda.jpeg',
    },
};
export const LOGO = assets[compania].logo;
export const LOGO_BLANCO = assets[compania].logoBlanco;
export const FONDO = assets[compania].fondo;
