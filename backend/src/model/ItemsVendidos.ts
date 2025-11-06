export default abstract class ItemsVendidos {
  
  //? ----------- Constructor -----------

  protected constructor(
    public id: number,
    public titulo: string,
    public preco: number,
    public descricao: string,
    public imagens?: string[]
  ){}

  //? ----------- Methods -----------

  public getPrecoFormatado(): string {
    return this.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

}