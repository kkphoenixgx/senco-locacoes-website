import { Request, Response } from 'express';
import VendaRepository from '../../repository/VendaRepository';

export default class VendasController {
  private vendaRepository: VendaRepository;

  constructor() {
    this.vendaRepository = new VendaRepository();
    this.create = this.create.bind(this);
    this.findAll = this.findAll.bind(this);
    this.findById = this.findById.bind(this);
    this.delete = this.delete.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  public async create(req: Request, res: Response): Promise<Response> {
    const vendaData = req.body;
    
    try {
      // Este método agora é mais simples, ideal para uso administrativo interno.
      // A lógica principal de compra do cliente passa pelo PurchaseController.
      vendaData.clienteId = req.user?.id;
      const novaVenda = await this.vendaRepository.create(vendaData);
      return res.status(201).json(novaVenda);
    } 
    catch (error: any) {
      return res.status(500).json({ message: error.message || 'Erro ao criar venda.' });
    }
  
  }

  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const vendas = await this.vendaRepository.findAll();
      return res.json(vendas);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const venda = await this.vendaRepository.findById(Number(id));
      if (!venda) {
        return res.status(404).json({ message: 'Venda não encontrada.' });
      }
      return res.json(venda);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const success = await this.vendaRepository.delete(Number(id));
    if (!success) {
      return res.status(404).json({ message: 'Venda não encontrada.' });
    }
    return res.status(204).send();
  }

  public async updateStatus(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { efetivada } = req.body;

    if (typeof efetivada !== 'boolean') {
      return res.status(400).json({ message: "O campo 'efetivada' deve ser um valor booleano." });
    }

    const vendaAtualizada = await this.vendaRepository.updateStatus(Number(id), efetivada);
    if (!vendaAtualizada) return res.status(404).json({ message: 'Venda não encontrada.' });

    return res.json(vendaAtualizada);
  }
}
