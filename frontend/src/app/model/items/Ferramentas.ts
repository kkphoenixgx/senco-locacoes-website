import CategoriaFerramentas from "./CategoriaFerramentas";
import ItemsVendidos from "../ItemsVendidos";

export default class Ferramentas extends ItemsVendidos {
  
  //? ----------- Constructor -----------

  constructor(
    id: number,
    nome: string,
    preco: number,
    descricao: string,
    imagens: string[] | undefined,

    public categoriaId: number,
    public marca: string,
    public condicao: 'nova' | 'usada',
    public modelo?: string,
    public voltagem?: '110v' | '220v' | 'bivolt',
    public categoria?: CategoriaFerramentas | undefined
  ){
    super(id, nome, preco, descricao, imagens);
  }

  //? ----------- Getters and Setters -----------

}