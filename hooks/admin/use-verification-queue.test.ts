import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { APPLICANTS } from "@/data/applicants";
import { applicantKey } from "@/lib/adapters/verification";
import { useVerificationQueue } from "@/hooks/admin/use-verification-queue";

/** A settled query, which each test narrows to the state it is about. */
const settled = () => ({
  data: undefined as unknown,
  isPending: false,
  isError: false,
  error: null as unknown,
  refetch: vi.fn(),
});

const endpoints = vi.hoisted(() => {
  const blank = () => ({
    data: undefined as unknown,
    isPending: false,
    isError: false,
    error: null as unknown,
    refetch: vi.fn(),
  });
  return {
    organizations: blank(),
    riders: blank(),
    users: blank(),
    reviewOrganization: { mutateAsync: vi.fn() },
    reviewRider: { mutateAsync: vi.fn() },
  };
});

vi.mock("@/hooks/admin/use-verification", () => ({
  usePendingOrganizations: () => endpoints.organizations,
  usePendingRiders: () => endpoints.riders,
  useReviewOrganization: () => endpoints.reviewOrganization,
  useReviewRider: () => endpoints.reviewRider,
}));

vi.mock("@/hooks/admin/use-admin-users", () => ({
  useUserDirectory: () => endpoints.users,
}));

beforeEach(() => {
  Object.assign(endpoints.organizations, settled());
  Object.assign(endpoints.riders, settled());
  Object.assign(endpoints.users, settled());
  endpoints.reviewOrganization.mutateAsync = vi.fn();
  endpoints.reviewRider.mutateAsync = vi.fn();
});

const organization = APPLICANTS.find((row) => row.kind === "organization")!;
const rider = APPLICANTS.find((row) => row.kind === "rider")!;

describe("useVerificationQueue", () => {
  describe("the fixture source", () => {
    it("is settled even while the endpoints behind it are in flight", () => {
      // The page still calls all three endpoints; their state must not reach a
      // queue whose rows never came from them, or the list sits under a
      // skeleton with the rows already in hand.
      endpoints.organizations.isPending = true;
      endpoints.riders.isError = true;

      const { result } = renderHook(() =>
        useVerificationQueue({ source: "fixture" }),
      );

      expect(result.current.query.isPending).toBe(false);
      expect(result.current.query.isError).toBe(false);
      expect(result.current.rows).toHaveLength(APPLICANTS.length);
    });
  });

  describe("the live source", () => {
    it("is pending while any of the three endpoints is", () => {
      endpoints.users.isPending = true;

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.query.isPending).toBe(true);
    });

    it("surfaces a failure of either pending queue", () => {
      endpoints.organizations.isError = true;
      endpoints.organizations.error = new Error("boom");

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.query.isError).toBe(true);
      expect(result.current.query.error).toEqual(new Error("boom"));
    });

    it("treats a lost user directory as survivable", () => {
      // The directory only supplies rider names, so losing it costs names, not
      // the queue. Blocking on it would hide reviewable applications.
      endpoints.users.isError = true;

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.query.isError).toBe(false);
    });

    it("refetches both pending queues", () => {
      const { result } = renderHook(() => useVerificationQueue());

      act(() => result.current.query.refetch());

      expect(endpoints.organizations.refetch).toHaveBeenCalledOnce();
      expect(endpoints.riders.refetch).toHaveBeenCalledOnce();
    });
  });

  describe("selection", () => {
    const render = () =>
      renderHook(() => useVerificationQueue({ source: "fixture" }));

    it("stands the first row in until one is picked", () => {
      const { result } = render();

      expect(result.current.selected).toBe(APPLICANTS[0]);
      expect(result.current.activeKey).toBe(applicantKey(APPLICANTS[0]));
    });

    it("moves to the picked row", () => {
      const { result } = render();

      act(() => result.current.select(applicantKey(APPLICANTS[3])));

      expect(result.current.selected).toBe(APPLICANTS[3]);
    });

    it("falls back to the first row when the selection leaves the queue", () => {
      const { result } = render();

      act(() => result.current.select("organization:no-such-row"));

      // A reviewed row drops out of the queue; the panel advances rather than
      // pointing at nothing.
      expect(result.current.selected).toBe(APPLICANTS[0]);
    });
  });

  describe("reviewing", () => {
    const renderOn = (key: string) => {
      const rendered = renderHook(() =>
        useVerificationQueue({ source: "fixture" }),
      );
      act(() => rendered.result.current.select(key));
      return rendered;
    };

    it("sends an organization to the organization endpoint", async () => {
      const { result } = renderOn(applicantKey(organization));

      await act(() => result.current.approve());

      expect(endpoints.reviewOrganization.mutateAsync).toHaveBeenCalledWith({
        organizationId: organization.id,
        approve: true,
        rejectionReason: undefined,
      });
      expect(endpoints.reviewRider.mutateAsync).not.toHaveBeenCalled();
    });

    it("sends a rider to the rider endpoint, which wants a different id", async () => {
      const { result } = renderOn(applicantKey(rider));

      await act(() => result.current.approve());

      expect(endpoints.reviewRider.mutateAsync).toHaveBeenCalledWith({
        riderProfileId: rider.id,
        approve: true,
        rejectionReason: undefined,
      });
      expect(endpoints.reviewOrganization.mutateAsync).not.toHaveBeenCalled();
    });

    it("composes the picked reason and the note into one string", async () => {
      const { result } = renderOn(applicantKey(organization));

      await act(() => result.current.reject("Incomplete documents", " blurry "));

      expect(endpoints.reviewOrganization.mutateAsync).toHaveBeenCalledWith({
        organizationId: organization.id,
        approve: false,
        rejectionReason: "Incomplete documents — blurry",
      });
    });

    it("sends the reason alone when the note is empty", async () => {
      const { result } = renderOn(applicantKey(organization));

      await act(() => result.current.reject("Incomplete documents", "   "));

      expect(endpoints.reviewOrganization.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ rejectionReason: "Incomplete documents" }),
      );
    });
  });
});
