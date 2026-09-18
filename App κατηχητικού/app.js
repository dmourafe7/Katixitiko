// app.js - Multi-User with Username + Email + Password + Loading Screen

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, get, push, update }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, sendPasswordResetEmail,
  setPersistence, browserLocalPersistence
}
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDjXchjSU8r-YMDReKUmUv9vsHtg2Yr8J8",
  authDomain: "katixitikoapp.firebaseapp.com",
  databaseURL: "https://katixitikoapp-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "katixitikoapp",
  storageBucket: "katixitikoapp.firebasestorage.app",
  messagingSenderId: "100645862912",
  appId: "1:100645862912:web:97c2fbdff09a4921c722e5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn("Σφάλμα ρύθμισης persistence:", err);
});

// ============================================================
// 👇 THEME SWITCHER
// ============================================================
const THEMES = ["dark", "midnight", "light"];
const THEME_ICONS = { dark: "🌙", midnight: "🌑", light: "☀️" };

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("themeBtn");
  if (btn) btn.textContent = THEME_ICONS[theme] || "🌙";

  // Update theme-color meta
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    if (theme === "light") meta.setAttribute("content", "#f1f5f9");
    else if (theme === "midnight") meta.setAttribute("content", "#000000");
    else meta.setAttribute("content", "#0f172a");
  }
}

function initTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  applyTheme(saved);
}

const themeBtnEl = document.getElementById("themeBtn");
if (themeBtnEl) {
  const handleThemeToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const idx = THEMES.indexOf(current);
    const next = THEMES[(idx + 1) % THEMES.length];
    localStorage.setItem("theme", next);
    applyTheme(next);
    // Feedback στο κινητό
    themeBtnEl.style.transform = "scale(0.9)";
    setTimeout(() => { themeBtnEl.style.transform = ""; }, 120);
  };
  themeBtnEl.addEventListener("click", handleThemeToggle);
  themeBtnEl.addEventListener("touchend", (e) => {
    e.preventDefault();
    handleThemeToggle(e);
  });
}

initTheme();

// ---------- Auth UI Elements ----------
const authScreen = document.getElementById("authScreen");
const mainApp = document.getElementById("mainApp");
const loadingScreen = document.getElementById("loadingScreen");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const forgotForm = document.getElementById("forgotForm");
const authError = document.getElementById("authError");
const authInfo = document.getElementById("authInfo");

function showAuthError(msg) {
  authInfo.style.display = "none";
  authError.textContent = msg;
  authError.style.display = "block";
}
function showAuthInfo(msg) {
  authError.style.display = "none";
  authInfo.textContent = msg;
  authInfo.style.display = "block";
}
function clearAuthMessages() {
  authError.style.display = "none";
  authInfo.style.display = "none";
  authError.textContent = "";
  authInfo.textContent = "";
}

document.getElementById("showSignup").addEventListener("click", (e) => {
  e.preventDefault(); clearAuthMessages();
  loginForm.style.display = "none";
  signupForm.style.display = "block";
  forgotForm.style.display = "none";
});
document.getElementById("showLogin").addEventListener("click", (e) => {
  e.preventDefault(); clearAuthMessages();
  signupForm.style.display = "none";
  loginForm.style.display = "block";
  forgotForm.style.display = "none";
});
document.getElementById("showForgot").addEventListener("click", (e) => {
  e.preventDefault(); clearAuthMessages();
  loginForm.style.display = "none";
  forgotForm.style.display = "block";
  signupForm.style.display = "none";
});
document.getElementById("backToLogin").addEventListener("click", (e) => {
  e.preventDefault(); clearAuthMessages();
  forgotForm.style.display = "none";
  loginForm.style.display = "block";
  signupForm.style.display = "none";
});

