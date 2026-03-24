"use client";

import { useState, useTransition } from "react";

import { updateMemberStatus } from "@/lib/client-api";
import type { AdminMember } from "@/lib/contracts";

function formatDateTime(value: string | null) {
  if (!value) {
    return "No recent login";
  }

  return new Date(value).toLocaleString("ko-KR");
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
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
          <p className="eyebrow text-[var(--ink-soft)]">Members</p>
          <h2 className="display mt-4 text-3xl font-semibold">Member operations</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Member moderation now lives on its own route and updates locally without reloading unrelated data.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <input
            name="memberQuery"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="admin-input px-4 py-3"
            placeholder="Search by name, email, or phone"
          />
          <select
            name="memberStatusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="admin-input px-4 py-3"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DORMANT">DORMANT</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
          <select
            name="memberProviderFilter"
            value={providerFilter}
            onChange={(event) => setProviderFilter(event.target.value)}
            className="admin-input px-4 py-3"
          >
            <option value="ALL">All providers</option>
            <option value="LOCAL">LOCAL</option>
            <option value="GOOGLE">GOOGLE</option>
            <option value="KAKAO">KAKAO</option>
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
                    {member.status}
                  </span>
                  <span className="rounded-full bg-black/6 px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                    {member.provider}
                  </span>
                </div>
                <p className="text-sm leading-7 text-[var(--ink-soft)]">
                  {member.email} / {member.phone ?? "No phone"}
                </p>
                <div className="grid gap-2 text-sm text-[var(--ink-soft)] sm:grid-cols-2 xl:grid-cols-4">
                  <p>Joined {formatDateTime(member.createdAt)}</p>
                  <p>Last login {formatDateTime(member.lastLoginAt)}</p>
                  <p>Orders {member.orderCount} / Addresses {member.shippingAddressCount}</p>
                  <p>Total spent {formatPrice(member.totalSpent)} KRW</p>
                </div>
                <p className="text-xs text-[var(--ink-soft)]">
                  Marketing opt-in: {member.marketingOptIn ? "yes" : "no"}
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
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DORMANT">DORMANT</option>
                  <option value="BLOCKED">BLOCKED</option>
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
                          setMessage(`${updatedMember.name} updated.`);
                        } catch (nextError) {
                          setError(getErrorMessage(nextError, "Failed to update member status."));
                        }
                      })();
                    });
                  }}
                  className="admin-button-secondary px-5 py-3 disabled:opacity-60"
                >
                  Save status
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
