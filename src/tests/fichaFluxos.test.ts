import { describe, expect, it } from 'vitest';
import { ETAPA_INICIAL_FICHA, ETAPAS_FLUXO, proximaEtapaNumerica } from '../services/fichaFluxos';
import { exigeConferencia } from '../services/fichaProcesso';

describe('Sequência de etapas da ficha', () => {
  it('inicia em 01 e exige a conferência apenas no primeiro avanço', () => {
    expect(ETAPA_INICIAL_FICHA).toBe('01 geração de ficha');
    for (let index = 0; index < 19; index++) {
      const atual = ETAPAS_FLUXO[index]!;
      const destino = ETAPAS_FLUXO[index + 1]!;
      expect(proximaEtapaNumerica(atual)).toBe(destino);
      expect(exigeConferencia(atual, destino)).toBe(index === 0);
    }
  });
  it('não avança para as etapas administrativas nem integra automaticamente', () => {
    for (const etapa of [
      '20 Final',
      'FINAL',
      '21 Inicial',
      '22 Integração Linx',
      '23 Revisar ficha técnica / liberar mostruário',
    ]) {
      expect(proximaEtapaNumerica(etapa)).toBe(etapa === '21 Inicial' ? ETAPA_INICIAL_FICHA : null);
    }
    expect(proximaEtapaNumerica('Etapa desconhecida')).toBeNull();
  });
  it('preserva o avanço inicial de peças legadas sem etapa e reconhece os nomes do backend', () => {
    for (const etapa of [undefined, '', '—', 'INICIAL'])
      expect(proximaEtapaNumerica(etapa)).toBe(ETAPA_INICIAL_FICHA);
    expect(proximaEtapaNumerica('GERACAO_FICHA')).toBe('02 engenharia recebimento');
    expect(proximaEtapaNumerica('ENGENHARIA RECEBIMENTO')).toBe('03 modelagem');
    expect(exigeConferencia('GERACAO_FICHA', 'ENGENHARIA RECEBIMENTO')).toBe(true);
  });
});
