import test from "node:test";
import assert from "node:assert/strict";
import { calculateCartTotal, formatCurrency, summarizeTransactions } from "../app.js";

test("formatCurrency menampilkan format rupiah", () => {
  assert.equal(formatCurrency(150000), "Rp 150.000");
});

test("calculateCartTotal menghitung total keranjang", () => {
  const cart = [
    { price: 65000, qty: 2 },
    { price: 145000, qty: 1 }
  ];
  assert.equal(calculateCartTotal(cart), 275000);
});

test("summarizeTransactions menghitung ringkasan keuangan", () => {
  const transactions = [{ id: 1 }, { id: 2 }];
  const cashFlow = [
    { type: "pemasukan", amount: 500000 },
    { type: "pengeluaran", amount: 150000 }
  ];

  const summary = summarizeTransactions(transactions, cashFlow);
  assert.equal(summary.sales, 2);
  assert.equal(summary.income, 500000);
  assert.equal(summary.expense, 150000);
  assert.equal(summary.balance, 350000);
});
