# Plano de construção — GiraMesa

Cada linha é uma entrega pequena: plano → aprovação → implementação → teste dos cenários afetados → aceite → commit + push. STATUS guarda o contexto atual; TESTES guarda a última execução por cenário; Git e PRs guardam o histórico. Não criar relatório por checkpoint. Mensagens de commit no padrão `feat: descricao em portugues sem acento` (`fix:` e `docs:` quando couber). Backend e frontend em commits separados, com backend primeiro.

**Legenda de status:** ✅ concluído · 🔄 em andamento · ⏳ pendente. O agente marca o status do item ao fechar cada checkpoint (junto com o `docs/STATUS.md`). Itens ainda sem marca são ⏳.

## Datas e compromisso de entrega

- **Entrega do sistema funcionando e documentação pronta: 20/11/2026.**
- **Apresentação: 24/11/2026.**
- Meta: estabilizar as funcionalidades até 13/11; 14–17/11 para regressão e correções; 18–19/11 para empacotamento e revisão final. De 21–23/11, ensaio e somente correções bloqueadoras.
- Documentação acadêmica começa em paralelo agora. Não depende de finalizar toda a UX para redigir objetivos, metodologia, API e regras já implementadas.

| Janela-alvo | Resultado esperado |
|---|---|
| 27–30/10 | Disponibilizar banco saudável para teste, aceitar e fechar 12.3, abrir PR do pacote atual; definir e executar 12.4 em entrega separada |
| 31/10–06/11 | Concluir o pacote de robustez 14 e iniciar formulários/mobile (13.3/13.4); textos acadêmicos/API em paralelo |
| 07–13/11 | Finalizar estados e feedback, identidade visual e acessibilidade básica; produzir figuras e consolidar o texto técnico |
| 14–17/11 | Regressão integral, instalação/restauração final, correção de bloqueadores, revisão de DER/caso de uso e ABNT |
| 18–19/11 | Congelar funcionalidades; finalizar fontes editáveis, PDF, prints e pacote demonstrável; conferir checklist de entrega |
| 20/11 | Entregar sistema, instruções reproduzíveis e documentação final |
| 21–23/11 | Ensaiar demonstração com os três perfis e preparar alternativa caso falhe a demonstração ao vivo |
| 24/11 | Apresentação |

As janelas são metas de trabalho. Se houver desvio, preservar funcionamento, testes e documentação; adiar as evoluções classificadas como pós-entrega.

## Ordem e limites de escopo

1. 12.3 concluído com aceite funcional em 28/10. A configuração persistente do frontend foi transferida ao 12.4; a variável de sessão mantém a cópia demonstrável. Não prolongar a investigação do ambiente temporário.
2. Estabilizar o ambiente (12.4) e corrigir os riscos financeiros (14.0), com testes repetíveis (14.7), antes de ampliar o acabamento visual.
3. Executar UX e documentação em paralelo, mantendo uma versão demonstrável.
4. Usar [TESTES.md](TESTES.md) como roteiro único e registro atual. Reexecutar o conjunto crítico antes de PR e entrega; não repetir testes sem mudança ou risco novo.
5. Usar a stack aprovada. Helmet e express-rate-limit fazem parte do pacote 14; migrations e schemas usam Node/Sequelize existentes, sem bibliotecas adicionais. Agrupar mudanças relacionadas com uma validação consolidada.

## Trabalho paralelo

O agente principal integra backend, alterações compartilhadas, STATUS, plano, TESTES e commits. Com plano aprovado, agentes podem assumir frontend, revisão/testes e documentação acadêmica em arquivos distintos. Qualidade usa banco descartável próprio e reporta resultados, sem aprovar automaticamente a própria implementação. Proibir edições concorrentes do mesmo arquivo e compartilhamento de fixtures entre agentes.

Na revisão deste plano, dois agentes atuaram somente em leitura: prioridades técnicas e fluxo de documentação/testes. Nenhuma implementação paralela foi iniciada. Novas frentes recebem responsabilidade por arquivos e critério de aceite antes da execução.

## Fase A — Fechar a entrega funcional

O PR #2 integrou 12.1–12.3 na main em 29/10/2026 (b29434b). A entrega seguinte reúne o ambiente 12.4 e o bloco 14. Não abrir novo PR ou fazer merge sem solicitação.

