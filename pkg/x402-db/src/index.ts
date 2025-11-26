import { ActionType, TagID } from "@privatetag/x402-core";

/**
 * D1 record describing a Tag and its lifecycle state.
 */
export interface TagRecord {
  id: number;
  tagId: TagID;
  tenantId: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

/**
 * Control-plane configuration for an action associated with a TagID.
 */
export interface TagActionRecord {
  id: number;
  tagId: TagID;
  actionType: ActionType;
  config: Record<string, unknown>;
  createdAt: string;
}

/**
 * Minimal representation of a captured photo stored in R2 (metadata lives in D1).
 */
export interface PhotoRecord {
  id: number;
  tagId: TagID;
  mediaId: string;
  objectKey: string;
  createdAt: string;
}
