const DashboardPage = () => {
  const stats = [
    { label: 'Total Customers', value: '0' },
    { label: 'Low Stock Products', value: '0' },
    { label: 'Draft Challans', value: '0' },
    { label: 'Confirmed This Month', value: '0' }
  ];

  return (
    <section className="fade-in">
      <h2 style={{ marginBottom: '1rem' }}>Dashboard</h2>
      <div className="grid-cards">
        {stats.map((stat) => (
          <article className="card" key={stat.label}>
            <div className="label">{stat.label}</div>
            <div className="value">{stat.value}</div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default DashboardPage;
