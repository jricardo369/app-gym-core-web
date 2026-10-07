import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let ThemeService = class ThemeService {
    themes = ['default', 'iroda', 'lua'];
    currentTheme = 'default';
    constructor() {
        // Restore saved preference from localStorage
        const saved = localStorage.getItem('appTheme');
        this.currentTheme = saved ?? 'default';
        document.documentElement.className = `theme-${this.currentTheme}`;
    }
    setTheme(name) {
        if (!this.themes.includes(name)) {
            console.warn(`Invalid theme name: ${name}. Available: ${this.themes.join(', ')}`);
            return;
        }
        this.currentTheme = name;
        document.documentElement.className = `theme-${name}`;
        localStorage.setItem('appTheme', name);
    }
    toggleTheme() {
        const order = ['default', 'iroda', 'lua'];
        const currentIndex = order.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % order.length;
        this.setTheme(order[nextIndex]);
    }
};
ThemeService = __decorate([
    Injectable({ providedIn: 'root' })
], ThemeService);
export { ThemeService };
