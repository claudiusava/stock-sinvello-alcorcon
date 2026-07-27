export interface StockProduct {
  id: string;

  nombre: string;
  unidad: string;

  stock: number;
  activo: boolean;

  consumoMensual: number;
}