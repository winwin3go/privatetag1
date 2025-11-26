import { AuthContext, TagID } from "@privatetag/x402-core";

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

export const SUPPORTED_IMAGE_TYPES = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp"
]);

export const MAX_CAPTURE_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB upper bound for MVP flows.

export enum AuditEventType {
  PHOTO_UPLOAD_REQUESTED = "PHOTO_UPLOAD_REQUESTED",
  PHOTO_UPLOAD_COMPLETED = "PHOTO_UPLOAD_COMPLETED",
  PHOTO_STORED = "PHOTO_STORED",
  PHOTO_DELETED = "PHOTO_DELETED"
}

export interface AuditEvent {
  type: AuditEventType;
  timestamp: string;
  tagId?: string;
  mediaId?: string;
  auth?: AuthContext | null;
  metadata?: Record<string, unknown>;
}
