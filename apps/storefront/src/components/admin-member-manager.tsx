"use client";

import { useMemo, useState, useTransition } from "react";

import {
  createAdminAccount,
  updateMemberStatus,
} from "@/lib/admin-client-api";
import type {
  AdminManagedAccount,
  AdminMember,
  CreateAdminAccountPayload,
} from "@/lib/admin-contracts";
import { AdminPagination } from "@/components/admin-pagination";

const MEMBERS_PER_PAGE = 10;

function formatDateTime(value: string | null) {
  if (!value) {
    return "로그인 기록 없음";
  }

  return new Date(value).toLocaleString("ko-KR");
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatProviderLabel(provider: string) {
  const labels: Record<string, string> = {
    LOCAL: "일반",
    GOOGLE: "Google",
    KAKAO: "카카오",
  };
  return labels[provider] ?? provider;
}

function formatStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "활성",
    DORMANT: "휴면",
    BLOCKED: "차단",
  };
  return labels[status] ?? status;
}

function formatRoleLabel(role: string) {
  const labels: Record<string, string> = {
    OWNER: "OWNER",
    MD: "상품 운영",
    CS: "고객 지원",
    OPS: "운영",
  };
  return labels[role] ?? role;
}

export function AdminMemberManager({
  initialMembers,
  initialManagedAccounts,
  currentAdminRole,
}: {
  initialMembers: AdminMember[];
  initialManagedAccounts: AdminManagedAccount[];
  currentAdminRole: string;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [managedAccounts, setManagedAccounts] = useState(initialManagedAccounts);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [draftStatuses, setDraftStatuses] = useState<Record<number, string>>({});
  const [page, setPage] = useState(1);
  const [memberMessage, setMemberMessage] = useState("");
  const [memberError, setMemberError] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountForm, setAccountForm] = useState<CreateAdminAccountPayload>({
    name: "",
    email: "",
    password: "",
    role: "MD",
  });
  const [isSaving, startSaving] = useTransition();
  const [isCreatingAccount, startCreatingAccount] = useTransition();

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return members.filter((member) => {
      if (statusFilter !== "ALL" && member.status !== statusFilter) {
        return false;
      }

      if (providerFilter !== "ALL" && member.provider !== providerFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [member.name, member.email, member.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [members, providerFilter, query, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * MEMBERS_PER_PAGE,
    currentPage * MEMBERS_PER_PAGE,
  );

  const canManageAdmins = currentAdminRole === "OWNER";

  return (
    <div className="grid gap-6">
      <article className="admin-card rounded-[36px] p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-[var(--ink-soft)]">회원 관리</p>
            <h2 className="display mt-4 text-3xl font-semibold">
              회원 목록
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
              이름, 가입 경로, 상태, 주문 수, 누적 구매 금액을 한 줄에서 보고 필요한
              회원만 빠르게 조치할 수 있게 정리했습니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              name="memberQuery"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="admin-input px-4 py-3"
              placeholder="이름, 이메일, 연락처 검색"
            />
            <select
              name="memberStatusFilter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="admin-input px-4 py-3"
            >
              <option value="ALL">전체 상태</option>
              <option value="ACTIVE">활성</option>
              <option value="DORMANT">휴면</option>
              <option value="BLOCKED">차단</option>
            </select>
            <select
              name="memberProviderFilter"
              value={providerFilter}
              onChange={(event) => {
                setProviderFilter(event.target.value);
                setPage(1);
              }}
              className="admin-input px-4 py-3"
            >
              <option value="ALL">전체 가입 경로</option>
              <option value="LOCAL">일반</option>
              <option value="GOOGLE">Google</option>
              <option value="KAKAO">카카오</option>
            </select>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto">
          <div className="min-w-[1240px]">
            <div className="grid grid-cols-[1.8fr_0.9fr_0.9fr_1.1fr_1.2fr_220px] gap-3 rounded-[22px] bg-[rgba(16,33,39,0.04)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              <div>회원</div>
              <div>가입 경로</div>
              <div>상태</div>
              <div>주문 / 주소</div>
              <div>구매 / 최근 로그인</div>
              <div>상태 변경</div>
            </div>

            <div className="mt-3 space-y-3">
              {paginatedMembers.map((member) => {
                const draftStatus = draftStatuses[member.id] ?? member.status;

                return (
                  <div
                    key={member.id}
                    className="grid grid-cols-[1.8fr_0.9fr_0.9fr_1.1fr_1.2fr_220px] gap-3 rounded-[24px] border border-[var(--line)] bg-white/72 px-4 py-4"
                  >
                    <div className="min-w-0 text-sm leading-6 text-[var(--ink-soft)]">
                      <p className="truncate font-semibold text-[var(--ink)]">
                        {member.name}
                      </p>
                      <p className="truncate">{member.email}</p>
                      <p>{member.phone ?? "연락처 없음"}</p>
                    </div>

                    <div className="text-sm text-[var(--ink-soft)]">
                      {formatProviderLabel(member.provider)}
                    </div>

                    <div>
                      <span className="rounded-full bg-[rgba(36,93,90,0.12)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
                        {formatStatusLabel(member.status)}
                      </span>
                    </div>

                    <div className="text-sm leading-6 text-[var(--ink-soft)]">
                      <p>주문 {member.orderCount}건</p>
                      <p>주소 {member.shippingAddressCount}개</p>
                    </div>

                    <div className="text-sm leading-6 text-[var(--ink-soft)]">
                      <p className="font-semibold text-[var(--ink)]">
                        {formatPrice(member.totalSpent)}원
                      </p>
                      <p>{formatDateTime(member.lastLoginAt)}</p>
                    </div>

                    <div className="grid gap-2">
                      <select
                        name={`memberStatus-${member.id}`}
                        value={draftStatus}
                        onChange={(event) =>
                          setDraftStatuses((current) => ({
                            ...current,
                            [member.id]: event.target.value,
                          }))
                        }
                        className="admin-input px-4 py-3"
                      >
                        <option value="ACTIVE">활성</option>
                        <option value="DORMANT">휴면</option>
                        <option value="BLOCKED">차단</option>
                      </select>
                      <button
                        type="button"
                        disabled={isSaving || draftStatus === member.status}
                        onClick={() => {
                          setMemberMessage("");
                          setMemberError("");
                          startSaving(() => {
                            void (async () => {
                              try {
                                const updatedMember = await updateMemberStatus(
                                  member.id,
                                  {
                                    status: draftStatus,
                                  },
                                );

                                setMembers((current) =>
                                  current.map((item) =>
                                    item.id === updatedMember.id
                                      ? updatedMember
                                      : item,
                                  ),
                                );
                                setDraftStatuses((current) => ({
                                  ...current,
                                  [member.id]: updatedMember.status,
                                }));
                                setMemberMessage(
                                  `${updatedMember.name} 회원 상태를 저장했습니다.`,
                                );
                              } catch (saveError) {
                                setMemberError(
                                  getErrorMessage(
                                    saveError,
                                    "회원 상태를 저장하지 못했습니다.",
                                  ),
                                );
                              }
                            })();
                          });
                        }}
                        className="admin-button-secondary px-5 py-3 disabled:opacity-60"
                      >
                        상태 저장
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <AdminPagination
          page={currentPage}
          totalPages={totalPages}
          summary={
            filteredMembers.length === 0
              ? "검색 결과가 없습니다."
              : `${(currentPage - 1) * MEMBERS_PER_PAGE + 1}-${Math.min(
                  currentPage * MEMBERS_PER_PAGE,
                  filteredMembers.length,
                )}번째 회원 표시`
          }
          onChange={setPage}
        />

        {memberMessage ? (
          <p className="mt-5 text-sm text-[var(--teal)]">{memberMessage}</p>
        ) : null}
        {memberError ? (
          <p className="mt-5 text-sm text-red-600">{memberError}</p>
        ) : null}
      </article>

      {canManageAdmins ? (
        <article className="admin-card rounded-[36px] p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
            <div>
              <p className="eyebrow text-[var(--ink-soft)]">운영 계정 생성</p>
              <h2 className="display mt-4 text-3xl font-semibold">
                관리자 계정 추가
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
                OWNER 권한에서만 운영 계정을 만들 수 있습니다. 이 기능은 회원 목록과
                분리해 덜 자주 쓰는 관리 작업으로 내려놓았습니다.
              </p>

              <form
                className="mt-8 grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  setAccountMessage("");
                  setAccountError("");

                  startCreatingAccount(() => {
                    void (async () => {
                      try {
                        const createdAccount = await createAdminAccount(accountForm);
                        setManagedAccounts((current) => [createdAccount, ...current]);
                        setAccountForm((current) => ({
                          ...current,
                          name: "",
                          email: "",
                          password: "",
                        }));
                        setAccountMessage(
                          `${createdAccount.name} 계정을 만들었습니다.`,
                        );
                      } catch (createError) {
                        setAccountError(
                          getErrorMessage(
                            createError,
                            "관리자 계정을 만들지 못했습니다.",
                          ),
                        );
                      }
                    })();
                  });
                }}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">이름</span>
                    <input
                      required
                      type="text"
                      value={accountForm.name}
                      onChange={(event) =>
                        setAccountForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      className="admin-input px-4 py-3"
                      placeholder="운영자 이름"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">이메일</span>
                    <input
                      required
                      type="email"
                      value={accountForm.email}
                      onChange={(event) =>
                        setAccountForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className="admin-input px-4 py-3"
                      placeholder="ops@maru.local"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">비밀번호</span>
                    <input
                      required
                      minLength={8}
                      type="password"
                      value={accountForm.password}
                      onChange={(event) =>
                        setAccountForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      className="admin-input px-4 py-3"
                      placeholder="8자 이상"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">역할</span>
                    <select
                      value={accountForm.role}
                      onChange={(event) =>
                        setAccountForm((current) => ({
                          ...current,
                          role: event.target.value,
                        }))
                      }
                      className="admin-input px-4 py-3"
                    >
                      <option value="MD">상품 운영</option>
                      <option value="CS">고객 지원</option>
                      <option value="OPS">운영</option>
                      <option value="OWNER">OWNER</option>
                    </select>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingAccount}
                  className="admin-button w-fit px-6 py-4 disabled:opacity-60"
                >
                  {isCreatingAccount ? "계정 생성 중..." : "관리자 계정 생성"}
                </button>
              </form>

              {accountMessage ? (
                <p className="mt-4 text-sm text-[var(--teal)]">{accountMessage}</p>
              ) : null}
              {accountError ? (
                <p className="mt-4 text-sm text-red-600">{accountError}</p>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-[var(--line)] bg-white/70 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow text-[var(--ink-soft)]">현재 운영 계정</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                    현재 콘솔에서 바로 접근 가능한 관리자 계정 목록입니다.
                  </p>
                </div>
                <span className="rounded-full bg-[rgba(36,93,90,0.12)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
                  {managedAccounts.length}개
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {managedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="rounded-[22px] border border-[var(--line)] bg-[rgba(255,255,255,0.82)] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold">{account.name}</p>
                      <span className="rounded-full bg-black/6 px-2.5 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                        {formatRoleLabel(account.role)}
                      </span>
                      <span className="rounded-full bg-[rgba(36,93,90,0.12)] px-2.5 py-1 text-xs font-semibold text-[var(--teal)]">
                        {formatStatusLabel(account.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--ink-soft)]">
                      {account.email}
                    </p>
                    <p className="mt-2 text-xs text-[var(--ink-soft)]">
                      생성 {formatDateTime(account.createdAt)} / 최근 로그인{" "}
                      {formatDateTime(account.lastLoginAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
}
