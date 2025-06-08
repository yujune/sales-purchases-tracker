import { InboxIcon } from "@heroicons/react/24/outline";

export default function Empty() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-lg border border-dashed border-gray-300 p-8 text-center">
      <InboxIcon className="h-12 w-12 text-gray-400" />
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">No items found</h3>
        <p className="text-sm text-gray-500">
          Get started by adding your first item
        </p>
      </div>
    </div>
  );
}
