import {OrderItem} from "./models/order-item.model";

export class OrderFormatter {
  format(order: OrderItem[]): string {
    if (order.length === 0) {
      return "✅ No es necesario realizar ningún pedido este mes.";
    }

    const lines: string[] = [];

    lines.push("📦 PEDIDO MENSUAL - SINVELLO ALCORCÓN");
    lines.push("");

    for (const item of order) {
      lines.push(
        `• ${item.productName}: ${item.quantity} ${item.unit}`,
      );
    }

    return lines.join("\n");
  }
}