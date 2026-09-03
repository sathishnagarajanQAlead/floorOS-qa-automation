/**
 * Data-driven layer: put a module's test-case rows in a JSON file under
 * `src/data/<module>/`, load it with this, and loop over the rows in the
 * spec to generate one Playwright test per row. Keeps test data out of
 * the spec file so non-engineers can extend coverage by editing JSON.
 *
 * Usage:
 *   import cases from '../../src/data/crm/create-lead.data.json';
 *   for (const c of readData<CreateLeadCase>(cases)) { ... }
 */
export function readData<T>(rows: unknown): T[] {
  return rows as T[];
}
