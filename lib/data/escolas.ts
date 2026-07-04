/**
 * Base de escolas da rede municipal de ensino de Caraguatatuba/SP.
 *
 * Fonte: Censo Escolar (INEP/MEC) — unidades cadastradas como rede
 * "Municipal" no município de Caraguatatuba. Os nomes foram normalizados
 * a partir do cadastro público (sigla + título + nome do(a) patrono/a).
 *
 * IMPORTANTE: a SEDUC Caraguatatuba pode ter aberto, fechado ou renomeado
 * unidades desde a última atualização do Censo. Antes de publicar em
 * produção, valide esta lista com o cadastro oficial da Secretaria
 * (quadros.educacao.caraguatatuba.sp.gov.br) e ajuste o campo `ofertaEja`,
 * que aqui é uma estimativa ilustrativa para as maiores EMEFs/EMEIEFs.
 */

export type TipoEscola = "CEI" | "EMEI" | "EMEF" | "EMEIEF"

export interface Escola {
  /** Identificador único e estável, usado como chave nos selects e no store */
  id: string
  /** Nome de exibição, já com a sigla institucional */
  nome: string
  /** Tipo de atendimento, define quais segmentos de turma são gerados */
  tipo: TipoEscola
  /** Bairro onde a unidade está localizada */
  bairro: string
  /** Indica se a unidade oferta EJA (Educação de Jovens e Adultos) */
  ofertaEja?: boolean
}

