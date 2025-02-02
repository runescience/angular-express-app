// shared/components/list-container/list-container.component.ts
import { Component, Input, ContentChild, TemplateRef } from '@angular/core';

@Component({
    selector: 'app-list-container',
    template: `
    <div class="container">
      <div class="header">
        <h2>{{title}}</h2>
        <button (click)="onAdd()">Add New</button>
      </div>
      
      <div class="list">
        <ng-container *ngTemplateOutlet="listTemplate"></ng-container>
      </div>

      <app-modal [isOpen]="isModalOpen" [title]="modalTitle" (close)="closeModal()">
        <ng-container *ngTemplateOutlet="formTemplate"></ng-container>
      </app-modal>
    </div>
  `
})
export class ListContainerComponent {
    @Input() title = '';
    @Input() modalTitle = '';
    @ContentChild('listTemplate') listTemplate!: TemplateRef<any>;
    @ContentChild('formTemplate') formTemplate!: TemplateRef<any>;

    isModalOpen = false;

    onAdd() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }
}
