// app.js - Firebase Version (χωρίς PDF, χωρίς JSON Export/Import)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, get, push, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDyJXchjSU8r-YMDRcKUmUv9vsHtg2Yr8J8",
  authDomain: "katixitikoapp.firebaseapp.com",
  databaseURL: "https://katixitikoapp-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "katixitikoapp",
  storageBucket: "katixitikoapp.firebasestorage.app",
  messagingSenderId: "100645862912",
  appId: "1:100645862912:web:97c2fbdf09a4921c722e5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Sundays list
const SUNDAYS = [
  { key: "2026-10-11", label: "Κυριακή 11 Οκτωβρίου 2026" },
  { key: "2026-10-18", label: "Κυριακή 18 Οκτωβρίου 2026" },
  { key: "2026-10-25", label: "Κυριακή 25 Οκτωβρίου 2026" },
  { key: "2026-11-01", label: "Κυριακή 1 Νοεμβρίου 2026" },
  { key: "2026-11-08", label: "Κυριακή 8 Νοεμβρίου 2026" },
  { key: "2026-11-15", label: "Κυριακή 15 Νοεμβρίου 2026" },
  { key: "2026-11-22", label: "Κυριακή 22 Νοεμβρίου 2026" },
  { key: "2026-11-29", label: "Κυριακή 29 Νοεμβρίου 2026" },
  { key: "2026-12-06", label: "Κυριακή 6 Δεκεμβρίου 2026" },
  { key: "2026-12-13", label: "Κυριακή 13 Δεκεμβρίου 2026" },
  { key: "2026-12-20", label: "Κυριακή 20 Δεκεμβρίου 2026" },
  { key: "2026-12-27", label: "Κυριακή 27 Δεκεμβρίου 2026" },
  { key: "2027-01-03", label: "Κυριακή 3 Ιανουαρίου 2027" },
  { key: "2027-01-10", label: "Κυριακή 10 Ιανουαρίου 2027" },
  { key: "2027-01-17", label: "Κυριακή 17 Ιανουαρίου 2027" },
  { key: "2027-01-24", label: "Κυριακή 24 Ιανουαρίου 2027" },
  { key: "2027-01-31", label: "Κυριακή 31 Ιανουαρίου 2027" },
  { key: "2027-02-07", label: "Κυριακή 7 Φεβρουαρίου 2027" },
  { key: "2027-02-14", label: "Κυριακή 14 Φεβρουαρίου 2027" },
  { key: "2027-02-21", label: "Κυριακή 21 Φεβρουαρίου 2027" },
  { key: "2027-02-28", label: "Κυριακή 28 Φεβρουαρίου 2027" },
  { key: "2027-03-07", label: "Κυριακή 7 Μαρτίου 2027" },
  { key: "2027-03-14", label: "Κυριακή 14 Μαρτίου 2027" },
  { key: "2027-03-21", label: "Κυριακή 21 Μαρτίου 2027" },
  { key: "2027-03-28", label: "Κυριακή 28 Μαρτίου 2027" },
  { key: "2027-04-04", label: "Κυριακή 4 Απριλίου 2027" },
  { key: "2027-04-11", label: "Κυριακή 11 Απριλίου 2027" },
  { key: "2027-04-18", label: "Κυριακή 18 Απριλίου 2027" },
  { key: "2027-04-25", label: "Κυριακή 25 Απριλίου 2027" },
  { key: "2027-05-02", label: "Κυριακή 2 Μαΐου 2027" }
];

