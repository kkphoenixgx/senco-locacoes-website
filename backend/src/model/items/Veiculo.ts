import CategoriaVeiculos from "./CategoriaVeiculos";
import ItemsVendidos from "../ItemsVendidos";

/**
 * @swagger
 * components:
 *   schemas:
 *     Veiculo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         titulo:
 *           type: string
 *         preco:
 *           type: number
 *         descricao:
 *           type: string
 *         imagens:
 *           type: array
 *           items:
 *             type: string
 *         categoriaId:
 *           type: integer
 *         modelo:
 *           type: string
 *         marca:
 *           type: string
 *         anoFabricacao:
 *           type: integer
 *         anoModelo:
 *           type: integer
 *         quilometragem:
 *           type: integer
 *         cor:
 *           type: string
 *         documentacao:
 *           type: string
 *         revisoes:
 *           type: string
 *         categoria:
 *           $ref: '#/components/schemas/CategoriaVeiculos'
 */
export default class Veiculo extends ItemsVendidos {
  
  //? ----------- Constructor -----------

  constructor(
    id: number,
    titulo: string,
    preco: number,
    descricao: string,
    imagens: string[] | undefined,

    public categoriaId: number,
    public modelo: string,
    public marca: string,
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

  /** * Retorna o ano formatado para exibição, como "2007/2008" ou "2007". */
  public getAnoFormatado(): string {
    if (this.anoFabricacao === this.anoModelo) {
      return this.anoFabricacao.toString();
    }
    const modeloAbreviado = this.anoModelo.toString().slice(-2);
    return `${this.anoFabricacao}/${modeloAbreviado}`;
  }

}