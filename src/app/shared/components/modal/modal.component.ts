// shared/components/modal/modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-modal',
    template: `
    <div class="modal" [class.show]="isOpen">
      <div class="modal-overlay" (click)="close.emit()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{title}}</h2>
          <button class="close-btn" (click)="close.emit()">&times;</button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
    styleUrls: ['./modal.component.css']
})
export class ModalComponent {
    @Input() isOpen = false;
    @Input() title = '';
    @Output() close = new EventEmitter<void>();
}
