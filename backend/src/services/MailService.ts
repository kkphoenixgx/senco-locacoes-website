import nodemailer from 'nodemailer';

interface IMailOptions {
  to: string;
  subject: string;
  html: string;
}

class MailService {
  private transporter;

  constructor() {
    // Configura o "transportador" de e-mail com as credenciais do .env
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465, // true para porta 465, false para outras
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  /**
   * Envia um e-mail.
   * @param options As opções do e-mail (destinatário, assunto, corpo HTML).
   */
  async sendMail({ to, subject, html }: IMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw new Error('Falha no serviço de envio de e-mail.');
    }
  }
}

export default new MailService();