| ID | Escopo | Teste esperado | Commit(s) |
|---|---|---|---|
| 11.8 ✅ | Dashboard real: endpoint de agregação só para administrador e integração dos gráficos. Critério aprovado: pedidos finalizados por data de fechamento, dia de São Paulo. Implementado, validado e integrado na main pelo PR #1 | Números batem com pedidos pagos; garçom/caixa não acessam; backend desligado mostra erro | `d565fa1` backend / `174d3eb` frontend / `e6e5a7a` documentação / `109e749` merge |
| 12.1 ✅ | Script `seed:demo` idempotente: histórico de pedidos e pagamentos dos últimos sete dias. Implementado, aplicado ao banco de demonstração e validado por script e pelo roteiro manual; concluído em develop | Dashboard populado após rodar o script; rodar 2x não duplica | `ffca9bc` backend / commit `docs:` de fechamento |
| 12.2 ✅ | Verificação de mocks, caminho antigo `@salvar/@remover` e código sem uso: não foram encontrados remanescentes nas verificações realizadas. ESLint e build aprovados; sem alterações no frontend. Concluído em develop | Inspeção, ESLint e build sem erros ou avisos; validação manual anterior registrada no 12.1 | `docs: registra verificacao do frontend no checkpoint 12.2` |
| 12.3 ✅ | README, SQL inicial e matriz de testes consolidados. Integração HTTP em banco vazio e roteiro funcional manual aprovados (28/10, mesa 10, R$ 16,00). Configuração persistente transferida ao 12.4; instalação totalmente reproduzível não comprovada | Evidências e limites em TESTES; cópia funciona com VITE_API_URL na sessão | `docs: conclui instalacao inicial e consolida testes` |
| 12.4 ✅ | Ambiente local sem XAMPP: somente MySQL 8.4.13 em Docker Compose, volume persistente e Node/Vite locais. Cópias externas, importação de três bancos/21 tabelas e totais conferidos; Compose, configuração persistente e reinício/persistência aprovados. SQL inicial, seed 2x e perfis HTTP aprovados. Aceite visual mínimo aprovado em 29/10; origem antiga 3308 agora está no EstoqueFacil | Importação SQL, registros e totais preservados, três perfis, seed, reinício e persistência; funcionar com serviços do XAMPP parados | Definir no fechamento após validação |

### Escopo proposto do 12.4

- A recuperação validada já permite executar a cópia. Migrar para um ambiente definitivo e resolver a configuração persistente de VITE_API_URL, validando reinício sem variável temporária. Não confundir recuperação com migração definitiva.
- **Destino definido:** opção B, somente MySQL 8.4.13 em Docker Compose, volume persistente e porta 127.0.0.1:3309. Node/Vite locais em C:/Projetos/giramesa. Docker operacional após atualização para 4.97.0; destino importado e validado por scripts contra o dump externo. A porta 3308 passou a pertencer ao EstoqueFacil; origem online não revalidada. Aplicação nova usa somente 3309. Aceite visual mínimo aprovado em 29/10; publicação ainda pendente.
- Preservar o serviço MySQL 8.0 existente na porta 3307 e os bancos de outros projetos. Migrar os bancos identificados como GiraMesa por SQL; criar contas de serviço no destino, sem importar tabelas internas mysql.* entre MariaDB e MySQL.
- Conferir restauração, conteúdo, permissões e totais antes de alterar o destino usado pela aplicação. Planejar retorno ao ambiente anterior caso a validação falhe.
- Atualizar README, exemplos de ambiente e instruções de testes; manter `compose.yaml` com somente o serviço de banco. Não adicionar bibliotecas à aplicação para essa migração.
- A nova configuração do projeto não deve depender de executáveis, Apache ou diretórios do XAMPP. Como o repositório e os backups atuais ficam dentro de C:/xampp, planejar cópias verificadas fora dessa pasta antes de qualquer desinstalação. Não mover a árvore com alterações locais sem preservá-las.
- Containerização da API/frontend, deploy e CI ficam para uma etapa futura; não entram automaticamente neste escopo.

## Fase B — UX/UI dos fluxos de atendimento e administração

