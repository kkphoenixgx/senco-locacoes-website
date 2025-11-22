import { Request, Response } from 'express';
import DashboardRepository from '../../repository/DashboardRepository';

export default class DashboardController {
  private repository = new DashboardRepository();

  constructor() {
    // Garante que o 'this' dentro de getStats seja a instância da classe DashboardController
    this.getStats = this.getStats.bind(this);
  }

  public async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const stats = await this.repository.getStats();
      return res.json(stats);
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor.';
      return res.status(500).json({ message: errorMessage });
    }
  }
}