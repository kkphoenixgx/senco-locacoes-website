import { Routes } from '@angular/router';

// Importação dos seus componentes de página
import { LoginComponent } from './pages/login/login';
import { HomeVendaDeVeiculos } from './pages/home-venda-de-veiculos/home-venda-de-veiculos';
import { Locacao } from './pages/locacao/locacao';
import { ExploreVeiculos } from './pages/explore-veiculos/explore-veiculos';
import { About } from './pages/about/about';
import { ContactUs } from './pages/contact-us/contact-us';
import { AdmLogin } from './pages/adm-login/adm-login';
import { Adm } from './pages/adm/adm';
import { clientAuthGuard } from './shared/guards/client-auth.guard';
import { loginGuard } from './shared/guards/login.guard';

// Importação do guarda de autenticação
import { authGuard } from './shared/guards/auth.guard';
import { AdmDashboardVeiculosComponent } from './pages/adm/partials/adm-dashboard-veiculos/adm-dashboard-veiculos'; 
import { AdmDashboardVendasComponent } from './pages/adm/partials/adm-dashboard-vendas/adm-dashboard-vendas';
import { VeiculosService } from './services/veiculos.service';
import { PurchaseService } from './services/purchase.service';
import { AuthService } from './services/auth.service';
import { VendasService } from './services/vendas.service';
import { CategoriasService } from './services/categorias.service';
import { AdmDashboardHomeComponent } from './pages/adm/partials/adm-dashboard-home/adm-dashboard-home';
import { AdmDashboardCategoriasComponent } from './pages/adm/partials/adm-dashboard-categorias/adm-dashboard-categorias';
import { AdmDashboardClientesComponent } from './pages/adm/partials/adm-dashboard-clientes/adm-dashboard-clientes';
import { ClientesService } from './services/clientes.service';
import { CadastroComponent } from './pages/cadastro/cadastro';
import { MinhaContaComponent } from './pages/minha-conta/minha-conta';
import { DashboardService } from './services/dashboard.service';
import { CompraVeiculos } from './pages/compra-veiculos/compra-veiculos';

//! Para manter a modularidade, podemos fornecer os serviços nas rotas que os utilizam.
export const routes: Routes = [
  // --- Rotas Públicas ---

  {
    path: '',
    component: HomeVendaDeVeiculos,
    providers: [VeiculosService, PurchaseService],
  },
  { path: 'locacao', component: Locacao },
  {
    path: 'veiculos',
    component: ExploreVeiculos,
    providers: [VeiculosService, PurchaseService],
  },
  { path: 'sobre', component: About },
  { path: 'contato', component: ContactUs },

  // --- Rotas de Autenticação do Cliente ---
  {
    path: 'login',
    component: LoginComponent,
    providers: [AuthService],
  },
  {
    path: 'cadastro',
    component: CadastroComponent,
    providers: [AuthService],
  },
  {
    path: 'minha-conta',
    component: MinhaContaComponent,
    canActivate: [clientAuthGuard],
    providers: [ClientesService],
  },
  {
    path: 'comprar/:id', // Rota para a página de compra de um veículo específico
    component: CompraVeiculos,
    providers: [VeiculosService, ClientesService, VendasService, AuthService],
  },
  // --- Rotas Administrativas ---
  { 
    path: 'adm/login', component: AdmLogin, 
    providers: [AuthService]
  },
  {
    path: 'adm',
    component: Adm,
    canActivate: [authGuard],
    providers: [AuthService, VeiculosService, CategoriasService, ClientesService, VendasService, DashboardService],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      { path: 'dashboard', component:  AdmDashboardHomeComponent },
      { path: 'vendas', component: AdmDashboardVendasComponent },
      { path: 'veiculos', component:  AdmDashboardVeiculosComponent },
      { path: 'categorias', component:  AdmDashboardCategoriasComponent },
      { path: 'clientes', component:  AdmDashboardClientesComponent },
      
    ],
  },
  // A rota catch-all deve vir por último se necessária, mas sem provedores.
  { path: '**', redirectTo: '' }
];