/**
 * Trả về Date chỉ chứa năm/tháng/ngày (UTC) để khớp với @db.Date của Prisma.
 * VD: 2026-08-15T00:00:00.000Z
 */
export function getToday(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}