document.getElementById("signupBtn").addEventListener("click", async () => {
  clearAuthMessages();
  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim().toLowerCase();
  const password = document.getElementById("signupPassword").value;
  const password2 = document.getElementById("signupPassword2").value;

  if (!username) return showAuthError("Παρακαλώ εισάγετε όνομα χρήστη.");
  if (username.length < 3) return showAuthError("Το όνομα χρήστη πρέπει να έχει τουλάχιστον 3 χαρακτήρες.");
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    return showAuthError("Το όνομα χρήστη μπορεί να περιέχει μόνο λατινικά, νούμερα, τελείες, _ και -.");
  }
  if (!email) return showAuthError("Παρακαλώ εισάγετε email.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAuthError("Το email δεν είναι έγκυρο.");
  if (!password) return showAuthError("Παρακαλώ εισάγετε κωδικό.");
  if (password.length < 6) return showAuthError("Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.");
  if (password !== password2) return showAuthError("Οι κωδικοί δεν ταιριάζουν.");

  const usernameKey = username.toLowerCase();

  try {
    const usernameSnap = await get(ref(db, 'usernames/' + usernameKey));
    if (usernameSnap.exists()) {
      return showAuthError("Το όνομα χρήστη υπάρχει ήδη. Δοκιμάστε άλλο ή συνδεθείτε.");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await set(ref(db, 'usernames/' + usernameKey), { email, uid, username });
    await set(ref(db, 'users/' + uid + '/profile'), {
      username, email, createdAt: Date.now()
    });

  } catch (err) {
    console.error(err);
    if (err.code === "auth/email-already-in-use") {
      showAuthError("Το email χρησιμοποιείται ήδη. Δοκιμάστε άλλο ή συνδεθείτε.");
    } else if (err.code === "auth/weak-password") {
      showAuthError("Ο κωδικός δεν είναι αρκετά ισχυρός.");
    } else if (err.code === "auth/invalid-email") {
      showAuthError("Το email δεν είναι έγκυρο.");
    } else {
      showAuthError("Σφάλμα εγγραφής: " + err.message);
    }
  }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  clearAuthMessages();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!username) return showAuthError("Παρακαλώ εισάγετε όνομα χρήστη.");
  if (!password) return showAuthError("Παρακαλώ εισάγετε κωδικό.");

  const usernameKey = username.toLowerCase();

  try {
    const usernameSnap = await get(ref(db, 'usernames/' + usernameKey));
    if (!usernameSnap.exists()) {
      return showAuthError("Ο λογαριασμός σας δεν υπάρχει. Δημιουργήστε καινούργιο λογαριασμό.");
    }
    const email = usernameSnap.val().email;

    await signInWithEmailAndPassword(auth, email, password);

  } catch (err) {
    console.error(err);
    if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
      showAuthError("Λάθος κωδικός. Δοκιμάστε ξανά.");
    } else if (err.code === "auth/too-many-requests") {
      showAuthError("Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε αργότερα.");
    } else {
      showAuthError("Σφάλμα σύνδεσης: " + err.message);
    }
  }
});

document.getElementById("forgotBtn").addEventListener("click", async () => {
  clearAuthMessages();
  const email = document.getElementById("forgotEmail").value.trim().toLowerCase();

  if (!email) return showAuthError("Παρακαλώ εισάγετε το email σας.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAuthError("Το email δεν είναι έγκυρο.");

  try {
    await sendPasswordResetEmail(auth, email);
    showAuthInfo(
      "✅ Το email επαναφοράς στάλθηκε! " +
      "Παρακαλώ ελέγξτε το inbox σας. " +
      "Αν δεν το δείτε μέσα σε λίγα λεπτά, ελέγξτε ΟΠΩΣΔΗΠΟΤΕ και τον φάκελο " +
      "Ανεπιθύμητης Αλληλογραφίας (Spam / Junk)."
    );
  } catch (err) {
    console.error(err);
    if (err.code === "auth/user-not-found") {
      showAuthError("Δεν βρέθηκε λογαριασμός με αυτό το email.");
    } else if (err.code === "auth/invalid-email") {
      showAuthError("Το email δεν είναι έγκυρο.");
    } else if (err.code === "auth/too-many-requests") {
      showAuthError("Πολλές προσπάθειες. Δοκιμάστε αργότερα.");
    } else {
      showAuthError("Σφάλμα αποστολής: " + err.message);
    }
  }
});

document.getElementById("loginPassword").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("loginBtn").click();
});
document.getElementById("signupPassword2").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("signupBtn").click();
});
document.getElementById("forgotEmail").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("forgotBtn").click();
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  if (!confirm("Θέλετε να αποσυνδεθείτε;")) return;
  await signOut(auth);
});

