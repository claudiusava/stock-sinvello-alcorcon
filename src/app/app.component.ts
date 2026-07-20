import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OrderService } from './services/order.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly orderService = inject(OrderService);

  ngOnInit() {
    this.orderService.generateOrder().subscribe(async (order) => {
      console.log(order);

      await this.orderService.createOrder(order);

      console.log('Pedido guardado');
    });
  }
}
