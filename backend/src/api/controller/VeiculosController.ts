import { Request, Response } from 'express';
import VeiculoRepository from '../../repository/VeiculoRepository'; 

export default class VeiculosController {
  private veiculoRepository = new VeiculoRepository();
  
  public async create(req: Request, res: Response): Promise<Response> {
    const veiculoData = req.body;
    const { files } = req;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: 'Pelo menos uma imagem é necessária.' });
    }

    veiculoData.preco = parseFloat(veiculoData.preco);
    veiculoData.categoriaId = parseInt(veiculoData.categoriaId, 10);
    veiculoData.anoFabricacao = parseInt(veiculoData.anoFabricacao, 10);
    veiculoData.anoModelo = parseInt(veiculoData.anoModelo, 10);
    veiculoData.quilometragem = parseInt(veiculoData.quilometragem, 10);

    const nomesDasImagens = files.map(file => file.filename);

    try {
      const novoVeiculo = await this.veiculoRepository.create(veiculoData, nomesDasImagens);
      return res.status(201).json(novoVeiculo);
    } catch (error) {
      if (error instanceof Error) {

        if (error.message.includes('banco de dados')) {
          return res.status(500).json({ message: error.message });
        }

      }

      return res.status(500).json({ message: 'Ocorreu um erro inesperado ao criar o veículo.' });
    }
  }

  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const veiculos = await this.veiculoRepository.findAll();
      return res.json(veiculos);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const veiculo = await this.veiculoRepository.findById(Number(id));
      if (!veiculo) {
        return res.status(404).json({ message: 'Veículo não encontrado.' });
      }
      return res.json(veiculo);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async findMaisVendidos(req: Request, res: Response): Promise<Response> {
    try {
      const veiculos = await this.veiculoRepository.findMaisVendidos();
      return res.json(veiculos);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const veiculoData = req.body;
    const { files } = req;
    const novasImagens = Array.isArray(files) ? files.map(file => file.filename) : undefined;

    try {
      const veiculoAtualizado = await this.veiculoRepository.update(Number(id), veiculoData, novasImagens);
      return res.json(veiculoAtualizado);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const success = await this.veiculoRepository.delete(Number(id));
    if (!success) {
      return res.status(404).json({ message: 'Veículo não encontrado.' });
    }
    return res.status(204).send();
  }
}