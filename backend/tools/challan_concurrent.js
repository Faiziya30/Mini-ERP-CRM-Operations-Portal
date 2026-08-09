const base = 'http://localhost:5000/api';
const admin = { email: 'admin@mini-erp.local', password: 'Admin@123' };

(async () => {
  const loginRes = await fetch(`${base}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(admin)
  });
  const loginJson = await loginRes.json();
  const token = loginJson?.data?.token;
  if (!token) { console.error('login failed', loginJson); return; }

  const productsRes = await fetch(`${base}/products`, { headers: { Authorization: `Bearer ${token}` } });
  const productsJson = await productsRes.json();
  const product = productsJson.data && productsJson.data[0];
  if (!product) { console.error('no product'); return; }

  const customersRes = await fetch(`${base}/customers`, { headers: { Authorization: `Bearer ${token}` } });
  const customersJson = await customersRes.json();
  const customer = customersJson.data && customersJson.data[0];
  if (!customer) { console.error('no customer'); return; }

  const concurrency = 30;
  const promises = [];
  for (let i = 0; i < concurrency; i++) {
    promises.push(
      fetch(`${base}/challans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerId: customer.id, items: [{ productId: product.id, quantity: 1 }] })
      }).then(async (res) => ({ status: res.status, body: await res.json() })).catch((err) => ({ error: err.message }))
    );
  }

  const results = await Promise.all(promises);
  results.forEach((r, idx) => console.log(`#${idx + 1}`, r.status || 'ERR', r.body?.message || r.error || JSON.stringify(r.body)));
})();
