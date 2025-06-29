// Variabel global
let currentCategory = 'Memo';
let currentMemoId = null;
let allMemos = [];
let activeBottomMenu = 'home';
let currentUser = null;

// Peta karakter Unicode untuk gaya teks tebal kapital dengan dekorasi
const unicodeMap = {
  'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
  'a': '𝐀', 'b': '𝐁', 'c': '𝐂', 'd': '𝐃', 'e': '𝐄', 'f': '𝐅', 'g': '𝐆', 'h': '𝐇', 'i': '𝐈', 'j': '𝐉', 'k': '𝐊', 'l': '𝐋', 'm': '𝐌', 'n': '𝐍', 'o': '𝐎', 'p': '𝐏', 'q': '𝐐', 'r': '𝐑', 's': '𝐒', 't': '𝐓', 'u': '𝐔', 'v': '𝐕', 'w': '𝐖', 'x': '𝐗', 'y': '𝐘', 'z': '𝐙',
  '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗',
  ' ': ' ', ':': ':', ',': ',', '.': '.', '!': '!', '?': '?', '-': '-', '_': '_', '(': '(', ')': ')',
  'DECORATION_START': '✩░▒▓▆▅▃▂▁',
  'DECORATION_END': '▁▂▃▅▆▓▒░✩'
};

// Fungsi untuk mengonversi teks ke gaya Unicode dengan dekorasi dan huruf kapital
function toFancyText(text) {
  if (!text || typeof text !== 'string') return text || '';
  const decoratedText = `${unicodeMap['DECORATION_START']}${text.toUpperCase().split('').map(char => unicodeMap[char] || char).join('')}${unicodeMap['DECORATION_END']}`;
  return decoratedText;
}

// Inisialisasi data dengan penanganan error
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
    document.getElementById('profilePicture').src = currentUser.profilePicture || 'https://via.placeholder.com/40';
    if (!localStorage.getItem(`menuItems_${currentUser.email}`)) {
      localStorage.setItem(`menuItems_${currentUser.email}`, JSON.stringify(['Memo', 'PK', 'Line']));
    }
    if (!localStorage.getItem(`memos_${currentUser.email}`)) {
      localStorage.setItem(`memos_${currentUser.email}`, JSON.stringify([]));
    }
  } catch (e) {
    console.error('Error initializing data:', e);
    showNotification('Terjadi kesalahan saat memuat data!', 'error');
    currentUser = { email: 'default@example.com', username: 'Default' }; // Fallback
    document.getElementById('currentUserEmail').textContent = 'Default';
    document.getElementById('profileModalUsername').textContent = 'Default';
  }
}

// Muat data awal saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
  initData();
  loadInitialData();
  initTheme();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', searchMemos);
  const profileInput = document.getElementById('profilePictureInput');
  if (profileInput) profileInput.addEventListener('change', previewProfilePicture);
}

// Fungsi inisialisasi tema
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  themeToggle.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });
}

// Fungsi inisialisasi
function loadInitialData() {
  loadMenuItems();
  loadMemos(currentCategory);
}

// Muat daftar menu dari localStorage
function loadMenuItems() {
  try {
    const menus = JSON.parse(localStorage.getItem(`menuItems_${currentUser.email}`) || '[]');
    const menuList = document.getElementById('menuList');
    if (!menuList) return;
    menuList.innerHTML = menus.length === 0 ? '<div style="padding:10px;color:#757575;">Belum ada menu</div>' : '';
    menus.forEach(menu => {
      const menuItem = document.createElement('div');
      menuItem.className = 'menu-item';
      menuItem.innerHTML = `<span>${menu}</span><div class="menu-actions"><button class="menu-btn" onclick="event.stopPropagation();deleteMenu('${menu}')">🗑️</button></div>`;
      menuItem.onclick = () => selectMenu(menu);
      menuList.appendChild(menuItem);
    });
    if (menus.length > 0) selectMenu(menus[0]);
  } catch (e) {
    console.error('Error loading menu items:', e);
    showNotification('Terjadi kesalahan saat memuat menu!', 'error');
  }
}

// Pilih menu/kategori
function selectMenu(menu) {
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.toggle('active', item.textContent.includes(menu));
  });
  currentCategory = menu;
  document.getElementById('currentCategory').textContent = menu;
  loadMemos(menu);
}

// Muat memo berdasarkan kategori
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

