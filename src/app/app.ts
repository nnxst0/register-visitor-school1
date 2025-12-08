import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { Main } from './main/main';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from "./register/register";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Main, CommonModule, RegisterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('register-visitor-school');
  isSidebarCollapsed = false;

  onSidebarChange(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
  
  
}
