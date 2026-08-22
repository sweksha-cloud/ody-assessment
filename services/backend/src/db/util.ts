// Postgres guarantees an INSERT ... RETURNING with a single-row VALUES list
// returns exactly one row; this just satisfies noUncheckedIndexedAccess.
export function firstOrThrow<T>(rows: T[], message = "Expected at least one row"): T {
  const [row] = rows;
  if (row === undefined) throw new Error(message);
  return row;
}