// Prefilled Ευαγγέλια
const DEFAULT_GOSPELS = {
  "2026-10-11": { pericope: "Λουκ. η' 5-15", page: "" },
  "2026-10-18": { pericope: "Λουκ. ι' 16-21", page: "" },
  "2026-10-25": { pericope: "Λουκ. η' 26-39", page: "" },
  "2026-11-01": { pericope: "Λουκ. ιστ' 19-31", page: "" },
  "2026-11-08": { pericope: "Λουκ. η' 41-56", page: "" },
  "2026-11-15": { pericope: "Λουκ. ι' 25-37", page: "" },
  "2026-11-22": { pericope: "Λουκ. ιβ' 16-21", page: "" },
  "2026-11-29": { pericope: "Λουκ. ιη' 18-27", page: "" },
  "2026-12-06": { pericope: "Λουκ. ιγ' 10-17", page: "" },
  "2026-12-13": { pericope: "Λουκ. ιδ' 16-24", page: "" },
  "2026-12-20": { pericope: "Ματθ. α' 1-25", page: "" },
  "2026-12-27": { pericope: "Ματθ. β' 13-23", page: "" },
  "2027-01-03": { pericope: "Μαρκ. α' 1-8", page: "" },
  "2027-01-10": { pericope: "Ματθ. δ' 12-17", page: "" },
  "2027-01-17": { pericope: "Λουκ. ιζ' 12-19", page: "" },
  "2027-01-24": { pericope: "Λουκ. ιη' 35-43", page: "" },
  "2027-01-31": { pericope: "Λουκ. ιθ' 1-10", page: "" },
  "2027-02-07": { pericope: "Ματθ. ιε' 21-28", page: "" },
  "2027-02-14": { pericope: "Ματθ. κε' 14-30", page: "" },
  "2027-02-21": { pericope: "Λουκ. ιη' 10-14", page: "" },
  "2027-02-28": { pericope: "Λουκ. ιε' 11-32", page: "" },
  "2027-03-07": { pericope: "Ματθ. κε' 31-46", page: "" },
  "2027-03-14": { pericope: "Ματθ. στ' 14-21", page: "" },
  "2027-03-21": { pericope: "Ιω. α' 44-52", page: "" },
  "2027-03-28": { pericope: "Μαρκ. β' 1-12", page: "" },
  "2027-04-04": { pericope: "Μαρκ. η' 34 - θ' 1", page: "" },
  "2027-04-11": { pericope: "Μαρκ. θ' 17-31", page: "" },
  "2027-04-18": { pericope: "Μαρκ. ι' 32-45", page: "" },
  "2027-04-25": { pericope: "Ιω. ιβ' 1-18", page: "" },
  "2027-05-02": { pericope: "Ιω. α' 1-17", page: "" }
};

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
const newAttendeeNameEl = document.getElementById("newAttendeeName");
const addAttendeeBtn = document.getElementById("addAttendeeBtn");
const refreshAttendeesBtn = document.getElementById("refreshAttendeesBtn");
const attendanceListEl = document.getElementById("attendanceList");
const selectedSundayAttendanceEl = document.getElementById("selectedSundayAttendance");
const averageAttendanceEl = document.getElementById("averageAttendance");
const perAttendeeListEl = document.getElementById("perAttendeeList");
const overviewTableBodyEl = document.getElementById("overviewTableBody");
const profileModal = document.getElementById("profileModal");
const profileModalTitle = document.getElementById("profileModalTitle");
const closeProfileModal = document.getElementById("closeProfileModal");
const cancelProfileBtn = document.getElementById("cancelProfileBtn");
const profileForm = document.getElementById("profileForm");
let currentProfileAttendeeId = null;

// ---------- Firebase Helpers ----------

async function saveOverview(dateKey, text) {
  await set(ref(db, 'overviews/' + dateKey), { dateKey, text });
}

async function saveGospel(dateKey, pericope, page) {
  await set(ref(db, 'gospels/' + dateKey), { dateKey, pericope, page });
}

async function listAttendees() {
  const snapshot = await get(ref(db, 'attendees'));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a, b) => (a.name || "").localeCompare(b.name || "", "el"));
}

async function addAttendee(name) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Άδειο όνομα");
  const record = { name: trimmed, fullName: trimmed, age: '', birthYear: '', class: '', mum: '', dad: '', phone: '', email: '', comments: '' };
  const newRef = push(ref(db, 'attendees'));
  await set(newRef, record);
  return { id: newRef.key, ...record };
}

async function updateAttendee(attendeeId, newName) {
  const trimmed = newName.trim();
  if (!trimmed) throw new Error("Άδειο όνομα");
  await update(ref(db, 'attendees/' + attendeeId), { name: trimmed });
}

async function deleteAttendeeAndAttendance(attendeeId) {
  await remove(ref(db, 'attendees/' + attendeeId));
  const snapshot = await get(ref(db, 'attendance'));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const updates = {};
    for (const dateKey in data) {
      if (data[dateKey][attendeeId]) {
        updates[`attendance/${dateKey}/${attendeeId}`] = null;
      }
    }
    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
    }
  }
}

