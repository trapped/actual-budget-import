import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { makeImportedId } from '../identity.js';

describe('BBVA imported identity', () => {
  const accountId = 'bbva-account';
  const movement = {
    operation_date: '2026/08/03',
    value_date: '2026/07/31',
    date: '2026/07/31',
    transaction_date: '2026/08/03',
    amount: -18.95,
    balance_after: 7936.46,
    subject: 'PAGO CON TARJETA EN RESTAURANTES Y CAFETERIAS',
    details: 'WWW.AMAZON* RE8F12LB5',
  };

  it('matches the same ledger movement across PDF descriptions', () => {
    const informe = {
      ...movement,
      subject: 'Pago tarjeta',
      details: 'AMAZON*RE8F12LB5',
    };
    assert.equal(makeImportedId(movement, accountId), makeImportedId(informe, accountId));
  });

  it('distinguishes repeated payments by their resulting balance', () => {
    const second = { ...movement, balance_after: 7917.51 };
    assert.notEqual(makeImportedId(movement, accountId), makeImportedId(second, accountId));
  });
});
