const listMount = document.getElementById("recordsList");
const statusEl = document.getElementById("recordsStatus");

function setStatus(message) {
  statusEl.textContent = message;
}

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function createCard(record) {
  const article = document.createElement("article");
  article.className = "record-card";
  article.innerHTML = `
    <h3>${record.name || "Unnamed"} - ${record.month || "No month"}</h3>
    <p><strong>Area:</strong> ${record.area || "N/A"}</p>
    <p><strong>Designation:</strong> ${record.designation || "N/A"}</p>
    <p><strong>Grand Total:</strong> ${Number(record.totals?.grandTotal || 0).toFixed(2)}</p>
    <p><strong>Saved:</strong> ${formatDate(record.updatedAt || record.createdAt)}</p>
    <div class="record-actions">
      <a href="index.html?id=${encodeURIComponent(record.id)}">Edit</a>
      <a href="index.html?id=${encodeURIComponent(record.id)}" target="_blank" rel="noopener noreferrer">Open for Print</a>
      <button type="button" class="ghost" data-duplicate-id="${record.id}">Duplicate</button>
      <button type="button" class="danger" data-delete-id="${record.id}">Delete</button>
    </div>
  `;
  return article;
}

async function duplicateRecord(id) {
  const sourceResponse = await fetch(`/api/get-expense?id=${encodeURIComponent(id)}`);
  if (!sourceResponse.ok) {
    throw new Error(`Load failed with status ${sourceResponse.status}`);
  }

  const source = await sourceResponse.json();
  const clone = {
    ...source,
    id: null,
    createdAt: null,
    updatedAt: null
  };

  const saveResponse = await fetch("/api/save-expense", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clone)
  });

  if (!saveResponse.ok) {
    throw new Error(`Duplicate failed with status ${saveResponse.status}`);
  }

  return saveResponse.json();
}

async function deleteRecord(id) {
  const response = await fetch(`/api/delete-expense?id=${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    throw new Error(`Delete failed with status ${response.status}`);
  }
}

async function loadRecords() {
  try {
    setStatus("Loading saved pages...");
    const response = await fetch("/api/list-expenses");
    if (!response.ok) {
      throw new Error(`List failed with status ${response.status}`);
    }

    const payload = await response.json();
    const records = payload.records || [];

    listMount.innerHTML = "";
    if (records.length === 0) {
      setStatus("No saved pages found yet.");
      return;
    }

    records
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .forEach((record) => {
        listMount.appendChild(createCard(record));
      });

    setStatus(`${records.length} saved page(s) loaded.`);
  } catch (error) {
    setStatus(error.message || "Unable to fetch saved pages");
  }
}

loadRecords();

listMount.addEventListener("click", async (event) => {
  if (!(event.target instanceof HTMLButtonElement)) {
    return;
  }

  const duplicateId = event.target.dataset.duplicateId;
  if (duplicateId) {
    try {
      setStatus("Duplicating record...");
      const result = await duplicateRecord(duplicateId);
      setStatus("Record duplicated. Opening cloned form...");
      window.location.href = `index.html?id=${encodeURIComponent(result.id)}`;
    } catch (error) {
      setStatus(error.message || "Duplicate failed");
    }
    return;
  }

  const id = event.target.dataset.deleteId;
  if (!id) {
    return;
  }

  const proceed = window.confirm("Delete this saved page?");
  if (!proceed) {
    return;
  }

  try {
    setStatus("Deleting record...");
    await deleteRecord(id);
    setStatus("Record deleted.");
    await loadRecords();
  } catch (error) {
    setStatus(error.message || "Delete failed");
  }
});

document.getElementById("refreshBtn").addEventListener("click", loadRecords);
