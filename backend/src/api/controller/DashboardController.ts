import { Request, Response } from 'express';
import DashboardRepository from '../../repository/DashboardRepository';

export default class DashboardController {
  private repository = new DashboardRepository();

  public async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const stats = await this.repository.getStats();
      return res.json(stats);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}