// Render daftar memo ke HTML
function renderMemos(memos) {
  const memoContainer = document.getElementById('memoContainer');
  if (!memoContainer) return;
  memoContainer.innerHTML = memos.length === 0 ? '<div style="text-align:center;padding:30px;color:#757575;">Tidak ada memo ditemukan</div>' : '';
  memos.forEach(memo => {
    const memoItem = document.createElement('div');
    memoItem.className = 'memo-item';
    memoItem.innerHTML = `
      <div class="memo-header">
        <div class="memo-title">${memo.title}</div>
        <div class="memo-actions">
          <button class="memo-action-btn" onclick="editMemo('${memo.id}')" title="Edit">✏️</button>
          <button class="memo-action-btn" onclick="deleteMemo('${memo.id}')" title="Hapus">🗑️</button>
        </div>
      </div>
      <div class="memo-body">
        <div class="copy-container">
          <button class="copy-btn" onclick="copyToClipboard('${escapeHtml(memo.description)}')">
            <span class="copy-icon">⎘</span> Copy PK
          </button>
          <div class="memo-desc">${memo.description}</div>
        </div>
      </div>
      <div class="memo-footer">
        <div>${memo.date || ''}</div>
        <div>✓</div>
      </div>
    `;
    memoContainer.appendChild(memoItem);
  });
}

// Fungsi untuk menghindari XSS
function escapeHtml(unsafe) {
  return (unsafe || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/\n/g, "<br>");
}

// Fungsi copy ke clipboard
function copyToClipboard(text) {
  const decodedText = (text || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, "'").replace(/<br>/g, '\n');
  navigator.clipboard.writeText(decodedText).then(() => {
    showNotification('Deskripsi berhasil disalin!');
  }).catch(err => {
    console.error('Gagal menyalin:', err);
    showNotification('Gagal menyalin deskripsi', 'error');
  });
}

// Tampilkan notifikasi
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  const notificationMsg = document.getElementById('notificationMessage');
  if (notification && notificationMsg) {
    notificationMsg.textContent = message;
    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
  }
}

// Fungsi pencarian memo (hanya pada judul asli, mengabaikan perbedaan font)
function searchMemos() {
  const query = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  if (!query) {
    renderMemos(allMemos);
    return;
  }

  // Filter memo berdasarkan kesamaan pada originalTitle (teks asli)
  const filteredMemos = allMemos.filter(memo => 
    memo.originalTitle.toLowerCase().includes(query)
  );

  renderMemos(filteredMemos);
}

// Fungsi modal
function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function hideModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

function toggleProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) modal.classList.toggle('active');
}

function hideProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) modal.classList.remove('active');
}

// Fungsi update profile picture
function showUpdateProfilePictureModal() {
  hideProfileModal();
  const fileInput = document.getElementById('profilePictureInput');
  const preview = document.getElementById('profilePicturePreview');
  if (fileInput && preview) {
    fileInput.value = '';
    preview.style.display = 'none';
    showModal('updateProfilePictureModal');
  }
}

