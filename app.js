let currentCategory = 'Memo';
let currentMemoId = null;
let allMemos = [];
let currentUser = null;

const unicodeMap = { 'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙', 'a': '𝐀', 'b': '𝐁', 'c': '𝐂', 'd': '𝐃', 'e': '𝐄', 'f': '𝐅', 'g': '𝐆', 'h': '𝐇', 'i': '𝐈', 'j': '𝐉', 'k': '𝐊', 'l': '𝐋', 'm': '𝐌', 'n': '𝐍', 'o': '𝐎', 'p': '𝐏', 'q': '𝐐', 'r': '𝐑', 's': '𝐒', 't': '𝐓', 'u': '𝐔', 'v': '𝐕', 'w': '𝐖', 'x': '𝐗', 'y': '𝐘', 'z': '𝐙', '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗', ' ': ' ', ':': ':', ',': ',', '.': '.', '!': '!', '?': '?', '-': '-', '_': '_', '(': '(', ')': ')', 'DECORATION_START': '✩░▒▓▆▅▃▂ ', 'DECORATION_END': ' ▂▃▅▆▓▒░✩' };
function toFancyText(text) { if (!text || typeof text !== 'string') return text || ''; return `${unicodeMap['DECORATION_START']}${text.toUpperCase().split('').map(char => unicodeMap[char] || char).join('')}${unicodeMap['DECORATION_END']}`; }

const boldSansSerifMap = {
  'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
  'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
  '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵',
  ' ': ' ', ':': ':', '!': '!', '?': '?', '.': '.', ',': ',', '-': '-', '_': '_'
};

function toMenuText(text) {
  if (!text || typeof text !== 'string') return text || '';
  return text.split('').map(char => boldSansSerifMap[char] || char).join('');
}

function initData() {
  try {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      window.location.href = 'login.html';
      return;
    }
    currentUser = JSON.parse(userData);
    if (!currentUser.username) {
      currentUser.username = currentUser.email.split('@')[0];
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email === currentUser.email);
      if (userIndex !== -1) {
        users[userIndex].username = currentUser.username;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
    document.getElementById('currentUserEmail').textContent = currentUser.username || 'Username';
    document.getElementById('profileModalUsername').textContent = currentUser.username || 'Username';
    document.getElementById('profilePicture').src = currentUser.profilePicture || `https://ui-avatars.com/api/?name=${currentUser.username.replace(/\s/g, "+")}&background=6B4EFF&color=fff`;
    if (!localStorage.getItem(`menuItems_${currentUser.email}`)) {
      localStorage.setItem(`menuItems_${currentUser.email}`, JSON.stringify(['PK', 'Line', 'Memo']));
    }
    if (!localStorage.getItem(`memos_${currentUser.email}`)) {
      localStorage.setItem(`memos_${currentUser.email}`, JSON.stringify([]));
    }
    if (!localStorage.getItem(`pinnedMenus_${currentUser.email}`)) {
      localStorage.setItem(`pinnedMenus_${currentUser.email}`, JSON.stringify([]));
    }
  } catch (e) {
    console.error('Error initializing data:', e);
    showNotification('Terjadi kesalahan saat memuat data!', 'error');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initData();
  loadInitialData();
  initTheme();
  setupEventListeners();
});

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', searchMemos);
  const profileInput = document.getElementById('profilePictureInput');
  if (profileInput) profileInput.addEventListener('change', previewProfilePicture);

  const rumusUserIdInput = document.getElementById('rumusUserIdInput');
  if(rumusUserIdInput) rumusUserIdInput.addEventListener('input', generateRumusTemplate);
  const rumusPasswordInput = document.getElementById('rumusPasswordInput');
  if(rumusPasswordInput) rumusPasswordInput.addEventListener('input', generateRumusTemplate);
}

function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  themeToggle.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  });
}

function loadInitialData() {
  loadMenuItems();
}

