const PlaceholderPage = ({ title }) => {
  return (
    <section className="card fade-in">
      <h2>{title}</h2>
      <p className="muted" style={{ marginTop: '0.8rem' }}>
        Module UI is queued for this section in upcoming steps.
      </p>
    </section>
  );
};

export default PlaceholderPage;
