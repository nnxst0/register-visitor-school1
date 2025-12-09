import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { Main } from './main/main';
import { CommonModule } from '@angular/common';
import { HostListener } from '@angular/core';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Main, CommonModule,  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('register-visitor-school');
  isSidebarCollapsed = false;

  onSidebarChange(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
  SidebarCollapsed = signal<boolean>(false);
  screenWidth = signal<number>(window.innerWidth);

  @HostListener('window:resize')
  onResize() {
    this.screenWidth.set(window.innerWidth);
    if (this.screenWidth() < 768) {
      this.SidebarCollapsed.set(true);
    }
  }

  ngOnInit(): void {
    this.SidebarCollapsed.set(this.screenWidth() < 768);
  }

  changeSidebarCollapsed(SidebarCollapsed: boolean): void {
    this.SidebarCollapsed.set(SidebarCollapsed);
  }
  
}
