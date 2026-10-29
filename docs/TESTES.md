# Testes — GiraMesa

Atualização: 28/10/2026. Matriz viva: atualizar a mesma linha quando houver nova execução. O histórico de versões fica no Git; não criar arquivo por rodada de testes. Uma aprovação por script não substitui a validação visual.

Base desta consolidação: `f050c2b`, com alterações documentais e SQL locais do 12.3 ainda não commitadas. Referências anteriores: seed implementada em `ffca9bc`, fechamento do 12.1 em `7b1d835` e verificação do frontend em `f050c2b`. Nas próximas execuções, registrar também a base/commit de cada cenário afetado; não atribuir às alterações locais um hash que ainda não existe.

## Fechamento do 12.3 e limite do aceite

README, exemplos de ambiente e SQL inicial preparados. A integração em banco vazio passou por script. Após os bloqueios de ambiente, o roteiro funcional manual na cópia foi aprovado em 28/10: administrador/dashboard, login/permissões, atendimento, pagamento/dashboard e falha/recuperação. Mesa nova 10, consumo quitado de R$ 16,00.

O README agora orienta usar `npm.cmd` no PowerShell. A reconstrução isolada foi disponibilizada em `127.0.0.1:3308` em 28/10, preservando a instalação original. O banco `giramesa_validacao_manual_20261028` foi preparado com dados iniciais e, na última conferência de 28/10, já havia 21 pedidos; o backend da cópia conectava ao destino correto. O arquivo .env do frontend passou a existir, mas o Vite ainda não disponibilizava VITE_API_URL. A definição da URL na sessão do PowerShell permitiu executar e aprovar o roteiro funcional. A tentativa sem a variável da sessão falhou novamente. O 12.3 foi encerrado com aceite funcional e essa limitação explícita; sua investigação e a configuração persistente foram transferidas ao 12.4. A instalação totalmente reproduzível não foi comprovada. Publicação do pacote 12.1–12.3 autorizada por commit/push e PR.

## Matriz de cenários e evidências atuais

| ID | Cenário / resultado esperado | Última evidência | Situação atual |
|---|---|---|---|
| T01 | Instalação inicial: sete tabelas compatíveis com os models e contas fictícias funcionais | 20/10, SQL em banco novo: campos, nulabilidade, seis FKs, DECIMAL(8,2), 3 usuários, 6 mesas e 4 categorias verificados. Reimportação recusada sem alterar registros | Integração por script aprovada; instalação manual completa pendente |
| T02 | Login dos três perfis, senha incorreta e token ausente | Em 28/10, aceite manual: três perfis e senha incorreta aprovados na cópia. API: login 200 e preflight 204; token ausente já testado por HTTP em 20/10 | Funcional aprovado; configuração persistente transferida ao 12.4. Sem mudança no código de login |
| T03 | Permissões: salão/produtos para todos; cadastros e dashboard só administrador; caixa fecha contas | Em 28/10, aceite manual de login/permissões aprovado: menus administrativos restritos e fechamento pelo caixa. Bloqueios HTTP 403 conferidos anteriormente | Roteiro manual aprovado na cópia; repetir após migração |
| T04 | Carrinho: incrementar produto sem duplicar linha; gravar somente no envio | Em 28/10, atendimento manual aprovado na mesa nova 10: mesmo produto em uma linha, quantidade 2, seguido do envio. Persistência antes do envio não foi verificada separadamente | Incremento e envio aprovados; ausência de gravação antes do envio ainda sem evidência específica |
| T05 | Fechar sem consumo bloqueado; reabrir somente antes do primeiro pagamento | Fechamento com consumo e pagamento parcial verificados em 20/10. Não há evidência detalhada dos dois bloqueios neste arquivo | Cobertura específica pendente |
| T06 | Pagamento: partes somam exatamente o consumo; bloquear acima do saldo; finalizar somente com saldo zero | Em 28/10, pagamento manual em partes aprovado, total R$ 16,00 na mesa 10, com liberação da mesa. Em 20/10, R$ 39,34 quitados em duas partes de R$ 19,67. Inspeção encontrou tolerância de R$ 0,01 no backend | Fluxo usual aprovado; correção 14.0 e testes de limites pendentes |
| T07 | Pagamentos simultâneos não duplicam quitação nem deixam estados divergentes | Código atual altera múltiplos registros sem transação; não foi reproduzida falha concorrente nesta revisão | Teste e tratamento de atomicidade pendentes |
| T08 | Seeds: repetir não duplica produtos, pedidos ou pagamentos | Banco vazio em 20/10: 8 produtos iniciais e cenário completo com 21 pedidos, 49 itens, 28 pagamentos; repetição sem alteração. Em 27/10, seed repetida em banco novo da reconstrução sem duplicação | Scripts aprovados; não redefinir senhas do banco atual para testar |
| T09 | Dashboard: pedidos finalizados por data de fechamento; parciais fora até quitação | Em 28/10, dashboard e atualização após quitar R$ 16,00 na mesa 10 aprovados no roteiro manual. Conferência temporal e de agregações por script em 20/10 | Aceite visual aprovado; filtros temporais e exclusão de parciais não foram repetidos isoladamente nesta rodada |
| T10 | Cadastros: histórico de mesa/produto protegido; categorias vinculadas e último administrador ativo preservados | Regras presentes no código; preço zero retornou 400 e cadastro pelo garçom retornou 403 no teste HTTP do 12.3 | Bloqueios específicos ainda sem resultados registrados; testar somente com registros novos |
| T11 | Backend desligado: mensagem clara, sem dados antigos indevidos; recuperar em nova tentativa | Em 28/10, roteiro manual aprovado: login com backend desligado mostrou erro e voltou a funcionar após reiniciar a API, mantendo o frontend | Falha e recuperação do login aprovadas; comportamento de dados antigos em outras telas não foi verificado nesta rodada |
| T12 | Mobile: salão → pedido → envio em 360px e 390px, sem cortes ou sobreposição | Não executado nesta revisão | Pendente, checkpoint 13.4 |
| T13 | Teclado, foco, rótulos e contraste nas telas principais | Não executado nesta revisão | Pendente, checkpoint 13.6 |
| T14 | Build e inspeção estática: sem erros ou avisos | 20/10, `npm run build` e ESLint sem `--fix` aprovados no 12.2; 32 arquivos de src alcançados pelos imports | Repetir quando houver alteração no frontend e antes da entrega |
| T15 | Recuperação do ambiente: dados preservados e instância sem erros InnoDB | Reconstrução isolada aprovada em 27/10. Em 28/10, banco saudável em 127.0.0.1:3308 e roteiro funcional manual aprovado na cópia | Uso funcional aprovado; configuração persistente transferida ao 12.4. Instalação original preservada |