async function getAttendeeProfile(attendeeId) {
  const snapshot = await get(ref(db, 'attendees/' + attendeeId));
  if (!snapshot.exists()) return null;
  const data = snapshot.val();
  return { id: attendeeId, ...data };
}

async function updateAttendeeProfile(attendeeId, profileData) {
  const updated = { ...profileData };
  if (profileData.name) updated.name = profileData.name.trim();
  await update(ref(db, 'attendees/' + attendeeId), updated);
}

async function setAttendance(dateKey, attendeeId, present) {
  if (present) {
    await set(ref(db, `attendance/${dateKey}/${attendeeId}`), true);
  } else {
    await remove(ref(db, `attendance/${dateKey}/${attendeeId}`));
  }
}

async function getAttendanceForDate(dateKey) {
  const snapshot = await get(ref(db, 'attendance/' + dateKey));
  const map = new Map();
  if (snapshot.exists()) {
    const data = snapshot.val();
    for (const attendeeId in data) {
      map.set(attendeeId, true);
    }
  }
  return map;
}

async function getAllAttendanceRecords() {
  const snapshot = await get(ref(db, 'attendance'));
  const records = [];
  if (snapshot.exists()) {
    const data = snapshot.val();
    for (const dateKey in data) {
      for (const attendeeId in data[dateKey]) {
        records.push({ dateKey, attendeeId, present: true });
      }
    }
  }
  return records;
}

// ---------- UI Logic ----------

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

  onValue(ref(db, 'overviews/' + dateKey), (snapshot) => {
    const data = snapshot.val();
    overviewTextEl.value = data ? data.text : "";
  });

  onValue(ref(db, 'gospels/' + dateKey), (snapshot) => {
    const data = snapshot.val();
    if (data) {
      gospelPericopeEl.value = data.pericope || "";
      gospelPageEl.value = data.page || "";
    } else {
      const defaultGospel = DEFAULT_GOSPELS[dateKey] || { pericope: "", page: "" };
      gospelPericopeEl.value = defaultGospel.pericope;
      gospelPageEl.value = defaultGospel.page;
    }
  });

  await refreshAttendanceUI();
  await refreshGlobalSections();
}

saveOverviewBtn.addEventListener("click", async () => {
  if (!currentDateKey) return alert("Παρακαλώ επιλέξτε Κυριακή.");
  await saveOverview(currentDateKey, overviewTextEl.value.trim());
  toast("Η σύνοψη αποθηκεύτηκε.");
});

saveGospelBtn.addEventListener("click", async () => {
  if (!currentDateKey) return alert("Παρακαλώ επιλέξτε Κυριακή.");
  await saveGospel(currentDateKey, gospelPericopeEl.value.trim(), gospelPageEl.value.trim());
  toast("Το Ευαγγέλιο αποθηκεύτηκε.");
});

async function refreshAttendanceUI() {
  if (!currentDateKey) return;
  onValue(ref(db, 'attendees'), async (snapshot) => {
    const attendees = snapshot.exists() ? Object.keys(snapshot.val()).map(key => ({ id: key, ...snapshot.val()[key] })).sort((a, b) => (a.name || "").localeCompare(b.name || "", "el")) : [];
    const presentMap = await getAttendanceForDate(currentDateKey);
    
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
      name.style.cursor = "pointer";
      name.style.textDecoration = "underline";
      name.style.color = "var(--primary)";
      name.addEventListener("click", () => openProfileModal(a.id));

      const actions = document.createElement("div");
      actions.className = "attendee-actions";

      const editBtn = document.createElement("button");
      editBtn.textContent = "Επεξ.";
      editBtn.addEventListener("click", async () => {
        const newName = prompt("Νέο όνομα:", a.name);
        if (newName == null) return;
        try { await updateAttendee(a.id, newName); toast("Το όνομα ενημερώθηκε."); } catch (e) { alert(e.message); }
      });

      const delBtn = document.createElement("button");
      delBtn.textContent = "Διαγραφή";
      delBtn.className = "danger";
      delBtn.addEventListener("click", async () => {
        if (!confirm(`Διαγραφή του/της "${a.name}" και όλων των παρουσιών του/της;`)) return;
        try { await deleteAttendeeAndAttendance(a.id); toast("Το άτομο διαγράφηκε."); } catch (e) { alert(e.message); }
      });

      actions.append(editBtn, delBtn);
      li.append(checkbox, name, actions);
      attendanceListEl.appendChild(li);
    });
    await refreshGlobalSections();
  });
}