function loadMenuItems() {
  try {
    const allMenus = JSON.parse(localStorage.getItem(`menuItems_${currentUser.email}`) || '[]');
    const pinnedMenus = JSON.parse(localStorage.getItem(`pinnedMenus_${currentUser.email}`) || '[]');
    const menuListContainer = document.getElementById('menuList');
    if (!menuListContainer) return;
    if (allMenus.length > 0 && !allMenus.includes(currentCategory)) {
        currentCategory = allMenus[0];
    }
    menuListContainer.innerHTML = ''; 
    const pinnedItems = allMenus.filter(menu => pinnedMenus.includes(menu));
    const unpinnedItems = allMenus.filter(menu => !pinnedMenus.includes(menu));
    const createMenuItemElement = (menu, isPinned) => {
      const menuItem = document.createElement('a');
      menuItem.href = '#';
      menuItem.className = 'sidebar-link';
      menuItem.dataset.menuName = menu;
      const pinIconClass = isPinned ? 'fa-solid' : 'fa-regular';
      menuItem.innerHTML = `
        <div class="menu-item-main"><i class="fa-solid fa-table-list"></i><span>${toMenuText(menu)}</span></div>
        <div class="menu-actions">
          <button class="menu-btn pin-btn" onclick="event.preventDefault(); event.stopPropagation(); togglePinMenu('${menu}')" title="${isPinned ? 'Unpin' : 'Pin'} Menu"><i class="${pinIconClass} fa-thumbtack"></i></button>
          <button class="menu-btn" onclick="event.preventDefault(); event.stopPropagation(); showEditMenuModal('${menu}')" title="Edit Menu"><i class="fa-solid fa-pencil"></i></button>
          <button class="menu-btn" onclick="event.preventDefault(); event.stopPropagation(); deleteMenu('${menu}')" title="Hapus Menu"><i class="fa-solid fa-trash-can"></i></button>
        </div>`;
      menuItem.onclick = (e) => { e.preventDefault(); selectMenu(menu); };
      return menuItem;
    };
    if (pinnedItems.length > 0) {
      const pinnedHeader = document.createElement('p');
      pinnedHeader.className = 'menu-header';
      pinnedHeader.textContent = 'PINNED';
      menuListContainer.appendChild(pinnedHeader);
      pinnedItems.forEach(menu => { menuListContainer.appendChild(createMenuItemElement(menu, true)); });
    }
    if (unpinnedItems.length > 0) {
        if (pinnedItems.length > 0) {
            const unpinnedHeader = document.createElement('p');
            unpinnedHeader.className = 'menu-header';
            unpinnedHeader.style.marginTop = '15px';
            unpinnedHeader.textContent = 'ALL MENUS';
            menuListContainer.appendChild(unpinnedHeader);
        }
        unpinnedItems.forEach(menu => { menuListContainer.appendChild(createMenuItemElement(menu, false)); });
    }
    selectMenu(currentCategory || (allMenus.length > 0 ? allMenus[0] : null));
  } catch (e) {
    console.error('Error loading menu items:', e);
    showNotification('Terjadi kesalahan saat memuat menu!', 'error');
  }
}

function selectMenu(menu) {
  if (!menu) {
    document.getElementById('memoContainer').innerHTML = '<div class="memo-empty">Tidak ada menu yang dipilih.</div>';
    document.getElementById('currentCategory').textContent = 'Memo';
    document.getElementById('header-subtitle').textContent = 'Silakan buat menu baru untuk memulai.';
    document.querySelectorAll('.sidebar-link').forEach(item => item.classList.remove('active'));
    return;
  }
  document.querySelectorAll('.sidebar-link').forEach(item => { item.classList.toggle('active', item.dataset.menuName === menu); });
  currentCategory = menu;
  document.getElementById('currentCategory').textContent = toMenuText(menu);
  document.getElementById('header-subtitle').textContent = 'Kelola semua data Anda di sini';
  loadMemos(menu);
}

function loadMemos(category) {
  try {
    const memos = JSON.parse(localStorage.getItem(`memos_${currentUser.email}`) || '[]');
    allMemos = memos.filter(memo => memo.category === category);
    renderMemos(allMemos);
  } catch (e) {
    console.error('Error loading memos:', e);
    showNotification('Terjadi kesalahan saat memuat memo!', 'error');
  }
}

function renderMemos(memos) {
  const memoContainer = document.getElementById('memoContainer');
  if (!memoContainer) return;
  memoContainer.innerHTML = memos.length === 0 ? '<div class="memo-empty">Tidak ada memo ditemukan di menu ini.</div>' : '';
  memos.forEach(memo => {
    const memoItem = document.createElement('div');
    memoItem.className = 'memo-item';
    const titleToShow = memo.title || toFancyText(memo.originalTitle);
    memoItem.innerHTML = `
      <div class="memo-header"><div class="memo-title">${escapeHtml(titleToShow)}</div><div class="memo-actions"><button class="memo-action-btn" onclick="editMemo('${memo.id}')" title="Edit">✏️</button><button class="memo-action-btn" onclick="deleteMemo('${memo.id}')" title="Hapus">🗑️</button></div></div>
      <div class="memo-body"><div class="copy-container"><button class="copy-btn" onclick="copyMemoDescription('${memo.id}')"><i class="fa-regular fa-copy"></i> Copy PK</button><div class="memo-desc">${escapeHtml(memo.description).replace(/\n/g, '<br>')}</div></div></div>
      <div class="memo-footer"><div>${memo.date || ''}</div><div>✓</div></div>`;
    memoContainer.appendChild(memoItem);
  });
}

