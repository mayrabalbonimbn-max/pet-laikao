import { siteConfig } from "@/config/site";

export type LegalSection = {
  title: string;
  body?: string;
  items?: string[];
};

export type LegalPage = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
};

const privacyEmail = siteConfig.channels.privacy.email;
const supportEmail = siteConfig.channels.support.email;
const billingEmail = siteConfig.channels.billing.email;
const contactEmail = siteConfig.channels.contact.email;

export const formPrivacyNotice =
  "Ao enviar seus dados, voce concorda com o tratamento das informacoes para atendimento, agendamento, compra e suporte, conforme nossa Politica de Privacidade.";

export const cookieConsentStorageKey = "laikao-cookie-consent-v1";

export const cookieCategories = [
  {
    id: "necessary",
    title: "Cookies necessarios",
    description:
      "Mantem recursos essenciais do site funcionando, como seguranca, carrinho, sessao, preferencias e estabilidade da navegacao.",
    required: true
  },
  {
    id: "analytics",
    title: "Cookies analiticos",
    description:
      "Ajudam a entender paginas visitadas, desempenho e pontos de melhoria. Ficam desativados ate voce autorizar.",
    required: false
  },
  {
    id: "marketing",
    title: "Cookies de marketing e terceiros",
    description:
      "Podem apoiar campanhas, pixels, medicao de anuncios e conteudos de terceiros. Ficam desativados ate voce autorizar.",
    required: false
  }
] as const;

export type CookieCategoryId = (typeof cookieCategories)[number]["id"];

