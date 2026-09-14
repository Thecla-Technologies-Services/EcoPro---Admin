import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { APPLICANTS } from "@/data/applicants";
import { applicantKey } from "@/lib/adapters/verification";
import { useVerificationQueue } from "@/hooks/admin/use-verification-queue";
import type { AdminVerificationItemDto } from "@/types/api/admin";

/**
 * A settled query, which each test narrows to the state it is about.
 *
 * `isPending` and `isLoading` are both here because they disagree for a
 * disabled query: React Query leaves such a query pending forever, and only
 * `isLoading` goes false. The hook reads `isLoading` for that reason.
 */
const settled = () => ({
  data: undefined as unknown,
  isPending: false,
  isLoading: false,
  isError: false,
  error: null as unknown,
  refetch: vi.fn(),
});

/** A uuid, which is the shape `reviewedBy` actually comes back as. */
const REVIEWER_ID = "0192f3a4-5b6c-7d8e-9f01-23456789abcd";

const endpoints = vi.hoisted(() => {
  const blank = () => ({
    data: undefined as unknown,
    isPending: false,
    isLoading: false,
    isError: false,
    error: null as unknown,
    refetch: vi.fn(),
  });
  return {
    queue: blank(),
    organization: blank(),
    riders: blank(),
    users: blank(),
    reviewerAccount: blank(),
    reviewOrganization: { mutateAsync: vi.fn() },
    reviewRider: { mutateAsync: vi.fn() },
  };
});

vi.mock("@/hooks/admin/use-verification", () => ({
  useQueuedVerifications: () => endpoints.queue,
  usePendingRiders: () => endpoints.riders,
  useReviewOrganization: () => endpoints.reviewOrganization,
  useReviewRider: () => endpoints.reviewRider,
}));

vi.mock("@/hooks/admin/use-organizations", () => ({
  useOrganization: () => endpoints.organization,
}));

vi.mock("@/hooks/admin/use-user-directory", () => ({
  useUserDirectory: () => endpoints.users,
}));

vi.mock("@/hooks/admin/use-users", () => ({
  useUser: () => endpoints.reviewerAccount,
}));

// The real `useSearchParams` needs a Next router; reading the live location is
// what it amounts to here, and it lets these tests exercise the URL both ways.
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

/** One row of `GET /verification/queue`. */
function queueRow(
  overrides: Partial<AdminVerificationItemDto> = {},
): AdminVerificationItemDto {
  return {
    id: "org-1",
    referenceNumber: "APP-0001",
    applicantName: "Green Futures",
    applicantType: "CharityPartner",
    contactEmail: "hello@greenfutures.org",
    contactPhoneNumber: "+2348012345678",
    submissionDate: "2026-02-01T10:00:00Z",
    status: "Pending",
    ...overrides,
  };
}

/** The endpoint's envelope around a page of rows. */
const queuePage = (rows: AdminVerificationItemDto[]) => ({
  metrics: { totalApplications: rows.length, pendingReview: rows.length },
  queue: { data: rows },
});

beforeEach(() => {
  Object.assign(endpoints.queue, settled());
  Object.assign(endpoints.organization, settled());
  Object.assign(endpoints.riders, settled());
  Object.assign(endpoints.users, settled());
  Object.assign(endpoints.reviewerAccount, settled());
  // The selection lives in the URL, so it outlives a test that does not clear it.
  window.history.replaceState(null, "", "/verification");
  endpoints.reviewOrganization.mutateAsync = vi.fn();
  endpoints.reviewRider.mutateAsync = vi.fn();
});

const organization = APPLICANTS.find((row) => row.kind === "organization")!;
const rider = APPLICANTS.find((row) => row.kind === "rider")!;

