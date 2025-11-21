import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, finalize, Observable, switchMap } from 'rxjs';
import Cliente from '../../../../model/Cliente';
import { ClientesService } from '../../../../services/clientes.service';
import { SectionHeader } from '../../../../components/section-header/section-header';

@Component({
  selector: 'app-adm-dashboard-clientes',
  standalone: true,
  imports: [CommonModule, SectionHeader],
  templateUrl: './adm-dashboard-clientes.html',
  styleUrls: ['./adm-dashboard-clientes.scss']
})
export class AdmDashboardClientesComponent implements OnInit {
  private clientesService = inject(ClientesService);

  private refreshClientes$ = new BehaviorSubject<void>(undefined);
  public clientes$!: Observable<Cliente[]>;

  public errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.clientes$ = this.refreshClientes$.pipe(
      switchMap(() => this.clientesService.getClientes())
    );
  }

  onDelete(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      return;
    }

    this.clientesService.deleteCliente(id).subscribe({
      next: () => this.refreshClientes$.next(),
      error: (err) => {
        console.error('Erro ao excluir cliente:', err);
        this.errorMessage.set(err.error?.message || 'Ocorreu um erro ao excluir o cliente.');
      }
    });
  }
}