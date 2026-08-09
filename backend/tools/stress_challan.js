require('dotenv').config();
const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

const base = 'http://localhost:5000/api';

const admin = { email: 'admin@mini-erp.local', password: 'Admin@123' };

const run = async () => {
  const loginRes = await (await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(admin)
  })).json();
  const token = loginRes.data.token;
  console.log('token', !!token);

  for (let i = 0; i < 10; i++) {
    try {
      const payload = { customerId: 1, items: [{ productId: 1, quantity: 1 }] };
      const createRes = await (await fetch(`${base}/challans`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })).json();
      console.log('create', createRes.success, createRes.data?.id);
      const id = createRes.data?.id;
      const confirmRes = await (await fetch(`${base}/challans/${id}/confirm`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })).json();
      console.log('confirm', confirmRes.success, confirmRes.message);
    } catch (err) {
      console.error('error', err.message || err);
    }
  }
};

run();
