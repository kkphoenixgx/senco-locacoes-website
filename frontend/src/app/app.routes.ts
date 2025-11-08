import { Routes } from '@angular/router';

// Importação dos seus componentes de página
import { HomeVendaDeVeiculos } from './pages/home-venda-de-veiculos/home-venda-de-veiculos';
import { Locacao } from './pages/locacao/locacao';
import { ExploreVeiculos } from './pages/explore-veiculos/explore-veiculos';
import { About } from './pages/about/about';
import { ContactUs } from './pages/contact-us/contact-us';
import { AdmLogin } from './pages/adm-login/adm-login';
import { Adm } from './pages/adm/adm';

// Importação do guarda de autenticação
import { authGuard } from './shared/auth.guard';
import { AdmDashboardVeiculos } from './pages/adm/partials/adm-dashboard-veiculos/adm-dashboard-veiculos';
import { AdmDashboardVendas } from './pages/adm/partials/adm-dashboard-vendas/adm-dashboard-vendas';
import { AdmDashboardFerramentas } from './pages/adm/partials/adm-dashboard-ferramentas/adm-dashboard-ferramentas';

export const routes: Routes = [
  // --- Rotas Públicas ---
  // A rota raiz (/) será a página de venda de veículos.
  { path: '', component: HomeVendaDeVeiculos },
  { path: 'locacao', component: Locacao },
  { path: 'veiculos', component: ExploreVeiculos },
  { path: 'sobre', component: About },
  { path: 'contato', component: ContactUs },

  // --- Rotas Administrativas ---
  { path: 'adm/login', component: AdmLogin },
  {
    path: 'adm',
    component: Adm,
    canActivate: [], //authGuard
    children: [
      { path: '', redirectTo: 'vendas', pathMatch: 'full' },
      { path: 'vendas', component: AdmDashboardVendas },
      { path: 'veiculos', component: AdmDashboardVeiculos },
    ],
  },
];