| ID | Escopo | Teste esperado | Commit |
|---|---|---|---|
| 13.1 | Conferir e padronizar o feedback existente com Bootstrap, reutilizando modais/alerts. A inspeção de 27/10 não encontrou alert() ou confirm(); evitar recriar o que já funciona | Ações relevantes mostram sucesso/erro e remoções têm confirmação; validar antes de implementar novos componentes | Definir conforme diferenças encontradas |
| 13.2 | Componentes padrão de carregamento, vazio e erro de rede, aplicados em todas as telas | Spinner ao carregar; mensagem clara com backend desligado | `feat: padroniza estados de carregamento, vazio e erro` |
| 13.3 | Validações de formulário no front (nome vazio, preço negativo, e-mail inválido) espelhando o backend | Entradas inválidas bloqueadas com mensagem por campo | `feat: adiciona validacoes de formulario nos cadastros` |
| 13.4 | Responsividade mobile do fluxo do garçom (pedido com carrinho fixo/colapsável, botões grandes) | Teste em 360px e 390px: salão → pedido → envio | `feat: otimiza fluxo do garcom para mobile` |
| 13.5 | Identidade visual: paleta, tipografia, logo, cores de status das mesas | Visual consistente em todas as telas | `feat: aplica identidade visual do giramesa` |
| 13.6 | Acessibilidade básica: contraste, `aria-label`, foco e teclado | Navegação por Tab nas telas principais | `feat: melhora acessibilidade das telas principais` |

## Fase C — Segurança do fluxo financeiro e robustez

Os itens 14.1–14.8 compõem uma entrega conjunta antes da publicação. Implementação, regressão de 20 grupos e aceite visual consolidado aprovados em 04/11/2026. Publicação organizada em backend/ambiente, frontend e documentação.

| ID | Escopo | Prioridade / autorização | Commit previsto |
|---|---|---|---|
| 14.0 ✅ | Corrigir a tolerância indevida de R$ 0,01: calcular/validar saldo em centavos, bloquear excesso e finalizar somente em zero. Tornar fechamento/pagamentos/reabertura atômicos com transação/bloqueio adequados | Implementação local autorizada em 29/10: centavos, transações e bloqueios no atendimento. Verificações de sintaxe/helper e 13 grupos de integração aprovados em 29/10; quatro passos financeiros aprovados manualmente em 29/10; publicação nesta entrega | `fix: corrige saldo e consistencia do fechamento` |
| 14.1 ✅ | Middleware comum para erros HTTP, JSON inválido/excedente e falhas de persistência; respostas sempre em JSON | Implementado e testado em 04/11; aceite conjunto aprovado em 04/11 | `fix: padroniza erros da api` |
| 14.2 ✅ | Helmet 8.3.0, express-rate-limit 8.7.2 no login, CORS configurável e perfil/situação atuais no token | Implementado; headers/CORS/429/retomada e revogação de permissões aprovados por script em 04/11; aceite conjunto aprovado em 04/11 | `feat: protege acesso e login da api` |
| 14.3 ✅ | nome_produto no item, backfill, exibição pelo snapshot e DER atualizado; bloqueio de renomeação do produto vendido mantido | Implementado; migração e snapshot aprovados por script em 04/11; conferência visual aprovada em 04/11 | `feat: preserva nome do produto no pedido` |
| 14.4 ✅ | Checks de valores/quantidades e índice pedidos(status,data_fechamento) em migration versionada; sem duplicar índices de FKs | Aplicado e testado em 04/11; não há alegação de ganho medido de desempenho; aceite conjunto aprovado em 04/11 | `feat: reforca integridade do banco` |
| 14.5 ✅ | Migrador Node/Sequelize com advisory lock, checksum e retomada idempotente; backup SQL fora do repositório | Preflight, backfill, repetição, checksum e restauração aprovados; aplicado no banco da API com dados anteriores preservados em 04/11; aceite conjunto aprovado em 04/11 | `feat: versiona evolucao do banco` |
| 14.6 ✅ | Schemas nativos para campos, IDs, enums, dinheiro e cadastros, mantendo senha vazia na edição | Implementado e testado em 04/11, sem nova biblioteca; aceite conjunto aprovado em 04/11 | `feat: centraliza validacoes da api` |
| 14.7 ✅ | npm test usa container MySQL e API próprios, portas livres, fixtures novas e limpeza por identidade | 20 grupos aprovados em 04/11, sem acesso a credenciais/volumes do banco principal. Aceite financeiro anterior de 29/10 preservado; validação visual das adições aprovada em 04/11 | `feat: amplia verificacao dos fluxos criticos` |
| 14.8 ✅ | Regras transacionais em pedidoService e alterações de contas em usuarioService; controllers com HTTP e validação | Implementado; regressão financeira e concorrência do último administrador aprovadas em 04/11. Cadastros simples permanecem nos controllers; aceite conjunto aprovado em 04/11 | `feat: separa regras de pedidos e usuarios` |

