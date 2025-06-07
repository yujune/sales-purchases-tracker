import {
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

import { Pagination } from "./pagination";

interface PaginationMenuProps {
  page: number;
  totalPages: number;
  href: string;
}

export default function PaginationMenu({
  page,
  totalPages,
  href,
}: PaginationMenuProps) {
  return (
    <div className="mt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={`${href}?page=${Math.max(1, page - 1)}`}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href={`${href}?page=${pageNum}`}
                  isActive={pageNum === page}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              href={`${href}?page=${Math.min(totalPages, page + 1)}`}
              className={
                page >= totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
