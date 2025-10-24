// Sundays list: exact dates with Greek labels
const SUNDAYS = [
  { key: "2025-10-05", label: "Κυριακή 5 Οκτωβρίου 2025" },
  { key: "2025-10-12", label: "Κυριακή 12 Οκτωβρίου 2025" },
  { key: "2025-10-19", label: "Κυριακή 19 Οκτωβρίου 2025" },
  { key: "2025-10-26", label: "Κυριακή 26 Οκτωβρίου 2025" },
  { key: "2025-11-02", label: "Κυριακή 2 Νοεμβρίου 2025" },
  { key: "2025-11-16", label: "Κυριακή 16 Νοεμβρίου 2025" },
  { key: "2025-11-23", label: "Κυριακή 23 Νοεμβρίου 2025" },
  { key: "2025-11-30", label: "Κυριακή 30 Νοεμβρίου 2025" },
  { key: "2025-12-07", label: "Κυριακή 7 Δεκεμβρίου 2025" },
  { key: "2025-12-14", label: "Κυριακή 14 Δεκεμβρίου 2025" },
  { key: "2026-01-11", label: "Κυριακή 11 Ιανουαρίου 2026" },
  { key: "2026-01-18", label: "Κυριακή 18 Ιανουαρίου 2026" },
  { key: "2026-01-25", label: "Κυριακή 25 Ιανουαρίου 2026" },
  { key: "2026-02-01", label: "Κυριακή 1 Φεβρουαρίου 2026" },
  { key: "2026-02-08", label: "Κυριακή 8 Φεβρουαρίου 2026" },
  { key: "2026-02-15", label: "Κυριακή 15 Φεβρουαρίου 2026" },
  { key: "2026-02-22", label: "Κυριακή 22 Φεβρουαρίου 2026" },
  { key: "2026-03-01", label: "Κυριακή 1 Μαρτίου 2026" },
  { key: "2026-03-08", label: "Κυριακή 8 Μαρτίου 2026" },
  { key: "2026-03-15", label: "Κυριακή 15 Μαρτίου 2026" },
  { key: "2026-03-22", label: "Κυριακή 22 Μαρτίου 2026" },
  { key: "2026-03-29", label: "Κυριακή 29 Μαρτίου 2026" },
  { key: "2026-04-05", label: "Κυριακή 5 Απριλίου 2026" }
];

// Prefilled Ευαγγέλια (blank for unspecified)
const DEFAULT_GOSPELS = {
  "2025-10-05": { pericope: "Λουκ. στ’ 31-36", page: "263-264" },
  "2025-10-12": { pericope: "Λουκ. η΄ 5-15", page: "274-275" },
  "2025-10-19": { pericope: "Λουκ. ζ΄ 11-16", page: "268" },
  "2025-10-26": { pericope: "Λουκ. η’ 27-39", page: "277-278" },
  "2025-11-02": { pericope: "Λουκ. ιστ΄ 19-31", page: "333-334" },
  "2025-11-16": { pericope: "Ματθ. θ΄ 9-13", page: "37" },
  "2025-11-23": { pericope: "Λουκ. ιβ΄ 16–21", page: "307-308" },
  "2025-11-30": { pericope: "Ιωάν. α΄ 35-52", page: "389-391" },
  "2025-12-07": { pericope: "Λουκ. ιγ΄ 10-17", page: "316" },
  "2025-12-14": { pericope: "Λουκ. ιδ΄ 16-24, Ματθ. κβ΄ 14", page: "322-323, 100" }
};

