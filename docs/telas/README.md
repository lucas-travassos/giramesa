# Interface e acessibilidade — GiraMesa

## Identidade

A interface utiliza Bootstrap, Bootstrap Icons e fontes do sistema, sem fontes ou serviços externos. A marca mantém a xícara e o nome GiraMesa; a aba do navegador tem título em português e ícone SVG local. O idioma do documento é pt-BR.

| Uso | Cor |
|---|---|
| Ação principal | #176b46 |
| Cabeçalho e resumo do carrinho | #164d36 |
| Fundo | #f5f7f4 |
| Texto | #24362d |
| Texto secundário | #56645d |

As mesas preservam a codificação anterior: disponível em verde, ocupada em vermelho, fechamento em amarelo e inativa em cinza, sempre acompanhada de texto. O fechamento usa texto escuro no amarelo; seu botão com contorno usa #805700. As combinações principais de texto/fundo foram calculadas com razão mínima de 4,5:1; isso não constitui auditoria integral de acessibilidade.

## Componentes e comportamento

- EstadoConteudo apresenta carregamento anunciado, erro com nova tentativa e estado vazio. É usado no salão, atendimento, fechamento, dashboard e cadastros. Tabelas mantêm a indicação de ausência de registros; gráficos mantêm seus estados vazios específicos.
- CampoFormulario associa rótulo, controle, ajuda e erro. Os quatro cadastros validam os campos antes de enviar e ao sair de um campo; um envio inválido leva o foco ao primeiro erro. O clique em Salvar valida o conjunto sem deslocar o botão durante o clique.
- Os limites seguem os schemas da API: nome de usuário/produto até 100 caracteres, categoria até 50, e-mail até 150, inteiros positivos até 2147483647, dinheiro positivo até 999999,99 e duas casas decimais. Senha de cadastro tem mínimo de seis caracteres e máximo de 72 bytes UTF-8. Na edição, senha vazia mantém a atual. A API continua responsável por vínculos, unicidade e regras de negócio.
- DialogoModal concentra cadastro e confirmação: título associado, foco inicial, Tab/Shift+Tab contidos, Escape e retorno ao acionador. O conteúdo atrás da janela fica inerte; durante a gravação, campos e fechamento ficam bloqueados. Falha da API mantém o formulário e a mensagem.
- Produtos são botões nativos, acionáveis com Enter/Espaço. Controles de quantidade e ações por ícone têm rótulos. Há atalho para o conteúdo, foco visível e respeito à preferência de movimento reduzido. Botões e campos principais têm altura mínima de 44 pixels.

## Atendimento no celular

Abaixo de 992 pixels, o carrinho fica no rodapé, com quantidade e subtotal dos novos itens. O resumo expande ou recolhe a revisão, incluindo consumo já enviado, total e botão de envio. O conteúdo expandido tem rolagem própria; a página reserva espaço para o resumo. Em telas maiores, o carrinho permanece na coluna lateral com posição sticky. Categorias têm rolagem horizontal.

O carrinho continua local ao Pinia: adicionar não grava no banco; enviar grava. Não foi adicionada persistência após recarregar a página. Durante o envio, os controles de produtos e itens ficam bloqueados. Uma falha expande a revisão e mostra a mensagem. No pagamento, pessoas devem ser inteiras positivas; valor inválido, com mais de duas casas ou acima do saldo impede registro.

## Evidências e limites

Revisão pelo navegador e aceite funcional são evidências distintas, registradas em [TESTES](../TESTES.md), cenários T11–T14. A matriz também registra os limites de aparelho físico, leitor de tela, zoom e regressão integral.

## Capturas da documentação

Em 09/11/2026 foram produzidas 12 capturas reais em [capturas/](capturas/), incorporadas à v2 do relatório. Desktop: login, salão/pedido como garçom, fechamento como caixa e cinco telas administrativas. Mobile: salão/carrinho em viewport de 390×844 e fechamento em 390×1020, com todos os controles visíveis. As Figuras 3–10 substituem as anteriores; categorias ocupa a Figura 11 e o fluxo mobile as Figuras 12–14.

Os identificadores dos pedidos, a quitação e a liberação da mesa estão registrados em TESTES/T04, T06 e T12. As capturas usam dados fictícios persistidos e representam telas reais; não substituem regressão integral ou validação em aparelho físico.
