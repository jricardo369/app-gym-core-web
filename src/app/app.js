import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconSpriteComponent } from './shared/icon/icon-sprite.component';
import { OverlayComponent } from './shared/overlay/overlay.component';
let App = class App {
    constructor(themeService) { }
};
App = __decorate([
    Component({
        imports: [RouterOutlet, IconSpriteComponent, OverlayComponent],
        selector: 'app-root',
        styleUrl: './app.scss',
        templateUrl: './app.html',
    })
], App);
export { App };
