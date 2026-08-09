const base = 'http://localhost:5000/api';

const admin = { email: 'admin@mini-erp.local', password: 'Admin@123' };

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  try {
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin)
    });
    const loginJson = await loginRes.json();
    const token = loginJson?.data?.token;
    if (!token) {
      console.error('Login failed', loginJson);
      process.exit(1);
    }

    const customersRes = await fetch(`${base}/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const customersJson = await customersRes.json();
    const customer = customersJson.data && customersJson.data[0];
    if (!customer) {
      console.error('No customer found');
      process.exit(1);
    }

    const productsRes = await fetch(`${base}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const productsJson = await productsRes.json();
    const product = productsJson.data && productsJson.data[0];
    if (!product) {
      console.error('No product found');
      process.exit(1);
    }

    for (let i = 0; i < 5; i++) {
      console.log('\n--- Run', i + 1, '---');
      // create challan
      const createRes = await fetch(`${base}/challans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerId: customer.id, items: [{ productId: product.id, quantity: 1 }] })
      });
      const createJson = await createRes.json();
      console.log('Create status', createRes.status, createJson.message || createJson);

      if (createRes.status === 201 && createJson.data && createJson.data.id) {
        const id = createJson.data.id;
        // try confirm
        const confirmRes = await fetch(`${base}/challans/${id}/confirm`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        const confirmJson = await confirmRes.json();
        console.log('Confirm status', confirmRes.status, confirmJson.message || confirmJson);
      }

      await delay(500);
    }
  } catch (err) {
    console.error('Error in repro script', err);
  }
})();
