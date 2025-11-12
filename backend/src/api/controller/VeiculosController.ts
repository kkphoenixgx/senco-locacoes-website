import { Request, Response } from 'express';
import VeiculoRepository from '../../repository/VeiculoRepository'; 

export default class VeiculosController {

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
    const veiculosRepository = new VeiculoRepository();

    try {
      const novoVeiculo = await veiculosRepository.create(veiculoData, nomesDasImagens);
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
}