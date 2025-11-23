import Cliente from "./Cliente";
import ItemsVendidos from "./ItemsVendidos";

export default class Venda {
  
  //? ----------- Constructor -----------

  constructor(
    public id: number,
    public items: ItemsVendidos[],
    public dataVenda: Date,
    public precoTotal: number,
    public clienteId: number,
    public cliente?: Cliente,
    public efetivada: boolean = false
  ){}

  //? ----------- Methods -----------

  public getPrecoTotalFormatado(): string {
    return this.precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  //? ----------- Getters and Setters -----------

}