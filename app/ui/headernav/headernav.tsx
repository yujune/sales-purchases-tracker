interface HeaderNavProps {
  title: string;
  onNew?: () => void;
}

export default function HeaderNav({ title, onNew }: HeaderNavProps) {
  return (
    <div className="flex h-16 items-center justify-between">
      <h1 className="text-2xl font-bold">{title}</h1>
      <button
        className="rounded-md bg-primary px-4 py-2 text-white"
        onClick={onNew}
      >
        New
      </button>
    </div>
  );
}
