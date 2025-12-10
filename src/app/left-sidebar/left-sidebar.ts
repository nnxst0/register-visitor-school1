import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './left-sidebar.html',
  styleUrl: './left-sidebar.css',
})
export class LeftSidebarComponent {
  isLeftSidebarCollapsed = input.required<boolean>();
  changeIsLeftSidebarCollapsed = output<boolean>();
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
    this.changeIsLeftSidebarCollapsed.emit(!this.isLeftSidebarCollapsed());
  }

  closeSidenav(): void {
    this.changeIsLeftSidebarCollapsed.emit(true);
  }
}