setTimeout(() => {
  const ls = document.getElementById("loadingScreen");
  if (ls) ls.style.display = "none";
}, 2000);

onAuthStateChanged(auth, async (user) => {
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
    loadingScreen.style.display = "none";
  }

  if (user) {
    let userExists = true;
    try {
      const snap = await get(ref(db, 'users/' + user.uid + '/profile'));
      userExists = snap.exists();
    } catch (e) {
      console.warn("Δεν ήταν δυνατός ο έλεγχος του χρήστη:", e);
      userExists = true;
    }

    if (!userExists) {
      console.warn("Ο χρήστης δεν υπάρχει πια. Αποσύνδεση...");
      await signOut(auth);
      return;
    }

    authScreen.style.display = "none";
    mainApp.style.display = "block";

    try {
      const snap = await get(ref(db, 'users/' + user.uid + '/profile/username'));
      document.getElementById("userBadge").textContent = snap.exists() ? snap.val() : user.email;
    } catch (e) {
      document.getElementById("userBadge").textContent = user.email;
    }

    await startAppForUser(user.uid);
  } else {
    authScreen.style.display = "flex";
    mainApp.style.display = "none";
    cleanupListeners();
    document.getElementById("loginPassword").value = "";
    document.getElementById("signupPassword").value = "";
    document.getElementById("signupPassword2").value = "";
  }
});

let currentUid = null;
let activeListeners = [];

function userPath(path) {
  if (!currentUid) throw new Error("Δεν έχει συνδεθεί χρήστης.");
  return "users/" + currentUid + "/" + path;
}
function cleanupListeners() {
  activeListeners.forEach(unsub => { try { unsub(); } catch (e) { } });
  activeListeners = [];
  currentUid = null;
}
function listen(path, callback) {
  const unsub = onValue(ref(db, userPath(path)), callback);
  activeListeners.push(unsub);
}

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

let currentDateKey = null;
let attendeeSearchTerm = "";

const sundaysListEl = document.getElementById("sundaysList");
const selectedSundayTitleEl = document.getElementById("selectedSundayTitle");
const overviewTextEl = document.getElementById("overviewText");
const saveOverviewBtn = document.getElementById("saveOverviewBtn");
const gospelPericopeEl = document.getElementById("gospelPericope");
const gospelPageEl = document.getElementById("gospelPage");
const saveGospelBtn = document.getElementById("saveGospelBtn");
const addAttendeeBtn = document.getElementById("addAttendeeBtn");
const refreshAttendeesBtn = document.getElementById("refreshAttendeesBtn");
const attendanceListEl = document.getElementById("attendanceList");
const attendeeSearchEl = document.getElementById("attendeeSearch");
const noSearchResultsEl = document.getElementById("noSearchResults");
const selectedSundayAttendanceEl = document.getElementById("selectedSundayAttendance");
const averageAttendanceEl = document.getElementById("averageAttendance");
const perAttendeeListEl = document.getElementById("perAttendeeList");
const overviewTableBodyEl = document.getElementById("overviewTableBody");
const profileModal = document.getElementById("profileModal");
const profileModalTitle = document.getElementById("profileModalTitle");
const closeProfileModal = document.getElementById("closeProfileModal");
const cancelProfileBtn = document.getElementById("cancelProfileBtn");
const profileForm = document.getElementById("profileForm");
const leaderboardModal = document.getElementById("leaderboardModal");
const leaderboardListEl = document.getElementById("leaderboardList");
const closeLeaderboardModal = document.getElementById("closeLeaderboardModal");
let currentProfileAttendeeId = null;
let currentProfileIsNew = false;

