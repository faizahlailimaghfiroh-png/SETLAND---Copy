/* SETLAND - script.js (letakkan satu folder dengan index.html) */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY = 'setland_db', SES = 'setland_session';

const TOPICS = [
  { id: 0, title: 'Pengertian Himpunan', desc: 'Anggota, notasi, dan cara menyatakan himpunan.',
    materi: 'Himpunan adalah kumpulan objek yang didefinisikan dengan jelas. Dinyatakan dengan huruf kapital, anggotanya ditulis di dalam kurung kurawal, contoh A = {1, 2, 3}. Simbol ∈ berarti "anggota dari".',
    qs: [
      { q: 'Manakah yang merupakan himpunan?', o: ['Kumpulan siswa pintar', 'Kumpulan bilangan prima kurang dari 10', 'Kumpulan buah enak', 'Kumpulan film bagus'], a: 1, h: 'Himpunan harus didefinisikan dengan jelas, tidak boleh bergantung pada selera.' },
      { q: 'A = {2, 4, 6}. Banyak anggota A, n(A), adalah...', o: ['2', '3', '4', '6'], a: 1, h: 'Hitung berapa elemen di dalam kurung kurawal.' },
      { q: 'Jika B = {a, b, c}, pernyataan yang benar adalah...', o: ['d ∈ B', 'a ∈ B', 'b ∉ B', 'c ∉ B'], a: 1, h: '∈ berarti "anggota dari", ∉ berarti bukan anggota.' } ] },
  { id: 1, title: 'Operasi Himpunan', desc: 'Irisan, gabungan, selisih, dan komplemen.',
    materi: 'Irisan (A ∩ B) berisi anggota yang ada di A dan B. Gabungan (A ∪ B) berisi semua anggota A atau B. Selisih (A − B) berisi anggota A yang tidak ada di B.',
    qs: [
      { q: 'A = {1,2,3}, B = {2,3,4}. A ∩ B = ...', o: ['{1,4}', '{2,3}', '{1,2,3,4}', '{1}'], a: 1, h: 'Irisan = anggota yang dimiliki kedua himpunan.' },
      { q: 'A = {1,2,3}, B = {2,3,4}. A ∪ B = ...', o: ['{2,3}', '{1,4}', '{1,2,3,4}', '{1,2,3}'], a: 2, h: 'Gabungan = semua anggota, tulis anggota yang sama sekali saja.' },
      { q: 'A = {1,2,3}, B = {2,3,4}. A − B = ...', o: ['{1}', '{4}', '{2,3}', '{1,4}'], a: 0, h: 'Ambil anggota A yang tidak ada di B.' } ] },
  { id: 2, title: 'Diagram Venn', desc: 'Menyajikan himpunan dan menyelesaikan soal cerita.',
    materi: 'Diagram Venn menyajikan himpunan dengan kurva tertutup di dalam persegi panjang (semesta S). Untuk soal cerita: n(A ∪ B) = n(A) + n(B) − n(A ∩ B).',
    qs: [
      { q: 'n(A)=10, n(B)=8, n(A∩B)=3. n(A∪B) = ...', o: ['21', '18', '15', '11'], a: 2, h: 'Gunakan n(A∪B) = n(A) + n(B) − n(A∩B).' },
      { q: 'Di kelas 30 siswa, 18 suka bola, 15 suka basket, 5 tidak suka keduanya. Yang suka keduanya?', o: ['5', '8', '10', '13'], a: 1, h: 'Yang suka minimal satu = 30 − 5 = 25. Lalu pakai rumus gabungan.' },
      { q: 'Persegi panjang pada diagram Venn mewakili...', o: ['Irisan', 'Himpunan kosong', 'Himpunan semesta', 'Komplemen'], a: 2, h: 'Ia memuat semua himpunan yang dibicarakan.' } ] }
];

let db = JSON.parse(localStorage.getItem(KEY) || 'null') || {
  users: [
    { name: 'Administrator', email: 'admin@setland.id', pass: 'admin123', role: 'admin', read: 0 },
    { name: 'Guru Matematika', email: 'guru@setland.id', pass: 'guru123', role: 'guru', read: 0 }
  ],
  results: [], notifs: [{ text: 'Selamat datang di SETLAND! Selesaikan tugas dengan nilai ≥ 60 untuk membuka materi berikutnya.', date: new Date().toLocaleDateString('id-ID') }]
};
const save = () => localStorage.setItem(KEY, JSON.stringify(db));
let me = null, role = 'siswa', view = 'home', task = null, chart = null, stream = null, cameraOpen = false;

