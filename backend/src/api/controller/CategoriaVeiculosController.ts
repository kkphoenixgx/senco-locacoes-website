import { Request, Response } from 'express';
import CategoriaVeiculosRepository from '../../repository/CategoriaVeiculosRepository';

export default class CategoriaVeiculosController {
  private repository = new CategoriaVeiculosRepository();

  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const categorias = await this.repository.findAll();
      return res.json(categorias);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    const { nome, descricao } = req.body;
    if (!nome) {
      return res.status(400).json({ message: 'O nome da categoria é obrigatório.' });
    }
    try {
      const novaCategoria = await this.repository.create({ nome, descricao });
      return res.status(201).json(novaCategoria);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const categoriaData = req.body;
    try {
      const categoriaAtualizada = await this.repository.update(Number(id), categoriaData);
      if (!categoriaAtualizada) {
        return res.status(404).json({ message: 'Categoria não encontrada.' });
      }
      return res.json(categoriaAtualizada);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const success = await this.repository.delete(Number(id));
      if (!success) {
        return res.status(404).json({ message: 'Categoria não encontrada.' });
      }
      return res.status(204).send();
    } catch (error: any) {
      // Captura o erro específico de categoria em uso
      if (error.message.includes('associada a um ou mais veículos')) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  }
}