async function saveOverview(dateKey, text) {
  await set(ref(db, userPath('overviews/' + dateKey)), { dateKey, text });
}
async function saveGospel(dateKey, pericope, page) {
  await set(ref(db, userPath('gospels/' + dateKey)), { dateKey, pericope, page });
}
async function listAttendees() {
  const snapshot = await get(ref(db, userPath('attendees')));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map(key => Object.assign({ id: key }, data[key]))
    .sort((a, b) => {
      const nameA = a.fullName || a.name || "";
      const nameB = b.fullName || b.name || "";
      return nameA.localeCompare(nameB, "el");
    });
}
async function updateAttendee(attendeeId, newName) {
  const trimmed = newName.trim();
  if (!trimmed) throw new Error("Άδειο όνομα");
  await update(ref(db, userPath('attendees/' + attendeeId)), { name: trimmed, fullName: trimmed });
}
async function deleteAttendeeAndAttendance(attendeeId) {
  await remove(ref(db, userPath('attendees/' + attendeeId)));
  const snapshot = await get(ref(db, userPath('attendance')));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const updates = {};
    for (const dateKey in data) {
      if (data[dateKey][attendeeId]) {
        updates["users/" + currentUid + "/attendance/" + dateKey + "/" + attendeeId] = null;
      }
    }
    if (Object.keys(updates).length > 0) await update(ref(db), updates);
  }
}
async function getAttendeeProfile(attendeeId) {
  const snapshot = await get(ref(db, userPath('attendees/' + attendeeId)));
  if (!snapshot.exists()) return null;
  return Object.assign({ id: attendeeId }, snapshot.val());
}
async function updateAttendeeProfile(attendeeId, profileData) {
  const updated = Object.assign({}, profileData);
  if (profileData.fullName) updated.name = profileData.fullName.trim();
  await update(ref(db, userPath('attendees/' + attendeeId)), updated);
}
async function createNewAttendee(profileData) {
  const newRef = push(ref(db, userPath('attendees')));
  const record = Object.assign({}, profileData);
  if (profileData.fullName) record.name = profileData.fullName.trim();
  await set(newRef, record);
  return Object.assign({ id: newRef.key }, record);
}
async function setAttendance(dateKey, attendeeId, present) {
  if (present) await set(ref(db, userPath("attendance/" + dateKey + "/" + attendeeId)), true);
  else await remove(ref(db, userPath("attendance/" + dateKey + "/" + attendeeId)));
}
async function getAttendanceForDate(dateKey) {
  const snapshot = await get(ref(db, userPath('attendance/' + dateKey)));
  const map = new Map();
  if (snapshot.exists()) {
    const data = snapshot.val();
    for (const attendeeId in data) map.set(attendeeId, true);
  }
  return map;
}
async function getAllAttendanceRecords() {
  const snapshot = await get(ref(db, userPath('attendance')));
  const records = [];
  if (snapshot.exists()) {
    const data = snapshot.val();
    for (const dateKey in data) {
      for (const attendeeId in data[dateKey]) records.push({ dateKey, attendeeId, present: true });
    }
  }
  return records;
}

function renderSundaysList() {
  sundaysListEl.innerHTML = "";
  SUNDAYS.forEach(item => {
    const li = document.createElement("li");
    li.className = "sunday-item";
    li.dataset.key = item.key;
    li.innerHTML = '<span class="sunday-dot"></span><span>' + item.label + '</span>';
    li.addEventListener("click", () => selectSunday(item.key));
    sundaysListEl.appendChild(li);
  });
}

