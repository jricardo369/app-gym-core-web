import { Component, Input } from '@angular/core';

/** Ícono vectorial (sprite inline). Ej: <app-icon name="home" [size]="20" /> */
@Component({
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
export class IconComponent {
  @Input({ required: true }) name = '';
  @Input() size = 20;
  @Input() stroke = 2;
  @Input() filled = false;
}
