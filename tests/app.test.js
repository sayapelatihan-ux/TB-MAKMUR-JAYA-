import test from "node:test";
import assert from "node:assert/strict";
import { authenticateUser, calculateCartTotal, createOrderTransaction, formatCurrency, summarizeTransactions } from "../app.js";

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

test("authenticateUser menerima kredensial user dan admin", () => {
  assert.deepEqual(authenticateUser("user", "user123"), { success: true, role: "user", message: "Login berhasil." });
  assert.deepEqual(authenticateUser("admin", "admin123"), { success: true, role: "admin", message: "Login berhasil." });
  assert.deepEqual(authenticateUser("user", "salah"), { success: false, role: null, message: "Username atau password salah." });
});

test("createOrderTransaction menyimpan data pembayaran dan alamat", () => {
  const transaction = createOrderTransaction({
    user: "user",
    formData: {
      customerName: "Budi",
      phone: "081234567890",
      address: "Jl. Merdeka 12",
      paymentMethod: "QRIS",
      note: "Antar sore"
    },
    cart: [{ name: "Semen Portland", price: 65000, qty: 2 }]
  });

  assert.equal(transaction.customerName, "Budi");
  assert.equal(transaction.paymentMethod, "QRIS");
  assert.equal(transaction.address, "Jl. Merdeka 12");
  assert.equal(transaction.total, 130000);
  assert.equal(transaction.status, "Diproses");
});
