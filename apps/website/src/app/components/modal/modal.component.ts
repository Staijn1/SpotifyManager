import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @ViewChild('dialogElement') dialogElement!: HTMLDialogElement;

  open() {
    this.dialogElement.showModal();
  }

  close() {
    this.dialogElement.close();
  }
}
