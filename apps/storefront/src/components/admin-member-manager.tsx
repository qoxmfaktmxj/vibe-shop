"use client";

import { useState, useTransition } from "react";

import { updateMemberStatus } from "@/lib/admin-client-api";
import type { AdminMember } from "@/lib/admin-contracts";

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

export function AdminMemberManager({
  initialMembers,
}: {
  initialMembers: AdminMember[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [draftStatuses, setDraftStatuses] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, startSaving] = useTransition();

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

  return (
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
                    setMessage("");
                    setError("");
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
                          setMessage(`${updatedMember.name} 회원 상태를 저장했습니다.`);
                        } catch (nextError) {
                          setError(getErrorMessage(nextError, "회원 상태를 저장하지 못했습니다."));
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

      {message ? <p className="mt-5 text-sm text-[var(--teal)]">{message}</p> : null}
      {error ? <p className="mt-5 text-sm text-red-600">{error}</p> : null}
    </article>
  );
}
