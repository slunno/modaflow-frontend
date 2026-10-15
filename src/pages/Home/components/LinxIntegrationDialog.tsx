import { useEffect, useRef, useState } from 'react';
import type { ColecaoItem, PecaItem } from '../../../types/plm';
import { api } from '../../../services/api';
import { conteudoFicha } from '../../../services/fichaProcesso';
import {
  prepararGravacaoDireta,
  prepararNovaVersao,
  validarReciboGravacao,
} from '../../../services/fichaLinxGravacao';
import type {
  LinxWriteCapability,
  LinxWritePreview,
  LinxWriteReceipt,
} from '../../../types/linxGravacao';
import { Button, Dialog } from '../../../components/ui/FichaPrimitives';

interface Props {
  peca: PecaItem;
  referencia: PecaItem;
  colecao: ColecaoItem;
  marcaId: string;
  onClose: () => void;
  onConfirmada: (receipt: LinxWriteReceipt, preview: LinxWritePreview) => Promise<void>;
}
const valueText = (value: unknown) => (value == null || value === '' ? 'Vazio' : String(value));

export function LinxIntegrationDialog({
  peca,
  referencia,
  colecao,
  marcaId,
  onClose,
  onConfirmada,
}: Props) {
  const [preview, setPreview] = useState<LinxWritePreview | null>(null);
  const [receipt, setReceipt] = useState<LinxWriteReceipt | null>(null);
  const [signaturePreview, setSignaturePreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [allowDiscard, setAllowDiscard] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const newVersion = !peca.linxOrigem;
  const [destination, setDestination] = useState(
    colecao.id.startsWith('linx-') ? (colecao.codigoPill ?? '') : ''
  );
  const [versionDescription, setVersionDescription] = useState(
    peca.fichaTecnica?.nomeProduto || peca.nome
  );
  const [targetLabel, setTargetLabel] = useState('homologação configurada');
  const signature = JSON.stringify([
    conteudoFicha(peca),
    peca.linxReferenciaCopia,
    colecao.id,
    colecao.nome,
    destination,
    versionDescription,
  ]);
  const latest = useRef(signature);
  useEffect(() => {
    latest.current = signature;
  }, [signature]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const stale = !!preview && signature !== signaturePreview;
  const prepare = async () => {
    const candidate = signature;
    setBusy(true);
    setError('');
    setPreview(null);
    setConfirm(false);
    try {
      const capability = await api.get<LinxWriteCapability>('/linx/integracao/capacidade', marcaId);
      if (!capability?.habilitada)
        throw new Error(
          capability?.mensagem || 'Gravador indisponível ou não habilitado no backend.'
        );
      setTargetLabel(`${capability.servidor} / ${capability.banco}`);
      const completion = peca.fichaTecnica?.processo;
      if (!completion?.concluida || completion.concluida.revisao !== completion.revisao)
        throw new Error('Conclua a ficha após a última alteração antes de preparar a gravação.');
      if (latest.current !== candidate) throw new Error('A ficha mudou; confira novamente.');
      const request = newVersion
        ? prepararNovaVersao(
            peca,
            referencia,
            colecao,
            destination,
            versionDescription,
            allowDiscard
          )
        : prepararGravacaoDireta(peca, referencia, colecao, allowDiscard);
      const result = await api.post<LinxWritePreview>(
        newVersion ? '/linx/integracao/versoes/preparar' : '/linx/integracao/preparar',
        request,
        marcaId
      );
      if (!result?.planoId || !Array.isArray(result.alteracoes) || !result.identidade)
        throw new Error(
          'O backend não retornou uma prévia válida. Nenhuma gravação foi solicitada.'
        );
      if (
        result.exigeConfirmacaoGlobal ||
        result.alteracoes.some(
          (change) => change.tabela === 'PRODUTOS' || change.tabela === 'PRODUTO_CORES'
        )
      )
        throw new Error(
          'A prévia atinge um cadastro global compartilhado. Gravação bloqueada para preservar as outras coleções.'
        );
      if (!mounted.current) return;
      if (latest.current !== candidate)
        throw new Error('A ficha mudou durante a preparação. Confira novamente.');
      setSignaturePreview(candidate);
      setPreview(result);
    } catch (cause) {
      if (mounted.current)
        setError(cause instanceof Error ? cause.message : 'Não foi possível preparar a gravação.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const send = async () => {
    if (!preview || !confirm || stale) return;
    if (Date.parse(preview.expiraEm) <= Date.now()) {
      setError('A prévia expirou. Confira novamente.');
      setPreview(null);
      return;
    }
    setBusy(true);
    setError('');
    let committed = false;
    try {
      const result = await api.post<LinxWriteReceipt>(
        newVersion ? '/linx/integracao/versoes/confirmar' : '/linx/integracao/confirmar',
        {
          planoId: preview.planoId,
          confirmar: true,
          confirmarCadastroCompartilhado: false,
        },
        marcaId
      );
      validarReciboGravacao(result, preview, newVersion);
      committed = true;
      if (mounted.current) setReceipt(result);
      await onConfirmada(result, preview);
    } catch (cause) {
      if (mounted.current)
        setError(
          (committed
            ? 'O Linx confirmou, mas não foi possível salvar o recibo no portal. Guarde o identificador abaixo. '
            : 'A confirmação não foi recebida. Consulte o estado no Linx antes de repetir; não há reenvio automático. ') +
            (cause instanceof Error ? cause.message : 'Falha de comunicação.')
        );
    } finally {
      if (mounted.current) {
        setBusy(false);
        setPreview(null);
      }
    }
  };
  return (
    <Dialog
      title="Integração Linx"
      closeLabel="Fechar integração Linx"
      className="max-w-3xl"
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <div className="space-y-4 text-sm" aria-busy={busy}>
        <p className="font-semibold text-status-pending">Alterações pendentes de integração</p>
        <p>
          O botão acompanha as mudanças em toda a ficha. O salvamento automático mantém o rascunho;
          não envia ao Linx.
        </p>
        <div className="rounded-control border border-border bg-surface-muted p-4 space-y-2">
          <h3 className="font-semibold">Gravação direta em homologação</h3>
          <p>
            {peca.linxOrigem
              ? 'Atualizar a Principal na mesma versão vinculada, preservando os dados não alterados.'
              : 'Criar uma nova versão deste código, vinculada à coleção aberta, copiando a referência sem alterá-la.'}
          </p>
          <p>
            Destino: {targetLabel}. Sem prévia confirmada não há gravação. O backend valida o IP,
            banco e vínculo completo com a coleção antes de executar qualquer alteração.
          </p>
          <p>O cadastro global de produto e suas cores não são modificados por esta coleção.</p>
          <p>
            Custo, precificação e preço manual sem destino confirmado ficam no portal. Não serão
            usados como NCM, tributação ou preço global do material.
          </p>
          <p>
            As versões anteriores, variantes adicionais, cores personalizadas e anexos não serão
            enviados. A confirmação abaixo não declara a ficha inteira integrada.
          </p>
        </div>
        {newVersion && !receipt && (
          <section
            aria-label="Nova versão por coleção"
            className="rounded-control border border-border p-4 space-y-3"
          >
            <h3 className="font-semibold">Nova versão para {colecao.nome}</h3>
            <p>
              {peca.linxReferenciaCopia
                ? `Referência: ${peca.linxReferenciaCopia.produto} · ${peca.linxReferenciaCopia.descColecao} · versão ${peca.linxReferenciaCopia.versao}. Somente leitura.`
                : 'Em Geral, digite o código e use “Buscar ficha de referência no Linx” antes de integrar.'}
            </p>
            <label className="block">
              Código Linx da coleção de destino
              <input
                className="block w-full rounded-control border border-border p-2"
                value={destination}
                maxLength={6}
                disabled={busy || !!preview}
                onChange={(event) => setDestination(event.target.value)}
              />
            </label>
            <p className="text-xs text-muted">
              A descrição e a griffe devem corresponder exatamente à coleção aberta. Coleções ainda
              inexistentes no Linx não serão criadas automaticamente.
            </p>
            <label className="block">
              Descrição da nova versão (até 40 caracteres)
              <input
                className="block w-full rounded-control border border-border p-2"
                value={versionDescription}
                maxLength={40}
                disabled={busy || !!preview}
                onChange={(event) => setVersionDescription(event.target.value)}
              />
            </label>
          </section>
        )}
        {peca.linxUltimaGravacao && !receipt && (
          <p className="text-xs text-muted">
            Última gravação parcial:{' '}
            {new Date(peca.linxUltimaGravacao.confirmadaEm).toLocaleString('pt-BR')} ·{' '}
            {peca.linxUltimaGravacao.integracaoId}
          </p>
        )}
        {!receipt && (
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={allowDiscard}
              disabled={busy || !!preview}
              onChange={(event) => setAllowDiscard(event.target.checked)}
            />
            Confirmo o descarte dos materiais removidos desta ficha e de seus vínculos de cor, se
            houver.
          </label>
        )}
        {error && (
          <p role="alert" className="whitespace-pre-line text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        {stale && (
          <p role="alert">A ficha mudou depois da prévia. Confira novamente antes de enviar.</p>
        )}
        {preview && (
          <section aria-label="Prévia da gravação" className="space-y-3">
            <p className="font-semibold">
              Produto {preview.identidade.produto} · Coleção {preview.identidade.colecao} · Versão{' '}
              {preview.identidade.versao}
            </p>
            <div className="max-h-64 overflow-auto rounded-control border border-border">
              <table className="w-full text-xs">
                <caption className="sr-only">Antes e depois dos campos que serão gravados</caption>
                <thead>
                  <tr>
                    <th className="p-2 text-left">Campo / item</th>
                    <th className="p-2 text-left">Antes</th>
                    <th className="p-2 text-left">Depois</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.alteracoes.map((change, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="p-2">
                        {change.tabela}.{change.campo}
                        <br />
                        {Object.values(change.chave).join(' / ')}
                      </td>
                      <td className="p-2 break-words">{valueText(change.antes)}</td>
                      <td className="p-2 break-words">
                        {change.exclusao ? 'Descartar vínculo' : valueText(change.depois)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.avisos.map((warning) => (
              <p key={warning} className="text-xs text-muted">
                {warning}
              </p>
            ))}
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={confirm}
                disabled={busy}
                onChange={(event) => setConfirm(event.target.checked)}
              />
              Conferi o antes e depois e autorizo gravar estes campos no banco de homologação.
            </label>
          </section>
        )}
        {receipt && (
          <section role="status" className="rounded-control border border-border p-4 space-y-2">
            <p className="font-semibold">
              {receipt.escopo === 'NOVA_VERSAO_COLECAO'
                ? 'Nova versão da coleção confirmada pelo backend.'
                : 'Gravação dos campos mapeados confirmada pelo backend.'}
            </p>
            <p>
              {receipt.camposGravados} campo(s)/operação(ões) ·{' '}
              {new Date(receipt.confirmadaEm).toLocaleString('pt-BR')}
            </p>
            <p className="break-all">Recibo: {receipt.integracaoId}</p>
            <p>
              Os campos fora deste escopo continuam somente no portal.{' '}
              {receipt.escopo === 'NOVA_VERSAO_COLECAO'
                ? `Versão ${receipt.identidade.versao} criada; a referência foi preservada.`
                : 'Apenas a versão desta coleção foi atualizada, sem criar outra.'}
            </p>
          </section>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button disabled={busy} onClick={onClose}>
            Entendi
          </Button>
          {!receipt && (
            <Button disabled={busy} onClick={() => void prepare()}>
              {busy ? 'Aguarde…' : 'Conferir envio ao Linx'}
            </Button>
          )}
          {preview && (
            <Button
              variant="primary"
              disabled={busy || stale || !confirm}
              onClick={() => void send()}
            >
              {newVersion ? 'Confirmar nova versão' : 'Confirmar gravação'}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
