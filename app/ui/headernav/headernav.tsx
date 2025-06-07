import Link from "next/link";

interface HeaderNavProps {
  title: string;
  newLink?: string;
}

export default function HeaderNav({ title, newLink }: HeaderNavProps) {
  return (
    <div className="flex h-16 items-center justify-between">
      <h1 className="text-2xl font-bold">{title}</h1>
      {newLink && (
        <Link
          className="rounded-md bg-primary px-4 py-2 text-white"
          href={newLink}
        >
          New
        </Link>
      )}
    </div>
  );
}
