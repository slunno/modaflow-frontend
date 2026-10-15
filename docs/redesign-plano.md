# Plano de redesign — Ficha Técnica

## Reconhecimento
Frontend Vite / React 19 / TypeScript / Tailwind 4 em `C:\King-Joe-Projects\modaflow-frontend`. Composição e cabeçalho: `PecaFichaTecnicaView.tsx`; variantes hoje inline nesse arquivo; modelagem: `FichaModelagemEditor`; insumos: `FichaInsumosEditor` e `FichaInsumoCard`; cadastro compartilhado: `CriarTecidoModal`; anexos: `FichaAnexosPanel`; conferência: `FichaConferenciaPanel`; histórico: `FichaHistoricoPanel`. `GraficosTab` é da coleção; a aba Gráficos da peça ainda é um placeholder. Tokens e tema claro/escuro em `src/index.css`; fonte Fraunces + Plus Jakarta Sans já existente; ícones Lucide e Vitest disponíveis. O CSS `fichaSubmenus.css` reduz atualmente os campos a 11px.

## Fases e validação
0. Mapear a implementação, revisar telas atuais e registrar este plano.
1. Ampliar tokens AKR e criar primitivos acessíveis para cards, status, ações, estados vazios, skeleton, tooltip e diálogo.
2. Compor cabeçalho sticky, ações hierarquizadas, resumo compacto, aviso de rascunho e navegação agrupada das 12 abas existentes. Derivar status sem escrever novos dados.
3. Prioridade: galeria da variante à esquerda, insumos à direita e miniaturas embaixo; seleção com teclado, ampliar, editar, duplicar e remover usando callbacks atuais.
4. Agrupar Geral; transformar anexos em galeria por categorias; melhorar tabela de medidas e salvar fixo de Modelagem.
5. Reorganizar cadastro de tecido/aviamento em formulário e resumo, com essenciais visíveis e técnicos recolhíveis, preservando todos os campos.
6. Substituir placeholder de Gráficos por visualização das informações de etapas realmente disponíveis; linha do tempo e filtros do histórico.
7. Apresentar checklist de três estados e destinos de correção, mantendo a conferência existente.

Ao fim de cada fase: `tsc -b`, `npm run lint`, `npm run build`; testes existentes e novos de seleção de variante / rascunho; revisão visual em desktop, celular e tema escuro. Um commit por fase em `codex/redesign-ficha-20261008`, sobre snapshot isolado do trabalho local anterior; somente o delta do redesign será aplicado ao checkout original.

## Limites e suposições
As cinco capturas mencionadas não vieram no anexo (apenas texto); foram revisadas as telas atuais no navegador antes de escrever código. Manter 12 abas apesar de o enunciado mencionar 11. Não inventar datas ou completude: informação ausente recebe status neutro. Preservar serviços, tipos de negócio, mocks, callbacks de persistência e preparação Linx. Não instalar dependências. A preparação do contrato continua disponível e o envio ERP continua desabilitado.
