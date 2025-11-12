import { Router } from 'express';
import admRoutes from './adm.routes'; 
import veiculosRoutes from './veiculos.routes'; 
import clientesRoutes from './clientes.routes'; 
import vendasRoutes from './vendas.routes'; 

const apiRoutes = Router();

apiRoutes.use(admRoutes);
apiRoutes.use(veiculosRoutes);
apiRoutes.use(clientesRoutes);
apiRoutes.use(vendasRoutes);

export default apiRoutes;