async function selectSunday(dateKey) {
  currentDateKey = dateKey;
  const selected = SUNDAYS.find(s => s.key === dateKey);
  document.querySelectorAll(".sunday-item").forEach(el =>
    el.classList.toggle("active", el.dataset.key === dateKey));
  selectedSundayTitleEl.textContent = selected ? selected.label : "Επιλέξτε Κυριακή";

  listen('overviews/' + dateKey, (snapshot) => {
    const data = snapshot.val();
    overviewTextEl.value = data ? data.text : "";
  });
  listen('gospels/' + dateKey, (snapshot) => {
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

// ============================================================
// Search toggle + listener
// ============================================================
const searchToggleBtn = document.getElementById("searchToggleBtn");
const searchWrapperEl = document.getElementById("searchWrapper");

if (searchToggleBtn && searchWrapperEl && attendeeSearchEl) {
  function openSearch() {
    searchWrapperEl.classList.add("open");
    searchToggleBtn.textContent = "✕";
    searchToggleBtn.setAttribute("aria-label", "Κλείσιμο αναζήτησης");
    setTimeout(() => attendeeSearchEl.focus(), 100);
  }
  function closeSearch() {
    searchWrapperEl.classList.remove("open");
    searchToggleBtn.textContent = "🔍";
    searchToggleBtn.setAttribute("aria-label", "Αναζήτηση");
    attendeeSearchEl.value = "";
    attendeeSearchTerm = "";
    refreshAttendanceUI();
  }
  searchToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (searchWrapperEl.classList.contains("open")) closeSearch();
    else openSearch();
  });
  attendeeSearchEl.addEventListener("input", (e) => {
    attendeeSearchTerm = e.target.value.trim().toLowerCase();
    refreshAttendanceUI();
  });
  attendeeSearchEl.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSearch();
  });
  document.addEventListener("click", (e) => {
    if (searchWrapperEl.classList.contains("open") &&
      !searchWrapperEl.contains(e.target)) {
      if (e.target === attendeeSearchEl) return;
      closeSearch();
    }
  });
  attendeeSearchEl.addEventListener("click", (e) => e.stopPropagation());
}

async function refreshAttendanceUI() {
  if (!currentDateKey || !currentUid) return;
  const unsub = onValue(ref(db, userPath('attendees')), async (snapshot) => {
    const allAttendees = snapshot.exists()
      ? Object.keys(snapshot.val()).map(key => Object.assign({ id: key }, snapshot.val()[key]))
        .sort((a, b) => {
          const nameA = a.fullName || a.name || "";
          const nameB = b.fullName || b.name || "";
          return nameA.localeCompare(nameB, "el");
        })
      : [];

    const attendees = attendeeSearchTerm
      ? allAttendees.filter(a => {
        const name = (a.fullName || a.name || "").toLowerCase();
        return name.includes(attendeeSearchTerm);
      })
      : allAttendees;

    if (noSearchResultsEl) {
      noSearchResultsEl.style.display = (attendeeSearchTerm && attendees.length === 0) ? "block" : "none";
    }

    const presentMap = await getAttendanceForDate(currentDateKey);

    attendanceListEl.innerHTML = "";
    attendees.forEach(a => {
      const displayName = a.fullName || a.name || "";
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
      name.textContent = displayName;

      const actions = document.createElement("div");
      actions.className = "attendee-actions";

      const editBtn = document.createElement("button");
      editBtn.textContent = "Επεξ.";
      editBtn.className = "edit-btn";
      editBtn.type = "button";
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openProfileModal(a.id);
      });

      const delBtn = document.createElement("button");
      delBtn.textContent = "Διαγραφή";
      delBtn.className = "danger delete-btn";
      delBtn.type = "button";
      delBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm('Διαγραφή του/της "' + displayName + '" και όλων των παρουσιών του/της;')) return;
        try {
          await deleteAttendeeAndAttendance(a.id);
          toast("Το άτομο διαγράφηκε.");
        } catch (err) {
          alert(err.message);
        }
      });

      actions.append(editBtn, delBtn);
      li.append(checkbox, name, actions);
      attendanceListEl.appendChild(li);
    });
    await refreshGlobalSections();
  });
  activeListeners.push(unsub);
}

// ============================================================
// 👇 ΝΕΟ: Προσθήκη Παιδιού ανοίγει το modal προφίλ
// ============================================================
addAttendeeBtn.addEventListener("click", () => {
  openNewAttendeeModal();
});

refreshAttendeesBtn.addEventListener("click", async () => {
  await refreshAttendanceUI();
  toast("Η λίστα ενημερώθηκε.");
});

async function refreshGlobalSections() {
  await Promise.all([renderGlobalSummary(), renderSundaysOverviewTable()]);
}