// IndexedDB
const DB_NAME = "presentations-db";
const DB_VERSION = 2; // bump for gospels store
const STORE_OVERVIEWS = "overviews";
const STORE_FILES = "files";
const STORE_ATTENDEES = "attendees";
const STORE_ATTENDANCE = "attendance";
const STORE_GOSPELS = "gospels"; // { dateKey, pericope, page }

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_OVERVIEWS)) {
        db.createObjectStore(STORE_OVERVIEWS, { keyPath: "dateKey" });
      }
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        const store = db.createObjectStore(STORE_FILES, { keyPath: "id" });
        store.createIndex("byDate", "dateKey", { unique: false });
        store.createIndex("byDateCategory", ["dateKey", "category"], { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_ATTENDEES)) {
        const store = db.createObjectStore(STORE_ATTENDEES, { keyPath: "id", autoIncrement: true });
        store.createIndex("byName", "name", { unique: true });
      }
      if (!db.objectStoreNames.contains(STORE_ATTENDANCE)) {
        const store = db.createObjectStore(STORE_ATTENDANCE, { keyPath: "id" });
        store.createIndex("byDate", "dateKey", { unique: false });
        store.createIndex("byAttendee", "attendeeId", { unique: false });
        store.createIndex("byDateAttendee", ["dateKey", "attendeeId"], { unique: true });
      }
      if (!db.objectStoreNames.contains(STORE_GOSPELS)) {
        db.createObjectStore(STORE_GOSPELS, { keyPath: "dateKey" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx(db, storeNames, mode = "readonly") {
  return db.transaction(storeNames, mode);
}
function requestToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Σύνοψη (free text)
async function saveOverview(dateKey, text) {
  const db = await openDb();
  const t = tx(db, [STORE_OVERVIEWS], "readwrite");
  await requestToPromise(t.objectStore(STORE_OVERVIEWS).put({ dateKey, text }));
  t.commit?.();
}
async function getOverview(dateKey) {
  const db = await openDb();
  const t = tx(db, [STORE_OVERVIEWS]);
  const res = await requestToPromise(t.objectStore(STORE_OVERVIEWS).get(dateKey));
  return res?.text || "";
}

// Ευαγγέλιο (Χωρίο/Σελίδα)
async function saveGospel(dateKey, pericope, page) {
  const db = await openDb();
  const t = tx(db, [STORE_GOSPELS], "readwrite");
  await requestToPromise(t.objectStore(STORE_GOSPELS).put({ dateKey, pericope, page }));
  t.commit?.();
}
async function getGospel(dateKey) {
  const db = await openDb();
  const t = tx(db, [STORE_GOSPELS]);
  const res = await requestToPromise(t.objectStore(STORE_GOSPELS).get(dateKey));
  if (res) return res;
  return DEFAULT_GOSPELS[dateKey] || { pericope: "", page: "" };
}

// Files (only Θέμα, original filename, up to 2)
async function getFiles(dateKey, category) {
  const db = await openDb();
  const t = tx(db, [STORE_FILES]);
  const idx = t.objectStore(STORE_FILES).index("byDateCategory");
  const res = await requestToPromise(idx.getAll([dateKey, category]));
  return res.sort((a, b) => a.createdAt - b.createdAt);
}
async function addFile(dateKey, category, file) {
  const existing = await getFiles(dateKey, category);
  if (existing.length >= 2) throw new Error("Μέχρι 2 αρχεία σε αυτή την κατηγορία.");
  const db = await openDb();
  const t = tx(db, [STORE_FILES], "readwrite");
  const id = `${dateKey}::${category}::${crypto.randomUUID()}`;
  const record = { id, dateKey, category, title: file.name, blob: file, mime: file.type, createdAt: Date.now() };
  await requestToPromise(t.objectStore(STORE_FILES).add(record));
  t.commit?.();
  return record;
}
async function deleteFile(id) {
  const db = await openDb();
  const t = tx(db, [STORE_FILES], "readwrite");
  await requestToPromise(t.objectStore(STORE_FILES).delete(id));
  t.commit?.();
}

// Attendees
async function listAttendees() {
  const db = await openDb();
  const t = tx(db, [STORE_ATTENDEES]);
  const all = await requestToPromise(t.objectStore(STORE_ATTENDEES).getAll());
  return all.sort((a, b) => a.name.localeCompare(b.name, "el"));
}
async function addAttendee(name) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Άδειο όνομα");
  const db = await openDb();
  const t = tx(db, [STORE_ATTENDEES], "readwrite");
  try {
    const id = await requestToPromise(t.objectStore(STORE_ATTENDEES).add({ name: trimmed }));
    t.commit?.();
    return { id, name: trimmed };
  } catch (err) {
    const ro = tx(db, [STORE_ATTENDEES]);
    const idx = ro.objectStore(STORE_ATTENDEES).index("byName");
    const existing = await requestToPromise(idx.get(trimmed));
    if (existing) return existing;
    throw err;
  }
}
async function updateAttendee(attendeeId, newName) {
  const trimmed = newName.trim();
  if (!trimmed) throw new Error("Άδειο όνομα");
  const db = await openDb();
  const t = tx(db, [STORE_ATTENDEES], "readwrite");
  const store = t.objectStore(STORE_ATTENDEES);
  const existing = await requestToPromise(store.get(attendeeId));
  if (!existing) throw new Error("Δεν βρέθηκε το άτομο");
  existing.name = trimmed;
  try {
    await requestToPromise(store.put(existing));
    t.commit?.();
  } catch (e) {
    throw new Error("Το όνομα υπάρχει ήδη.");
  }
}
async function deleteAttendeeAndAttendance(attendeeId) {
  const db = await openDb();
  const t = tx(db, [STORE_ATTENDEES, STORE_ATTENDANCE], "readwrite");
  const attendeesStore = t.objectStore(STORE_ATTENDEES);
  const attendanceStore = t.objectStore(STORE_ATTENDANCE);
  await requestToPromise(attendeesStore.delete(attendeeId));
  const idx = attendanceStore.index("byAttendee");
  const keys = await requestToPromise(idx.getAllKeys(attendeeId));
  for (const key of keys) await requestToPromise(attendanceStore.delete(key));
  t.commit?.();
}

// Attendance records
async function setAttendance(dateKey, attendeeId, present) {
  const db = await openDb();
  const t = tx(db, [STORE_ATTENDANCE], "readwrite");
  const id = `${dateKey}::${attendeeId}`;
  if (present) await requestToPromise(t.objectStore(STORE_ATTENDANCE).put({ id, dateKey, attendeeId, present: true }));
  else await requestToPromise(t.objectStore(STORE_ATTENDANCE).delete(id));
  t.commit?.();
}
async function getAttendanceForDate(dateKey) {
  const db = await openDb();
  const t = tx(db, [STORE_ATTENDANCE]);
  const idx = t.objectStore(STORE_ATTENDANCE).index("byDate");
  const records = await requestToPromise(idx.getAll(dateKey));
  const map = new Map();
  records.forEach(r => map.set(r.attendeeId, true));
  return map;
}
async function getAllAttendanceRecords() {
  const db = await openDb();
  const t = tx(db, [STORE_ATTENDANCE]);
  return await requestToPromise(t.objectStore(STORE_ATTENDANCE).getAll());
}

// UI state
let currentDateKey = null;

// Elements
const sundaysListEl = document.getElementById("sundaysList");
const selectedSundayTitleEl = document.getElementById("selectedSundayTitle");

const overviewTextEl = document.getElementById("overviewText");
const saveOverviewBtn = document.getElementById("saveOverviewBtn");

const gospelPericopeEl = document.getElementById("gospelPericope");
const gospelPageEl = document.getElementById("gospelPage");
const saveGospelBtn = document.getElementById("saveGospelBtn");

const topicFileEl = document.getElementById("topicFile");
const addTopicFileBtn = document.getElementById("addTopicFileBtn");
const topicFilesListEl = document.getElementById("topicFilesList");

const newAttendeeNameEl = document.getElementById("newAttendeeName");
const addAttendeeBtn = document.getElementById("addAttendeeBtn");
const refreshAttendeesBtn = document.getElementById("refreshAttendeesBtn");
const attendanceListEl = document.getElementById("attendanceList");

// Summary elements
const selectedSundayAttendanceEl = document.getElementById("selectedSundayAttendance");
const averageAttendanceEl = document.getElementById("averageAttendance");
const perAttendeeListEl = document.getElementById("perAttendeeList");
const overviewTableBodyEl = document.getElementById("overviewTableBody");

// Sundays UI
function renderSundaysList() {
  sundaysListEl.innerHTML = "";
  SUNDAYS.forEach(({ key, label }) => {
    const li = document.createElement("li");
    li.className = "sunday-item";
    li.dataset.key = key;
    li.innerHTML = `<span class="sunday-dot"></span><span>${label}</span>`;
    li.addEventListener("click", () => selectSunday(key));
    sundaysListEl.appendChild(li);
  });
}

async function selectSunday(dateKey) {
  currentDateKey = dateKey;
  const selected = SUNDAYS.find(s => s.key === dateKey);
  document.querySelectorAll(".sunday-item").forEach(el => el.classList.toggle("active", el.dataset.key === dateKey));
  selectedSundayTitleEl.textContent = selected ? selected.label : "Επιλέξτε Κυριακή";

  overviewTextEl.value = await getOverview(dateKey);

  const gospel = await getGospel(dateKey);
  gospelPericopeEl.value = gospel.pericope || "";
  gospelPageEl.value = gospel.page || "";

  await refreshFilesUI();
  await refreshAttendanceUI();
  await refreshGlobalSections();
}

// Files UI (only Θέμα)
async function refreshFilesUI() {
  if (!currentDateKey) return;
  const topicFiles = await getFiles(currentDateKey, "topic");
  renderFilesList(topicFilesListEl, topicFiles);
  await refreshGlobalSections();
}
function renderFilesList(container, files) {
  container.innerHTML = "";
  files.forEach(file => {
    const li = document.createElement("li");
    li.className = "file-item";
    const title = document.createElement("span");
    title.className = "file-title";
    title.textContent = file.title;
    const actions = document.createElement("div");
    actions.className = "file-actions";

    const viewBtn = document.createElement("button");
    viewBtn.textContent = "Προβολή";
    viewBtn.addEventListener("click", () => {
      const url = URL.createObjectURL(file.blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    });

    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Λήψη";
    downloadBtn.addEventListener("click", () => {
      const url = URL.createObjectURL(file.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = sanitizeFilename(`${file.title || "file"}.pdf`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "Διαγραφή";
    delBtn.className = "danger";
    delBtn.addEventListener("click", async () => {
      if (confirm("Διαγραφή αρχείου;")) {
        await deleteFile(file.id);
        await refreshFilesUI();
      }
    });

    actions.append(viewBtn, downloadBtn, delBtn);
    li.append(title, actions);
    container.appendChild(li);
  });
}
function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]+/g, "-");
}

// Overview save
saveOverviewBtn.addEventListener("click", async () => {
  if (!currentDateKey) return alert("Παρακαλώ επιλέξτε Κυριακή.");
  await saveOverview(currentDateKey, overviewTextEl.value.trim());
  await refreshGlobalSections();
  toast("Η σύνοψη αποθηκεύτηκε.");
});

// Gospel save
saveGospelBtn.addEventListener("click", async () => {
  if (!currentDateKey) return alert("Παρακαλώ επιλέξτε Κυριακή.");
  await saveGospel(currentDateKey, gospelPericopeEl.value.trim(), gospelPageEl.value.trim());
  toast("Το Ευαγγέλιο αποθηκεύτηκε.");
});

// File uploads
addTopicFileBtn.addEventListener("click", () => addFileHandler("topic", topicFileEl));
async function addFileHandler(category, fileInput) {
  if (!currentDateKey) return alert("Παρακαλώ επιλέξτε Κυριακή.");
  const file = fileInput.files?.[0];
  if (!file) return alert("Επιλέξτε ένα PDF.");
  if (file.type !== "application/pdf") return alert("Μόνο αρχεία PDF επιτρέπονται.");
  try {
    await addFile(currentDateKey, category, file);
    fileInput.value = "";
    await refreshFilesUI();
    toast("Το αρχείο προστέθηκε.");
  } catch (e) {
    alert(e.message || "Σφάλμα προσθήκης αρχείου.");
  }
}

// Attendance UI
async function refreshAttendanceUI() {
  if (!currentDateKey) return;
  const [attendees, presentMap] = await Promise.all([listAttendees(), getAttendanceForDate(currentDateKey)]);
  attendanceListEl.innerHTML = "";
  attendees.forEach(a => {
    const li = document.createElement("li");
    li.className = "attendee-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!presentMap.get(a.id);
    checkbox.addEventListener("change", async () => {
      await setAttendance(currentDateKey, a.id, checkbox.checked);
      await refreshGlobalSections();
    });

    const name = document.createElement("span");
    name.className = "attendee-name";
    name.textContent = a.name;

    const actions = document.createElement("div");
    actions.className = "attendee-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Επεξ.";
    editBtn.addEventListener("click", async () => {
      const newName = prompt("Νέο όνομα:", a.name);
      if (newName == null) return;
      try {
        await updateAttendee(a.id, newName);
        await refreshAttendanceUI();
        await refreshGlobalSections();
        toast("Το όνομα ενημερώθηκε.");
      } catch (e) {
        alert(e.message || "Σφάλμα ενημέρωσης ονόματος.");
      }
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "Διαγραφή";
    delBtn.className = "danger";
    delBtn.addEventListener("click", async () => {
      if (!confirm(`Διαγραφή του/της "${a.name}" και όλων των παρουσιών του/της;`)) return;
      try {
        await deleteAttendeeAndAttendance(a.id);
        await refreshAttendanceUI();
        await refreshGlobalSections();
        toast("Το άτομο διαγράφηκε.");
      } catch (e) {
        alert(e.message || "Σφάλμα διαγραφής.");
      }
    });

    actions.append(editBtn, delBtn);
    li.append(checkbox, name, actions);
    attendanceListEl.appendChild(li);
  });
}
addAttendeeBtn.addEventListener("click", async () => {
  const name = newAttendeeNameEl.value;
  if (!name.trim()) return newAttendeeNameEl.focus();
  try {
    await addAttendee(name);
    newAttendeeNameEl.value = "";
    await refreshAttendanceUI();
    await refreshGlobalSections();
    toast("Το άτομο προστέθηκε στη λίστα.");
  } catch {
    alert("Δεν ήταν δυνατή η προσθήκη. Ίσως υπάρχει ήδη αυτό το όνομα.");
  }
});
refreshAttendeesBtn.addEventListener("click", async () => {
  await refreshAttendanceUI();
  await refreshGlobalSections();
  toast("Η λίστα ενημερώθηκε.");
});

// Global summaries
async function refreshGlobalSections() {
  await Promise.all([renderGlobalSummary(), renderSundaysOverviewTable()]);
}
async function renderGlobalSummary() {
  const [records, attendees] = await Promise.all([getAllAttendanceRecords(), listAttendees()]);

  // Selected Sunday attendees
  const selectedCount = records.filter(r => r.dateKey === currentDateKey).length;
  selectedSundayAttendanceEl.textContent = String(selectedCount);

  // Average attendees across past Sundays only (strictly before today)
  const countsByDate = new Map();
  for (const r of records) countsByDate.set(r.dateKey, (countsByDate.get(r.dateKey) || 0) + 1);
  const today = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();
  const pastKeys = SUNDAYS.map(s => s.key).filter(k => k < today);
  const totalPast = pastKeys.reduce((sum, k) => sum + (countsByDate.get(k) || 0), 0);
  const avg = pastKeys.length ? totalPast / pastKeys.length : 0;
  averageAttendanceEl.textContent = avg.toFixed(1);

  // Per-attendee counts (alphabetically)
  const per = new Map();
  for (const r of records) per.set(r.attendeeId, (per.get(r.attendeeId) || 0) + 1);
  const idToName = new Map(attendees.map(a => [a.id, a.name]));
  const items = [...per.entries()]
    .map(([attendeeId, count]) => ({ name: idToName.get(attendeeId) || `#${attendeeId}`, count }))
    .sort((a, b) => a.name.localeCompare(b.name, "el"));
  perAttendeeListEl.innerHTML = "";
  if (items.length === 0) {
    perAttendeeListEl.innerHTML = "<li class=\"file-item\"><span class=\"file-title\">Καμία καταγραφή ακόμα</span></li>";
  } else {
    items.forEach(item => {
      const li = document.createElement("li");
      li.className = "file-item";
      const title = document.createElement("span");
      title.className = "file-title";
      title.textContent = item.name;
      const actions = document.createElement("div");
      actions.className = "file-actions";
      const badge = document.createElement("button");
      badge.textContent = `${item.count}`;
      badge.disabled = true;
      actions.appendChild(badge);
      li.append(title, actions);
      perAttendeeListEl.appendChild(li);
    });
  }
}
async function renderSundaysOverviewTable() {
  const [records] = await Promise.all([getAllAttendanceRecords()]);
  const countsByDate = new Map();
  for (const r of records) countsByDate.set(r.dateKey, (countsByDate.get(r.dateKey) || 0) + 1);

  overviewTableBodyEl.innerHTML = "";
  for (const { key, label } of SUNDAYS) {
    const tr = document.createElement("tr");
    const tdDate = document.createElement("td");
    tdDate.textContent = label;

    const tdTopic = document.createElement("td");
    const summaryLine = await getSummarySnippetForDate(key);
    tdTopic.textContent = summaryLine;

    const tdCount = document.createElement("td");
    tdCount.textContent = (countsByDate.get(key) || 0).toString();

    tr.append(tdDate, tdTopic, tdCount);
    overviewTableBodyEl.appendChild(tr);
  }
}
async function getSummarySnippetForDate(dateKey) {
  const text = (await getOverview(dateKey)) || "";
  const first = text.split(/\r?\n/).find(l => l.trim().length > 0) || "";
  const trimmed = first.trim();
  return trimmed.length > 120 ? trimmed.slice(0, 117) + "..." : trimmed;
}

// Toast
let toastTimeout = null;
function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.style.position = "fixed";
    el.style.bottom = "24px";
    el.style.left = "50%";
    el.style.transform = "translateX(-50%)";
    el.style.background = "rgba(15, 23, 42, 0.95)";
    el.style.border = "1px solid #1f2937";
    el.style.color = "#e5e7eb";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "10px";
    el.style.zIndex = "9999";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.opacity = "1";
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { el.style.opacity = "0"; }, 1400);
}

// Init
(async function init() {
  renderSundaysList();
  await refreshGlobalSections();
  if (SUNDAYS.length > 0) await selectSunday(SUNDAYS[0].key);
})();