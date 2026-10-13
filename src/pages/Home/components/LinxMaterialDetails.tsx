import type { LinxFichaMaterial, LinxFichaValor } from '../../../types/linx';

const display = (value: LinxFichaValor | undefined) =>
  value == null || value === ''
    ? 'Não informado'
    : typeof value === 'boolean'
      ? value
        ? 'Sim'
        : 'Não'
      : String(value);
export function LinxMaterialDetails({ material }: { material: LinxFichaMaterial }) {
  const fields = Object.entries(material.dados).filter(
    ([key]) => !/^C\d+$/.test(key) && !/^TAMANHO_\d+$/.test(key)
  );
  const temGrade = Array.from(
    { length: 48 },
    (_, index) => material.dados[`TAMANHO_${index + 1}`]
  ).some((item) => item != null && item !== '');
  return (
    <details className="rounded-lg border border-border bg-surface p-3 text-xs">
      <summary className="cursor-pointer font-semibold">
        Dados originais do Linx — item {material.item}
      </summary>
      <p className="my-3 text-muted">
        Cadastro atual do material + dados da versão da ficha. Fabricante não foi convertido em
        fornecedor; os preços abaixo não são custos calculados.
      </p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 break-words">
        {fields.map(([key, value]) => (
          <div key={key}>
            <dt className="text-muted font-semibold">{key}</dt>
            <dd>{display(value)}</dd>
          </div>
        ))}
      </dl>
      <details className="mt-4">
        <summary className="cursor-pointer font-semibold">
          Consumos C1 a C48 —{' '}
          {temGrade ? 'grade atual do produto' : 'correspondência com tamanhos pendente'}
        </summary>
        <dl className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-3">
          {Array.from({ length: 48 }, (_, index) => `C${index + 1}`).map((key) => (
            <div key={key}>
              <dt className="text-muted">{key}</dt>
              {temGrade && (
                <dt className="font-semibold">
                  {display(material.dados[`TAMANHO_${Number(key.slice(1))}`])}
                </dt>
              )}
              <dd>{display(material.dados[key])}</dd>
            </div>
          ))}
        </dl>
      </details>
      <p className="mt-2 text-muted">
        Consumos são da versão da ficha; os rótulos são da grade atual. A fórmula de custo foi
        comprovada apenas para C1 a C9.
      </p>
      <details className="mt-4">
        <summary className="cursor-pointer font-semibold">
          Cores, gramatura e encolhimentos ({material.cores.length})
        </summary>
        {!material.cores.length ? (
          <p className="mt-2 text-muted">Nenhuma cor vinculada retornada.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {material.cores.map((cor, index) => (
              <dl
                key={`${cor.COR_PRODUTO}-${cor.COR_MATERIAL}-${index}`}
                className="grid sm:grid-cols-2 gap-2 border-t border-border pt-3"
              >
                {Object.entries(cor).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-muted">{key}</dt>
                    <dd>{display(value)}</dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>
        )}
      </details>
    </details>
  );
}
