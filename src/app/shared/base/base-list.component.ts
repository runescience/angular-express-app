// shared/base/base-list.component.ts
import { Directive } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Directive()
export abstract class BaseListComponent {
    isModalOpen = false;
    isEditing = false;
    loading = false;
    error: string | null = null;

    abstract form: FormGroup;

    openModal(): void {
        this.isModalOpen = true;
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.resetForm();
    }

    abstract resetForm(): void;
    abstract loadData(): void;
    abstract handleSubmit(): void;
}
