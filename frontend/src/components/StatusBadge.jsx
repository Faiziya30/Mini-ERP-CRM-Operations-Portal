const StatusBadge = ({ status }) => {
  const s = String(status || 'draft').toLowerCase();
  return <span className={`badge badge-${s} status-${s}`}>{status}</span>;
};

export default StatusBadge;
