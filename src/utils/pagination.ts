import { Request } from "express";
import { OptionsQuery } from "../types/pagination.types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export function parsePaginationQuery(
  query: Request["query"],
  allowedSortFields: string[],
  defaultSortBy: string,
): OptionsQuery {
  const page = Math.max(1, parseInt(query.page as string) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit as string) || DEFAULT_LIMIT),
  );
  const search = (query.search as string)?.trim() || undefined;
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  let sortBy = defaultSortBy;
  if (query.sortBy && allowedSortFields.includes(query.sortBy as string)) {
    sortBy = query.sortBy as string;
  }

  return { page, limit, search, sortBy, sortOrder };
}
