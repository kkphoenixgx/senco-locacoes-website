import { RowDataPacket } from "mysql2";
import ConnectionFactory from "../database/ConnectionFactory";

export interface IDashboardStats {
  totalVeiculos: number;
  totalClientes: number;
  totalVendas: number;
  faturamentoTotal: number;
}

export default class DashboardRepository {
  private pool = ConnectionFactory.getPool();

  public async getStats(): Promise<IDashboardStats> {
    const [veiculosResult] = await this.pool.execute<RowDataPacket[]>("SELECT COUNT(*) as total FROM veiculos");
    const [clientesResult] = await this.pool.execute<RowDataPacket[]>("SELECT COUNT(*) as total FROM clientes");
    const [vendasResult] = await this.pool.execute<RowDataPacket[]>("SELECT COUNT(*) as total, SUM(preco_total) as faturamento FROM vendas");

    const totalVeiculos = veiculosResult[0]?.total || 0;
    const totalClientes = clientesResult[0]?.total || 0;
    const totalVendas = vendasResult[0]?.total || 0;
    const faturamentoTotal = vendasResult[0]?.faturamento || 0;

    return {
      totalVeiculos,
      totalClientes,
      totalVendas,
      faturamentoTotal: Number(faturamentoTotal)
    };
  }
}