As evidências de 20/10 usaram Node.js 24.19.0, npm 11.17.0 e MariaDB 10.4.32 do XAMPP, com dependências já instaladas. Os scripts foram executados por entrada padrão do Node; ainda não existe um comando versionado que repita a suíte inteira. Não foi validado `npm ci` em outra máquina. O reset de senhas foi testado somente nas três contas fictícias de um banco temporário novo.

Relatórios já versionados: [11.8](checkpoints/11.8-dashboard-real.md), [12.1](checkpoints/12.1-seed-demonstracao.md), [12.2](checkpoints/12.2-verificacao-front.md) e [ajuste de porta](checkpoints/ajuste-porta-api.md). Os backups SQL de recuperação e dados reais permanecem privados, fora do repositório.

## Roteiro curto para aceite do 12.3

1. Confirmar a instância saudável e o banco de teste. Não importar o SQL inicial sobre banco existente; preservar os arquivos de ambiente da instalação atual.
2. Na cópia usada para validação, conferir o procedimento do README, usando `npm.cmd` no PowerShell. Registrar o que foi efetivamente executado: instalação de dependências, importação SQL e seeds; marcar como não executado o que não foi conferido.
3. Iniciar backend e frontend em terminais separados, com portas e URL da API coerentes. Confirmar conexão e resposta da API.
4. Entrar como administrador: conferir salão, cadastros e dashboard. Entrar como caixa e garçom: conferir acesso ao atendimento e ausência dos menus administrativos.
5. Se necessário validar atendimento, cadastrar mesa/produto novos, enviar consumo como garçom e quitar o saldo exato como caixa. Conferir liberação da mesa e atualização do dashboard; não alterar dados de seed.
6. Encerrar somente o backend da cópia; conferir erro na interface. Reiniciar e usar nova tentativa. Concluir qualquer pedido de teste interrompido antes de seguir.
7. Informar os IDs dos cenários aprovados, falhas e passos não executados. Registrar data, ambiente e referência do commit/base nesta matriz. Fechar somente com os limites do aceite explícitos.

## Rotina proposta para as próximas entregas

- Antes de código: definir cenários afetados e um resultado esperado objetivo.
- Qualidade: executar build quando o front mudar e testes repetíveis de API em banco descartável. O comando versionado ainda será implementado no 14.7, com `assert`/`fetch` nativos do Node e sem dependências novas, mediante aprovação do plano.
- Aceite manual: testar as telas afetadas. Antes de PR/entrega, repetir o conjunto crítico T02–T11 e os cenários mobile/acessibilidade aplicáveis.
- Atualizar nesta matriz apenas a última execução: data, ambiente, base/commit, resultado observado e referência da evidência. O Git preserva o resultado anterior.
- Os resultados manuais são informados pelo responsável pelo produto; revisão de agente é evidência distinta e não equivale a esse aceite.
- Proibido usar a suíte para inativar contas ou remover registros de seed. Bancos descartáveis devem ter nome exclusivo e verificação de origem antes de qualquer limpeza.
