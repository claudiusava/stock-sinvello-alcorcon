export interface StockProduct {
  id: string;
  nombre: string;
  emoji: string;
  unidad: string;
  stock: number;
  activo: boolean;
  consumoMensual: number;
  unidadesPorLote: number;
  tipoLote: string;
}
