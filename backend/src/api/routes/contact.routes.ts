import { Router } from 'express';
import ContactController from '../controller/ContactController';

const contactRoutes = Router();
const controller = new ContactController();

// Rota pública para envio de formulário de contato
contactRoutes.post('/contact', controller.send);

export default contactRoutes;