function previewProfilePicture(event) {
  const file = event.target.files[0];
  const preview = document.getElementById('profilePicturePreview');
  if (file && preview) {
    const reader = new FileReader();
    reader.onload = function(e) { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(file);
  }
}

function saveProfilePicture() {
  const fileInput = document.getElementById('profilePictureInput');
  if (fileInput && !fileInput.files[0]) {
    showNotification('Silakan pilih gambar terlebih dahulu!', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
      users[userIndex].profilePicture = e.target.result;
      localStorage.setItem('users', JSON.stringify(users));
      currentUser.profilePicture = e.target.result;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      document.getElementById('profilePicture').src = e.target.result;
      showNotification('Foto profil berhasil diperbarui!');
      hideModal('updateProfilePictureModal');
    }
  };
  if (fileInput) reader.readAsDataURL(fileInput.files[0]);
}

// Fungsi update username
function showUpdateUsernameModal() {
  hideProfileModal();
  const usernameInput = document.getElementById('newUsername');
  if (usernameInput) {
    usernameInput.value = currentUser.username || '';
    showModal('updateUsernameModal');
  }
}

function saveUsername() {
  const newUsername = (document.getElementById('newUsername')?.value || '').trim();
  if (!newUsername) {
    showNotification('Username tidak boleh kosong!', 'error');
    return;
  }
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  const usernameExists = users.some(u => u.username === newUsername && u.email !== currentUser.email);
  if (usernameExists) {
    showNotification('Username sudah digunakan!', 'error');
    return;
  }
  const userIndex = users.findIndex(u => u.email === currentUser.email);
  if (userIndex !== -1) {
    users[userIndex].username = newUsername;
    localStorage.setItem('users', JSON.stringify(users));
    currentUser.username = newUsername;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    document.getElementById('currentUserEmail').textContent = newUsername;
    document.getElementById('profileModalUsername').textContent = newUsername;
    showNotification('Username berhasil diperbarui!');
    hideModal('updateUsernameModal');
  }
}

// Tambah menu baru
function showAddMenuModal() {
  const menuInput = document.getElementById('newMenuName');
  if (menuInput) {
    menuInput.value = '';
    showModal('addMenuModal');
  }
}

function addNewMenu() {
  const menuName = (document.getElementById('newMenuName')?.value || '').trim();
  if (!menuName) {
    showNotification('Nama menu tidak boleh kosong!', 'error');
    return;
  }
  const menus = JSON.parse(localStorage.getItem(`menuItems_${currentUser.email}`) || '[]');
  if (menus.includes(menuName)) {
    showNotification('Menu sudah ada!', 'error');
    return;
  }
  menus.push(menuName);
  localStorage.setItem(`menuItems_${currentUser.email}`, JSON.stringify(menus));
  loadMenuItems();
  hideModal('addMenuModal');
  showNotification('Menu berhasil ditambahkan!');
}

// Hapus menu
function deleteMenu(menuName) {
  if (confirm(`Apakah Anda yakin ingin menghapus menu "${menuName}"?`)) {
    const menus = JSON.parse(localStorage.getItem(`menuItems_${currentUser.email}`) || '[]');
    const updatedMenus = menus.filter(menu => menu !== menuName);
    localStorage.setItem(`menuItems_${currentUser.email}`, JSON.stringify(updatedMenus));
    loadMenuItems();
    showNotification('Menu berhasil dihapus!');
  }
}

// Tambah/edit memo
function showAddMemoModal() {
  currentMemoId = null;
  const titleInput = document.getElementById('memoModalTitle');
  const memoTitle = document.getElementById('memoTitle');
  const memoDesc = document.getElementById('memoDescription');
  if (titleInput && memoTitle && memoDesc) {
    titleInput.textContent = 'Tambah Memo Baru';
    memoTitle.value = '';
    memoDesc.value = '';
    showModal('memoModal');
  }
}

function editMemo(id) {
  currentMemoId = id;
  const memo = allMemos.find(m => m.id === id);
  const titleInput = document.getElementById('memoModalTitle');
  const memoTitle = document.getElementById('memoTitle');
  const memoDesc = document.getElementById('memoDescription');
  if (memo && titleInput && memoTitle && memoDesc) {
    titleInput.textContent = 'Edit Memo';
    memoTitle.value = memo.originalTitle || memo.title;
    memoDesc.value = memo.description.replace(/<br>/g, '\n');
    showModal('memoModal');
  }
}

function saveMemo() {
  const originalTitle = (document.getElementById('memoTitle')?.value || '').trim();
  const description = (document.getElementById('memoDescription')?.value || '').trim();
  if (!originalTitle || !description) {
    showNotification('Judul dan deskripsi harus diisi!', 'error');
    return;
  }
  const fancyTitle = toFancyText(originalTitle);
  try {
    let memos = JSON.parse(localStorage.getItem(`memos_${currentUser.email}`) || '[]');
    const now = new Date();
    const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    if (currentMemoId) {
      const memoIndex = memos.findIndex(m => m.id === currentMemoId);
      if (memoIndex !== -1) {
        memos[memoIndex] = { ...memos[memoIndex], title: fancyTitle, originalTitle, description, date: formattedDate };
      }
    } else {
      memos.push({ id: Date.now().toString(), date: formattedDate, category: currentCategory, title: fancyTitle, originalTitle, description, status: '✓' });
    }
    localStorage.setItem(`memos_${currentUser.email}`, JSON.stringify(memos));
    hideModal('memoModal');
    loadMemos(currentCategory);
    showNotification('Memo berhasil disimpan!');
  } catch (e) {
    console.error('Error saving memo:', e);
    showNotification('Terjadi kesalahan saat menyimpan memo!', 'error');
  }
}

function deleteMemo(id) {
  if (confirm('Apakah Anda yakin ingin menghapus memo ini?')) {
    try {
      let memos = JSON.parse(localStorage.getItem(`memos_${currentUser.email}`) || '[]');
      const updatedMemos = memos.filter(memo => memo.id !== id);
      localStorage.setItem(`memos_${currentUser.email}`, JSON.stringify(updatedMemos));
      loadMemos(currentCategory);
      showNotification('Memo berhasil dihapus!');
    } catch (e) {
      console.error('Error deleting memo:', e);
      showNotification('Terjadi kesalahan saat menghapus memo!', 'error');
    }
  }
}

// Fungsi logout
function logout() {
  if (confirm('Apakah Anda yakin ingin logout?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}