export const escolas: Escola[] = [
  { id: "ciefi-adolfina-leonor-soares-dos-santos", nome: "CIEFI Profª Adolfina Leonor Soares dos Santos", tipo: "EMEIEF", bairro: "Sumaré" },
  { id: "emef-antonia-antunes-arouca", nome: "EMEF Profª Antonia Antunes Arouca", tipo: "EMEF", bairro: "Massaguaçu", ofertaEja: true },
  { id: "ciefi-antonia-ribeiro-da-silva", nome: "CIEFI Profª Antonia Ribeiro da Silva", tipo: "EMEIEF", bairro: "Jardim Califórnia" },
  { id: "emef-antonio-de-freitas-avelar", nome: "EMEF Prof. Antonio de Freitas Avelar", tipo: "EMEF", bairro: "Caputera" },
  { id: "cei-bairro-poiares", nome: "CEI do Bairro Poiares", tipo: "CEI", bairro: "Poiares" },
  { id: "emef-carlos-de-almeida-rodrigues", nome: "EMEF Dr. Carlos de Almeida Rodrigues", tipo: "EMEF", bairro: "Indaiá" },
  { id: "cei-sumare-ipiranga", nome: "CEI do Sumaré", tipo: "CEI", bairro: "Ipiranga" },
  { id: "cei-messias-mendes-de-souza", nome: "CEI Messias Mendes de Souza", tipo: "CEI", bairro: "Sumaré" },
  { id: "cei-josiane-aparecida-ramos", nome: "CEI Prof. Josiane Aparecida Ramos", tipo: "CEI", bairro: "Balneário dos Golfinhos" },
  { id: "cei-maira-marques-de-oliveira", nome: "CEI Prof. Maira Marques de Oliveira", tipo: "CEI", bairro: "Massaguaçu" },
  { id: "cei-aparecida-maria-pires-de-meneses", nome: "CEI Profª Aparecida Maria Pires de Meneses", tipo: "CEI", bairro: "Jardim Olaria" },
  { id: "cei-celia-rocha-lobo", nome: "CEI Profª Célia Rocha Lobo", tipo: "CEI", bairro: "Jaraguá" },
  { id: "cei-edith-castro-de-morais", nome: "CEI Profª Edith Castro de Morais", tipo: "CEI", bairro: "Balneário Copacabana" },
  { id: "cei-maria-onicie-dias-pereira", nome: "CEI Profª Maria Onicie Dias Pereira", tipo: "CEI", bairro: "Jaraguazinho" },
  { id: "cei-ana-maria-aulicino", nome: "CEI Prof. Ana Maria Aulicino", tipo: "CEI", bairro: "Jardim Califórnia" },
  { id: "cei-elisa-butschkau", nome: "CEI Prof. Elisa Butschkau", tipo: "CEI", bairro: "Barranco Alto" },
  { id: "cei-telma-do-amarante-veiga-santos", nome: "CEI Profª Telma do Amarante Veiga Santos", tipo: "CEI", bairro: "Tinga" },
  { id: "cei-adriana-aparecida-cassiano", nome: "CEI Adi Adriana Aparecida Cassiano", tipo: "CEI", bairro: "Pereque-Mirim" },
  { id: "cei-waldete-ferreira-de-souza", nome: "CEI Inspetora Waldete Ferreira de Souza", tipo: "CEI", bairro: "Pegorelli" },
  { id: "cei-vera-da-silva-santos", nome: "CEI Profª Vera da Silva Santos", tipo: "CEI", bairro: "Portal da Fazendinha" },
  { id: "cei-stela-da-silva", nome: "CEI Stela da Silva", tipo: "CEI", bairro: "Travessão" },
  { id: "ciefi-edna-maria-nogueira-ferraz", nome: "CIEFI Profª Edna Maria Nogueira Ferraz", tipo: "EMEIEF", bairro: "Parque Balneário Maria Helena" },
  { id: "emef-auracy-mansano", nome: "EMEF Prof. Auracy Mansano", tipo: "EMEF", bairro: "Balneário Califórnia" },
  { id: "emef-debora-valle-da-silva-pilon", nome: "EMEF Profª Débora Valle da Silva Pilon", tipo: "EMEF", bairro: "Travessão" },
  { id: "emeief-benedito-inacio-soares", nome: "EMEIEF Benedito Inácio Soares", tipo: "EMEIEF", bairro: "Massaguaçu" },
  { id: "emeief-bernardo-ferreira-louzada", nome: "EMEIEF Bernardo Ferreira Louzada", tipo: "EMEIEF", bairro: "Rio do Ouro" },
  { id: "emeief-carlos-altero-ortega", nome: "EMEIEF Carlos Altero Ortega", tipo: "EMEIEF", bairro: "Morro do Algodão" },
  { id: "emeief-joao-thimoteo-do-rosario", nome: "EMEIEF João Thimóteo do Rosário", tipo: "EMEIEF", bairro: "Cantagalo" },
  { id: "emeief-masako-sone", nome: "EMEIEF Masako Sone", tipo: "EMEIEF", bairro: "Pegorelli" },
  { id: "emeief-pedro-joao-de-oliveira", nome: "EMEIEF Pedro João de Oliveira", tipo: "EMEIEF", bairro: "Tabatinga" },
  { id: "emeief-alaor-xavier-junqueira", nome: "EMEIEF Prof. Alaor Xavier Junqueira", tipo: "EMEIEF", bairro: "Travessão" },
  { id: "emeief-joao-baptista-gardelin", nome: "EMEIEF Prof. João Baptista Gardelin", tipo: "EMEIEF", bairro: "Poiares" },
  { id: "emeief-joao-benedito-marcondes", nome: "EMEIEF Prof. João Benedito Marcondes", tipo: "EMEIEF", bairro: "Barranco Alto" },
  { id: "emeief-lucio-jacinto-dos-santos", nome: "EMEIEF Prof. Lúcio Jacinto dos Santos", tipo: "EMEIEF", bairro: "Tinga" },
  { id: "emeief-aida-de-almeida-castro-grazioli", nome: "EMEIEF Profª Aida de Almeida Castro Grazioli", tipo: "EMEIEF", bairro: "Vila Nossa Senhora Aparecida" },
  { id: "emei-maria-de-lourdes-lucarelli-perez", nome: "EMEI Maria de Lourdes Lucarelli Perez", tipo: "EMEI", bairro: "Indaiá" },
  { id: "emef-jane-urbano-focesi", nome: "EMEF Profª Jane Urbano Focesi", tipo: "EMEF", bairro: "Pereque-Mirim" },
  { id: "cei-ester-nunes-de-souza", nome: "CEI Profª Ester Nunes de Souza", tipo: "CEI", bairro: "Sertão dos Tourinhos" },
  { id: "emef-euclydes-ferreira", nome: "EMEF Prof. Euclydes Ferreira", tipo: "EMEF", bairro: "Travessão" },
  { id: "cei-francisco-assis-de-carvalho", nome: "CEI Prof. Francisco Assis de Carvalho", tipo: "CEI", bairro: "Travessão" },
  { id: "emef-geraldo-de-lima", nome: "EMEF Prof. Geraldo de Lima", tipo: "EMEF", bairro: "Parque Balneário Maria Helena" },
  { id: "cei-honorina-pacheco-correa", nome: "CEI Profª Honorina Pacheco Corrêa", tipo: "CEI", bairro: "Rio do Ouro" },
  { id: "cei-joao-lino-da-cruz", nome: "CEI João Lino da Cruz", tipo: "CEI", bairro: "Barranco Alto" },
  { id: "emef-jorge-passos", nome: "EMEF Prof. Jorge Passos", tipo: "EMEF", bairro: "Jaraguazinho" },
  { id: "cei-leonor-mendes-de-barros", nome: "CEI Leonor Mendes de Barros", tipo: "CEI", bairro: "Travessão" },
  { id: "emef-luiz-ribeiro-muniz", nome: "EMEF Prof. Luiz Ribeiro Muniz", tipo: "EMEF", bairro: "Vila Balneário Santa Marta" },
  { id: "emef-luiz-silvar-do-prado", nome: "EMEF Prof. Luiz Silvar do Prado", tipo: "EMEF", bairro: "Jardim Olaria" },
  { id: "emef-maria-aparecida-de-carvalho", nome: "EMEF Profª Maria Aparecida de Carvalho", tipo: "EMEF", bairro: "Tinga" },
  { id: "emef-maria-aparecida-ujio", nome: "EMEF Profª Maria Aparecida Ujio", tipo: "EMEF", bairro: "Jardim Porto Novo" },
  { id: "cei-maria-carlita-s-guedes", nome: "CEI Maria Carlita S. Guedes", tipo: "CEI", bairro: "Morro do Algodão" },
  { id: "cei-maria-elma-mansano", nome: "CEI Profª Maria Elma Mansano", tipo: "CEI", bairro: "Tinga" },
  { id: "cei-maria-eugenia-aranha-chodounsky", nome: "CEI Profª Maria Eugênia Aranha Chodounsky", tipo: "CEI", bairro: "Jardim Casa Branca" },
  { id: "emef-maria-moraes-de-oliveira", nome: "EMEF Profª Maria Moraes de Oliveira", tipo: "EMEF", bairro: "Jardim das Gaivotas", ofertaEja: true },
  { id: "emeief-maria-thereza-de-souza-castro", nome: "EMEIEF Profª Maria Thereza de Souza Castro", tipo: "EMEIEF", bairro: "Balneário Copacabana" },
  { id: "emef-oswaldo-ferreira", nome: "EMEF Prof. Oswaldo Ferreira", tipo: "EMEF", bairro: "Jardim Olaria" },
  { id: "cei-regina-celia-santos-chapira-blaustein", nome: "CEI Profª Regina Célia Santos Chapira Blaustein", tipo: "CEI", bairro: "Jardim Jaraguá" },
  { id: "emef-ricardo-luques-sammarco-serra", nome: "EMEF Prof. Ricardo Luques Sammarco Serra", tipo: "EMEF", bairro: "Praia das Palmeiras" },
  { id: "cei-santina-nardi-marques", nome: "CEI Santina Nardi Marques", tipo: "CEI", bairro: "Caputera" },
  { id: "cei-severino-vitoriano-dos-santos", nome: "CEI Severino Vitoriano dos Santos", tipo: "CEI", bairro: "Jardim das Gaivotas" },
  { id: "cei-thereza-yanesse-schimidt-cardozo", nome: "CEI Profª Thereza Yanesse Schimidt Cardozo", tipo: "CEI", bairro: "Jardim Porto Novo" },
  { id: "emeief-yasutada-nasu", nome: "EMEIEF Yasutada Nasu", tipo: "EMEIEF", bairro: "Pereque-Mirim" },
]