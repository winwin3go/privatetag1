import { TagID } from "@privatetag/x402-core";

/**
 * Represents a logical PrivateTag space (tenant/site/venue) that groups related TagIDs.
 * Future iterations will extend this with role assignments and configurations.
 */
export interface PrivateTagSpace {
  id: string;
  displayName: string;
  region?: string;
  tagIds: TagID[];
  metadata?: Record<string, unknown>;
}
