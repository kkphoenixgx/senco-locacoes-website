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
    const [vendasResult] = await this.pool.execute<RowDataPacket[]>("SELECT COUNT(*) as total FROM vendas");
    const [faturamentoResult] = await this.pool.execute<RowDataPacket[]>("SELECT COALESCE(SUM(preco_total), 0) as faturamento FROM vendas WHERE efetivada = TRUE");

    const totalVeiculos = veiculosResult?.[0]?.total ?? 0;
    const totalClientes = clientesResult?.[0]?.total ?? 0;
    const totalVendas = vendasResult?.[0]?.total ?? 0;
    const faturamentoTotal = faturamentoResult?.[0]?.faturamento ?? 0;

    return {
      totalVeiculos,
      totalClientes,
      totalVendas,
      faturamentoTotal: +faturamentoTotal
    };
  }
}