addAttendeeBtn.addEventListener("click", async () => {
  const name = newAttendeeNameEl.value;
  if (!name.trim()) return newAttendeeNameEl.focus();
  try {
    await addAttendee(name);
    newAttendeeNameEl.value = "";
    toast("Το άτομο προστέθηκε στη λίστα.");
  } catch { alert("Δεν ήταν δυνατή η προσθήκη."); }
});

refreshAttendeesBtn.addEventListener("click", async () => {
  await refreshAttendanceUI();
  toast("Η λίστα ενημερώθηκε.");
});

async function refreshGlobalSections() {
  await Promise.all([renderGlobalSummary(), renderSundaysOverviewTable()]);
}

async function renderGlobalSummary() {
  const [records, attendees] = await Promise.all([getAllAttendanceRecords(), listAttendees()]);
  const selectedCount = records.filter(r => r.dateKey === currentDateKey).length;
  selectedSundayAttendanceEl.textContent = String(selectedCount);

  const countsByDate = new Map();
  for (const r of records) countsByDate.set(r.dateKey, (countsByDate.get(r.dateKey) || 0) + 1);
  const today = new Date().toISOString().split('T')[0];
  const pastKeys = SUNDAYS.map(s => s.key).filter(k => k < today);
  const totalPast = pastKeys.reduce((sum, k) => sum + (countsByDate.get(k) || 0), 0);
  const avg = pastKeys.length ? totalPast / pastKeys.length : 0;
  averageAttendanceEl.textContent = avg.toFixed(1);

  const per = new Map();
  for (const r of records) per.set(r.attendeeId, (per.get(r.attendeeId) || 0) + 1);
  const idToName = new Map(attendees.map(a => [a.id, a.name]));
  const items = [...per.entries()].map(([attendeeId, count]) => ({ attendeeId, name: idToName.get(attendeeId) || `#${attendeeId}`, count })).sort((a, b) => a.name.localeCompare(b.name, "el"));
  
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
      title.style.cursor = "pointer";
      title.style.textDecoration = "underline";
      title.style.color = "var(--primary)";
      title.addEventListener("click", () => openProfileModal(item.attendeeId));
      const actions = document.createElement("div");
      actions.className = "file-actions";
      const attendanceBadge = document.createElement("button");
      attendanceBadge.textContent = `${item.count}`;
      attendanceBadge.disabled = true;
      const giftsBadge = document.createElement("button");
      giftsBadge.textContent = `Δώρα: ${Math.floor(item.count / 4)}`;
      giftsBadge.disabled = true;
      actions.append(attendanceBadge, giftsBadge);
      li.append(title, actions);
      perAttendeeListEl.appendChild(li);
    });
  }
}

async function renderSundaysOverviewTable() {
  const records = await getAllAttendanceRecords();
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
  const snapshot = await get(ref(db, 'overviews/' + dateKey));
  const text = snapshot.exists() ? snapshot.val().text : "";
  const first = text.split(/\r?\n/).find(l => l.trim().length > 0) || "";
  const trimmed = first.trim();
  return trimmed.length > 120 ? trimmed.slice(0, 117) + "..." : trimmed;
}

async function openProfileModal(attendeeId) {
  currentProfileAttendeeId = attendeeId;
  const profile = await getAttendeeProfile(attendeeId);
  if (!profile) { alert("Δεν βρέθηκε το προφίλ."); return; }

  profileModalTitle.textContent = `Προφίλ: ${profile.name}`;
  document.getElementById("profileName").value = profile.name || '';
  document.getElementById("profileFullName").value = profile.fullName || '';
  document.getElementById("profileAge").value = profile.age || '';
  document.getElementById("profileBirthYear").value = profile.birthYear || '';
  document.getElementById("profileClass").value = profile.class || '';
  document.getElementById("profileMum").value = profile.mum || '';
  document.getElementById("profileDad").value = profile.dad || '';
  document.getElementById("profilePhone").value = profile.phone || '';
  document.getElementById("profileEmail").value = profile.email || '';
  document.getElementById("profileComments").value = profile.comments || '';

  profileModal.style.display = "flex";
}

