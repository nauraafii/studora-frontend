export function FilterTabs<T extends string>({ items, value, onChange }: {
  items: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="filter-tabs" role="group" aria-label="Filter daftar">
      {items.map((item) => (
        <button
          type="button"
          aria-pressed={value === item.value}
          className={value === item.value ? "filter-tab is-selected" : "filter-tab"}
          key={item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
