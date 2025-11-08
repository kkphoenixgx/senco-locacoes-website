import CategoriaVeiculos from "./CategoriaVeiculos";
import ItemsVendidos from "../ItemsVendidos";

export default class Veiculos extends ItemsVendidos {
  
  //? ----------- Constructor -----------

  constructor(
    id: number,
    titulo: string,
    preco: number,
    descricao: string,
    imagens: string[] | undefined,

    public categoriaId: number,
    public modelo: string,
    public anoFabricacao: number,
    public anoModelo: number,
    public quilometragem: number,
    public cor: string,
    public documentacao?: string,
    public revisoes?: string,
    public categoria?: CategoriaVeiculos
  ){
    super(id, titulo, preco, descricao, imagens);
  }

  //? ----------- Getters and Setters -----------

  /**
   * Retorna o ano formatado para exibição, como "2007/2008" ou "2007".
   */
  public getAnoFormatado(): string {
    if (this.anoFabricacao === this.anoModelo) {
      return this.anoFabricacao.toString();
    }
    const modeloAbreviado = this.anoModelo.toString().slice(-2);
    return `${this.anoFabricacao}/${modeloAbreviado}`;
  }

}