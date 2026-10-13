import { ProductOptionField } from './ProductOptionField';

interface Props {
  storageKey: string;
  produto: string;
  tipo: 'tecido' | 'aviamento';
  value: string;
  onChange: (value: string) => void;
}

export function ProductUsoField({ storageKey, produto, tipo, value, onChange }: Props) {
  return (
    <ProductOptionField
      storageKey={storageKey}
      produto={produto}
      label={`Uso do ${tipo}`}
      placeholder="Clique para escolher ou cadastrar um uso"
      listLabel={`Usos de ${tipo} salvos para ${produto}`}
      saveLabel="Salvar uso"
      savedMessage={`Uso de ${tipo} salvo para as peças de ${produto} em todas as marcas.`}
      emptyMessage="Nenhum uso salvo para este tipo de peça."
      description={
        produto.trim()
          ? `Usos de ${tipo} compartilhados entre as peças de ${produto} em todas as marcas.`
          : 'Identifique o tipo de peça para cadastrar usos.'
      }
      value={value}
      onChange={onChange}
    />
  );
}