export const legalPages = [
  {
    slug: "termos",
    title: "Termos de Uso",
    eyebrow: "Legal",
    description:
      "Regras gerais para usar o site, navegar, criar pedidos, realizar agendamentos e acessar areas protegidas do Pet Shop Laikao.",
    updatedAt: "29/04/2026",
    sections: [
      {
        title: "1. Aceite dos termos",
        body:
          "Ao acessar ou usar o site do Pet Shop Laikao, voce concorda com estes Termos de Uso. Se nao concordar, recomendamos nao utilizar os recursos de cadastro, agendamento, carrinho ou checkout. Estes termos podem ser atualizados para acompanhar novas funcionalidades, exigencias legais ou ajustes operacionais."
      },
      {
        title: "2. Uso do site",
        items: [
          "Voce deve usar o site de forma licita, respeitosa e sem tentar prejudicar a operacao, seguranca ou disponibilidade da plataforma.",
          "As informacoes exibidas sobre servicos, produtos, precos, estoque, promocoes e horarios podem mudar conforme disponibilidade da loja.",
          "O conteudo do site, incluindo textos, marcas, imagens, layout e componentes, pertence ao Pet Shop Laikao ou a seus licenciantes e nao deve ser copiado para uso comercial sem autorizacao."
        ]
      },
      {
        title: "3. Cadastro, login e area administrativa",
        body:
          "Quando houver login de cliente ou acesso administrativo, cada usuario e responsavel por manter seus dados corretos e proteger suas credenciais. A area administrativa e destinada a pessoas autorizadas pela gestao do Pet Shop Laikao. Acesso indevido, tentativa de invasao ou uso de credenciais de terceiros pode gerar bloqueio e medidas cabiveis."
      },
      {
        title: "4. Pedidos, carrinho e checkout",
        items: [
          "Adicionar um produto ao carrinho nao garante reserva definitiva ate a conclusao do pedido conforme as regras do checkout.",
          "Pedidos podem depender de confirmacao de pagamento, disponibilidade de estoque, area de entrega, retirada em loja ou validacao operacional.",
          "Em caso de erro evidente de preco, estoque, descricao ou promocao, o Pet Shop Laikao podera corrigir a informacao e orientar o cliente antes de confirmar a compra."
        ]
      },
      {
        title: "5. Agendamentos",
        body:
          "Agendamentos dependem de disponibilidade de data, horario, servico, equipe e informacoes do pet. Quando houver pagamento antecipado, a reserva fica vinculada ao status financeiro informado no fluxo. Atrasos, ausencia, cancelamentos e reagendamentos seguem a Politica de Agendamento."
      },
      {
        title: "6. Responsabilidades e limites",
        body:
          "O Pet Shop Laikao trabalha para manter o site seguro, claro e disponivel, mas podem ocorrer indisponibilidades temporarias por manutencao, internet, provedores de pagamento, hospedagem, ferramentas de terceiros ou caso fortuito. O site nao substitui avaliacao presencial quando o estado do animal exigir atencao especifica."
      },
      {
        title: "7. Contato",
        body: `Duvidas sobre estes termos podem ser enviadas para ${supportEmail} ou pelo canal principal de atendimento informado no site.`
      }
    ]
  },
  {
    slug: "privacidade",
    title: "Politica de Privacidade",
    eyebrow: "LGPD",
    description:
      "Como o Pet Shop Laikao trata dados pessoais em contato, agendamento, pedidos, checkout, suporte e operacao administrativa.",
    updatedAt: "29/04/2026",
    sections: [
      {
        title: "1. Nosso compromisso",
        body:
          "O Pet Shop Laikao trata dados pessoais com cuidado, transparencia e finalidade clara. Esta politica explica quais informacoes podem ser coletadas, por que sao usadas, com quem podem ser compartilhadas e como voce pode exercer seus direitos previstos na LGPD."
      },
      {
        title: "2. Dados que podemos coletar",
        items: [
          "Dados de identificacao e contato, como nome, telefone, WhatsApp, e-mail e endereco quando necessario.",
          "Dados de atendimento e agendamento, como servico escolhido, data, horario, observacoes, historico, nome do pet, porte, especie, raca e informacoes relevantes para o atendimento.",
          "Dados de compra, carrinho e checkout, como produtos, valores, forma de entrega ou retirada, status do pedido, comprovantes e status de pagamento.",
          "Dados tecnicos de navegacao, como dispositivo, navegador, paginas acessadas, registros de erro e preferencias de cookies, conforme consentimento quando aplicavel.",
          "Dados administrativos inseridos por usuarios autorizados no painel de gestao, como registros de clientes, produtos, agenda, pedidos, pagamentos e notificacoes."
        ]
      },
      {
        title: "3. Finalidades do tratamento",
        items: [
          "Responder contatos, duvidas, solicitacoes e suporte.",
          "Criar, confirmar, reagendar, cancelar e acompanhar agendamentos.",
          "Processar pedidos, carrinho, checkout, pagamentos, retirada, entrega e pos-venda.",
          "Enviar confirmacoes, lembretes, atualizacoes operacionais e comunicacoes relacionadas ao atendimento.",
          "Manter seguranca, prevenir fraudes, registrar logs necessarios e cumprir obrigacoes legais ou regulatorias.",
          "Melhorar a experiencia do site e analisar desempenho somente quando houver base legal adequada, incluindo consentimento para cookies nao essenciais quando exigido."
        ]
      },
      {
        title: "4. Compartilhamento com terceiros",
        body:
          "Podemos compartilhar dados apenas quando necessario para operar o site e prestar o servico, por exemplo com provedores de hospedagem, banco de dados, pagamento, e-mail transacional, WhatsApp/API de mensagens, analytics autorizado, antifraude, contabilidade, suporte tecnico ou autoridades quando houver obrigacao legal. Esses terceiros devem tratar os dados de acordo com suas funcoes e contratos aplicaveis."
      },
      {
        title: "5. Base legal e consentimento",
        body:
          "Dependendo do contexto, o tratamento pode ocorrer para executar contrato ou procedimentos preliminares, cumprir obrigacao legal, atender interesse legitimo do negocio ou mediante consentimento. Cookies analiticos e de marketing, quando nao essenciais, ficam desativados por padrao e dependem da sua escolha."
      },
      {
        title: "6. Retencao e seguranca",
        body:
          "Os dados sao mantidos pelo tempo necessario para atendimento, historico operacional, obrigacoes legais, protecao de direitos e melhoria da plataforma. Aplicamos medidas razoaveis de seguranca, controle de acesso e organizacao dos registros, mas nenhum sistema conectado a internet e totalmente imune a riscos."
      },
      {
        title: "7. Direitos do titular",
        items: [
          "Confirmar se tratamos seus dados pessoais.",
          "Solicitar acesso, correcao, atualizacao ou exclusao quando cabivel.",
          "Solicitar informacoes sobre compartilhamento.",
          "Revogar consentimentos, inclusive preferencias de cookies nao essenciais.",
          "Solicitar portabilidade, anonimizacao ou bloqueio quando aplicavel pela LGPD."
        ]
      },
      {
        title: "8. Canal de privacidade",
        body: `Para pedidos relacionados a dados pessoais, escreva para ${privacyEmail}. Podemos solicitar confirmacao de identidade antes de responder, para proteger suas informacoes.`
      }
    ]
  },
  {
    slug: "cookies",
    title: "Politica de Cookies",
    eyebrow: "Cookies",
    description:
      "Explicacao simples sobre cookies necessarios, analiticos e de marketing no site do Pet Shop Laikao.",
    updatedAt: "29/04/2026",
    sections: [
      {
        title: "1. O que sao cookies",
        body:
          "Cookies e tecnologias semelhantes sao pequenos registros usados pelo navegador para lembrar informacoes, manter funcionalidades, melhorar seguranca, medir desempenho ou personalizar experiencias."
      },
      {
        title: "2. Cookies necessarios",
        body:
          "Sao essenciais para o funcionamento do site. Podem ser usados para manter carrinho, sessao, seguranca, preferencias, estabilidade, roteamento e recursos basicos de navegacao. Eles permanecem ativos porque o site nao funciona corretamente sem eles."
      },
      {
        title: "3. Cookies analiticos",
        body:
          "Ajudam a entender como as pessoas usam o site, quais paginas funcionam melhor, onde existem erros e como melhorar a experiencia. No Laikao, essa categoria fica preparada para ferramentas futuras de medicao e so deve ser ativada com consentimento quando nao for estritamente necessaria."
      },
      {
        title: "4. Cookies de marketing e terceiros",
        body:
          "Podem ser usados futuramente para pixels, campanhas, anuncios, mensuracao de conversoes, redes sociais, mapas, videos ou outros conteudos de terceiros. Eles ficam desativados por padrao e dependem da sua autorizacao."
      },
      {
        title: "5. Como gerenciar preferencias",
        body:
          "Voce pode aceitar todos, recusar cookies nao essenciais ou escolher categorias na tela de Preferencias de Cookies. Tambem pode limpar cookies diretamente no navegador, mas isso pode apagar preferencias salvas."
      }
    ]
  },
  {
    slug: "politica-comercial",
    title: "Politica Comercial",
    eyebrow: "Compras",
    description:
      "Condicoes gerais de precos, disponibilidade, promocoes, pagamentos, retirada, entrega e atendimento comercial.",
    updatedAt: "29/04/2026",
    sections: [
      {
        title: "1. Precos e disponibilidade",
        body:
          "Precos, estoque, disponibilidade de produtos, disponibilidade de servicos e prazos podem variar conforme atualizacao da loja, campanhas, fornecedores e operacao local. O site busca manter informacoes corretas, mas a confirmacao final pode depender do pedido, pagamento e validacao operacional."
      },
      {
        title: "2. Promocoes e cupons",
        body:
          "Promocoes, combos e cupons podem ter prazo, quantidade limitada, regras especificas, produtos participantes e restricoes de acumulacao. Quando uma promocao terminar, estiver indisponivel ou tiver erro evidente, a loja podera corrigir a exibicao e orientar o cliente."
      },
      {
        title: "3. Formas de pagamento",
        body:
          "O site pode aceitar Pix, cartao de credito e outras formas habilitadas no checkout. A confirmacao do pedido ou agendamento pode depender da aprovacao do provedor de pagamento. Falhas, expiracoes ou recusas devem ser tratadas no proprio fluxo ou pelo atendimento."
      },
      {
        title: "4. Retirada e entrega",
        body:
          "Quando houver retirada, o cliente deve observar horario de funcionamento e confirmacao do pedido. Quando houver entrega local, prazos, area atendida, taxa e disponibilidade podem variar conforme endereco, agenda da loja e condicoes operacionais."
      },
      {
        title: "5. Atendimento comercial",
        body: `Duvidas sobre pedido, cobranca ou disponibilidade podem ser enviadas para ${contactEmail}, ${billingEmail} ou pelos canais de atendimento exibidos no site.`
      }
    ]
  },
  {
    slug: "cancelamento-e-reembolso",
    title: "Cancelamento e Reembolso",
    eyebrow: "Pos-venda",
    description:
      "Orientacoes sobre cancelamento de pedidos, cancelamento de agendamentos, analise de reembolso e excecoes.",
    updatedAt: "29/04/2026",
    sections: [
      {
        title: "1. Cancelamento de pedidos",
        body:
          "O cancelamento de pedidos pode ser solicitado pelo canal de atendimento. A possibilidade de cancelamento depende do status do pedido, separacao, entrega, retirada, pagamento e natureza do produto. Pedidos ja entregues ou retirados seguem tambem a Politica de Trocas e Devolucoes."
      },
      {
        title: "2. Cancelamento de agendamentos",
        body:
          "Agendamentos podem ter regras proprias de prazo, reagendamento e pagamento antecipado. Quando houver reserva com pagamento de 50% ou 100%, o tratamento do valor pago depende do momento do cancelamento, status do pagamento e regras informadas na Politica de Agendamento."
      },
      {
        title: "3. Quando pode haver reembolso",
        items: [
          "Pagamento confirmado em duplicidade ou valor cobrado incorretamente.",
          "Pedido cancelado antes da separacao ou entrega, quando aplicavel.",
          "Servico nao realizado por indisponibilidade operacional da loja.",
          "Produto indisponivel apos pagamento, quando nao houver substituicao aceita pelo cliente."
        ]
      },
      {
        title: "4. Prazos e forma de restituicao",
        body:
          "O prazo de reembolso pode variar conforme meio de pagamento, gateway, banco emissor e conciliacao financeira. Cartoes podem depender da fatura do cliente. Pix, quando aprovado, tende a ser operacionalmente mais rapido, mas ainda depende de validacao interna."
      },
      {
        title: "5. Excecoes",
        body:
          "Podem existir excecoes para produtos usados, violados, sem embalagem, pereciveis, personalizados, medicamentos, itens de higiene, produtos com risco sanitario ou servicos ja iniciados/prestados. Cada caso sera analisado com razoabilidade e conforme o Codigo de Defesa do Consumidor."
      }
    ]
  },
  {
    slug: "trocas-e-devolucoes",
    title: "Trocas e Devolucoes",
    eyebrow: "Pos-venda",
    description:
      "Regras claras para troca, devolucao, analise de produtos e restituicao em compras feitas pelo site ou canais da loja.",
    updatedAt: "29/04/2026",
    sections: [
      {
        title: "1. Solicitacao",
        body:
          "Para solicitar troca ou devolucao, entre em contato com o Pet Shop Laikao informando numero do pedido, produto, motivo e fotos quando necessario. A loja pode pedir avaliacao presencial ou comprovantes para concluir a analise."
      },
      {
        title: "2. Prazo de arrependimento",
        body:
          "Para compras online, o cliente consumidor pode exercer o direito de arrependimento nos termos do Codigo de Defesa do Consumidor, quando aplicavel. O produto deve ser devolvido em condicoes adequadas, com embalagem, acessorios e comprovantes sempre que possivel."
      },
      {
        title: "3. Troca por defeito ou divergencia",
        body:
          "Produtos com defeito, avaria, vencimento inadequado ou divergencia em relacao ao pedido serao analisados pela loja. Confirmado o problema, poderemos oferecer troca, credito, substituicao, reparo quando cabivel ou restituicao conforme a situacao."
      },
      {
        title: "4. Itens com restricoes",
        body:
          "Produtos de higiene, medicamentos, alimentos, itens pereciveis, abertos, usados, violados ou que envolvam risco sanitario podem ter troca ou devolucao limitada, salvo defeito, divergencia ou obrigacao legal."
      },
      {
        title: "5. Restituicao",
        body:
          "Quando houver restituicao, ela seguira o meio de pagamento usado e os prazos do provedor financeiro. Fretes, taxas e custos de retirada podem depender do motivo da troca ou devolucao."
      }
    ]
  },
  {
    slug: "politica-de-agendamento",
    title: "Politica de Agendamento",
    eyebrow: "Agenda",
    description:
      "Regras de confirmacao, atraso, cancelamento, reagendamento, ausencia e pagamento antecipado dos servicos.",
    updatedAt: "29/04/2026",
    sections: [
      {
        title: "1. Confirmacao do agendamento",
        body:
          "O agendamento depende da escolha de servico, informacoes do tutor e do pet, data, horario disponivel e, quando aplicavel, pagamento antecipado. A confirmacao pode ser exibida no site e enviada por canais de atendimento ou notificacoes configuradas."
      },
      {
        title: "2. Pagamento antecipado",
        body:
          "Quando o fluxo permitir pagamento de 50% para reserva ou 100% antecipado, o horario fica vinculado ao status do pagamento. Se o pagamento falhar, expirar ou nao for confirmado, o slot pode voltar a ficar disponivel. Quando houver pagamento parcial, o saldo restante deve aparecer no atendimento/admin e ser quitado conforme combinado."
      },
      {
        title: "3. Atrasos",
        body:
          "Atrasos podem reduzir o tempo disponivel para o servico ou exigir reagendamento, especialmente em dias de alta demanda. A loja podera avaliar tolerancia caso a caso, sem garantir manutencao do horario quando o atraso comprometer a agenda."
      },
      {
        title: "4. Cancelamento e reagendamento",
        body:
          "Solicitacoes de cancelamento ou reagendamento devem ser feitas com antecedencia razoavel pelo canal de atendimento. A possibilidade de manter credito, reembolsar valor ou transferir pagamento depende do prazo, motivo, status financeiro e disponibilidade da agenda."
      },
      {
        title: "5. Ausencia / no-show",
        body:
          "Se o cliente nao comparecer e nao avisar em tempo adequado, o horario pode ser considerado perdido. Valores antecipados podem ser analisados conforme regra informada no momento da reserva, custo operacional e politica de cancelamento vigente."
      },
      {
        title: "6. Informacoes do pet",
        body:
          "O tutor deve informar dados importantes sobre o pet, como comportamento, idade, porte, condicoes de saude, alergias, gestacao, uso de medicamentos ou qualquer ponto que possa afetar o atendimento. Em caso de risco ao animal ou equipe, o servico pode ser adaptado, recusado ou reagendado."
      },
      {
        title: "7. Regras de atendimento de banho e tosa",
        items: [
          "Atendemos apenas pets dóceis. Para a segurança da equipe e dos outros clientes, não atendemos cães agressivos ou reativos.",
          "Pet que chega com pulga ou carrapato precisa ser medicado na hora, para não contaminar o ambiente nem os outros pets.",
          "Todo banho inclui limpeza de ouvidos e corte de unhas.",
          "Se o pet tem algum problema de saúde, alergia ou de pele, o tutor precisa avisar antes do atendimento.",
          "O valor do banho e da tosa é a partir de, podendo variar conforme porte, raça e pelagem. O valor final é confirmado no agendamento."
        ]
      },
      {
        title: "8. Pacotes de banho e tosa",
        body:
          "Os pacotes são uma condição de recorrência (semanal ou quinzenal) com desconto. Não são um serviço avulso. Valem as regras abaixo.",
        items: [
          "A validade conta a partir da primeira sessão. Sessões não usadas dentro do período expiram.",
          "A frequência combinada (semanal ou quinzenal) deve ser seguida, sem pular nem pausar as sessões.",
          "Cancelamento ou remarcação com pelo menos 24 horas de antecedência. Faltou sem avisar, a sessão é considerada feita.",
          "O pagamento é feito no primeiro dia de serviço, sem parcelar.",
          "Descontos pagando tudo no primeiro dia: 10% no Pix ou dinheiro, 5% no crédito ou débito.",
          "O pacote não tem estorno e não pode ser transferido para outra pessoa ou outro pet."
        ]
      }
    ]
  }
] satisfies LegalPage[];

export const legalPageMap = Object.fromEntries(legalPages.map((page) => [page.slug, page])) as Record<string, LegalPage>;


