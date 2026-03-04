export enum PaymentStatus {
  PENDING = 'PENDING',           // Esperando confirmación de pago
  PROCESSED = 'PROCESSED',       // Pago confirmado y procesado
  REJECTED = 'REJECTED',         // Pago rechazado
  ERROR = 'ERROR',               // Error durante el procesamiento
  CANCELLED = 'CANCELLED',       // Pago cancelado
  REFUNDED = 'REFUNDED',         // Pago reembolsado
}
