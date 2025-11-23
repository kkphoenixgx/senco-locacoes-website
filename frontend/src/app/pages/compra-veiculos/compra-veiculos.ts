import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, of, throwError, EMPTY } from 'rxjs';
import { switchMap, finalize, catchError, tap } from 'rxjs/operators';
import { SectionHeader } from '../../components/section-header/section-header';
import { DefaultButton } from '../../components/default-button/default-button';
import { DefaultFormInput } from '../../components/default-form-input/default-form-input';
import Veiculo from '../../model/items/Veiculos';
import { VeiculosService } from '../../services/veiculos.service';
import { AuthService } from '../../services/auth.service';
import { ClientesService } from '../../services/clientes.service';
import Venda from '../../model/Venda';
import { SectionSubheader } from '../../components/section-subheader/section-subheader';
import { PurchaseService } from '../../services/purchase.service';

@Component({
  selector: 'app-compra-veiculos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SectionHeader,
    SectionSubheader,
    DefaultButton,
    DefaultFormInput
  ],
  templateUrl: './compra-veiculos.html',
  styleUrls: ['./compra-veiculos.scss'],
})
export class CompraVeiculos implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private veiculosService = inject(VeiculosService);
  private clientesService = inject(ClientesService);
  private purchaseService = inject(PurchaseService);
  public authService = inject(AuthService);

  public veiculo$!: Observable<Veiculo | null>;
  public compraForm!: FormGroup;

  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);
  public successMessage = signal<string | null>(null);
  private veiculoId!: number;

  ngOnInit(): void {
    this.veiculo$ = this.route.paramMap.pipe(
      switchMap(params => {
        if (!this.authService.isCliente()) {
          const currentUrl = this.router.url;
          this.router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
          return EMPTY;
        }

        const id = params.get('id');
        if (id) {
          this.veiculoId = +id;
          return this.veiculosService.getVeiculoById(this.veiculoId);
        }
        return of(null);
      })
    );

    this.compraForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      endereco: ['', Validators.required]
    });

    this.clientesService.getProfile().subscribe(cliente => {
      this.compraForm.patchValue(cliente);
    });
  }

  onSubmit(): void {
    if (this.compraForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const userId = this.authService.authState().user?.id;
    if (!userId) {
      this.errorMessage.set('Não foi possível identificar o usuário. Por favor, faça login novamente.');
      this.isLoading.set(false);
      return;
    }

    this.purchaseService.requestPurchase(this.veiculoId).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError(err => {
        this.errorMessage.set(err.error?.message || 'Ocorreu um erro ao processar sua compra.');
        return throwError(() => err);
      })
    ).subscribe({
      next: () => {
        this.successMessage.set('Parabéns! Sua solicitação de compra foi registrada. Em breve um de nossos consultores entrará em contato para finalizar o processo.');
        this.compraForm.disable();
      },
      // O erro já é tratado no catchError
    });
  }
}