/* ---------- AUTH ---------- */
function selectRole(r) {
  role = r;
  ['Siswa', 'Guru', 'Admin'].forEach(n => $('roleBtn' + n).classList.toggle('active', n.toLowerCase() === r));
  $('regHelpText').classList.toggle('hidden', r !== 'siswa');
  toggleAuthMode('login');
}
function toggleAuthMode(m) {
  $('loginForm').classList.toggle('hidden', m !== 'login');
  $('registerForm').classList.toggle('hidden', m !== 'register');
}
function handleLogin(e) {
  e.preventDefault();
  const u = db.users.find(x => x.email === $('loginEmail').value.trim().toLowerCase() && x.pass === $('loginPassword').value && x.role === role);
  if (!u) return alert('Email, kata sandi, atau peran salah.');
  sessionStorage.setItem(SES, u.email); start(u);
}
function handleRegister(e) {
  e.preventDefault();
  const email = $('regEmail').value.trim().toLowerCase();
  if ($('regPassword').value !== $('regPasswordConfirm').value) return alert('Konfirmasi kata sandi tidak cocok.');
  if (db.users.some(u => u.email === email)) return alert('Email sudah terdaftar.');
  db.users.push({ name: $('regName').value.trim(), dob: $('regDob').value, gender: $('regGender').value, email, pass: $('regPassword').value, role: 'siswa', read: 0 });
  save(); alert('Registrasi berhasil! Silakan login.');
  $('registerForm').reset(); toggleAuthMode('login'); $('loginEmail').value = email;
}
function logout() {
  sessionStorage.removeItem(SES); me = null; task = null;
  ['navRight', 'appLayout'].forEach(i => $(i).style.display = 'none');
  $('authOverlay').classList.remove('hidden'); $('authOverlay').style.display = 'flex';
  $('loginForm').reset();
}
function start(u) {
  me = u; view = 'home'; task = null;
  $('authOverlay').style.display = 'none';
  $('navRight').style.display = 'flex'; $('appLayout').style.display = 'flex';
  $('userNameDisplay').textContent = u.name + ' (' + u.role + ')';
  $('notifWrapper').classList.remove('hidden');
  render();
}

/* ---------- NOTIFIKASI ---------- */
function updateBell() {
  $('bellDot').classList.toggle('read', me.read >= db.notifs.length);
  $('notifList').innerHTML = db.notifs.slice().reverse().map(n => `<div class="notif-item">${esc(n.text)}<br><small style="color:#999">${esc(n.date)}</small></div>`).join('') || '<div class="notif-item">Belum ada pengumuman.</div>';
}
function toggleNotifications() { $('notifDropdown').classList.toggle('active'); }
function clearNotifDot(e) { e.stopPropagation(); me.read = db.notifs.length; save(); updateBell(); }
document.addEventListener('click', e => { if (!$('notifWrapper').contains(e.target)) $('notifDropdown').classList.remove('active'); });

/* ---------- NAVIGASI ---------- */
const MENUS = {
  siswa: [['home', 'fa-house', 'Beranda'], ['tugas', 'fa-pen-to-square', 'Tugas'], ['nilai', 'fa-chart-line', 'Nilai Saya']],
  guru: [['home', 'fa-house', 'Beranda'], ['nilai', 'fa-table', 'Nilai Siswa'], ['info', 'fa-bullhorn', 'Buat Pengumuman']],
  admin: [['home', 'fa-house', 'Beranda'], ['users', 'fa-users', 'Kelola Pengguna'], ['info', 'fa-bullhorn', 'Buat Pengumuman']]
};
function go(v) {
  if (task && !confirm('Keluar dari tugas? Jawaban belum tersimpan.')) return;
  stopTracking(); task = null; view = v; render();
}
function render() {
  $('sidebarNav').innerHTML = '<div class="sidebar-section-title">Menu ' + me.role + '</div>' +
    MENUS[me.role].map(m => `<button class="nav-btn ${view === m[0] ? 'active' : ''}" onclick="go('${m[0]}')"><i class="fa-solid ${m[1]}"></i> ${m[2]}</button>`).join('');
  updateBell();
  if (chart) { chart.destroy(); chart = null; }
  const v = $('mainView');
  if (task) return renderTask(v);
  const fn = { home: viewHome, tugas: viewHome, nilai: viewNilai, info: viewInfo, users: viewUsers }[view];
  fn(v);
}

