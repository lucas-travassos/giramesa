# STATUS — GiraMesa

> Atualizado em 28/10/2026. Contexto atual em STATUS, roteiro no plano, evidências em TESTES e histórico no Git/PRs.

## Repositório e entrega

- Branch: develop. Base anterior ao fechamento: f050c2b. Commit desta etapa: docs: conclui instalacao inicial e consolida testes; consultar git log para o hash após publicação.
- Checkpoints 12.1–12.3 concluídos em develop; integração na main somente por PR. Antes deste fechamento, main estava em 109e749 (PR #1). Conferir o Git antes de retomar; não pressupor que o próximo PR já foi integrado.
- 12.1: seed em ffca9bc e documentação em 7b1d835. 12.2: verificação do frontend em f050c2b. 12.3: README, SQL inicial de sete tabelas, matriz TESTES e planejamento consolidados neste fechamento.
- Aceite funcional manual de 28/10 na cópia aprovado: administrador/dashboard, login/permissões, atendimento, pagamento/dashboard e falha/recuperação. Mesa nova 10; consumo quitado de R$ 16,00.
- Integração por script em banco vazio aprovada em 20/10. Instalação em outra máquina não comprovada. Não repetir todo o roteiro sem mudança ou risco novo.

## Limitação aceita e transferida ao 12.4

- O frontend da cópia só funcionou ao definir VITE_API_URL=http://localhost:3001/api na sessão do PowerShell antes de npm.cmd run dev. Sem a variável temporária, o erro voltou. API e CORS funcionam; causa do não carregamento persistente ainda não identificada. Nenhum arquivo .env foi aberto ou alterado pelo agente.
- A investigação do ambiente temporário foi encerrada neste escopo. O 12.3 fecha com essa limitação explícita; instalação totalmente reproduzível não foi comprovada. Resolver e validar configuração persistente na migração 12.4.

## Ambiente e preservação

- Projeto original: C:/xampp/htdocs/giramesa. Cópia de testes: C:/xampp/htdocs/giramesa_copia, sem Git. Backend na porta 3001; frontend na 5173.
- Banco do aceite: giramesa_validacao_manual_20261028, na instância reconstruída temporária em 127.0.0.1:3308. Havia 21 pedidos antes do atendimento manual; não tratar essa contagem como atual após o teste.
- Instância saudável: C:/xampp/backups/mariadb-reconstruido-20261027-821ebc89. Relatório privado: C:/xampp/backups/reconstrucao-validada-20261027-821ebc89.md. Metadados do teste: C:/xampp/backups/validacao-manual-20261028.json. Conferir processos/portas ao retomar; essa instância não é um serviço definitivo.
- Recuperação isolada em 27/10: 17 bancos restaurados, 68 tabelas conferidas, conteúdo comparado com backup, três logins e escrita/rollback/seed aprovados, logs limpos. Dumps, credenciais e backups são privados; não publicar.
- MariaDB original em C:/xampp/mysql/data (3306) apresentou inconsistências InnoDB. Serviço MySQL 8.0 em 3307 pertence a outra instalação e deve ser preservado. Não remover o XAMPP: repositório e backups ainda estão dentro de C:/xampp.

## Próximo checkpoint: 12.4

- Primeiro conferir Git/PR e atualizar o checkout sem sobrescrever alterações. Desenvolvimento e commits somente em develop; não integrar PR automaticamente.
- Apresentar plano e obter escolha do destino: A) MySQL 8.4 LTS nativo; B) somente banco em Docker Compose, recomendada pela reprodutibilidade. Nenhum destino está aprovado. Ferramentas instaladas não equivalem a autorização para migração.
- Preservar dados e outros projetos; preparar cópias verificadas fora de C:/xampp, restauração e retorno antes de trocar o destino. Não importar tabelas internas mysql.* entre MariaDB e MySQL.
- Node/Vite continuam locais. Validar importação, totais, três perfis, seed, reinício/persistência e configuração do frontend; funcionar com serviços do XAMPP parados. Sem deploy, CI ou containerização da aplicação neste checkpoint.
- Depois: correção financeira 14.0 (tolerância indevida de R$ 0,01 e atomicidade), regressão repetível 14.7 e UX mobile. Falha concorrente ainda não reproduzida.

## Entrega e documentação

- Sistema e documentação prontos até 20/11/2026; apresentação em 24/11/2026. Calendário no plano.
- Não criar novos relatórios por checkpoint; atualizar STATUS/plano/TESTES e documentos afetados. Relatórios históricos preservados.
- Modelos institucionais e feedback estão em docs/referencias/institucional, local e ignorada pelo Git. Conferir modelo aplicável e dados de capa/fontes/formato da apresentação. Documentação acadêmica final editável/PDF, API completa, prints e roteiro ainda pendentes.
