import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-admin-modal',
  standalone: true,
  imports: [],
  templateUrl: './admin-modal.component.html',
  styleUrl: './admin-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminModalComponent {
  readonly close = output<void>();
}