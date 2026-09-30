import type { ApplicationStatus } from '@/types/application';
import { readable } from '@utils/format-label';

export function StatusBadge({
  status,
}: Readonly<{ status: ApplicationStatus }>) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span />
      {readable(status)}
    </span>
  );
}
