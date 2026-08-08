import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';

interface MovimientoReporte {
  tipo: 'Ingreso' | 'Gasto';
  monto: number;
  categoria: string;
  descripcion?: string;
  fecha: string;
}

export const generarReportePDF = async (
  movimientos: MovimientoReporte[],
  totalIngresos: number,
  totalGastos: number,
  nombreUsuario: string = 'Usuario'
) => {
  try {
    const balanceNeto = totalIngresos - totalGastos;
    const fechaActual = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const filasHtml = movimientos
      .map(
        (m) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
            ${new Date(m.fecha).toLocaleDateString('es-MX')}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: ${
            m.tipo === 'Ingreso' ? '#10b981' : '#f43f5e'
          };">
            ${m.tipo}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
            ${m.categoria}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
            ${m.descripcion || '-'}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; text-align: right; color: ${
            m.tipo === 'Ingreso' ? '#10b981' : '#f43f5e'
          };">
            ${m.tipo === 'Gasto' ? '-' : '+'}$${m.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 15px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
            .summary-box { display: flex; justify-content: space-between; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 25px; }
            .summary-item { text-align: center; flex: 1; }
            .summary-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
            .summary-value { font-size: 18px; font-weight: bold; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #0f172a; color: #ffffff; padding: 10px; font-size: 12px; text-align: left; text-transform: uppercase; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">Reporte Financiero</h1>
              <div class="subtitle">Generado para: ${nombreUsuario} • Fecha: ${fechaActual}</div>
            </div>
          </div>

          <div class="summary-box">
            <div class="summary-item">
              <div class="summary-label">Total Ingresos</div>
              <div class="summary-value" style="color: #10b981;">+$${totalIngresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-item" style="border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
              <div class="summary-label">Total Gastos</div>
              <div class="summary-value" style="color: #f43f5e;">-$${totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Balance Neto</div>
              <div class="summary-value" style="color: ${balanceNeto >= 0 ? '#10b981' : '#f43f5e'};">$${balanceNeto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Concepto / Detalle</th>
                <th style="text-align: right;">Monto</th>
              </tr>
            </thead>
            <tbody>
              ${filasHtml}
            </tbody>
          </table>

          <div class="footer">
            Gestión de Finanzas Personales — Reporte Oficial de Movimientos
          </div>
        </body>
      </html>
    `;

    if (Platform.OS === 'web') {
      await Print.printAsync({ html: htmlContent });
    } else {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
  } catch (error) {
    console.error('Error al generar PDF:', error);
    const msg = 'No se pudo exportar el reporte a PDF';
    Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
  }
};