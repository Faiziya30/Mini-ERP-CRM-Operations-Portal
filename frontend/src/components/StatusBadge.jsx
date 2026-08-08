import { useMemo } from 'react';

const StatusBadge = ({ status, index = 0, className = '' }) => {
  const normStatus = String(status || 'Draft').toLowerCase();

  // Vary rotation slightly per instance or status so stamps don't look uniform
  const rotationDeg = useMemo(() => {
    const rotations = [-4, -3, -5, -3.5, -4.5];
    return rotations[Math.abs(index) % rotations.length];
  }, [index]);

  return (
    <span
      className={`stamp-badge stamp-${normStatus} ${className}`}
      style={{ transform: `rotate(${rotationDeg}deg)` }}
    >
      {status ? status.toUpperCase() : 'DRAFT'}
    </span>
  );
};

export default StatusBadge;
