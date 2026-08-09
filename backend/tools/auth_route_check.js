const base = 'http://localhost:5000/api';

const users = [
  { email: 'admin@mini-erp.local', password: 'Admin@123', name: 'admin' },
  { email: 'sales@mini-erp.local', password: 'Sales@123', name: 'sales' },
  { email: 'warehouse@mini-erp.local', password: 'Warehouse@123', name: 'warehouse' },
  { email: 'accounts@mini-erp.local', password: 'Accounts@123', name: 'accounts' }
];

const endpoints = [
  { method: 'GET', path: '/auth/users' },
  { method: 'GET', path: '/customers' },
  { method: 'GET', path: '/products' },
  { method: 'GET', path: '/challans' },
  { method: 'GET', path: '/dashboard' }
];

(async () => {
  for (const u of users) {
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: u.email, password: u.password })
    });
    const loginJson = await loginRes.json();
    const token = loginJson?.data?.token;
    console.log(`\n=== User: ${u.name} (${u.email}) token ${token ? 'OK' : 'FAILED'} ===`);

    for (const ep of endpoints) {
      try {
        const res = await fetch(`${base}${ep.path}`, {
          method: ep.method,
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`${ep.method} ${ep.path} -> ${res.status}`);
      } catch (err) {
        console.log(`${ep.method} ${ep.path} -> ERROR ${err.message}`);
      }
    }
  }
})();
