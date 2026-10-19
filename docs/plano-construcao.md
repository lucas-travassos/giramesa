# Plano de construção — GiraMesa

Cada linha é um checkpoint: plano → aprovação → implementação → roteiro de teste → validação do Lucas → commit + push → resumo em `docs/checkpoints/`. Mensagens de commit no padrão `feat: descricao em portugues sem acento` (`fix:` e `docs:` quando couber). Back e front mudando juntos = dois commits, back primeiro.

**Ordem recomendada (foco em entrega e apresentação):** A → D em paralelo (docs:) → B → C (itens selecionados) → E só se sobrar tempo.

## Fase A — Fechar a entrega funcional

| ID | Escopo | Teste esperado | Commit(s) |
|---|---|---|---|
| 11.8 | Dashboard real: endpoint de agregação (só administrador: faturamento do dia, ticket médio, nº de pedidos, vendas por categoria, por forma de pagamento) e integração com os gráficos. Pular se o diagnóstico mostrar que já foi feito | Números batem com pedidos pagos; garçom/caixa não acessam; backend desligado mostra erro | `feat: cria endpoint de dashboard com dados reais de pedidos e pagamentos` / `feat: integra dashboard financeiro com a api` |
| 12.1 | Script `seed:demo` idempotente: histórico de pedidos e pagamentos de vários dias para o dashboard ter o que mostrar | Dashboard populado após rodar o script; rodar 2x não duplica | `feat: cria seed de dados demo para apresentacao` |
| 12.2 | Limpeza: mocks restantes, caminho antigo `@salvar/@remover` do `CrudManager`, código morto | Todas as telas seguem funcionando; build sem warnings novos | `fix: remove mocks e codigo legado do front` |
| 12.3 | README (instalação, `.env.example`, scripts, usuários e senha de demonstração identificados como dados do seed, como rodar front e back) | Seguir o README em máquina limpa funciona | `docs: cria readme com instalacao e execucao` |

## Fase B — UX/UI (o que mais pesa na apresentação)

| ID | Escopo | Teste esperado | Commit |
|---|---|---|---|
| 13.1 | Toasts e modal de confirmação (Bootstrap) substituindo `alert()` e `confirm()` | Nenhum diálogo nativo restante; ações mostram feedback | `feat: troca alert e confirm por toasts e modal de confirmacao` |
| 13.2 | Componentes padrão de carregamento, vazio e erro de rede, aplicados em todas as telas | Spinner ao carregar; mensagem clara com backend desligado | `feat: padroniza estados de carregamento, vazio e erro` |
| 13.3 | Validações de formulário no front (nome vazio, preço negativo, e-mail inválido) espelhando o backend | Entradas inválidas bloqueadas com mensagem por campo | `feat: adiciona validacoes de formulario nos cadastros` |
| 13.4 | Responsividade mobile do fluxo do garçom (pedido com carrinho fixo/colapsável, botões grandes) | Teste em 360px e 390px: salão → pedido → envio | `feat: otimiza fluxo do garcom para mobile` |
| 13.5 | Identidade visual: paleta, tipografia, logo, cores de status das mesas | Visual consistente em todas as telas | `feat: aplica identidade visual do giramesa` |
| 13.6 | Acessibilidade básica: contraste, `aria-label`, foco e teclado | Navegação por Tab nas telas principais | `feat: melhora acessibilidade das telas principais` |

## Fase C — Robustez e escalabilidade do backend

| ID | Escopo | Autorização | Commit |
|---|---|---|---|
| 14.1 | Middleware global de erros e padronização das respostas | — | `feat: cria middleware global de tratamento de erros` |
| 14.2 | `helmet`, rate limit no login, CORS por variável de ambiente | **Pedir:** helmet, express-rate-limit | `feat: adiciona helmet, rate limit no login e cors por ambiente` |
| 14.3 | Snapshot do nome do produto no item do pedido (histórico sobrevive a renomeação); atualizar DER | — | `feat: grava nome do produto no item do pedido` |
| 14.4 | Índices e constraints (ex.: `pedidos.status`, `pedidos.mesa_id`, `pagamentos.pedido_id`) em script SQL versionado | — | `feat: adiciona indices e constraints ao banco` |
| 14.5 | Migrations no lugar de `sync` | **Pedir:** sequelize-cli | `feat: adota migrations do sequelize` |
| 14.6 | Validação de entrada centralizada | **Pedir:** biblioteca de validação | `feat: valida entradas da api com schemas` |
| 14.7 | Testes automatizados dos fluxos críticos (abrir pedido, fechar, pagar/dividir) | **Pedir:** framework de testes + supertest | `feat: cria testes automatizados dos fluxos de pedido e pagamento` |
| 14.8 | Camada de `services` para pedido/pagamento (controllers só orquestram) | — | `feat: extrai regras de pedido e pagamento para services` |

## Fase D — Documentação (commits `docs:`, em paralelo às outras fases)

| ID | Escopo | Depende de | Commit |
|---|---|---|---|
| 15.1 | Estrutura `docs/` e índice | — | `docs: cria estrutura de documentacao` |
| 15.2 | Texto ABNT: resumo, introdução, objetivos, atualizados para o sistema full-stack | Dados da capa e normas da faculdade | `docs: atualiza resumo, introducao e objetivos` |
| 15.3 | Caso de uso e DER atualizados (`categorias`, `pagamentos`, snapshot) | 14.3 | `docs: atualiza caso de uso e der` |
| 15.4 | Descrição das telas com figuras numeradas (desktop e mobile) | Prints do Lucas | `docs: atualiza descricao das telas` |
| 15.5 | Documentação da API (endpoints, perfis, exemplos, erros), gerada a partir do código | — | `docs: documenta a api` |
| 15.6 | Metodologia, matriz de testes executados, resultados, conclusão, referências | Testes e referências do Lucas | `docs: adiciona metodologia, resultados e conclusao` |
| 15.7 | Roteiro de apresentação e de demonstração (passo a passo com as contas de teste) | Formato e tempo da apresentação | `docs: cria roteiro de apresentacao` |

## Fase E — Evolução futura (só após aprovação do Lucas; fora do escopo do semestre)

Deploy (front em Vercel/Netlify; back e banco em Railway/Render) e CI com GitHub Actions; histórico por mesa e cancelamento de item com motivo; fechamento de caixa por turno; estoque básico; KDS com WebSockets; divisão por item consumido; QR Code por mesa; PWA/offline.

## Sugestões de escalabilidade (resumo)

1. **Dados:** snapshot de nome no item, índices, migrations, soft delete mantido.
2. **Código:** services no backend; componentes genéricos no front; contratos de resposta padronizados.
3. **Segurança:** helmet, rate limit, validação de entrada, CORS por ambiente, senhas já em bcrypt, segredos fora do repositório.
4. **Qualidade:** testes dos fluxos de dinheiro e de estado da mesa, que são os mais sensíveis.
5. **Operação:** README, `.env.example`, `seed:demo`, e deploy quando o semestre permitir.