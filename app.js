const API_URL = 'http://localhost:3000/api';

async function signup() {
  const name = document.getElementById('signupName').value;
  const password = document.getElementById('signupPassword').value;
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password })
  });
  const data = await response.json();
  alert(data.message);
  if (response.ok) {
    localStorage.setItem('token', data.token);
    showDashboard();
  }
}

async function login() {
  const name = document.getElementById('loginName').value;
  const password = document.getElementById('loginPassword').value;
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password })
  });
  const data = await response.json();
  alert(data.message);
  if (response.ok) {
    localStorage.setItem('token', data.token);
    showDashboard();
  }
}

async function redeemCode() {
  const code = document.getElementById('licenseCode').value;
  const response = await fetch(`${API_URL}/redeem`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ code })
  });
  const data = await response.json();
  alert(data.message);
  if (response.ok) showAnimation();
}

async function transfer() {
  const name = document.getElementById('transferName').value;
  const amount = document.getElementById('transferAmount').value;
  const response = await fetch(`${API_URL}/transfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ name, amount })
  });
  const data = await response.json();
  alert(data.message);
  if (response.ok) showAnimation();
}

async function loadLeaderboard() {
  const response = await fetch(`${API_URL}/leaderboard`);
  const data = await response.json();
  const leaderboard = document.getElementById('leaderboard');
  leaderboard.innerHTML = '';
  data.forEach((user, index) => {
    leaderboard.innerHTML += `<tr><td class="p-2">${index + 1}</td><td class="p-2">${user.name}</td><td class="p-2">${user.dollars}</td></tr>`;
  });
}

function showAdminPanel() {
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('adminPanel').classList.remove('hidden');
}

async function loginAdmin() {
  const password = document.getElementById('adminPassword').value;
  if (password === 'Alireza.dr.N') {
    document.getElementById('adminControls').classList.remove('hidden');
  } else {
    alert('رمز اشتباه است');
  }
}

async function createLicense() {
  const amount = document.getElementById('licenseAmount').value;
  const response = await fetch(`${API_URL}/admin/license`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ amount })
  });
  const data = await response.json();
  alert(`کد ساخته شد: ${data.code}`);
}

async function deleteUser() {
  const name = document.getElementById('deleteUserName').value;
  const response = await fetch(`${API_URL}/admin/user/${name}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  const data = await response.json();
  alert(data.message);
}

function showDashboard() {
  document.getElementById('auth').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  loadLeaderboard();
}

function showAnimation() {
  const container = document.getElementById('animationContainer');
  container.classList.remove('hidden');
  lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: 'https://assets.lottiefiles.com/packages/lf20_j3fcm3.json' // انیمیشن تیک سبز
  }).addEventListener('complete', () => {
    container.classList.add('hidden');
  });
}

if (localStorage.getItem('token')) showDashboard();
