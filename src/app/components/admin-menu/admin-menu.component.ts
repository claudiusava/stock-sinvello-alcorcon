import {
  ChangeDetectionStrategy,
  Component,
  output,
} from '@angular/core';

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [],
  templateUrl: './admin-menu.component.html',
  styleUrl: './admin-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMenuComponent {

  readonly createProduct = output<void>();

  readonly manageProducts = output<void>();

  readonly close = output<void>();

}