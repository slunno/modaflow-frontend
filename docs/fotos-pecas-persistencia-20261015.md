# Fotos da peça e das variantes — 15/10/2026

As fotos enviadas na aba Variantes agora são gravadas como arquivos e vinculadas à variante antes de confirmar o salvamento. A foto da Principal também aparece no card da coleção e nas miniaturas dos temas.

## Correção

- O envio de foto deixou de incorporar base64 ao JSON de todas as peças. O arquivo usa o armazenamento de anexos existente e o cadastro guarda somente ID, nome e estado de remoção.
- O fluxo local usa IndexedDB; fichas compartilhadas continuam usando a API de anexos do servidor. O limite das fotos deste fluxo acompanha o serviço de anexos: 10 MB.
- O envio aguarda as alterações pendentes, grava o arquivo e seu vínculo, atualiza a prévia e só então mostra “Imagem salva”. A saída da ficha fica indisponível durante essa gravação.
- Uma falha preserva a foto anterior. Se a gravação local do vínculo falhar, o arquivo recém-criado é removido para não virar uma capa sem vínculo.
- A coleção usa a primeira variante como capa. A imagem de outra variante não ocupa uma Principal vazia; remoção explícita impede que croquis antigos reapareçam.
- Fotos antigas em URL/base64 e a galeria anterior continuam sendo reconhecidas. URLs temporárias de exibição são recriadas ao abrir a tela e revogadas ao sair.

O armazenamento local permanece restrito ao navegador e à origem usados pelo portal. Esta correção não migra coleções locais para o servidor nem altera registros do Linx.

## Verificação

- Seis testes novos cobrem fotos independentes, recuperação da ficha e da capa, imagem de 3 MB sem base64 no cadastro, falhas de arquivo/vínculo, confirmação após persistir, remoção, compatibilidade e Principal vazia.
- Conferência no navegador com arquivos SVG de teste: envio pelo seletor de arquivos, retorno à coleção, recarga completa e reabertura das duas variantes. Ambas carregaram com largura natural de 600 px a partir dos arquivos persistidos no IndexedDB.
- Build TypeScript/Vite e ESLint nos arquivos alterados aprovados.
- Suíte completa aprovada: 65 arquivos e 542 testes, incluindo os seis novos cenários de fotos.
- A restauração visual que já estava no diretório de trabalho foi preservada e separada do commit desta correção.

Prévia isolada: `node node_modules/vite/bin/vite.js --config tests/manual/fotos/vite.config.ts`, em `http://127.0.0.1:5195/tests/manual/fotos/index.html`. Dados de teste e arquivos são locais; a API externa está bloqueada.

Evidências: `C:/King-Joe-Projects/outputs/fotos-colecao-persistidas-20261015.jpg` e `C:/King-Joe-Projects/outputs/fotos-variante-persistida-20261015.jpg`.
