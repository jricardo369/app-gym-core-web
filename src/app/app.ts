import { Component } from '@angular/core';
import { ThemeService } from './core/theme/theme.service';
import { RouterOutlet } from '@angular/router';
import { IconSpriteComponent } from './shared/icon/icon-sprite.component';
import { OverlayComponent } from './shared/overlay/overlay.component';

@Component({
  imports: [RouterOutlet, IconSpriteComponent, OverlayComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  constructor(themeService: ThemeService) {}
}