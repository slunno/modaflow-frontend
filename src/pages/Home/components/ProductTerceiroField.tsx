import {
  getProductTerceiroKey,
  removeProductTerceiroOption,
} from '../../../services/productTerceiroStorage';
import { ProductOptionField } from './ProductOptionField';

export function ProductTerceiroField({
  produto,
  campo,
  value,
  onChange,
}: {
  produto: string;
  campo: 'tela' | 'tecnica';
  value: string;
  onChange: (value: string) => void;
}) {
  const label = campo === 'tela' ? 'Tela' : 'Técnicas';
  const singular = campo === 'tela' ? 'tela' : 'técnica';
  const plural = campo === 'tela' ? 'Telas' : 'Técnicas';
  const key = getProductTerceiroKey(produto, campo);
  return (
    <ProductOptionField
      storageKey={key}
      produto={produto}
      label={label}
      placeholder={`Clique para escolher ou cadastrar uma ${singular}`}
      listLabel={`${plural} salvas para ${produto}`}
      saveLabel={`Salvar ${singular}`}
      savedMessage={`${label === 'Tela' ? 'Tela salva' : 'Técnica salva'} para as peças de ${produto} em todas as marcas.`}
      emptyMessage={`Nenhuma ${singular} salva para este tipo de peça.`}
      description={
        produto.trim()
          ? `${plural} de Terceiros compartilhadas entre as peças de ${produto} em todas as marcas.`
          : 'Identifique o tipo de peça para cadastrar opções.'
      }
      removeOption={(option) => removeProductTerceiroOption(key, option)}
      value={value}
      onChange={onChange}
    />
  );
}
