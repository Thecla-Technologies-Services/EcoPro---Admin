import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useIndependentRiders } from "@/hooks/admin/use-independent-riders";
import type { RiderProfileDto, UserDto } from "@/types/api/admin";

const endpoints = vi.hoisted(() => {
  const blank = () => ({
    data: undefined as unknown,
    isPending: false,
    isFetching: false,
    isError: false,
    error: null as unknown,
    refetch: vi.fn(),
  });
  return { users: blank(), riders: blank() };
});

vi.mock("@/hooks/admin/use-admin-users", () => ({
  useUserDirectory: () => endpoints.users,
}));

vi.mock("@/hooks/admin/use-verification", () => ({
  usePendingRiders: () => endpoints.riders,
}));

const settled = () => ({
  data: undefined,
  isPending: false,
  isFetching: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
});

const DIRECTORY: UserDto[] = [
  {
    id: "u-rider",
    userType: "IndependentRider",
    firstName: "Ngozi",
    lastName: "Eze",
    email: "ngozi@example.com",
    createdOn: "2026-03-02T00:00:00Z",
  },
  {
    id: "u-unpending",
    userType: "IndependentRider",
    firstName: "Kelechi",
    lastName: "Obi",
    email: "kelechi@example.com",
    createdOn: "2026-03-01T00:00:00Z",
  },
  { id: "u-ngo", userType: "CharityPartner", firstName: "Green", lastName: "Earth" },
  { id: "u-person", userType: "EcoWarrior", firstName: "Tunde", lastName: "Bakare" },
];

const PROFILES: RiderProfileDto[] = [
  {
    id: "profile-1",
    userId: "u-rider",
    verificationMethod: "DriversLicense",
    idNumber: "DL-8842019",
    status: "Pending",
  },
];

beforeEach(() => {
  Object.assign(endpoints.users, settled());
  Object.assign(endpoints.riders, settled());
});

describe("useIndependentRiders", () => {
  it("finds riders by filtering the directory on account type", () => {
    endpoints.users.data = DIRECTORY;

    const { result } = renderHook(() => useIndependentRiders());

    // No admin endpoint returns riders, so the NGO and the individual have to
    // be excluded here or they would be listed as riders.
    expect(result.current.rows.map((row) => row.userId)).toEqual([
      "u-rider",
      "u-unpending",
    ]);
  });

  it("joins each rider's pending profile by user id", () => {
    endpoints.users.data = DIRECTORY;
    endpoints.riders.data = PROFILES;

    const { result } = renderHook(() => useIndependentRiders());
    const [withProfile] = result.current.rows;

    expect(withProfile.id).toBe("profile-1");
    expect(withProfile.idNumber).toBe("DL-8842019");
    expect(withProfile.documentType).toBe("Driver's Licence");
  });

  it("lists a rider who has nothing pending", () => {
    endpoints.users.data = DIRECTORY;
    endpoints.riders.data = PROFILES;

    const { result } = renderHook(() => useIndependentRiders());
    const unpending = result.current.rows.find(
      (row) => row.userId === "u-unpending",
    );

    // An onboarded rider with no open application is still a rider; the
    // evidence columns are simply empty.
    expect(unpending).toBeDefined();
    expect(unpending?.idNumber).toBe("—");
  });

  it("treats a lost pending queue as survivable", () => {
    // The profiles carry documents and the UTR, not the rows themselves.
    endpoints.users.data = DIRECTORY;
    endpoints.riders.isError = true;

    const { result } = renderHook(() => useIndependentRiders());

    expect(result.current.query.isError).toBe(false);
    expect(result.current.rows).toHaveLength(2);
  });

  it("treats a lost directory as fatal, because it is the list", () => {
    endpoints.users.isError = true;
    endpoints.users.error = new Error("boom");

    const { result } = renderHook(() => useIndependentRiders());

    expect(result.current.query.isError).toBe(true);
    expect(result.current.query.error).toEqual(new Error("boom"));
  });

  it("dims while the directory is refetching rather than only on first load", () => {
    endpoints.users.data = DIRECTORY;
    endpoints.users.isFetching = true;

    const { result } = renderHook(() => useIndependentRiders());

    expect(result.current.query.isLoading).toBe(true);
  });

  it("retries both endpoints", () => {
    const { result } = renderHook(() => useIndependentRiders());

    act(() => result.current.query.refetch());

    expect(endpoints.users.refetch).toHaveBeenCalledOnce();
    expect(endpoints.riders.refetch).toHaveBeenCalledOnce();
  });
});