/* ---------- SISWA ---------- */
const best = (email, id) => Math.max(-1, ...db.results.filter(r => r.email === email && r.topic === id).map(r => r.score));
const unlocked = i => i === 0 || best(me.email, i - 1) >= 60;
function welcome(v, extra = '') {
  v.innerHTML = `<div class="welcome-card"><div><h2>Halo, ${esc(me.name)}!</h2><p>${esc(extra)}</p></div><i class="fa-solid fa-shapes" style="font-size:3rem;color:var(--pink-medium)"></i></div>`;
}
function viewHome(v) {
  if (me.role !== 'siswa') {
    welcome(v, 'Selamat datang di panel ' + me.role + '.');
    const s = db.users.filter(u => u.role === 'siswa').length;
    v.innerHTML += `<div class="cards-grid"><div class="card"><h3>${s}</h3><p>Siswa terdaftar</p></div><div class="card"><h3>${db.results.length}</h3><p>Tugas terkumpul</p></div><div class="card"><h3>${db.results.filter(r => r.cheats > 0).length}</h3><p>Terindikasi keluar halaman</p></div></div>`;
    return;
  }
  welcome(v, view === 'tugas' ? 'Pilih tugas yang ingin dikerjakan.' : 'Pelajari materi, lalu kerjakan tugas.');
  let h = '<div class="cards-grid">';
  TOPICS.forEach((t, i) => {
    const ok = unlocked(i), b = best(me.email, i);
    h += `<div class="card"><div class="card-header"><div class="card-icon ${i % 2 ? 'icon-pink' : 'icon-green'}"><i class="fa-solid fa-circle-nodes"></i></div>
      ${ok ? '<span class="unlock-badge">Terbuka</span>' : '<span class="lock-badge"><i class="fa-solid fa-lock"></i> Terkunci</span>'}</div>
      <h3>${t.title}</h3><p style="font-size:.85rem;color:#666;margin:6px 0">${t.desc}</p>
      ${ok ? `<p style="font-size:.85rem;margin:8px 0">${view === 'tugas' ? '' : esc(t.materi)}</p>` : '<p style="font-size:.8rem;color:#c62828;margin:8px 0">Selesaikan tugas sebelumnya (nilai ≥ 60).</p>'}
      <p style="font-size:.8rem;margin-bottom:10px">Nilai terbaik: <b>${b < 0 ? '-' : b}</b></p>
      <button class="btn btn-primary" ${ok ? '' : 'disabled'} onclick="openTask(${i})"><i class="fa-solid fa-pen"></i> Kerjakan Tugas</button></div>`;
  });
  v.innerHTML += h + '</div>';
}

