function register() {
  const email = document.querySelector('#registerEmail').value.trim();
  const password = document.querySelector('#registerPassword').value;
  const confirmPassword = document.querySelector('#confirmPassword').value;
  const errorMessage = document.querySelector('.error-message');
  
  if (!email || !password || !confirmPassword) {
    errorMessage.textContent = 'Mohon isi semua field!';
    return;
  }
  
  if (password !== confirmPassword) {
    errorMessage.textContent = 'Kata sandi tidak cocok!';
    return;
  }
  
  try {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.email === email)) {
      errorMessage.textContent = 'Email sudah terdaftar!';
      return;
    }
    users.push({ email, password, username: email.split('@')[0], profilePicture: '' });
    localStorage.setItem('users', JSON.stringify(users));
    window.location.href = 'login.html';
  } catch (e) {
    console.error('Error during registration:', e);
    errorMessage.textContent = 'Terjadi kesalahan saat mendaftar!';
  }
}

document.querySelector('.btn-register').addEventListener('click', register);