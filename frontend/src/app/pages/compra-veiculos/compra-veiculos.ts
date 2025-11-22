import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { switchMap, finalize, catchError, tap } from 'rxjs/operators';
import { SectionHeader } from '../../components/section-header/section-header';
import { DefaultButton } from '../../components/default-button/default-button';
import { DefaultFormInput } from '../../components/default-form-input/default-form-input';
import Veiculo from '../../model/items/Veiculos';
import { VeiculosService } from '../../services/veiculos.service';
import { AuthService } from '../../services/auth.service';
import { ClientesService } from '../../services/clientes.service';
import { VendasService } from '../../services/vendas.service';
import { passwordMatchValidator } from '../cadastro/cadastro';
import Venda from '../../model/Venda';

@Component({
  selector: 'app-compra-veiculos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SectionHeader,
    DefaultButton,
    DefaultFormInput
  ],
  templateUrl: './compra-veiculos.html',
  styleUrl: './compra-veiculos.scss',
})
export class CompraVeiculos implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private veiculosService = inject(VeiculosService);
  private clientesService = inject(ClientesService);
  private vendasService = inject(VendasService);
  public authService = inject(AuthService);

  public veiculo$!: Observable<Veiculo | null>;
  public compraForm!: FormGroup;

  public isClienteLogado = this.authService.authState().isAuthenticated && this.authService.authState().role === 'client';
  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);
  public successMessage = signal<string | null>(null);
  private veiculoId!: number;

  ngOnInit(): void {
    this.veiculo$ = this.route.paramMap.pipe(
      switchMap(params => {
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
      endereco: ['', Validators.required],
      senhaPlana: [''],
      confirmarSenha: ['']
    });

    if (this.isClienteLogado) {
      this.clientesService.getProfile().subscribe(cliente => {
        this.compraForm.patchValue(cliente);
      });
    } else {
      // Se não está logado, a senha é obrigatória para criar a conta
      this.compraForm.get('senhaPlana')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.compraForm.get('confirmarSenha')?.setValidators([Validators.required]);
      this.compraForm.setValidators(passwordMatchValidator);
    }
  }

  onSubmit(): void {
    if (this.compraForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.compraForm.getRawValue();

    const createVenda = (clienteId: number) => {
      const vendaData = {
        clienteId: clienteId,
        items: [{ id: this.veiculoId }],
      };
      return this.vendasService.createVenda(vendaData);
    };

    const userId = this.authService.authState().user?.id;
    if (this.isClienteLogado && !userId) {
      this.errorMessage.set('Não foi possível identificar o usuário. Por favor, faça login novamente.');
      this.isLoading.set(false);
      return;
    }

    let action$: Observable<Venda>;

    if (this.isClienteLogado) {
      action$ = createVenda(userId!); // Usamos o non-null assertion (!) pois já verificamos que userId existe.
    } else {
      action$ = this.authService.registerCliente(formValue).pipe(
        switchMap(response => {
          if (!response.user.id) {
            // Lança um erro se o ID do usuário não for retornado após o registro.
            return throwError(() => new Error('Falha ao obter ID do usuário após o registro.'));
          }
          return createVenda(response.user.id);
        })
      );
    }
    action$.pipe(
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
