import { jsPDF } from "jspdf";
import Papa from "papaparse";
import { format } from "date-fns";
import { Transaction } from "@/types";

export const exportToCSV = (transactions: Transaction[], filename = "transactions.csv") => {
  const csvData = transactions.map((tx) => ({
    Date: format(new Date(tx.date), "yyyy-MM-dd"),
    Description: tx.description,
    Category: tx.category,
    Type: tx.type,
    Amount: tx.amount,
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (
  transactions: Transaction[],
  filename = "transactions.pdf",
  formatAmount: (amount: number) => string
) => {
  const doc = new jsPDF();
  let yPosition = 10;

  // Title
  doc.setFontSize(18);
  doc.text("Transaction Report", 10, yPosition);
  yPosition += 12;

  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`, 10, yPosition);
  yPosition += 8;

  // Table headers
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  const headers = ["Date", "Description", "Category", "Type", "Amount"];
  const columnWidths = [30, 50, 35, 25, 30];
  const cellPadding = 3;
  let xPosition = 10;

  // Draw headers
  doc.setFillColor(240, 240, 240);
  headers.forEach((header, i) => {
    doc.rect(xPosition, yPosition, columnWidths[i], 8, "F");
    doc.text(header, xPosition + cellPadding, yPosition + 6);
    xPosition += columnWidths[i];
  });

  yPosition += 10;

  // Table rows
  doc.setFontSize(9);
  transactions.forEach((tx) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 10;
    }

    xPosition = 10;
    const rows = [
      format(new Date(tx.date), "yyyy-MM-dd"),
      tx.description,
      tx.category,
      tx.type,
      formatAmount(tx.amount),
    ];

    rows.forEach((cell, i) => {
      doc.text(cell, xPosition + cellPadding, yPosition + 6);
      xPosition += columnWidths[i];
    });

    yPosition += 8;
  });

  // Summary
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  yPosition += 10;
  doc.setFontSize(11);
  doc.text(`Total Income: ${formatAmount(totalIncome)}`, 10, yPosition);
  yPosition += 8;
  doc.text(`Total Expenses: ${formatAmount(totalExpense)}`, 10, yPosition);
  yPosition += 8;
  doc.setTextColor(0, 100, 0);
  doc.text(`Net Savings: ${formatAmount(netSavings)}`, 10, yPosition);

  doc.save(filename);
};