async function renderGlobalSummary() {
  if (!currentUid) return;
  const results = await Promise.all([getAllAttendanceRecords(), listAttendees()]);
  const records = results[0];
  const attendees = results[1];
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
  const idToName = new Map(attendees.map(a => [a.id, a.fullName || a.name || ""]));
  const items = Array.from(per.entries())
    .map(entry => ({ attendeeId: entry[0], name: idToName.get(entry[0]) || ('#' + entry[0]), count: entry[1] }))
    .sort((a, b) => a.name.localeCompare(b.name, "el"));

  perAttendeeListEl.innerHTML = "";
  if (items.length === 0) {
    perAttendeeListEl.innerHTML = '<li class="file-item"><span class="file-title">Καμία καταγραφή ακόμα</span></li>';
  } else {
    items.forEach(item => {
      const li = document.createElement("li");
      li.className = "file-item";
      const title = document.createElement("span");
      title.className = "file-title per-attendee-name";
      title.textContent = item.name;
      const actions = document.createElement("div");
      actions.className = "file-actions";
      const attendanceBadge = document.createElement("button");
      attendanceBadge.textContent = String(item.count);
      attendanceBadge.disabled = true;
      const giftsBadge = document.createElement("button");
      giftsBadge.textContent = "Δώρα: " + Math.floor(item.count / 4);
      giftsBadge.disabled = true;
      actions.append(attendanceBadge, giftsBadge);
      li.append(title, actions);
      perAttendeeListEl.appendChild(li);
    });
  }
}

async function renderSundaysOverviewTable() {
  if (!currentUid) return;

  const records = await getAllAttendanceRecords();
  const countsByDate = new Map();
  for (const r of records) countsByDate.set(r.dateKey, (countsByDate.get(r.dateKey) || 0) + 1);

  const snippets = await Promise.all(
    SUNDAYS.map(s => getSummarySnippetForDate(s.key))
  );

  const fragment = document.createDocumentFragment();
  SUNDAYS.forEach((item, i) => {
    const tr = document.createElement("tr");
    const tdDate = document.createElement("td");
    tdDate.textContent = item.label;
    const tdTopic = document.createElement("td");
    tdTopic.textContent = snippets[i];
    const tdCount = document.createElement("td");
    tdCount.textContent = String(countsByDate.get(item.key) || 0);
    tr.append(tdDate, tdTopic, tdCount);
    fragment.appendChild(tr);
  });

  overviewTableBodyEl.replaceChildren(fragment);
}

async function getSummarySnippetForDate(dateKey) {
  const snapshot = await get(ref(db, userPath('overviews/' + dateKey)));
  const text = snapshot.exists() ? snapshot.val().text : "";
  const first = text.split(/\r?\n/).find(l => l.trim().length > 0) || "";
  const trimmed = first.trim();
  return trimmed.length > 120 ? trimmed.slice(0, 117) + "..." : trimmed;
}

// ============================================================
// Στατιστικά Παρουσίας στο προφίλ
// ============================================================
async function renderAttendeeStats(attendeeId) {
  try {
    const allRecords = await getAllAttendanceRecords();
    const totalPresent = allRecords.filter(r => r.attendeeId === attendeeId).length;

    const sundaysWithData = new Set();
    allRecords.forEach(r => sundaysWithData.add(r.dateKey));
    const totalSundays = sundaysWithData.size;

    const percentage = totalSundays > 0 ? Math.round((totalPresent / totalSundays) * 100) : 0;

    const countEl = document.getElementById("statAttendanceCount");
    const totalEl = document.getElementById("statTotalSundays");
    const percentEl = document.getElementById("statPercentage");

    if (countEl) countEl.textContent = String(totalPresent);
    if (totalEl) totalEl.textContent = String(totalSundays);
    if (percentEl) percentEl.textContent = percentage + "%";
  } catch (e) {
    console.warn("Σφάλμα υπολογισμού στατιστικών:", e);
  }
}

// ============================================================
// 👇 ΝΕΟ: Άνοιγμα προφίλ (υπάρχοντος ή νέου)
// ============================================================
const statsBoxEl = document.querySelector(".attendance-stats-box");

