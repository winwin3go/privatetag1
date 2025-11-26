import { describe, expect, it } from "vitest";
import { ActionType, ResolvedAction, TagID, toTagID } from "../src/index";

describe("x402-core", () => {
  it("brands TagIDs without mutating value", () => {
    const id = toTagID("ABC123");
    expect(id).toBeTypeOf("string");
    expect(id).toBe("ABC123");
  });

  it("allows constructing resolved actions", () => {
    const tagId: TagID = toTagID("DEMO");
    const action: ResolvedAction = {
      tagId,
      actionType: ActionType.PHOTO_CAPTURE,
      target: { type: "service", value: "media-core" }
    };

    expect(action.target.type).toBe("service");
    expect(action.actionType).toBe(ActionType.PHOTO_CAPTURE);
  });
});