// --- FUNGSI RUMUS (FINAL & CORRECTED) ---

// Fungsi ini memastikan modal SELALU terbuka dalam keadaan terkunci.
function showRumusModal() {
  const passwordInput = document.getElementById('rumusPasswordInput');
  const lockIcon = document.querySelector('#togglePasswordLockBtn i');
  
  // Ambil password yang tersimpan dari localStorage
  const savedPassword = localStorage.getItem(`rumusPassword_${currentUser.email}`) || '';
  passwordInput.value = savedPassword;

  // Hapus value user ID dan Hasil Rumus dari sesi sebelumnya
  document.getElementById('rumusUserIdInput').value = '';
  document.getElementById('rumusResult').value = '';

  // Atur ke keadaan terkunci secara default SETIAP KALI modal dibuka
  passwordInput.disabled = true;
  lockIcon.classList.remove('fa-lock-open');
  lockIcon.classList.add('fa-lock');
  
  showModal('rumusModal');
}

// Fungsi ini hanya mengubah status dan UI untuk sesi modal saat ini.
function togglePasswordLock() {
  const passwordInput = document.getElementById('rumusPasswordInput');
  const lockIcon = document.querySelector('#togglePasswordLockBtn i');
  
  // Ubah status disabled pada input
  passwordInput.disabled = !passwordInput.disabled;

  // Ubah ikon dan beri notifikasi
  if (passwordInput.disabled) {
    lockIcon.classList.remove('fa-lock-open');
    lockIcon.classList.add('fa-lock');
    showNotification('Password dikunci.', 'error');
  } else {
    lockIcon.classList.remove('fa-lock');
    lockIcon.classList.add('fa-lock-open');
    showNotification('Password tidak dikunci. Anda bisa mengubahnya.');
    passwordInput.focus();
  }
}

function generateRumusTemplate() {
    const userId = (document.getElementById('rumusUserIdInput').value || '').trim();
    const password = (document.getElementById('rumusPasswordInput').value || '').trim();
    
    if (!userId) {
        document.getElementById('rumusResult').value = '';
        return '';
    }

    const template = `Untuk user id anda : ${userId}\npassword : ${password}\nSilahkan dicoba login ya bosku\nKami sarankan silakan lakukan pergantian password secara berkala pada menu GANTI PASWORD\nTerima Kasih.`;
    document.getElementById('rumusResult').value = template;
    return template;
}

// Fungsi ini menyimpan password HANYA jika gemboknya terbuka (input tidak disabled).
function generateAndCopyRumus() {
  const userId = (document.getElementById('rumusUserIdInput').value || '').trim();
  const newPassword = (document.getElementById('rumusPasswordInput').value || '').trim();
  const passwordInput = document.getElementById('rumusPasswordInput');

  if (!userId) {
    showNotification('User ID tidak boleh kosong!', 'error');
    return;
  }
  if (!newPassword) {
    showNotification('Password tidak boleh kosong!', 'error');
    return;
  }
  
  // Cek apakah input sedang aktif (tidak di-disable)
  const wasPasswordChanged = !passwordInput.disabled;

  // Jika password diubah (karena gembok terbuka), simpan yang baru
  if (wasPasswordChanged) {
    localStorage.setItem(`rumusPassword_${currentUser.email}`, newPassword);
  }

  const template = generateRumusTemplate(); 

  if (template) {
    navigator.clipboard.writeText(template).then(() => {
      // Tampilkan notifikasi yang sesuai
      if (wasPasswordChanged) {
        showNotification('Password baru disimpan & rumus disalin!');
      } else {
        showNotification('Rumus berhasil disalin!');
      }
      // TUTUP MODAL SECARA OTOMATIS
      hideModal('rumusModal');
    }).catch(err => {
      console.error('Gagal menyalin:', err);
      showNotification('Gagal menyalin rumus', 'error');
    });
  }
}