async function openProfileModal(attendeeId) {
  currentProfileAttendeeId = attendeeId;
  currentProfileIsNew = false;
  const profile = await getAttendeeProfile(attendeeId);
  if (!profile) { alert("Δεν βρέθηκε το προφίλ."); return; }

  const displayName = profile.fullName || profile.name || "";
  profileModalTitle.textContent = "Προφίλ: " + displayName;
  document.getElementById("profileFullName").value = displayName;
  document.getElementById("profileAge").value = profile.age || '';
  document.getElementById("profileBirthYear").value = profile.birthYear || '';
  document.getElementById("profileClass").value = profile.class || '';
  document.getElementById("profileMum").value = profile.mum || '';
  document.getElementById("profileDad").value = profile.dad || '';
  document.getElementById("profilePhone").value = profile.phone || '';
  document.getElementById("profileEmail").value = profile.email || '';
  document.getElementById("profileComments").value = profile.comments || '';

  // Εμφάνιση στατιστικών
  if (statsBoxEl) statsBoxEl.style.display = "block";
  await renderAttendeeStats(attendeeId);

  profileModal.style.display = "flex";
}

function openNewAttendeeModal() {
  currentProfileAttendeeId = null;
  currentProfileIsNew = true;
  profileModalTitle.textContent = "Νέο Παιδί";
  profileForm.reset();

  // Απόκρυψη στατιστικών (δεν έχει νόημα για νέο παιδί)
  if (statsBoxEl) statsBoxEl.style.display = "none";

  profileModal.style.display = "flex";

  // Focus στο όνομα
  setTimeout(() => {
    const nameInput = document.getElementById("profileFullName");
    if (nameInput) nameInput.focus();
  }, 150);
}

function closeProfileModalFunc() {
  profileModal.style.display = "none";
  currentProfileAttendeeId = null;
  currentProfileIsNew = false;
  profileForm.reset();
}

closeProfileModal.addEventListener("click", closeProfileModalFunc);
cancelProfileBtn.addEventListener("click", closeProfileModalFunc);

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const fullName = document.getElementById("profileFullName").value.trim();
    if (!fullName) {
      alert("Παρακαλώ εισάγετε όνομα.");
      return;
    }
    const profileData = {
      name: fullName,
      fullName: fullName,
      age: document.getElementById("profileAge").value.trim(),
      birthYear: document.getElementById("profileBirthYear").value.trim(),
      class: document.getElementById("profileClass").value,
      mum: document.getElementById("profileMum").value.trim(),
      dad: document.getElementById("profileDad").value.trim(),
      phone: document.getElementById("profilePhone").value.trim(),
      email: document.getElementById("profileEmail").value.trim(),
      comments: document.getElementById("profileComments").value.trim()
    };

    if (currentProfileIsNew || !currentProfileAttendeeId) {
      // Δημιουργία νέου παιδιού
      await createNewAttendee(profileData);
      toast("Το παιδί προστέθηκε στη λίστα.");
    } else {
      // Ενημέρωση υπάρχοντος
      await updateAttendeeProfile(currentProfileAttendeeId, profileData);
      toast("Το προφίλ ενημερώθηκε.");
    }

    closeProfileModalFunc();
  } catch (err) {
    alert(err.message || "Σφάλμα αποθήκευσης.");
  }
});

profileModal.addEventListener("click", (e) => {
  if (e.target === profileModal) closeProfileModalFunc();
});

