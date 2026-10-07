import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themes = ['default', 'iroda', 'lua'];

  currentTheme: 'default' | 'iroda' | 'lua' = 'default';

  constructor() {
    // Restore saved preference from localStorage
    const saved = localStorage.getItem('appTheme') as 'default' | 'iroda' | 'lua' | null;
    this.currentTheme = saved ?? 'default';
    document.documentElement.className = `theme-${this.currentTheme}`;
  }

  setTheme(name: 'default' | 'iroda' | 'lua'): void {
    if (!this.themes.includes(name)) {
      console.warn(`Invalid theme name: ${name}. Available: ${this.themes.join(', ')}`);
      return;
    }
    this.currentTheme = name;
    document.documentElement.className = `theme-${name}`;
    localStorage.setItem('appTheme', name);
  }

  toggleTheme(): void {
    const order: ('default' | 'iroda' | 'lua')[] = ['default', 'iroda', 'lua'];
    const currentIndex = order.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % order.length;
    this.setTheme(order[nextIndex]);
  }
}