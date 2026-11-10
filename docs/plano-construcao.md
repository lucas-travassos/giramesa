# Pendências de entrega — GiraMesa

Atualizado em 10/11/2026. Este plano contém somente trabalho ainda necessário ou decisões abertas. A cada checkpoint, remover itens concluídos, incorporar decisões estáveis ao AGENTS.md e atualizar STATUS e TESTES. Histórico fica no Git e nos PRs; não acumular diagnósticos ou tabelas de entregas concluídas.

Sistema e documentação: **20/11/2026**. Apresentação: **24/11/2026**. Priorizar correções bloqueadoras e manter uma versão demonstrável.

## Antes da publicação da entrega

| Pendência | Critério de conclusão |
|---|---|
| Completar a documentação da API (15.5) | Documentar login, usuários, mesas, categorias e produtos a partir das rotas/controllers atuais, com perfis, campos, exemplos e erros; reutilizar os contratos existentes |
| Reexecutar a regressão crítica (T20) | Suíte isolada concluída com limpeza dos recursos próprios e resultado registrado em TESTES. As duas tentativas pré-PR de 04/11 pararam por timeout antes do primeiro grupo; a execução anterior de 20 grupos não substitui essa pendência |
| Conferir instalação e recuperação do pacote final | Executar o roteiro aplicável de TESTES, incluindo dependências em ambiente limpo e restauração em destino separado. Registrar o que foi executado e manter explícitos os limites; não usar o banco principal para ensaios destrutivos |

## Validação do professor

| Pendência | Critério de conclusão |
|---|---|
| Receber o parecer da V2 e aplicar ajustes solicitados | Registrar as pendências concretas do parecer, corrigir conteúdo sem mudar o formato e atualizar o PDF vigente |
| Confirmar exigências institucionais ainda abertas | Confirmar se exportação PDF/CSV e recuperação de senha por e-mail são exigidas neste escopo. Esses recursos não estão implementados; não iniciar desenvolvimento nem declarar dispensa sem decisão |

## Apresentação durante a validação

| Pendência | Critério de conclusão |
|---|---|
| Confirmar tempo, formato e critérios de avaliação | Definir duração, uso de slides, demonstração ao vivo ou vídeo e eventual modelo institucional |
| Construir roteiro e slides (15.7) | Explicar problema, objetivos, solução integrada, modelagem e resultados com base no relatório; distribuir o tempo e manter linguagem coerente com o sistema |
| Preparar e ensaiar a demonstração | Demonstrar garçom, caixa e administrador; envio de consumo, pagamento parcial/quitação e dashboard. Usar dados fictícios novos, concluir os pedidos e preparar capturas ou vídeo de contingência |
| Conferir o pacote final após o parecer | Atualizar relatório, diagramas ou capturas apenas se afetados; ensaiar entre 21 e 23/11 e apresentar em 24/11 |

Leitor de tela, aparelho físico, zoom de 200%, carga e queda do MySQL não estão comprovados. Conferir a necessidade desses cenários na validação final; os limites permanecem em TESTES. Não abrir novas funcionalidades durante a preparação da entrega sem aprovação de escopo.