/* ---------- TUGAS + ANTI CURANG ---------- */
function openTask(i) {
  task = { i, ans: {}, cheats: 0, photo: null, checked: false };
  startTracking(); render();
}
function onLeave() {
  if (!task || cameraOpen) return;
  if (document.hidden) { task.cheats++; task.warn = true; }
}
function onReturn() { if (task && task.warn) { task.warn = false; showCheat(); } }
function startTracking() { document.addEventListener('visibilitychange', onLeave); window.addEventListener('focus', onReturn); }
function stopTracking() { document.removeEventListener('visibilitychange', onLeave); window.removeEventListener('focus', onReturn); }
function showCheat() {
  let el = $('cheatBar'); if (!el) return;
  el.innerHTML = `<div class="cheat-alert"><i class="fa-solid fa-triangle-exclamation"></i> Terdeteksi meninggalkan halaman ${task.cheats}x. Hal ini dilaporkan ke guru.</div>`;
}
function renderTask(v) {
  const t = TOPICS[task.i];
  let h = `<h2 style="color:var(--green-primary)">Tugas: ${t.title}</h2><div id="cheatBar"></div>`;
  t.qs.forEach((q, qi) => {
    h += `<div class="card" style="margin:14px 0"><p><b>${qi + 1}.</b> ${esc(q.q)}</p>` +
      q.o.map((o, oi) => `<label style="display:block;margin:6px 0;cursor:pointer"><input type="radio" name="q${qi}" ${task.ans[qi] === oi ? 'checked' : ''} onchange="task.ans[${qi}]=${oi}"> ${esc(o)}</label>`).join('') +
      `<div id="sc${qi}"></div></div>`;
  });
  h += `<div style="display:flex;gap:10px;flex-wrap:wrap">
    <button class="btn btn-outline" onclick="crosscheck()"><i class="fa-solid fa-lightbulb"></i> Cek Jawaban (Petunjuk)</button>
    <button class="btn btn-outline" onclick="openCamera()"><i class="fa-solid fa-camera"></i> Lampirkan Foto</button>
    <button class="btn btn-primary" onclick="askSubmit()"><i class="fa-solid fa-paper-plane"></i> Kirim</button></div>
    <p id="photoInfo" style="font-size:.8rem;margin-top:10px">${task.photo ? '✔ Foto terlampir' : ''}</p>`;
  v.innerHTML = h;
  if (task.cheats) showCheat();
}
function crosscheck() {
  const t = TOPICS[task.i];
  t.qs.forEach((q, qi) => {
    const a = task.ans[qi], el = $('sc' + qi);
    if (a === undefined) el.innerHTML = '<div class="scaffold-box error-scaffold">Soal ini belum dijawab.</div>';
    else if (a === q.a) el.innerHTML = '<div class="scaffold-box"><i class="fa-solid fa-check"></i> Jawabanmu sudah tepat, lanjutkan!</div>';
    else el.innerHTML = `<div class="scaffold-box error-scaffold"><i class="fa-solid fa-lightbulb"></i> Petunjuk: ${esc(q.h)}</div>`;
  });
}
function askSubmit() {
  const n = TOPICS[task.i].qs.length - Object.keys(task.ans).length;
  $('confirmModalText').textContent = n ? `Masih ada ${n} soal belum dijawab. Tetap kirim?` : 'Apakah Anda sudah yakin dengan jawaban Anda?';
  $('confirmModal').classList.add('active');
}
function closeModal(id) { $(id).classList.remove('active'); }
function submitTaskFinal() {
  closeModal('confirmModal');
  const t = TOPICS[task.i];
  const right = t.qs.filter((q, i) => task.ans[i] === q.a).length;
  const score = Math.round(right / t.qs.length * 100);
  db.results.push({ email: me.email, name: me.name, topic: task.i, score, cheats: task.cheats, photo: !!task.photo, date: new Date().toLocaleString('id-ID') });
  save(); stopTracking();
  const nextOpen = score >= 60 && task.i < TOPICS.length - 1;
  alert(`Nilai kamu: ${score}.` + (score >= 60 ? (nextOpen ? ' Materi berikutnya terbuka!' : ' Selamat!') : ' Belum mencapai 60, coba lagi.'));
  task = null; view = 'nilai'; render();
}

/* ---------- KAMERA ---------- */
async function openCamera() {
  cameraOpen = true; $('cameraModal').classList.add('active');
  $('photoPreview').classList.add('hidden'); $('webcamVideo').classList.remove('hidden');
  $('btnCapture').classList.remove('hidden'); $('btnRetake').classList.add('hidden'); $('btnUsePhoto').disabled = true;
  try { stream = await navigator.mediaDevices.getUserMedia({ video: true }); $('webcamVideo').srcObject = stream; }
  catch (e) { alert('Kamera tidak dapat diakses: ' + e.message); closeCameraModal(); }
}
function stopStream() { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } }
function capturePhoto() {
  const vid = $('webcamVideo'), c = $('photoCanvas');
  if (!vid.videoWidth) return;
  c.width = vid.videoWidth; c.height = vid.videoHeight;
  c.getContext('2d').drawImage(vid, 0, 0);
  $('photoPreview').src = c.toDataURL('image/jpeg', 0.7);
  $('photoPreview').classList.remove('hidden'); vid.classList.add('hidden');
  $('btnCapture').classList.add('hidden'); $('btnRetake').classList.remove('hidden'); $('btnUsePhoto').disabled = false;
}
function retakePhoto() {
  $('photoPreview').classList.add('hidden'); $('webcamVideo').classList.remove('hidden');
  $('btnCapture').classList.remove('hidden'); $('btnRetake').classList.add('hidden'); $('btnUsePhoto').disabled = true;
}
function useCapturedPhoto() {
  task.photo = $('photoPreview').src; closeCameraModal();
  const p = $('photoInfo'); if (p) p.textContent = '✔ Foto terlampir';
}
function closeCameraModal() {
  stopStream(); $('cameraModal').classList.remove('active');
  setTimeout(() => { cameraOpen = false; if (task) task.warn = false; }, 500);
}

