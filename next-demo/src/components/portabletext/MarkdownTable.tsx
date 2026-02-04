interface MarkdownTableProps {
  value: {
    rows?: string[];
  };
}

export function MarkdownTable({ value }: MarkdownTableProps) {
  const rows = value.rows || [];
  if (rows.length < 2) return null;

  const headerCells = rows[0]
    .split("|")
    .filter((cell) => cell.trim() !== "")
    .map((cell) => cell.trim());

  const dataRows = rows
    .slice(2)
    .filter((row) => row.trim() !== "" && !row.match(/^\|[-\s|]+\|$/))
    .map((row) =>
      row
        .split("|")
        .filter((cell) => cell.trim() !== "")
        .map((cell) => cell.trim()),
    )
    .filter((row) => row.length > 0);

  return (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border-collapse text-gray-900 dark:text-white">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            {headerCells.map((cell, i) => (
              <th
                key={i}
                className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, i) => (
            <tr
              key={i}
              className="bg-white dark:bg-gray-800 even:bg-gray-50 even:dark:bg-gray-900"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
