import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule ,CommonModule, NgClass],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  SidebarCollapsed = input.required<boolean>();
  changeIsSidebarCollapsed = output<boolean>();
  items = [
    {
      routeLink: 'register',
      icon: 'bi bi-people-fill',
      label: 'ลงทะเบียน',
    },
    {
      routeLink: 'datatable',
      icon: 'bi bi-table',
      label: 'ข้อมูลผู้ติดต่อ',
    },
    {
      routeLink: 'return-card',
      icon: 'bi bi-person-vcard-fill',
      label: 'คืนบัตร',
    },
    {
      routeLink: 'export',
      icon: 'bi bi-cloud-download-fill', 
      label: 'ส่งออกข้อมูล',
    },
  ];

  toggleCollapse(): void {
    this.changeIsSidebarCollapsed.emit(!this.SidebarCollapsed());
  }

  closeSidenav(): void {
    this.changeIsSidebarCollapsed.emit(true);
  }
}