describe("useVerificationQueue", () => {
  describe("the fixture source", () => {
    it("is settled even while the endpoints behind it are in flight", () => {
      // The page still mounts the queries; their state must not reach a queue
      // whose rows never came from them, or the list sits under a skeleton with
      // the rows already in hand.
      endpoints.queue.isPending = true;
      endpoints.riders.isError = true;

      const { result } = renderHook(() =>
        useVerificationQueue({ source: "fixture" }),
      );

      expect(result.current.query.isPending).toBe(false);
      expect(result.current.query.isError).toBe(false);
      expect(result.current.rows).toHaveLength(APPLICANTS.length);
    });

    it("reports no metrics, because none were fetched", () => {
      endpoints.queue.data = queuePage([queueRow()]);

      const { result } = renderHook(() =>
        useVerificationQueue({ source: "fixture" }),
      );

      expect(result.current.metrics).toBeUndefined();
    });
  });

  describe("the live source", () => {
    it("maps the joined queue onto rows", () => {
      endpoints.queue.data = queuePage([
        queueRow(),
        queueRow({
          id: "rider-1",
          applicantName: "Tayo Igbira",
          applicantType: "IndependentRider",
        }),
      ]);

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.rows.map((row) => row.kind)).toEqual([
        "organization",
        "rider",
      ]);
      expect(result.current.rows[0].accountType).toBe("Charity Partner");
      expect(result.current.rows[1].accountType).toBe("Delivery");
    });

    it("reports the queue's own counts", () => {
      endpoints.queue.data = queuePage([queueRow()]);

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.metrics?.pendingReview).toBe(1);
    });

    it("is pending while the queue is", () => {
      endpoints.queue.isPending = true;

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.query.isPending).toBe(true);
    });

    it("surfaces a failure of the queue", () => {
      endpoints.queue.isError = true;
      endpoints.queue.error = new Error("boom");

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.query.isError).toBe(true);
      expect(result.current.query.error).toEqual(new Error("boom"));
    });

    it("treats a lost user directory as survivable", () => {
      // The directory only supplies rider names, so losing it costs names, not
      // the queue. Blocking on it would hide reviewable applications.
      endpoints.queue.data = queuePage([queueRow()]);
      endpoints.users.isError = true;

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.query.isError).toBe(false);
      expect(result.current.rows).toHaveLength(1);
    });

    it("refetches the queue", () => {
      const { result } = renderHook(() => useVerificationQueue());

      act(() => result.current.query.refetch());

      expect(endpoints.queue.refetch).toHaveBeenCalledOnce();
    });

    it("reports detail as pending while the selected organization loads", () => {
      // The row is on screen from the queue; only its evidence is outstanding.
      endpoints.queue.data = queuePage([queueRow()]);
      endpoints.organization.isPending = true;
      endpoints.organization.isLoading = true;

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.query.isPending).toBe(false);
      expect(result.current.isDetailPending).toBe(true);
    });

    it("replaces the reviewer id with the name on that account", () => {
      endpoints.queue.data = queuePage([
        queueRow({ status: "Approved", reviewedBy: REVIEWER_ID }),
      ]);
      endpoints.reviewerAccount.data = { userId: REVIEWER_ID, name: "Ada Obi" };

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.selected?.reviewer).toBe("Ada Obi");
    });

    it("never shows the id while the account is still loading", () => {
      // The id is not a name, and showing it is the thing this replaces.
      endpoints.queue.data = queuePage([
        queueRow({ status: "Approved", reviewedBy: REVIEWER_ID }),
      ]);

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.selected?.reviewer).toBe("—");
    });

    it("passes a reviewer through when it is not an id", () => {
      endpoints.queue.data = queuePage([
        queueRow({ status: "Approved", reviewedBy: "ada@ecopro.test" }),
      ]);

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.selected?.reviewer).toBe("ada@ecopro.test");
    });

    it("offers the decision only while the application is pending", () => {
      endpoints.queue.data = queuePage([queueRow({ status: "Pending" })]);

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.canReview).toBe(true);
    });

    it("withdraws the decision once the application has been decided", () => {
      // The queue keeps decided applications, unlike the pending endpoints, so
      // this is the one list that can select one.
      for (const status of ["Approved", "Rejected"]) {
        endpoints.queue.data = queuePage([queueRow({ status })]);

        const { result } = renderHook(() => useVerificationQueue());

        expect(result.current.canReview).toBe(false);
      }
    });

    it("withdraws the decision for a status it cannot read", () => {
      // `toStatus` passes an undocumented label through, and offering to decide
      // on something unreadable risks acting on a settled record.
      endpoints.queue.data = queuePage([queueRow({ status: "Escalated" })]);

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.canReview).toBe(false);
    });

    it("does not report detail as pending for a row it can never fetch", () => {
      // A queue row with no id disables the detail query, which React Query
      // then leaves `pending` indefinitely. Dimming on that pulses the panel
      // forever — and does it precisely for the rows with nothing to show.
      endpoints.queue.data = queuePage([queueRow({ id: "" })]);
      endpoints.organization.isPending = true;
      endpoints.organization.isLoading = false;

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.isDetailPending).toBe(false);
    });

    it("layers the organization's evidence under the queue's verdict", () => {
      endpoints.queue.data = queuePage([
        queueRow({ status: "Approved", reviewedBy: "Ada" }),
      ]);
      endpoints.organization.data = {
        id: "org-1",
        organizationName: "Green Futures",
        // The per-record endpoint is the only place documents exist.
        documents: [{ id: "doc-1", documentType: "CacCertificate" }],
        // Its own status can lag the queue's, so the queue's must win.
        status: "Pending",
      };

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.selected?.documents).toHaveLength(1);
      expect(result.current.selected?.status).toBe("Approved");
      expect(result.current.selected?.reviewer).toBe("Ada");
    });

    it("keeps the queue row when an unknown applicant type has no endpoint", async () => {
      endpoints.queue.data = queuePage([
        queueRow({ id: "mystery", applicantType: "Something Else" }),
      ]);

      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.rows).toHaveLength(1);
      expect(result.current.selected?.kind).toBe("unknown");

      // Reviewing it would have to guess which endpoint owns the id.
      await expect(result.current.approve()).rejects.toThrow(
        /does not match either review endpoint/,
      );
      expect(endpoints.reviewOrganization.mutateAsync).not.toHaveBeenCalled();
      expect(endpoints.reviewRider.mutateAsync).not.toHaveBeenCalled();
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

    it("names the first applicant in the URL on arrival", () => {
      render();

      expect(new URLSearchParams(window.location.search).get("applicant")).toBe(
        applicantKey(APPLICANTS[0]),
      );
    });

    it("corrects a URL naming a row that has left the queue", () => {
      window.history.replaceState(
        null,
        "",
        "/verification?applicant=organization:no-such-row",
      );

      render();

      // The panel advanced to the first row; the address bar follows it rather
      // than pointing at a row nobody is looking at.
      expect(new URLSearchParams(window.location.search).get("applicant")).toBe(
        applicantKey(APPLICANTS[0]),
      );
    });

    it("puts the picked applicant in the URL", () => {
      const { result } = render();
      const key = applicantKey(APPLICANTS[3]);

      act(() => result.current.select(key));

      expect(new URLSearchParams(window.location.search).get("applicant")).toBe(
        key,
      );
    });

    it("opens the applicant the URL names", () => {
      // What a linked-to application looks like on arrival.
      window.history.replaceState(
        null,
        "",
        `/verification?applicant=${encodeURIComponent(applicantKey(APPLICANTS[2]))}`,
      );

      const { result } = render();

      expect(result.current.selected).toBe(APPLICANTS[2]);
    });

    it("keeps a param another control owns", () => {
      window.history.replaceState(null, "", "/verification?tab=riders");

      const { result } = render();
      act(() => result.current.select(applicantKey(APPLICANTS[1])));

      expect(new URLSearchParams(window.location.search).get("tab")).toBe(
        "riders",
      );
    });

    it("writes no applicant param when there is nothing to name", () => {
      // The live queue with no rows: the page shows its empty state, and an
      // `?applicant=` naming nothing would only link back to that same screen.
      const { result } = renderHook(() => useVerificationQueue());

      expect(result.current.selected).toBeNull();
      expect(window.location.search).toBe("");
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

    it("sends an organization the reason and note apart as well as together", async () => {
      const { result } = renderOn(applicantKey(organization));

      await act(() => result.current.reject("Incomplete documents", " blurry "));

      // `ReviewOrganizationRequestDto` models the two halves separately, so
      // sending only the sentence would throw away the category.
      expect(endpoints.reviewOrganization.mutateAsync).toHaveBeenCalledWith({
        organizationId: organization.id,
        approve: false,
        rejectionCategory: "Incomplete documents",
        additionalNotes: "blurry",
        rejectionReason: "Incomplete documents — blurry",
      });
    });

    it("sends a rider only the combined string, its one field", async () => {
      const { result } = renderOn(applicantKey(rider));

      await act(() => result.current.reject("Incomplete documents", " blurry "));

      expect(endpoints.reviewRider.mutateAsync).toHaveBeenCalledWith({
        riderProfileId: rider.id,
        approve: false,
        rejectionReason: "Incomplete documents — blurry",
      });
    });

    it("sends the reason alone when the note is empty", async () => {
      const { result } = renderOn(applicantKey(organization));

      await act(() => result.current.reject("Incomplete documents", "   "));

      expect(endpoints.reviewOrganization.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          rejectionCategory: "Incomplete documents",
          // A blank note is left out rather than sent as an empty string.
          additionalNotes: undefined,
          rejectionReason: "Incomplete documents",
        }),
      );
    });
  });
});
