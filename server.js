import express from 'express';
import * as api from '@actual-app/api';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const app = express();
app.use(express.json({ limit: '2mb' }));

function toActualAmount(amount) {
  return Math.round(Number(amount) * 100);
}

function normalizeDate(dateStr) {
  return String(dateStr).replaceAll('/', '-');
}

function makeImportedId(tx, accountId) {
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

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/import-transactions', async (req, res) => {
  const tempDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'actual-import-'));

  try {
    const {
      actual,
      bankStatement,
      options = {},
    } = req.body ?? {};

    const {
      serverURL,
      password,
      syncId,
      accountId,
      encryptionPassword,
    } = actual ?? {};

    if (!serverURL || !password || !syncId || !accountId) {
      return res.status(400).json({
        error:
          'Missing required actual fields: serverURL, password, syncId, accountId',
      });
    }

    if (!bankStatement || !Array.isArray(bankStatement.transactions)) {
      return res.status(400).json({
        error: 'bankStatement.transactions must be an array',
      });
    }

    await api.init({
      dataDir: tempDataDir,
      serverURL,
      password,
    });

    if (encryptionPassword) {
      await api.downloadBudget(syncId, { password: encryptionPassword });
    } else {
      await api.downloadBudget(syncId);
    }

    const transactions = bankStatement.transactions.map((tx) => ({
      date: normalizeDate(tx.transaction_date || tx.date),
      amount: toActualAmount(tx.amount),
      payee_name: tx.details || tx.subject || 'Unknown',
      imported_payee: tx.details || tx.subject || 'Unknown',
      notes: tx.subject || '',
      imported_id: makeImportedId(tx, accountId),
    }));

    const result = await api.importTransactions(accountId, transactions, {
      defaultCleared: options.defaultCleared ?? true,
      dryRun: options.dryRun ?? false,
      reimportDeleted: options.reimportDeleted ?? false,
    });

    await api.sync();

    return res.json({
      ok: true,
      importedCount: transactions.length,
      added: result.added ?? [],
      updated: result.updated ?? [],
      errors: result.errors ?? [],
      preview: transactions.slice(0, 5),
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      stack: process.env.NODE_ENV === 'production' ? undefined : err?.stack,
    });
  } finally {
    try {
      await api.shutdown();
    } catch {}

    try {
      await fs.rm(tempDataDir, { recursive: true, force: true });
    } catch {}
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Actual importer listening on :${port}`);
});
