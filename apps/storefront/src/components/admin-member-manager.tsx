"use client";

import { useState, useTransition } from "react";

import { createAdminAccount, updateMemberStatus } from "@/lib/admin-client-api";
import type {
  AdminManagedAccount,
  AdminMember,
  CreateAdminAccountPayload,
} from "@/lib/admin-contracts";

function formatDateTime(value: string | null) {
  if (!value) {
    return "최근 로그인 없음";
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

  const filteredMembers = members.filter((member) => {
    const normalizedQuery = query.trim().toLowerCase();

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

  const canManageAdmins = currentAdminRole === "OWNER";

  return (
    <div className="grid gap-6">
      {canManageAdmins ? (
        <article className="admin-card rounded-[36px] p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
            <div>
              <p className="eyebrow text-[var(--ink-soft)]">운영 계정 생성</p>
              <h2 className="display mt-4 text-3xl font-semibold">새 관리자 계정을 바로 추가</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
                OWNER 권한에서만 운영 계정을 생성할 수 있습니다. 생성된 계정은 즉시 관리자 로그인 화면에서 사용할 수
                있습니다.
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
                        setAccountMessage(`${createdAccount.name} 계정을 생성했습니다.`);
                      } catch (error) {
                        setAccountError(getErrorMessage(error, "관리자 계정을 생성하지 못했습니다."));
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
                      placeholder="8자 이상 비밀번호"
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

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={isCreatingAccount}
                    className="admin-button px-6 py-4 disabled:opacity-60"
                  >
                    {isCreatingAccount ? "계정 생성 중..." : "관리자 계정 생성"}
                  </button>
                  <p className="text-xs leading-6 text-[var(--ink-soft)]">
                    생성 직후 바로 로그인 가능하며, 권한은 계정별 역할에 따라 분리됩니다.
                  </p>
                </div>
              </form>

              {accountMessage ? <p className="mt-4 text-sm text-[var(--teal)]">{accountMessage}</p> : null}
              {accountError ? <p className="mt-4 text-sm text-red-600">{accountError}</p> : null}
            </div>

            <div className="rounded-[28px] border border-[var(--line)] bg-white/70 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow text-[var(--ink-soft)]">현재 운영 계정</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                    OWNER 권한 계정과 운영 역할 계정을 한곳에서 확인합니다.
                  </p>
                </div>
                <span className="rounded-full bg-[rgba(36,93,90,0.12)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
                  {managedAccounts.length}개
                </span>
              </div>

              <div className="mt-6 grid gap-3">
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
                    <p className="mt-2 text-sm text-[var(--ink-soft)]">{account.email}</p>
                    <p className="mt-2 text-xs text-[var(--ink-soft)]">
                      생성일 {formatDateTime(account.createdAt)} / 최근 로그인 {formatDateTime(account.lastLoginAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      ) : null}

      <article className="admin-card rounded-[36px] p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-[var(--ink-soft)]">회원 관리</p>
            <h2 className="display mt-4 text-3xl font-semibold">회원 상태와 구매 이력 확인</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
              회원 상태 변경과 로그인 이력, 누적 구매 금액을 같은 화면에서 빠르게 확인할 수 있습니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              name="memberQuery"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="admin-input px-4 py-3"
              placeholder="이름, 이메일, 전화번호 검색"
            />
            <select
              name="memberStatusFilter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
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
              onChange={(event) => setProviderFilter(event.target.value)}
              className="admin-input px-4 py-3"
            >
              <option value="ALL">전체 가입 경로</option>
              <option value="LOCAL">일반</option>
              <option value="GOOGLE">Google</option>
              <option value="KAKAO">카카오</option>
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {filteredMembers.map((member) => {
            const draftStatus = draftStatuses[member.id] ?? member.status;

            return (
              <div
                key={member.id}
                className="grid gap-4 rounded-[28px] border border-[var(--line)] bg-white/72 p-5 xl:grid-cols-[minmax(0,1fr)_220px]"
              >
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-semibold">{member.name}</p>
                    <span className="rounded-full bg-[rgba(36,93,90,0.12)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
                      {formatStatusLabel(member.status)}
                    </span>
                    <span className="rounded-full bg-black/6 px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                      {formatProviderLabel(member.provider)}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-[var(--ink-soft)]">
                    {member.email} / {member.phone ?? "전화번호 없음"}
                  </p>
                  <div className="grid gap-2 text-sm text-[var(--ink-soft)] sm:grid-cols-2 xl:grid-cols-4">
                    <p>가입일 {formatDateTime(member.createdAt)}</p>
                    <p>최근 로그인 {formatDateTime(member.lastLoginAt)}</p>
                    <p>주문 {member.orderCount} / 배송지 {member.shippingAddressCount}</p>
                    <p>누적 구매 {formatPrice(member.totalSpent)}원</p>
                  </div>
                  <p className="text-xs text-[var(--ink-soft)]">
                    마케팅 수신 동의: {member.marketingOptIn ? "예" : "아니오"}
                  </p>
                </div>

                <div className="grid gap-3">
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
                            const updatedMember = await updateMemberStatus(member.id, {
                              status: draftStatus,
                            });

                            setMembers((current) =>
                              current.map((item) => (item.id === updatedMember.id ? updatedMember : item)),
                            );
                            setDraftStatuses((current) => ({
                              ...current,
                              [member.id]: updatedMember.status,
                            }));
                            setMemberMessage(`${updatedMember.name} 회원 상태를 저장했습니다.`);
                          } catch (error) {
                            setMemberError(getErrorMessage(error, "회원 상태를 저장하지 못했습니다."));
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

        {memberMessage ? <p className="mt-5 text-sm text-[var(--teal)]">{memberMessage}</p> : null}
        {memberError ? <p className="mt-5 text-sm text-red-600">{memberError}</p> : null}
      </article>
    </div>
  );
}
