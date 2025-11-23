import { Router } from 'express';
import admRoutes from './adm.routes'; 
import veiculosRoutes from './veiculos.routes'; 
import clientesRoutes from './clientes.routes'; 
import vendasRoutes from './vendas.routes'; 
import categoriasRoutes from './categorias.routes';
import dashboardRoutes from './dashboard.routes';
import authRoutes from './auth.route';

import contactRoutes from './contact.routes';
import purchaseRoutes from './purchase.routes';

const apiRoutes = Router();

apiRoutes.use(admRoutes);
apiRoutes.use(authRoutes);
apiRoutes.use(veiculosRoutes);
apiRoutes.use(clientesRoutes);
apiRoutes.use(vendasRoutes);
apiRoutes.use(categoriasRoutes);
apiRoutes.use(dashboardRoutes);
apiRoutes.use(contactRoutes);
apiRoutes.use(purchaseRoutes);

export default apiRoutes;