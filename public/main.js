const ROW_COUNT = 31;
let currentId = null;

const rowsMount = document.getElementById("rowsMount");
const totalExpensesEl = document.getElementById("totalExpenses");
const totalExpensesMirrorEl = document.getElementById("totalExpensesMirror");
const basicSalaryEl = document.getElementById("basicSalary");
const mobileExpensesEl = document.getElementById("mobileExpenses");
const otherExpensesEl = document.getElementById("otherExpenses");
const grandTotalEl = document.getElementById("grandTotal");
const totalInWordsEl = document.getElementById("totalInWords");
const statusEl = document.getElementById("status");
const areaEl = document.getElementById("metaArea");
const areaOptionsEl = document.getElementById("areaOptions");
const prepaidByEl = document.getElementById("prepaidBy");

function num(input) {
  const value = Number.parseFloat(input);
  return Number.isFinite(value) ? value : 0;
}

function fmt(value) {
  return num(value).toFixed(2);
}

function refreshDateAttrs() {
  rowsMount.querySelectorAll('input[type="date"]').forEach((inp) => {
    inp.dataset.hasValue = inp.value ? "true" : "";
  });
}

function buildRows() {
  for (let i = 1; i <= ROW_COUNT; i += 1) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input name="date-${i}" type="date" /></td>
      <td><input name="from-${i}" /></td>
      <td><input name="to-${i}" /></td>
      <td><input type="number" min="0" step="0.01" class="ta" name="ta-${i}" value="0" /></td>
      <td><input type="number" min="0" step="0.01" class="da" name="da-${i}" value="0" /></td>
      <td><input type="number" min="0" step="0.01" class="nstay" name="nstay-${i}" value="0" /></td>
      <td><input class="money row-total" name="expense-${i}" value="0.00" readonly /></td>
    `;
    rowsMount.appendChild(tr);
  }
}

function recalcTotals() {
  let total = 0;
  const rows = rowsMount.querySelectorAll("tr");
  rows.forEach((tr) => {
    const ta = num(tr.querySelector(".ta")?.value);
    const da = num(tr.querySelector(".da")?.value);
    const nstay = num(tr.querySelector(".nstay")?.value);
    const rowTotal = ta + da + nstay;
    tr.querySelector(".row-total").value = fmt(rowTotal);
    total += rowTotal;
  });

  const basicSalary = num(basicSalaryEl.value);
  const mobile = num(mobileExpensesEl.value);
  const other = num(otherExpensesEl.value);
  const grandTotal = total + basicSalary + mobile + other;

  totalExpensesEl.value = fmt(total);
  totalExpensesMirrorEl.value = fmt(total);
  grandTotalEl.value = fmt(grandTotal);
  totalInWordsEl.value = toWords(Math.round(grandTotal));
}

function collectForm() {
  const rows = [...rowsMount.querySelectorAll("tr")].map((tr, index) => ({
    day: index + 1,
    date: tr.querySelector(`[name="date-${index + 1}"]`).value,
    from: tr.querySelector(`[name="from-${index + 1}"]`).value,
    to: tr.querySelector(`[name="to-${index + 1}"]`).value,
    ta: num(tr.querySelector(`[name="ta-${index + 1}"]`).value),
    da: num(tr.querySelector(`[name="da-${index + 1}"]`).value),
    nstay: num(tr.querySelector(`[name="nstay-${index + 1}"]`).value),
    expense: num(tr.querySelector(`[name="expense-${index + 1}"]`).value)
  }));

  return {
    id: currentId,
    name: document.getElementById("name").value,
    designation: document.getElementById("designation").value,
    month: document.getElementById("month").value,
    area: areaEl.value,
    approvedBy: document.getElementById("approvedBy").value,
    prepaidBy: prepaidByEl.value,
    totals: {
      totalExpenses: num(totalExpensesEl.value),
      basicSalary: num(basicSalaryEl.value),
      mobileExpenses: num(mobileExpensesEl.value),
      otherExpenses: num(otherExpensesEl.value),
      grandTotal: num(grandTotalEl.value),
      totalInWords: totalInWordsEl.value
    },
    rows
  };
}

function patchForm(data) {
  currentId = data.id || null;
  document.getElementById("name").value = data.name || "";
  document.getElementById("designation").value = data.designation || "";
  document.getElementById("month").value = data.month || "";
  areaEl.value = data.area || "";
  document.getElementById("approvedBy").value = data.approvedBy || "";
  prepaidByEl.value = data.prepaidBy || "Zia ur Rehman";

  const rows = data.rows || [];
  rows.forEach((r, i) => {
    const j = i + 1;
    const tr = rowsMount.querySelectorAll("tr")[i];
    if (!tr) {
      return;
    }
    tr.querySelector(`[name="date-${j}"]`).value = r.date ?? "";
    tr.querySelector(`[name="from-${j}"]`).value = r.from ?? "";
    tr.querySelector(`[name="to-${j}"]`).value = r.to ?? "";
    tr.querySelector(`[name="ta-${j}"]`).value = r.ta ?? 0;
    tr.querySelector(`[name="da-${j}"]`).value = r.da ?? 0;
    tr.querySelector(`[name="nstay-${j}"]`).value = r.nstay ?? 0;
  });

  basicSalaryEl.value = data.totals?.basicSalary ?? 0;
  mobileExpensesEl.value = data.totals?.mobileExpenses ?? 0;
  otherExpensesEl.value = data.totals?.otherExpenses ?? 0;
  recalcTotals();
  refreshDateAttrs();
}

function bindEvents() {
  rowsMount.addEventListener("input", (event) => {
    if (event.target instanceof HTMLInputElement) {
      if (event.target.type === "date") {
        event.target.dataset.hasValue = event.target.value ? "true" : "";
      }
      recalcTotals();
    }
  });

  [basicSalaryEl, mobileExpensesEl, otherExpensesEl].forEach((el) => {
    el.addEventListener("input", recalcTotals);
  });

  document.getElementById("printBtn").addEventListener("click", () => {
    window.print();
  });

  document.getElementById("newFormBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  document.getElementById("pdfBtn").addEventListener("click", async () => {
    try {
      setStatus("Preparing PDF...");
      const sheet = document.getElementById("printSheet");
      const month = document.getElementById("month").value || "expense-form";
      const filename = `${month.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`;

      if (!window.html2pdf) {
        throw new Error("PDF library failed to load");
      }

      await window.html2pdf()
        .set({
          margin: 6,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] }
        })
        .from(sheet)
        .save();
      setStatus(`PDF exported: ${filename}`);
    } catch (error) {
      setStatus(error.message || "PDF export failed");
    }
  });

  document.getElementById("saveBtn").addEventListener("click", async () => {
    try {
      setStatus("Saving...");
      const payload = collectForm();
      const response = await fetch("/api/save-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Save failed with status ${response.status}`);
      }
      const result = await response.json();
      currentId = result.id;
      const url = new URL(window.location.href);
      url.searchParams.set("id", currentId);
      window.history.replaceState({}, "", url);
      setStatus(`Saved successfully. Record ID: ${currentId}`);
    } catch (error) {
      setStatus(error.message || "Save failed");
    }
  });
}