// Fungsi escapeHtml yang benar
function copyMemoDescription(memoId) { const memo = allMemos.find(m => m.id === memoId); if (memo) { navigator.clipboard.writeText(memo.description).then(() => { showNotification('Deskripsi berhasil disalin!'); }).catch(err => { console.error('Gagal menyalin:', err); showNotification('Gagal menyalin deskripsi', 'error'); }); } }
function showNotification(message, type = 'success') { const notification = document.getElementById('notification'); const notificationMsg = document.getElementById('notificationMessage'); if (notification && notificationMsg) { notificationMsg.textContent = message; notification.className = `notification ${type === 'error' ? 'error' : ''}`; notification.classList.add('show'); setTimeout(() => notification.classList.remove('show'), 3000); } }
function searchMemos() { const query = (document.getElementById('searchInput')?.value || '').toLowerCase().trim(); const filteredMemos = allMemos.filter(memo => (memo.originalTitle || '').toLowerCase().includes(query) || (memo.description || '').toLowerCase().includes(query)); renderMemos(filteredMemos); }
function showModal(id) { const modal = document.getElementById(id); if (modal) modal.classList.add('active'); }
function hideModal(id) { const modal = document.getElementById(id); if (modal) modal.classList.remove('active'); }
function toggleProfileModal() { const modal = document.getElementById('profileModal'); if (modal) modal.classList.toggle('active'); }
function hideProfileModal() { const modal = document.getElementById('profileModal'); if (modal) modal.classList.remove('active'); }
function showUpdateProfilePictureModal() { hideProfileModal(); const fileInput = document.getElementById('profilePictureInput'); const preview = document.getElementById('profilePicturePreview'); if (fileInput && preview) { fileInput.value = ''; preview.src = ''; preview.style.display = 'none'; showModal('updateProfilePictureModal'); } }
function previewProfilePicture(event) { const file = event.target.files[0]; const preview = document.getElementById('profilePicturePreview'); if (file && preview) { const reader = new FileReader(); reader.onload = function(e) { preview.src = e.target.result; preview.style.display = 'block'; }; reader.readAsDataURL(file); } }
function saveProfilePicture() { const fileInput = document.getElementById('profilePictureInput'); if (!fileInput || !fileInput.files || fileInput.files.length === 0) { showNotification('Silakan pilih gambar terlebih dahulu!', 'error'); return; } const reader = new FileReader(); reader.onload = function(e) { let users = JSON.parse(localStorage.getItem('users') || '[]'); const userIndex = users.findIndex(u => u.email === currentUser.email); if (userIndex !== -1) { users[userIndex].profilePicture = e.target.result; localStorage.setItem('users', JSON.stringify(users)); currentUser.profilePicture = e.target.result; localStorage.setItem('currentUser', JSON.stringify(currentUser)); document.getElementById('profilePicture').src = e.target.result; showNotification('Foto profil berhasil diperbarui!'); hideModal('updateProfilePictureModal'); } }; reader.readAsDataURL(fileInput.files[0]); }
function showUpdateUsernameModal() { hideProfileModal(); const usernameInput = document.getElementById('newUsername'); if (usernameInput) { usernameInput.value = currentUser.username || ''; showModal('updateUsernameModal'); } }
function saveUsername() { const newUsername = (document.getElementById('newUsername')?.value || '').trim(); if (!newUsername) { showNotification('Username tidak boleh kosong!', 'error'); return; } let users = JSON.parse(localStorage.getItem('users') || '[]'); const usernameExists = users.some(u => u.username === newUsername && u.email !== currentUser.email); if (usernameExists) { showNotification('Username sudah digunakan!', 'error'); return; } const userIndex = users.findIndex(u => u.email === currentUser.email); if (userIndex !== -1) { users[userIndex].username = newUsername; localStorage.setItem('users', JSON.stringify(users)); currentUser.username = newUsername; localStorage.setItem('currentUser', JSON.stringify(currentUser)); document.getElementById('currentUserEmail').textContent = newUsername; document.getElementById('profileModalUsername').textContent = newUsername; document.getElementById('profilePicture').src = currentUser.profilePicture || `https://ui-avatars.com/api/?name=${currentUser.username.replace(/\s/g, "+")}&background=6B4EFF&color=fff`; showNotification('Username berhasil diperbarui!'); hideModal('updateUsernameModal'); } }
function showAddMenuModal() { const menuInput = document.getElementById('newMenuName'); if (menuInput) { menuInput.value = ''; showModal('addMenuModal'); } }
function addNewMenu() { let menuName = (document.getElementById('newMenuName').value || '').trim(); if (!menuName) { showNotification('Nama menu tidak boleh kosong!', 'error'); return; } menuName = menuName.toUpperCase(); const menus = JSON.parse(localStorage.getItem(`menuItems_${currentUser.email}`) || '[]'); if (menus.some(m => m.toUpperCase() === menuName)) { showNotification('Menu sudah ada!', 'error'); return; } menus.push(menuName); localStorage.setItem(`menuItems_${currentUser.email}`, JSON.stringify(menus)); loadMenuItems(); hideModal('addMenuModal'); showNotification('Menu berhasil ditambahkan!'); }
function togglePinMenu(menuName) { let pinnedMenus = JSON.parse(localStorage.getItem(`pinnedMenus_${currentUser.email}`) || '[]'); const menuIndex = pinnedMenus.indexOf(menuName); if (menuIndex > -1) { pinnedMenus.splice(menuIndex, 1); showNotification(`Menu "${menuName}" dilepas.`); } else { pinnedMenus.push(menuName); showNotification(`Menu "${menuName}" di-pin.`); } localStorage.setItem(`pinnedMenus_${currentUser.email}`, JSON.stringify(pinnedMenus)); loadMenuItems(); }
function showEditMenuModal(menuName) { document.getElementById('editMenuName').value = menuName; document.getElementById('oldMenuName').value = menuName; showModal('editMenuModal'); }
function updateMenuName() { const oldName = document.getElementById('oldMenuName').value; let newName = (document.getElementById('editMenuName').value || '').trim(); if (!newName) { showNotification('Nama menu baru tidak boleh kosong!', 'error'); return; } newName = newName.toUpperCase(); if (newName === oldName) { hideModal('editMenuModal'); return; } let menus = JSON.parse(localStorage.getItem(`menuItems_${currentUser.email}`) || '[]'); if (menus.some(m => m.toUpperCase() === newName)) { showNotification(`Menu dengan nama "${newName}" sudah ada!`, 'error'); return; } const menuIndex = menus.findIndex(m => m === oldName); if (menuIndex > -1) { menus[menuIndex] = newName; } localStorage.setItem(`menuItems_${currentUser.email}`, JSON.stringify(menus)); let pinnedMenus = JSON.parse(localStorage.getItem(`pinnedMenus_${currentUser.email}`) || '[]'); const pinnedIndex = pinnedMenus.findIndex(p => p === oldName); if (pinnedIndex > -1) { pinnedMenus[pinnedIndex] = newName; localStorage.setItem(`pinnedMenus_${currentUser.email}`, JSON.stringify(pinnedMenus)); } let memos = JSON.parse(localStorage.getItem(`memos_${currentUser.email}`) || '[]'); memos.forEach(memo => { if (memo.category === oldName) { memo.category = newName; } }); localStorage.setItem(`memos_${currentUser.email}`, JSON.stringify(memos)); if (currentCategory === oldName) { currentCategory = newName; selectMenu(newName); } hideModal('editMenuModal'); showNotification('Nama menu berhasil diubah!'); loadMenuItems(); }
function deleteMenu(menuName) { const confirmationMessage = `Apakah Anda yakin ingin menghapus menu "${menuName}"? Ini akan menghapus semua memo di dalamnya.`; if (confirm(confirmationMessage)) { let menus = JSON.parse(localStorage.getItem(`menuItems_${currentUser.email}`) || '[]'); let pinnedMenus = JSON.parse(localStorage.getItem(`pinnedMenus_${currentUser.email}`) || '[]'); menus = menus.filter(menu => menu !== menuName); localStorage.setItem(`menuItems_${currentUser.email}`, JSON.stringify(menus)); pinnedMenus = pinnedMenus.filter(pin => pin !== menuName); localStorage.setItem(`pinnedMenus_${currentUser.email}`, JSON.stringify(pinnedMenus)); let memos = JSON.parse(localStorage.getItem(`memos_${currentUser.email}`) || '[]'); const updatedMemos = memos.filter(memo => memo.category !== menuName); localStorage.setItem(`memos_${currentUser.email}`, JSON.stringify(updatedMemos)); if (currentCategory === menuName) { currentCategory = menus.length > 0 ? menus[0] : null; } loadInitialData(); showNotification('Menu berhasil dihapus!'); } }
function showAddMemoModal() { currentMemoId = null; const titleInput = document.getElementById('memoModalTitle'); const memoTitle = document.getElementById('memoTitle'); const memoDesc = document.getElementById('memoDescription'); if (titleInput && memoTitle && memoDesc) { titleInput.textContent = 'Tambah Memo Baru'; memoTitle.value = ''; memoDesc.value = ''; showModal('memoModal'); } }
function editMemo(id) { currentMemoId = id; const memo = allMemos.find(m => m.id === id); const titleInput = document.getElementById('memoModalTitle'); const memoTitle = document.getElementById('memoTitle'); const memoDesc = document.getElementById('memoDescription'); if (memo && titleInput && memoTitle && memoDesc) { titleInput.textContent = 'Edit Memo'; memoTitle.value = memo.originalTitle || ''; memoDesc.value = memo.description; showModal('memoModal'); } }
function saveMemo() { const originalTitle = (document.getElementById('memoTitle')?.value || '').trim(); const description = (document.getElementById('memoDescription')?.value || '').trim(); if (!originalTitle || !description) { showNotification('Judul dan deskripsi harus diisi!', 'error'); return; } const fancyTitle = toFancyText(originalTitle); try { let memos = JSON.parse(localStorage.getItem(`memos_${currentUser.email}`) || '[]'); const now = new Date(); const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`; if (currentMemoId) { const memoIndex = memos.findIndex(m => m.id === currentMemoId); if (memoIndex !== -1) { memos[memoIndex] = { ...memos[memoIndex], title: fancyTitle, originalTitle: originalTitle.toUpperCase(), description, date: formattedDate }; } } else { memos.push({ id: Date.now().toString(), date: formattedDate, category: currentCategory, title: fancyTitle, originalTitle: originalTitle.toUpperCase(), description, status: '✓' }); } localStorage.setItem(`memos_${currentUser.email}`, JSON.stringify(memos)); hideModal('memoModal'); loadMemos(currentCategory); showNotification('Memo berhasil disimpan!'); } catch (e) { console.error('Error saving memo:', e); showNotification('Terjadi kesalahan saat menyimpan memo!', 'error'); } }
function deleteMemo(id) { if (confirm('Apakah Anda yakin ingin menghapus memo ini?')) { try { let memos = JSON.parse(localStorage.getItem(`memos_${currentUser.email}`) || '[]'); const updatedMemos = memos.filter(memo => memo.id !== id); localStorage.setItem(`memos_${currentUser.email}`, JSON.stringify(updatedMemos)); loadMemos(currentCategory); showNotification('Memo berhasil dihapus!'); } catch (e) { console.error('Error deleting memo:', e); showNotification('Terjadi kesalahan saat menghapus memo!', 'error'); } } }
function exportData() { try { const dataToExport = { menus: JSON.parse(localStorage.getItem(`menuItems_${currentUser.email}`)), memos: JSON.parse(localStorage.getItem(`memos_${currentUser.email}`)), pinnedMenus: JSON.parse(localStorage.getItem(`pinnedMenus_${currentUser.email}`)) }; const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `backup-data-${currentUser.username}.json`; a.click(); URL.revokeObjectURL(url); showNotification('Data berhasil diekspor!'); } catch (e) { console.error('Error exporting data:', e); showNotification('Terjadi kesalahan saat mengekspor data!', 'error'); } }
function importData(event) { try { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function(e) { try { const data = JSON.parse(e.target.result); if (data.menus) localStorage.setItem(`menuItems_${currentUser.email}`, JSON.stringify(data.menus)); if (data.memos) localStorage.setItem(`memos_${currentUser.email}`, JSON.stringify(data.memos)); if (data.pinnedMenus) localStorage.setItem(`pinnedMenus_${currentUser.email}`, JSON.stringify(data.pinnedMenus)); showNotification('Data berhasil diimpor! Halaman akan dimuat ulang.'); setTimeout(() => location.reload(), 2000); } catch (err) { console.error('Error parsing imported data:', err); showNotification('File JSON tidak valid!', 'error'); } }; reader.readAsText(file); event.target.value = ''; } catch (e) { console.error('Error importing data:', e); showNotification('Terjadi kesalahan saat mengimpor data!', 'error'); } }
function logout() { if (confirm('Apakah Anda yakin ingin logout?')) { localStorage.removeItem('currentUser'); window.location.href = 'login.html'; } }
