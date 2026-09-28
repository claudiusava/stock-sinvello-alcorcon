export interface StockProduct {
  id: string;

  nombre: string;
  unidad: string;

  stock: number;
  activo: boolean;

  consumoMensual: number;

  // Foto real subida desde el formulario (Firebase Storage). Si no existe,
  // se usa el icono generico empaquetado en public/icons/{id}.png.
  imagenUrl?: string;
}