function closeProfileModalFunc() {
  profileModal.style.display = "none";
  currentProfileAttendeeId = null;
  profileForm.reset();
}

closeProfileModal.addEventListener("click", closeProfileModalFunc);
cancelProfileBtn.addEventListener("click", closeProfileModalFunc);

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentProfileAttendeeId) return;
  try {
    const profileData = {
      name: document.getElementById("profileName").value.trim(),
      fullName: document.getElementById("profileFullName").value.trim(),
      age: document.getElementById("profileAge").value.trim(),
      birthYear: document.getElementById("profileBirthYear").value.trim(),
      class: document.getElementById("profileClass").value,
      mum: document.getElementById("profileMum").value.trim(),
      dad: document.getElementById("profileDad").value.trim(),
      phone: document.getElementById("profilePhone").value.trim(),
      email: document.getElementById("profileEmail").value.trim(),
      comments: document.getElementById("profileComments").value.trim()
    };
    await updateAttendeeProfile(currentProfileAttendeeId, profileData);
    closeProfileModalFunc();
    toast("Το προφίλ ενημερώθηκε.");
  } catch (e) { alert(e.message || "Σφάλμα αποθήκευσης προφίλ."); }
});

profileModal.addEventListener("click", (e) => { if (e.target === profileModal) closeProfileModalFunc(); });

let toastTimeout = null;
function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.style.position = "fixed"; el.style.bottom = "24px"; el.style.left = "50%"; el.style.transform = "translateX(-50%)";
    el.style.background = "rgba(15, 23, 42, 0.95)"; el.style.border = "1px solid #1f2937"; el.style.color = "#e5e7eb";
    el.style.padding = "10px 14px"; el.style.borderRadius = "10px"; el.style.zIndex = "9999";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.opacity = "1";
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { el.style.opacity = "0"; }, 1400);
}

document.getElementById("profileClass").addEventListener("change", function () {
  const selectedClass = this.value;
  const currentYear = new Date().getFullYear();
  const ageInput = document.getElementById('profileAge');
  const birthYearInput = document.getElementById('profileBirthYear');
  let age = 0;
  switch (selectedClass) {
    case 'πρώτη': age = 7; break;
    case 'δευτέρα': age = 8; break;
    case 'τρίτη': age = 9; break;
    case 'τετάρτη': age = 10; break;
    case 'πέμπτη': age = 11; break;
    case 'έκτη': age = 12; break;
    default: age = 0;
  }
  if (age > 0) { ageInput.value = age; birthYearInput.value = currentYear - age; } 
  else { ageInput.value = ''; birthYearInput.value = ''; }
});

// Init
(async function init() {
  try {
    renderSundaysList();
    setupMobileMenu();
    await refreshGlobalSections();
    if (SUNDAYS.length > 0) await selectSunday(SUNDAYS[0].key);
    registerServiceWorker();
  } catch (error) {
    console.error("Σφάλμα εκκίνησης:", error);
    alert("Παρουσιάστηκε σφάλμα κατά τη φόρτωση:\n" + error.message);
  }
})();

// Mobile menu toggle
function setupMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  
  if (!menuToggle || !sidebar || !overlay) return;
  
  function openMenu() {
    sidebar.classList.add("open");
    overlay.classList.add("active");
  }
  
  function closeMenu() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  }
  
  menuToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) closeMenu();
    else openMenu();
  });
  
  overlay.addEventListener("click", closeMenu);
  
  // Κλείσιμο όταν επιλέγεται Κυριακή σε κινητό
  document.getElementById("sundaysList").addEventListener("click", (e) => {
    if (e.target.closest(".sunday-item") && window.innerWidth <= 900) {
      setTimeout(closeMenu, 200);
    }
  });
}

// Register Service Worker (PWA)
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('✅ Service Worker ενεργό:', reg.scope))
        .catch(err => console.warn('⚠️ Service Worker σφάλμα:', err));
    });
  }
}