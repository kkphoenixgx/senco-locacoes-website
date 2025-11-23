import { Request, Response } from 'express';
import MailService from '../../services/MailService';
import ClienteRepository from '../../repository/ClienteRepository';
import VeiculoRepository from '../../repository/VeiculoRepository';
import VendaRepository from '../../repository/VendaRepository';

export default class PurchaseController {
  private clienteRepository = new ClienteRepository();
  private veiculoRepository = new VeiculoRepository();
  private vendaRepository = new VendaRepository();

  constructor() {
    // Garante o 'this' correto no método.
    this.request = this.request.bind(this);
  }

  public async request(req: Request, res: Response): Promise<Response> {
    const { vehicleId } = req.body;
    const clienteId = req.user?.id;

    if (!vehicleId || !clienteId) {
      return res.status(400).json({ message: 'ID do veículo e autenticação do cliente são obrigatórios.' });
    }

    const adminEmail = process.env.ADMIN_MAIL;
    if (!adminEmail) {
      console.error('ADMIN_MAIL não está definido no .env');
      return res.status(500).json({ message: 'Erro de configuração do servidor de e-mail.' });
    }

    try {
      const cliente = await this.clienteRepository.findById(clienteId);
      const veiculo = await this.veiculoRepository.findById(vehicleId);

      if (!cliente || !veiculo) {
        return res.status(404).json({ message: 'Cliente ou veículo não encontrado.' });
      }

      // 1. Criar a Venda
      const vendaData = {
        clienteId: clienteId,
        items: [veiculo],
        precoTotal: veiculo.preco,
        dataVenda: new Date(),
      };
      const novaVenda = await this.vendaRepository.create(vendaData);

      if (!novaVenda) {
        throw new Error('Falha ao registrar a venda no banco de dados.');
      }

      // 2. Enviar e-mail para o administrador
      const emailHtml = `
        <h1>Nova Solicitação de Compra Recebida (Venda #${novaVenda.id})</h1>
        <p>O cliente <strong>${cliente.nome}</strong> demonstrou interesse formal na compra do seguinte veículo:</p>
        <hr>
        <h2>Detalhes do Veículo</h2>
        <p><strong>ID:</strong> ${veiculo.id}</p>
        <p><strong>Título:</strong> ${veiculo.titulo}</p>
        <p><strong>Preço:</strong> ${veiculo.getPrecoFormatado()}</p>
        <hr>
        <h2>Dados do Cliente</h2>
        <p><strong>Nome:</strong> ${cliente.nome}</p>
        <p><strong>Email:</strong> ${cliente.email}</p>
        <p><strong>Telefone:</strong> ${cliente.telefone || 'Não informado'}</p>
        <p><strong>Endereço:</strong> ${cliente.endereco || 'Não informado'}</p>
        <hr>
        <p><em>Por favor, entre em contato com o cliente para prosseguir com a negociação. A venda foi registrada no sistema com o ID ${novaVenda.id}.</em></p>
      `;

      await MailService.sendMail({
        to: adminEmail,
        subject: `Nova Solicitação de Compra - Veículo #${veiculo.id}`,
        html: emailHtml,
      });

      return res.status(201).json(novaVenda);
    } catch (error) {
      console.error('Erro ao processar solicitação de compra:', error);
      return res.status(500).json({ message: 'Não foi possível processar sua solicitação. Tente novamente mais tarde.' });
    }
  }
}