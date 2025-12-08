import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule ,CommonModule, NgClass],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
   isSidebarCollapsed = input.required<boolean>();
  changeIsSidebarCollapsed = output<boolean>();
  items = [
    {
      routeLink: 'dashboard',
      icon: 'fal fa-home',
      label: 'ลงทะเบียน',
    },
    {
      routeLink: 'products',
      icon: 'fal fa-box-open',
      label: 'ข้อมูลผู้ติดต่อ',
    },
    {
      routeLink: 'pages',
      icon: 'fal fa-file',
      label: 'คืนบัตร',
    },
    {
      routeLink: 'settings',
      icon: 'fal fa-cog', 
      label: 'ส่งออกข้อมูล',
    },
  ];

  toggleCollapse(): void {
    this.changeIsSidebarCollapsed.emit(!this.isSidebarCollapsed());
  }

  closeSidenav(): void {
    this.changeIsSidebarCollapsed.emit(true);
  }
}
