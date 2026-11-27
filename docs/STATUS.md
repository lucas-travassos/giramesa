# STATUS — GiraMesa

> Atualizado em 26/11/2026. Pendências no plano, evidências em TESTES e histórico no Git e nos PRs.

## Repositório e entrega

- Cópia ativa em C:/Projetos/giramesa. A entrega acadêmica do commit `314fca1` está integrada à `main` pelo [PR #5](https://github.com/lucas-travassos/giramesa/pull/5), em `2e025fe`. A árvore C:/xampp/htdocs/giramesa corresponde à instalação antiga.
- A pasta `abnt/` contém o relatório final de 31 páginas. O Quadro 1 e as Figuras 18 a 27 documentam dez cenários verificados em 23/11. O DER e as 25 capturas da interface estão indexados em [Documentação](README.md).
- A pasta `apresentacao/` reúne slides, vídeo e roteiro. O [README da raiz](../README.md) apresenta o projeto, as evidências e as lições aprendidas, com a captura atualizada do pedido no celular. A revisão do terceiro parecer foi concluída. O relatório atual identifica as ferramentas de teste e traz o DER reorganizado, com o sumário conferido na exportação. Os slides incluem o contexto de mercado e mantêm a demonstração original.

## Ambiente e validação

- Ambiente de referência com MySQL 8.4.13 em Docker Compose (3309), API (3001) e Vite (5173). As capturas de teste foram produzidas em ambientes temporários e os recursos de teste foram encerrados. O volume de referência é `giramesa_dados_mysql`.
- Em 25/11, `npm test` aprovou 20 grupos em banco descartável. O build e a inspeção ESLint de `src/` também passaram. A ocorrência intermitente anterior na checagem de limite de login consta em TESTES/T22. As verificações manuais e documentais constam separadamente na matriz.
- Backups privados preservados em C:/Backups/GiraMesa/20261104 e 20261028. A cobertura dos demais contratos da API e a instalação em ambiente limpo seguem no plano.