## Fase D — Documentação final em paralelo, obrigatória até 20/11

| ID | Escopo | Depende de | Commit |
|---|---|---|---|
| 15.1 ✅ | Estrutura docs e índice existentes. Operação consolidada em STATUS/plano/TESTES; manter relatórios antigos como arquivo | Estrutura registrada no Git | `077d732` e revisões posteriores |
| 15.2 | Texto ABNT: resumo, introdução, objetivos, atualizados para o sistema full-stack | Conferir os modelos institucionais locais e confirmar os dados da capa | `docs: atualiza resumo, introducao e objetivos` |
| 15.3 | Caso de uso e DER conforme o schema efetivamente entregue, incluindo categorias e pagamentos | Incluir snapshot implementado e separar schema_migrations das entidades de domínio | `docs: atualiza caso de uso e der` |
| 15.4 | Descrição das telas com figuras numeradas (desktop e mobile) | Capturas das telas desktop e mobile | `docs: atualiza descricao das telas` |
| 15.5 | Documentação da API (endpoints, perfis, exemplos, erros), gerada a partir do código | — | `docs: documenta a api` |
| 15.6 | Metodologia, matriz de testes executados, resultados, conclusão, referências | Registros dos testes executados e fontes consultadas | `docs: adiciona metodologia, resultados e conclusao` |
| 15.7 | Roteiro de apresentação e de demonstração (passo a passo com as contas de teste) | Formato e tempo da apresentação | `docs: cria roteiro de apresentacao` |

Situação documental: há uma versão anterior em PDF, caso de uso em imagem e DER textual. Modelos institucionais e feedback do professor já estão disponíveis localmente em `docs/referencias/institucional/`, pasta ignorada pelo Git; conferir qual modelo se aplica antes de solicitar material novamente. Texto acadêmico final editável, documentação completa da API, capturas de tela, resultados/conclusão/referências finais e roteiro de apresentação continuam pendentes. Confirmar dados de capa, critérios aplicáveis, fontes utilizadas e duração/formato da apresentação. Não inventar referências, resultados ou figuras.

## Critério do pacote de entrega

- Instalação e restauração reproduzíveis; ambiente escolhido documentado e dados fictícios disponíveis.
- Três perfis funcionando; atendimento, pagamentos e estados consistentes; regressão financeira aprovada e erro de rede tratado.
- Fluxo do garçom utilizável em 360/390px, cadastros validados e apresentação visual coerente.
- README, documentação acadêmica final em formato editável e PDF, DER/caso de uso, API, figuras e matriz de resultados conferidos.
- Roteiro demonstrável ensaiado antes de 24/11, com backup verificado e alternativa de demonstração caso a execução ao vivo falhe.

## Fase E — Evolução futura (depende de aprovação de escopo; fora da entrega do semestre)

Deploy (front em Vercel/Netlify; back e banco em Railway/Render) e CI com GitHub Actions; histórico por mesa e cancelamento de item com motivo; fechamento de caixa por turno; estoque básico; KDS com WebSockets; divisão por item consumido; QR Code por mesa; PWA/offline.

## Sugestões de escalabilidade (resumo)

1. **Dados:** snapshot de nome no item, índices, migrations, soft delete mantido.
2. **Código:** services no backend; componentes genéricos no front; contratos de resposta padronizados.
3. **Segurança:** helmet, rate limit, validação de entrada, CORS por ambiente, senhas já em bcrypt, segredos fora do repositório.
4. **Qualidade:** testes dos fluxos de dinheiro e de estado da mesa, que são os mais sensíveis.
5. **Operação:** README, `.env.example`, `seed:demo`, e deploy quando o semestre permitir.
