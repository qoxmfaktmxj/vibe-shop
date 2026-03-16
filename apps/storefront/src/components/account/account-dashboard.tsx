"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  createShippingAddress,
  deleteShippingAddress,
  listShippingAddresses,
  updateAccountProfile,
  updateShippingAddress,
} from "@/lib/client-api";
import type {
  AccountProfile,
  OrderSummaryResponse,
  ShippingAddress,
  ShippingAddressPayload,
} from "@/lib/contracts";
import { formatPrice } from "@/lib/currency";
import { useAuth } from "@/lib/auth-store";
import { formatOrderStatus } from "@/lib/order-status";

const EMPTY_ADDRESS_FORM: ShippingAddressPayload = {
  label: "",
  recipientName: "",
  phone: "",
  postalCode: "",
  address1: "",
  address2: "",
  isDefault: false,
};

const PROVIDER_LABELS: Record<string, string> = {
  LOCAL: "일반 회원",
  KAKAO: "카카오 로그인",
  NAVER: "네이버 로그인",
};

function sortAddresses(addresses: ShippingAddress[]) {
  return [...addresses].sort((left, right) => {
    if (left.isDefault === right.isDefault) {
      return left.id - right.id;
    }
    return left.isDefault ? -1 : 1;
  });
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function AccountDashboard({
  initialProfile,
  initialAddresses,
  recentOrders,
}: {
  initialProfile: AccountProfile;
  initialAddresses: ShippingAddress[];
  recentOrders: OrderSummaryResponse[];
}) {
  const { refreshSession } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  const [profileName, setProfileName] = useState(initialProfile.name);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [addresses, setAddresses] = useState(sortAddresses(initialAddresses));
  const [addressForm, setAddressForm] = useState<ShippingAddressPayload>(EMPTY_ADDRESS_FORM);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressMessage, setAddressMessage] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isSavingProfile, startSavingProfile] = useTransition();
  const [isSavingAddress, startSavingAddress] = useTransition();

  const joinedDate = new Date(profile.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function resetAddressForm() {
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
  }

  async function refreshAddresses(nextAddressCount?: number) {
    const nextAddresses = sortAddresses(await listShippingAddresses());
    setAddresses(nextAddresses);
    setProfile((current) => ({
      ...current,
      addressCount:
        typeof nextAddressCount === "number" ? nextAddressCount : nextAddresses.length,
    }));
  }

  function handleEditAddress(address: ShippingAddress) {
    setEditingAddressId(address.id);
    setAddressMessage("");
    setAddressError("");
    setAddressForm({
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      postalCode: address.postalCode,
      address1: address.address1,
      address2: address.address2,
      isDefault: address.isDefault,
    });
  }

  return (
    <div className="grid-shell">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <p className="display-eyebrow">My Page</p>
          <h1 className="display-heading mt-4 text-4xl font-semibold">내 계정</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
            주문 현황과 배송지, 계정 정보를 한 곳에서 관리합니다. 회원 주문은 이 계정에만 연결됩니다.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
              <dt className="display-eyebrow">Joined</dt>
              <dd className="mt-3 text-lg font-semibold">{joinedDate}</dd>
            </div>
            <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
              <dt className="display-eyebrow">Orders</dt>
              <dd className="mt-3 text-3xl font-semibold">{profile.orderCount}</dd>
            </div>
            <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
              <dt className="display-eyebrow">Addresses</dt>
              <dd className="mt-3 text-3xl font-semibold">{profile.addressCount}</dd>
            </div>
          </dl>
        </article>

        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="display-eyebrow">Profile</p>
              <h2 className="display-heading mt-4 text-3xl font-semibold">기본 정보</h2>
            </div>
            <div className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-soft)]">
              {PROVIDER_LABELS[profile.provider] ?? profile.provider}
            </div>
          </div>

          <form
            className="mt-8 grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              setProfileMessage("");
              setProfileError("");

              startSavingProfile(() => {
                void (async () => {
                  try {
                    const nextProfile = await updateAccountProfile({
                      name: profileName.trim(),
                    });
                    setProfile(nextProfile);
                    await refreshSession();
                    setProfileMessage("계정 정보를 저장했습니다.");
                  } catch (error) {
                    setProfileError(getErrorMessage(error, "계정 저장 중 문제가 발생했습니다."));
                  }
                })();
              });
            }}
          >
            <label className="grid gap-2">
              <span className="text-sm font-medium">이름</span>
              <input
                name="profileName"
                required
                minLength={2}
                maxLength={80}
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                className="soft-input px-4 py-3"
                placeholder="김민수"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">이메일</span>
              <input
                name="profileEmail"
                value={profile.email}
                disabled
                className="soft-input px-4 py-3 text-[var(--ink-soft)] disabled:cursor-not-allowed disabled:bg-[rgba(240,244,247,0.92)]"
              />
            </label>

            {profileMessage ? <p className="text-sm text-[var(--secondary)]">{profileMessage}</p> : null}
            {profileError ? <p className="text-sm text-red-600">{profileError}</p> : null}

            <button
              type="submit"
              disabled={isSavingProfile}
              className="button-primary w-full px-5 py-3 disabled:opacity-60"
            >
              {isSavingProfile ? "저장 중입니다." : "계정 저장"}
            </button>
          </form>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="display-eyebrow">Shipping</p>
              <h2 className="display-heading mt-4 text-3xl font-semibold">배송지 관리</h2>
            </div>
            <button
              type="button"
              onClick={resetAddressForm}
              className="button-secondary px-4 py-3"
            >
              새 배송지
            </button>
          </div>

          <div className="mt-8 space-y-4">
            {addresses.length > 0 ? (
              addresses.map((address) => (
                <article
                  key={address.id}
                  className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold">{address.label}</p>
                        {address.isDefault ? (
                          <span className="rounded-full bg-[rgba(28,107,81,0.12)] px-3 py-1 text-xs font-semibold text-[var(--secondary)]">
                            기본 배송지
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-[var(--ink-soft)]">
                        {address.recipientName} · {address.phone}
                      </p>
                      <p className="text-sm leading-7 text-[var(--ink-soft)]">
                        ({address.postalCode}) {address.address1}
                        {address.address2 ? `, ${address.address2}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditAddress(address)}
                        className="button-secondary px-4 py-3"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        disabled={isSavingAddress}
                        onClick={() => {
                          if (!window.confirm("이 배송지를 삭제하시겠습니까?")) {
                            return;
                          }
                          setAddressMessage("");
                          setAddressError("");
                          startSavingAddress(() => {
                            void (async () => {
                              try {
                                await deleteShippingAddress(address.id);
                                await refreshAddresses(Math.max(0, profile.addressCount - 1));
                                if (editingAddressId === address.id) {
                                  resetAddressForm();
                                }
                                setAddressMessage("배송지를 삭제했습니다.");
                              } catch (error) {
                                setAddressError(getErrorMessage(error, "배송지 삭제 중 문제가 발생했습니다."));
                              }
                            })();
                          });
                        }}
                        className="button-secondary px-4 py-3 disabled:opacity-60"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm leading-7 text-[var(--ink-soft)]">
                등록된 배송지가 없습니다. 첫 배송지를 등록하면 기본 배송지로 자동 지정됩니다.
              </div>
            )}
          </div>
        </article>

        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <p className="display-eyebrow">Address Form</p>
          <h2 className="display-heading mt-4 text-3xl font-semibold">
            {editingAddressId ? "배송지 수정" : "배송지 추가"}
          </h2>

          <form
            className="mt-8 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setAddressMessage("");
              setAddressError("");

              startSavingAddress(() => {
                void (async () => {
                  try {
                    const payload = {
                      ...addressForm,
                      label: addressForm.label.trim(),
                      recipientName: addressForm.recipientName.trim(),
                      phone: addressForm.phone.trim(),
                      postalCode: addressForm.postalCode.trim(),
                      address1: addressForm.address1.trim(),
                      address2: addressForm.address2.trim(),
                    };

                    if (editingAddressId) {
                      await updateShippingAddress(editingAddressId, payload);
                      setAddressMessage("배송지를 수정했습니다.");
                    } else {
                      await createShippingAddress(payload);
                      setAddressMessage("배송지를 등록했습니다.");
                    }

                    await refreshAddresses(
                      editingAddressId ? profile.addressCount : profile.addressCount + 1,
                    );
                    resetAddressForm();
                  } catch (error) {
                    setAddressError(getErrorMessage(error, "배송지 저장 중 문제가 발생했습니다."));
                  }
                })();
              });
            }}
          >
            <label className="grid gap-2">
              <span className="text-sm font-medium">배송지 별칭</span>
              <input
                name="label"
                required
                maxLength={40}
                value={addressForm.label}
                onChange={(event) =>
                  setAddressForm((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
                className="soft-input px-4 py-3"
                placeholder="집"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">받는 분</span>
              <input
                name="recipientName"
                required
                maxLength={80}
                value={addressForm.recipientName}
                onChange={(event) =>
                  setAddressForm((current) => ({
                    ...current,
                    recipientName: event.target.value,
                  }))
                }
                className="soft-input px-4 py-3"
                placeholder="김민수"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">연락처</span>
              <input
                name="phone"
                required
                maxLength={30}
                value={addressForm.phone}
                onChange={(event) =>
                  setAddressForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                className="soft-input px-4 py-3"
                placeholder="01012345678"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">우편번호</span>
              <input
                name="postalCode"
                required
                maxLength={20}
                value={addressForm.postalCode}
                onChange={(event) =>
                  setAddressForm((current) => ({
                    ...current,
                    postalCode: event.target.value,
                  }))
                }
                className="soft-input px-4 py-3"
                placeholder="06236"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">기본 주소</span>
              <input
                name="address1"
                required
                maxLength={255}
                value={addressForm.address1}
                onChange={(event) =>
                  setAddressForm((current) => ({
                    ...current,
                    address1: event.target.value,
                  }))
                }
                className="soft-input px-4 py-3"
                placeholder="서울시 강남구 테헤란로 123"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">상세 주소</span>
              <input
                name="address2"
                value={addressForm.address2}
                onChange={(event) =>
                  setAddressForm((current) => ({
                    ...current,
                    address2: event.target.value,
                  }))
                }
                className="soft-input px-4 py-3"
                placeholder="8층"
              />
            </label>

            <label className="flex items-center gap-3 rounded-[20px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--ink-soft)]">
              <input
                name="isDefault"
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(event) =>
                  setAddressForm((current) => ({
                    ...current,
                    isDefault: event.target.checked,
                  }))
                }
              />
              기본 배송지로 설정
            </label>

            {addressMessage ? <p className="text-sm text-[var(--secondary)]">{addressMessage}</p> : null}
            {addressError ? <p className="text-sm text-red-600">{addressError}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSavingAddress}
                className="button-primary flex-1 px-5 py-3 disabled:opacity-60"
              >
                {isSavingAddress ? "저장 중입니다." : editingAddressId ? "배송지 수정" : "배송지 저장"}
              </button>
              <button
                type="button"
                onClick={resetAddressForm}
                className="button-secondary px-5 py-3"
              >
                초기화
              </button>
            </div>
          </form>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="display-eyebrow">Orders</p>
              <h2 className="display-heading mt-4 text-3xl font-semibold">최근 주문</h2>
            </div>
            <Link href="/orders" className="button-secondary px-4 py-3">
              전체 주문 보기
            </Link>
          </div>

          <div className="mt-8 space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link
                  key={order.orderNumber}
                  href={`/orders/${order.orderNumber}`}
                  className="block rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 transition hover:translate-y-[-2px]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <p className="text-xl font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-[var(--ink-soft)]">{order.customerName}</p>
                      <p className="text-sm text-[var(--ink-soft)]">
                        상품 수량 {order.itemCount}개
                      </p>
                    </div>
                    <div className="space-y-2 text-sm sm:text-right">
                      <p className="font-semibold text-[var(--ink)]">
                        {formatOrderStatus(order.status)}
                      </p>
                      <p>{formatPrice(order.total)}원</p>
                      <p className="text-[var(--ink-soft)]">
                        {new Date(order.createdAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm leading-7 text-[var(--ink-soft)]">
                아직 완료된 주문이 없습니다. 첫 주문을 만들면 이 영역에 최근 주문이 표시됩니다.
              </div>
            )}
          </div>
        </article>

        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <p className="display-eyebrow">Shortcuts</p>
          <h2 className="display-heading mt-4 text-3xl font-semibold">빠른 이동</h2>
          <div className="mt-8 grid gap-4">
            <Link
              href="/search"
              className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 transition hover:translate-y-[-2px]"
            >
              <p className="text-lg font-semibold">상품 더 보기</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                카테고리와 검색 화면으로 이동해 다음 주문을 준비합니다.
              </p>
            </Link>
            <Link
              href="/cart"
              className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 transition hover:translate-y-[-2px]"
            >
              <p className="text-lg font-semibold">장바구니 확인</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                저장된 상품을 점검하고 바로 주문으로 이어갈 수 있습니다.
              </p>
            </Link>
            <Link
              href="/lookup-order"
              className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 transition hover:translate-y-[-2px]"
            >
              <p className="text-lg font-semibold">비회원 주문 조회</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                별도 비회원 주문은 주문번호와 연락처로 다시 확인할 수 있습니다.
              </p>
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
