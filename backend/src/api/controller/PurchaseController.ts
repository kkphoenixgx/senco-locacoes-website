import { Request, Response } from 'express';
import MailService from '../../services/MailService';
import ClienteRepository from '../../repository/ClienteRepository';
import VeiculoRepository from '../../repository/VeiculoRepository';

export default class PurchaseController {
  private clienteRepository = new ClienteRepository();
  private veiculoRepository = new VeiculoRepository();

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
      return res.status(500).json({ message: 'Erro de configuração do servidor.' });
    }

    try {
      const cliente = await this.clienteRepository.findById(clienteId);
      const veiculo = await this.veiculoRepository.findById(vehicleId);

      if (!cliente || !veiculo) {
        return res.status(404).json({ message: 'Cliente ou veículo não encontrado.' });
      }

      const emailHtml = `
        <h1>Nova Solicitação de Compra</h1>
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
        <p><em>Por favor, entre em contato com o cliente para prosseguir com a negociação.</em></p>
      `;

      await MailService.sendMail({
        to: adminEmail,
        subject: `Solicitação de Compra - Veículo #${veiculo.id} (${veiculo.titulo})`,
        html: emailHtml,
      });

      return res.status(200).json({ message: 'Sua solicitação de compra foi enviada com sucesso! Entraremos em contato em breve.' });
    } catch (error) {
      console.error('Erro ao processar solicitação de compra:', error);
      return res.status(500).json({ message: 'Não foi possível processar sua solicitação. Tente novamente mais tarde.' });
    }
  }
}