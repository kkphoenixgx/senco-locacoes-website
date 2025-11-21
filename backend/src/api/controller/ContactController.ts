import { Request, Response } from 'express';
import MailService from '../../services/MailService';

export default class ContactController {
  public async send(req: Request, res: Response): Promise<Response> {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const adminEmail = process.env.ADMIN_MAIL;
    if (!adminEmail) {
      console.error('ADMIN_MAIL não está definido no .env');
      return res.status(500).json({ message: 'Erro de configuração do servidor.' });
    }

    const emailHtml = `
      <h1>Nova Mensagem de Contato</h1>
      <p>Você recebeu uma nova mensagem através do site Senco Engenharia.</p>
      <hr>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Telefone:</strong> ${phone || 'Não informado'}</p>
      <hr>
      <h2>${subject}</h2>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    try {
      await MailService.sendMail({
        to: adminEmail,
        subject: `Novo Contato: ${subject}`,
        html: emailHtml,
      });
      return res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
      return res.status(500).json({ message: 'Não foi possível enviar a mensagem. Tente novamente mais tarde.' });
    }
  }
}