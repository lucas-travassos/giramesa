# Documentação — GiraMesa

Índice da entrega acadêmica e dos guias técnicos mantidos no repositório. O relatório descreve a aplicação integrada com Vue, API Express e MySQL, seus três perfis, pagamentos e dashboard.

## Relatório e evidências

- [Documentação V2 revisada em PDF](<abnt/Documentação GiraMesa v2.pdf>): versão adicionada após a revisão pelo responsável pelo produto, para validação do professor.
- [Documento editável no Google Docs](https://docs.google.com/document/d/12-eQdSeEEJZeOEPau8N1GjBKxeTxzPgJYcZUgGjNt58/edit): origem para ajustes de conteúdo e nova exportação, preservando a formatação atual.
- Diagramas de [casos de uso](diagramas/caso-uso-giramesa.png) e [entidades e relacionamentos](diagramas/der-giramesa.png), com fontes [SVG dos casos de uso](diagramas/caso-uso-giramesa.svg) e [SVG do DER](diagramas/der-giramesa.svg). O [dicionário do banco](diagramas/der-giramesa.txt) detalha campos, chaves e integridade.
- [Interface e capturas](telas/README.md): comportamento das telas e doze imagens reais em [capturas/](telas/capturas/).

## Operação e contratos

- [Instalação e execução](instalacao.md): dependências, ambientes, contas de demonstração e recuperação.
- [SQL inicial](banco/instalacao-inicial.sql), [migrations e backup](banco/migracoes.md) e [dados de demonstração](banco/seed-demo.md).
- API: [pedidos e pagamentos](api/pedidos.md), [dashboard](api/dashboard.md) e [segurança e validações](api/seguranca-validacoes.md). A cobertura documental ainda não inclui todos os recursos; a complementação está no plano.
- [Testes](TESTES.md): matriz com a última evidência por cenário, limites e roteiros reutilizáveis.

## Continuidade do trabalho

- [STATUS](STATUS.md): situação atual e próxima ação.
- [Plano](plano-construcao.md): somente pendências e decisões abertas, atualizado a cada checkpoint.
- [AGENTS.md](../AGENTS.md): contexto estável, arquitetura e regras de trabalho.
- Git e PRs: histórico das mudanças. As versões antigas dos documentos versionados podem ser consultadas pelo Git.

`abnt/` mantém somente o PDF vigente. `apresentacao/` está reservada para o roteiro e os slides. Materiais institucionais de referência continuam locais e ignorados pelo Git; não fazem parte do pacote público. Backups, configurações privadas e dumps de dados permanecem fora do repositório.
