export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  value?: (row: T) => unknown;
}

export function formatTable<T extends Record<string, unknown>>(
  rows: T[],
  columns: TableColumn<T>[],
): string {
  const renderedRows = rows.map((row) =>
    columns.map((column) => stringifyCell(resolveCell(row, column))),
  );
  const headers = columns.map((column) => column.header);
  const widths = headers.map((header, index) =>
    Math.max(
      header.length,
      ...renderedRows.map((row) => row[index]?.length ?? 0),
    ),
  );

  const lines = [
    renderLine(headers, widths),
    renderLine(
      widths.map((width) => "-".repeat(width)),
      widths,
    ),
    ...renderedRows.map((row) => renderLine(row, widths)),
  ];

  return `${lines.join("\n")}\n`;
}

function resolveCell<T extends Record<string, unknown>>(
  row: T,
  column: TableColumn<T>,
): unknown {
  return column.value ? column.value(row) : row[column.key as keyof T];
}

function stringifyCell(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
}

function renderLine(cells: string[], widths: number[]): string {
  return cells
    .map((cell, index) => cell.padEnd(widths[index] ?? cell.length))
    .join("  ")
    .trimEnd();
}