// ============================================================
// 👇 ΝΕΟ: Leaderboard
// ============================================================
async function showLeaderboard() {
  if (!currentUid) return;

  try {
    const records = await getAllAttendanceRecords();
    const attendees = await listAttendees();

    const countByAttendee = new Map();
    for (const r of records) {
      countByAttendee.set(r.attendeeId, (countByAttendee.get(r.attendeeId) || 0) + 1);
    }

    const items = attendees.map(a => ({
      name: a.fullName || a.name || "",
      count: countByAttendee.get(a.id) || 0
    }));

    // Φθίνουσα σειρά
    items.sort((a, b) => b.count - a.count);

    leaderboardListEl.innerHTML = "";

    if (items.length === 0) {
      const li = document.createElement("li");
      li.className = "leaderboard-empty";
      li.textContent = "Δεν υπάρχουν παιδιά ακόμα.";
      leaderboardListEl.appendChild(li);
    } else {
      items.forEach(item => {
        const li = document.createElement("li");
        li.className = "leaderboard-item";

        const nameSpan = document.createElement("span");
        nameSpan.className = "leaderboard-name";
        nameSpan.textContent = item.name;

        const countSpan = document.createElement("span");
        countSpan.className = "leaderboard-count";
        countSpan.textContent = String(item.count);

        li.append(nameSpan, countSpan);
        leaderboardListEl.appendChild(li);
      });
    }

    leaderboardModal.style.display = "flex";
  } catch (e) {
    console.error("Σφάλμα leaderboard:", e);
    alert("Σφάλμα φόρτωσης κατάταξης: " + e.message);
  }
}

function closeLeaderboard() {
  leaderboardModal.style.display = "none";
}


// Leaderboard - safe listeners (?. = ασφαλής πρόσβαση)
document.getElementById("leaderboardBtnDesktop")?.addEventListener("click", showLeaderboard);
document.getElementById("closeLeaderboardModal")?.addEventListener("click", closeLeaderboard);
document.getElementById("leaderboardModal")?.addEventListener("click", (e) => {
  if (e.target.id === "leaderboardModal") closeLeaderboard();
});

// ============================================================
let toastTimeout = null;
function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.style.position = "fixed"; el.style.bottom = "24px"; el.style.left = "50%";
    el.style.transform = "translateX(-50%)";
    el.style.background = "rgba(15, 23, 42, 0.95)"; el.style.border = "1px solid #1f2937";
    el.style.color = "#e5e7eb"; el.style.padding = "10px 14px";
    el.style.borderRadius = "10px"; el.style.zIndex = "9999";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.opacity = "1";
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { el.style.opacity = "0"; }, 1400);
}

// Αμφίδρομος υπολογισμός Ηλικίας ↔ Έτους Γέννησης
document.getElementById("profileAge").addEventListener("input", function () {
  const age = parseInt(this.value, 10);
  const birthYearInput = document.getElementById("profileBirthYear");
  const currentYear = new Date().getFullYear();
  if (!isNaN(age) && age >= 0 && age <= 100) {
    birthYearInput.value = currentYear - age;
  } else if (this.value === '') {
    birthYearInput.value = '';
  }
});

document.getElementById("profileBirthYear").addEventListener("input", function () {
  const birthYear = parseInt(this.value, 10);
  const ageInput = document.getElementById("profileAge");
  const currentYear = new Date().getFullYear();
  if (!isNaN(birthYear) && birthYear >= 1900 && birthYear <= currentYear) {
    ageInput.value = currentYear - birthYear;
  } else if (this.value === '') {
    ageInput.value = '';
  }
});

function setupMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (!menuToggle || !sidebar || !overlay) return;
  if (menuToggle.dataset.bound === "1") return;
  menuToggle.dataset.bound = "1";

  function openMenu() {
    sidebar.classList.add("open");
    overlay.classList.add("active");
    document.body.classList.add("menu-open");
  }
  function closeMenu() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    document.body.classList.remove("menu-open");
  }

  menuToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) closeMenu();
    else openMenu();
  });
  overlay.addEventListener("click", closeMenu);
  document.getElementById("sundaysList").addEventListener("click", (e) => {
    if (e.target.closest(".sunday-item") && window.innerWidth <= 900) {
      setTimeout(closeMenu, 200);
    }
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker ενεργό:', reg.scope))
        .catch(err => console.warn('Service Worker σφάλμα:', err));
    });
  }
}

async function startAppForUser(uid) {
  cleanupListeners();
  currentUid = uid;

  renderSundaysList();
  setupMobileMenu();
  registerServiceWorker();

  await refreshGlobalSections();
  if (SUNDAYS.length > 0) await selectSunday(SUNDAYS[0].key);
}
