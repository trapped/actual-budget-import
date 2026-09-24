import crypto from 'node:crypto';

export function toActualAmount(amount) {
  return Math.round(Number(amount) * 100);
}

export function normalizeDate(dateStr) {
  return String(dateStr).replaceAll('/', '-');
}

export function makeImportedId(tx, accountId) {
  if (tx.balance_after !== undefined && tx.balance_after !== null) {
    // BBVA's running balance is shared by extracto and informe and
    // distinguishes repeated payments with identical dates and amounts.
    // Avoid PDF-specific descriptions in the identity.
    const raw = [
      'bbva-v2',
      accountId,
      normalizeDate(tx.operation_date || tx.transaction_date),
      normalizeDate(tx.value_date || tx.date),
      String(toActualAmount(tx.amount)),
      String(toActualAmount(tx.balance_after)),
    ].join('|');
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  // Preserve IDs for formats without a running balance.
  const raw = [
    accountId,
    tx.date ?? '',
    tx.transaction_date ?? '',
    tx.subject ?? '',
    tx.details ?? '',
    String(tx.amount ?? ''),
  ].join('|');
  return crypto.createHash('sha256').update(raw).digest('hex');
}
