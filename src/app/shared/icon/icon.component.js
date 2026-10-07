import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
/** Ícono vectorial (sprite inline). Ej: <app-icon name="home" [size]="20" /> */
let IconComponent = class IconComponent {
    name = '';
    size = 20;
    stroke = 2;
    filled = false;
};
__decorate([
    Input({ required: true })
], IconComponent.prototype, "name", void 0);
__decorate([
    Input()
], IconComponent.prototype, "size", void 0);
__decorate([
    Input()
], IconComponent.prototype, "stroke", void 0);
__decorate([
    Input()
], IconComponent.prototype, "filled", void 0);
IconComponent = __decorate([
    Component({
        selector: 'app-icon',
        standalone: true,
        template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      [attr.fill]="filled ? 'currentColor' : 'none'"
      stroke="currentColor"
      [attr.stroke-width]="stroke"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <use [attr.href]="'#i-' + name" />
    </svg>
  `,
        styles: [
            `
      :host {
        display: inline-flex;
        flex-shrink: 0;
      }
      svg {
        display: block;
      }
    `,
        ],
    })
], IconComponent);
export { IconComponent };
