/**
 * Branded identifier to distinguish TagIDs from arbitrary strings.
 */
export type TagID = string & { readonly __tagId: unique symbol };

/**
 * Utility helper to coerce raw strings into TagIDs in controlled places.
 */
export const toTagID = (value: string): TagID => value as TagID;

/**
 * Canonical action types supported by the platform.
 */
export enum ActionType {
  PHOTO_CAPTURE = "PHOTO_CAPTURE",
  PHOTO_VIEW = "PHOTO_VIEW",
  REDIRECT = "REDIRECT"
}

export interface ResolvedActionTarget {
  /**
   * The logical destination. "service" means call another Worker, "url" means redirect.
   */
  type: "service" | "url";
  /**
   * Service binding name or absolute URL depending on the target type.
   */
  value: string;
}

/**
 * Result payload returned by tag-core once a TagID is validated.
 */
export interface ResolvedAction {
  tagId: TagID;
  actionType: ActionType;
  target: ResolvedActionTarget;
  /**
   * Free-form message or instruction for the caller (e.g., UI hints).
   */
  note?: string;
}
