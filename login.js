function login() {
  const email = document.querySelector('#loginEmail').value.trim();
  const password = document.querySelector('#loginPassword').value;
  const errorMessage = document.querySelector('.error-message');
  
  if (!email || !password) {
    errorMessage.textContent = 'Mohon isi email dan kata sandi!';
    return;
  }
  
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      errorMessage.textContent = 'Email atau kata sandi salah!';
      return;
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'index.html';
  } catch (e) {
    console.error('Error during login:', e);
    errorMessage.textContent = 'Terjadi kesalahan saat login!';
  }
}

document.querySelector('.btn-login').addEventListener('click', login);
