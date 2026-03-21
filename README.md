# actual-budget-import

Microservice that imports bank statement transactions into [Actual Budget](https://actualbudget.org).

Accepts the JSON output of [bankstatement-go](https://github.com/trapped/bankstatement-go)'s `/parse` endpoint and imports it via Actual's official API client.

## Usage

```bash
curl -X POST http://localhost:3000/import-transactions \
  -H 'Content-Type: application/json' \
  -d '{
    "actual": {
      "serverURL": "https://your-actual-instance",
      "password": "your-password",
      "syncId": "your-budget-sync-id",
      "accountId": "your-account-id"
    },
    "bankStatement": {
      "metadata": { "report_date": "2025/03/01", "iban": "...", "holder_name": "..." },
      "transactions": [
        { "date": "2025/03/01", "transaction_date": "2025/03/02", "subject": "PAYMENT", "details": "", "amount": -10.50 }
      ]
    }
  }'
```

## Docker

```bash
docker run -p 3000:3000 ghcr.io/trapped/actual-budget-import:latest
```