/* ---------- NILAI ---------- */
function viewNilai(v) {
  const isS = me.role === 'siswa';
  const rows = db.results.filter(r => isS ? r.email === me.email : true).slice().reverse();
  welcome(v, isS ? 'Riwayat nilai tugasmu.' : 'Hasil pengerjaan seluruh siswa.');
  v.innerHTML += `<div class="card"><canvas id="chart" height="90"></canvas></div>
    <table class="data-table"><tr>${isS ? '' : '<th>Siswa</th>'}<th>Materi</th><th>Nilai</th><th>Keluar Halaman</th><th>Foto</th><th>Waktu</th></tr>` +
    (rows.map(r => `<tr>${isS ? '' : `<td>${esc(r.name)}</td>`}<td>${TOPICS[r.topic].title}</td><td><b>${r.score}</b></td><td>${r.cheats ? '<span style="color:#c62828">' + r.cheats + 'x</span>' : '0'}</td><td>${r.photo ? 'Ada' : '-'}</td><td>${esc(r.date)}</td></tr>`).join('') || '<tr><td colspan="6">Belum ada data.</td></tr>') + '</table>';
  const avg = TOPICS.map(t => { const s = db.results.filter(r => r.topic === t.id && (!isS || r.email === me.email)).map(r => r.score); return s.length ? Math.round(s.reduce((a, b) => a + b) / s.length) : 0; });
  if (window.Chart) chart = new Chart($('chart'), { type: 'bar', data: { labels: TOPICS.map(t => t.title), datasets: [{ label: 'Rata-rata nilai', data: avg, backgroundColor: ['#a5d6a7', '#f48fb1', '#2e7d32'] }] }, options: { scales: { y: { min: 0, max: 100 } } } });
}

/* ---------- GURU / ADMIN ---------- */
function viewInfo(v) {
  welcome(v, 'Kirim pengumuman ke semua siswa.');
  v.innerHTML += `<div class="card"><div class="form-group"><label>Isi pengumuman</label><textarea id="infoText" class="form-control" rows="3"></textarea></div><button class="btn btn-secondary" onclick="sendInfo()"><i class="fa-solid fa-paper-plane"></i> Kirim</button></div>`;
}
function sendInfo() {
  const t = $('infoText').value.trim(); if (!t) return;
  db.notifs.push({ text: t, date: new Date().toLocaleDateString('id-ID') }); save(); updateBell(); $('infoText').value = ''; alert('Pengumuman terkirim.');
}
function viewUsers(v) {
  welcome(v, 'Kelola akun pengguna.');
  v.innerHTML += '<table class="data-table"><tr><th>Nama</th><th>Email</th><th>Peran</th><th>Aksi</th></tr>' +
    db.users.map((u, i) => `<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${u.role}</td><td>${u.role === 'admin' ? '-' : `<button class="btn btn-secondary" style="padding:4px 10px" onclick="delUser(${i})">Hapus</button>`}</td></tr>`).join('') + '</table>';
}
function delUser(i) {
  if (!confirm('Hapus pengguna ini?')) return;
  db.results = db.results.filter(r => r.email !== db.users[i].email); db.users.splice(i, 1); save(); render();
}

/* ---------- INIT ---------- */
(function init() {
  const em = sessionStorage.getItem(SES), u = em && db.users.find(x => x.email === em);
  if (u) start(u); else selectRole('siswa');
})();