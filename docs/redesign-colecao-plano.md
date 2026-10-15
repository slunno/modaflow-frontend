# Redesign da coleção — plano

Reconhecimento: gravação de 48 segundos revisada. `CollectionDetailView.tsx` compõe cabeçalho, navegação, Peças, Painéis, Mix, Metas e Cronograma. `CollectionManagementTabs.tsx` contém Temas, Cores, Estampas, Reservas e seleção de material. `CollectionPrintImageUpload.tsx` mantém upload de imagem com limite de 1 MB. Os modais de insumo e cor usam os componentes existentes de Gestão e os seletores de fornecedor/cor.

1. **Fundação:** reutilizar tokens de `src/index.css` e `components/ui/FichaPrimitives.tsx`; não modificar a paleta global. Acrescentar somente composição e estilos necessários à coleção.
2. **Cabeçalho e abas:** metadados, indicadores derivados, uma ação principal, opções preservadas e dez abas agrupadas. Não alterar identificadores nem parâmetros `marca`/`colecao`.
3. **Temas e Cores:** miniaturas, progresso e prazo; chips de cores; entrega legada preservada em detalhe complementar; filtros compactos, grade/lista, aviso com tentativa de consulta e modal com preview.
4. **Estampas:** imagens em destaque, chips, inclusão de imagem pelo card e formulário de duas colunas com ações fixas.
5. **Reservas:** filtros recolhíveis, informações completas, consumo, formulário com resumo e seletor de materiais acessível. Mesma composição para tecido e aviamento, sem mudar registros salvos.
6. **Demais abas:** cronograma com linha do tempo e tabela; padronizar Peças, Painéis, Mix e Metas, preservando as ações atuais.

Cada fase terá commit próprio e validação de TypeScript, lint e build; testes de fluxo verificarão navegação sem alteração da URL, estados vazios e criação de reserva. Verificação visual em desktop, tela estreita e tema escuro. Aplicação ao projeto em uso preservará alterações concorrentes e o índice Git.

Limites conhecidos: reservas não guardam unidade/código/imagem nem status; buscar apenas no catálogo local disponível, exibindo ausência como informação neutra. `Completos` não possui definição de negócio no código. Painéis são conteúdo editorial fixo; Metas possui indicadores, sem metas numéricas configuradas. Nenhum envio ao Linx será acrescentado. FFmpeg temporário, fora do frontend, foi usado somente para revisar o vídeo.