async function loadAreaSuggestions() {
  try {
    const response = await fetch("/api/list-expenses");
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    const uniqueAreas = [...new Set((payload.records || []).map((record) => String(record.area || "").trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));

    areaOptionsEl.innerHTML = "";
    uniqueAreas.forEach((area) => {
      const option = document.createElement("option");
      option.value = area;
      areaOptionsEl.appendChild(option);
    });
  } catch {
    // Suggestions are optional; ignore fetch failures.
  }
}

function setStatus(message) {
  statusEl.textContent = message;
}

async function loadIfRequested() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    return;
  }

  try {
    setStatus("Loading saved record...");
    const response = await fetch(`/api/get-expense?id=${encodeURIComponent(id)}`);
    if (!response.ok) {
      throw new Error(`Failed to load record ${id}`);
    }
    const data = await response.json();
    patchForm(data);
    setStatus(`Loaded record ${id}`);
  } catch (error) {
    setStatus(error.message || "Load failed");
  }
}

function toWords(number) {
  if (!Number.isFinite(number) || number < 0) {
    return "Zero Only";
  }
  if (number === 0) {
    return "Zero Only";
  }

  const below20 = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const scales = ["", "Thousand", "Million", "Billion"];

  const chunkToWords = (n) => {
    let result = "";
    const hundred = Math.floor(n / 100);
    const rest = n % 100;

    if (hundred > 0) {
      result += `${below20[hundred]} Hundred `;
    }
    if (rest < 20) {
      result += below20[rest];
    } else {
      const t = Math.floor(rest / 10);
      const u = rest % 10;
      result += `${tens[t]} ${below20[u]}`;
    }
    return result.trim();
  };

  let n = Math.floor(number);
  let words = "";
  let scaleIndex = 0;

  while (n > 0 && scaleIndex < scales.length) {
    const chunk = n % 1000;
    if (chunk > 0) {
      const chunkWords = chunkToWords(chunk);
      const scale = scales[scaleIndex];
      words = `${chunkWords}${scale ? ` ${scale}` : ""} ${words}`.trim();
    }
    n = Math.floor(n / 1000);
    scaleIndex += 1;
  }

  return `${words} Only`;
}

buildRows();
refreshDateAttrs();
bindEvents();
recalcTotals();
loadAreaSuggestions();
loadIfRequested();
