"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import {
  createShippingAddress,
  deleteAccountReview,
  deleteShippingAddress,
  listShippingAddresses,
  removeWishlistItem,
  updateAccountProfile,
  updateAccountReview,
  updateShippingAddress,
} from "@/lib/client-api";
import type {
  AccountProfile,
  MyReview,
  OrderSummaryResponse,
  ShippingAddress,
  ShippingAddressPayload,
  UpdateReviewPayload,
  WishlistItem,
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
  GOOGLE: "Google Login",
};

const REVIEW_STATUS_LABELS: Record<string, string> = {
  PUBLISHED: "공개",
  HIDDEN: "숨김",
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
  initialWishlist,
  initialReviews,
}: {
  initialProfile: AccountProfile;
  initialAddresses: ShippingAddress[];
  recentOrders: OrderSummaryResponse[];
  initialWishlist: WishlistItem[];
  initialReviews: MyReview[];
}) {
  const { refreshSession } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  const [profileName, setProfileName] = useState(initialProfile.name);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [addresses, setAddresses] = useState(sortAddresses(initialAddresses));
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [reviews, setReviews] = useState(initialReviews);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState<UpdateReviewPayload>({
    rating: 5,
    title: "",
    content: "",
    fitTag: "",
    repurchaseYn: false,
    deliverySatisfaction: 5,
    packagingSatisfaction: 5,
    imageUrls: [],
  });
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [wishlistError, setWishlistError] = useState("");
  const [addressForm, setAddressForm] = useState<ShippingAddressPayload>(EMPTY_ADDRESS_FORM);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressMessage, setAddressMessage] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isSavingProfile, startSavingProfile] = useTransition();
  const [isSavingAddress, startSavingAddress] = useTransition();
  const [isSavingReview, startSavingReview] = useTransition();
  const [isUpdatingWishlist, startUpdatingWishlist] = useTransition();

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

  function resetReviewForm() {
    setEditingReviewId(null);
    setReviewForm({
      rating: 5,
      title: "",
      content: "",
      fitTag: "",
      repurchaseYn: false,
      deliverySatisfaction: 5,
      packagingSatisfaction: 5,
      imageUrls: [],
    });
  }

  function handleEditReview(review: MyReview) {
    setEditingReviewId(review.id);
    setReviewMessage("");
    setReviewError("");
    setReviewForm({
      rating: review.rating,
      title: review.title,
      content: review.content,
      fitTag: review.fitTag ?? "",
      repurchaseYn: review.repurchaseYn,
      deliverySatisfaction: review.deliverySatisfaction ?? 5,
      packagingSatisfaction: review.packagingSatisfaction ?? 5,
      imageUrls: review.images.map((image) => image.imageUrl),
    });
  }

  return (
    <div className="grid-shell space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <p className="display-eyebrow">My Page</p>
          <h1 className="display-heading mt-4 text-4xl font-semibold">내 계정</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
            주문, 배송지, 찜, 리뷰를 한 곳에서 관리합니다.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-4">
            <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
              <dt className="display-eyebrow">Joined</dt>
              <dd className="mt-3 text-lg font-semibold">{joinedDate}</dd>
            </div>
            <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
              <dt className="display-eyebrow">Orders</dt>
              <dd className="mt-3 text-3xl font-semibold">{profile.orderCount}</dd>
            </div>
            <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
              <dt className="display-eyebrow">Wishlist</dt>
              <dd className="mt-3 text-3xl font-semibold">{profile.wishlistCount}</dd>
            </div>
            <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
              <dt className="display-eyebrow">Reviews</dt>
              <dd className="mt-3 text-3xl font-semibold">{profile.reviewCount}</dd>
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
              {isSavingProfile ? "저장 중..." : "계정 저장"}
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
                          if (!window.confirm("이 배송지를 삭제할까요?")) {
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
                등록된 배송지가 없습니다. 첫 배송지는 기본 배송지로 설정됩니다.
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
              <span className="text-sm font-medium">배송지 이름</span>
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
                {isSavingAddress ? "저장 중..." : editingAddressId ? "배송지 수정" : "배송지 저장"}
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

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="display-eyebrow">Wishlist</p>
              <h2 className="display-heading mt-4 text-3xl font-semibold">찜한 상품</h2>
            </div>
            <Link href="/search" className="button-secondary px-4 py-3">
              상품 더 보기
            </Link>
          </div>

          <div className="mt-8 space-y-4">
            {wishlist.length > 0 ? (
              wishlist.map((item) => (
                <article
                  key={item.productId}
                  className="grid gap-4 rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5 sm:grid-cols-[120px_minmax(0,1fr)]"
                >
                  <Link href={`/products/${item.slug}`} className="relative min-h-[140px] overflow-hidden rounded-[24px]">
                    <Image
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="display-eyebrow">{item.categoryName}</p>
                      <Link href={`/products/${item.slug}`} className="mt-2 block text-xl font-semibold">
                        {item.name}
                      </Link>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{item.summary}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">Saved</p>
                        <p className="mt-1 text-sm text-[var(--ink-soft)]">
                          {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-semibold text-[var(--primary)]">{formatPrice(item.price)}</p>
                        <button
                          type="button"
                          disabled={isUpdatingWishlist}
                          onClick={() => {
                            setWishlistMessage("");
                            setWishlistError("");
                            startUpdatingWishlist(() => {
                              void (async () => {
                                try {
                                  await removeWishlistItem(item.productId);
                                  setWishlist((current) =>
                                    current.filter((currentItem) => currentItem.productId !== item.productId),
                                  );
                                  setProfile((current) => ({
                                    ...current,
                                    wishlistCount: Math.max(0, current.wishlistCount - 1),
                                  }));
                                  setWishlistMessage("찜 목록을 업데이트했습니다.");
                                } catch (error) {
                                  setWishlistError(getErrorMessage(error, "찜 해제 중 문제가 발생했습니다."));
                                }
                              })();
                            });
                          }}
                          className="button-secondary px-4 py-3 disabled:opacity-60"
                        >
                          찜 해제
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm leading-7 text-[var(--ink-soft)]">
                아직 찜한 상품이 없습니다. 마음에 드는 상품을 저장해 보세요.
              </div>
            )}
          </div>
          {wishlistMessage ? <p className="mt-4 text-sm text-[var(--secondary)]">{wishlistMessage}</p> : null}
          {wishlistError ? <p className="mt-4 text-sm text-red-600">{wishlistError}</p> : null}
        </article>

        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="display-eyebrow">Reviews</p>
              <h2 className="display-heading mt-4 text-3xl font-semibold">내 리뷰</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/search" className="button-secondary px-4 py-3">
                리뷰 쓸 상품 찾기
              </Link>
              <button type="button" onClick={resetReviewForm} className="button-secondary px-4 py-3">
                편집 닫기
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => {
                const isEditing = editingReviewId === review.id;
                return (
                  <article
                    key={review.id}
                    className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/products/${review.productSlug}`} className="text-lg font-semibold">
                            {review.productName}
                          </Link>
                          {review.buyerReview ? (
                            <span className="rounded-full bg-[rgba(28,107,81,0.12)] px-3 py-1 text-xs font-semibold text-[var(--secondary)]">
                              구매 인증
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm text-[var(--ink-soft)]">
                          {review.rating} / 5 · {REVIEW_STATUS_LABELS[review.status] ?? review.status} · 도움이 돼요 {review.helpfulCount}
                        </p>
                      </div>
                      <p className="text-sm text-[var(--ink-soft)]">
                        {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <p className="mt-4 text-base font-semibold">{review.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{review.content}</p>
                    <div className="mt-4 grid gap-2 text-sm text-[var(--ink-soft)] sm:grid-cols-3">
                      <p>핏 태그 {review.fitTag ?? "-"}</p>
                      <p>배송 만족도 {review.deliverySatisfaction ?? "-"}/5</p>
                      <p>포장 만족도 {review.packagingSatisfaction ?? "-"}/5</p>
                    </div>
                    {review.images.length > 0 ? (
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {review.images.map((image) => (
                          <div key={image.id} className="aspect-square overflow-hidden rounded-[18px] border border-[var(--line)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image.imageUrl}
                              alt={`${review.title} 리뷰 이미지`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleEditReview(review)}
                        className="button-secondary px-4 py-3"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        disabled={isSavingReview}
                        onClick={() => {
                          if (!window.confirm("이 리뷰를 삭제할까요?")) {
                            return;
                          }
                          setReviewMessage("");
                          setReviewError("");
                          startSavingReview(() => {
                            void (async () => {
                              try {
                                await deleteAccountReview(review.id);
                                setReviews((current) => current.filter((item) => item.id !== review.id));
                                setProfile((current) => ({
                                  ...current,
                                  reviewCount: Math.max(0, current.reviewCount - 1),
                                }));
                                if (editingReviewId === review.id) {
                                  resetReviewForm();
                                }
                                setReviewMessage("리뷰를 삭제했습니다.");
                              } catch (error) {
                                setReviewError(getErrorMessage(error, "리뷰 삭제 중 문제가 발생했습니다."));
                              }
                            })();
                          });
                        }}
                        className="button-secondary px-4 py-3 disabled:opacity-60"
                      >
                        삭제
                      </button>
                    </div>

                    {isEditing ? (
                      <form
                        className="mt-6 grid gap-4 rounded-[24px] border border-[var(--line)] bg-white/80 p-5"
                        onSubmit={(event) => {
                          event.preventDefault();
                          setReviewMessage("");
                          setReviewError("");
                          startSavingReview(() => {
                            void (async () => {
                              try {
                                const updated = await updateAccountReview(review.id, {
                                  ...reviewForm,
                                  title: reviewForm.title.trim(),
                                  content: reviewForm.content.trim(),
                                  fitTag: reviewForm.fitTag?.trim() ?? "",
                                  imageUrls: (reviewForm.imageUrls ?? []).map((value) => value.trim()).filter(Boolean),
                                });
                                setReviews((current) =>
                                  current.map((item) => (item.id === updated.id ? updated : item)),
                                );
                                setReviewMessage("리뷰를 수정했습니다.");
                                resetReviewForm();
                              } catch (error) {
                                setReviewError(getErrorMessage(error, "리뷰 수정 중 문제가 발생했습니다."));
                              }
                            })();
                          });
                        }}
                      >
                        <label className="grid gap-2">
                          <span className="text-sm font-medium">평점</span>
                          <select
                            value={reviewForm.rating}
                            onChange={(event) =>
                              setReviewForm((current) => ({
                                ...current,
                                rating: Number(event.target.value),
                              }))
                            }
                            className="soft-input px-4 py-3"
                          >
                            <option value={5}>5점</option>
                            <option value={4}>4점</option>
                            <option value={3}>3점</option>
                            <option value={2}>2점</option>
                            <option value={1}>1점</option>
                          </select>
                        </label>

                        <label className="grid gap-2">
                          <span className="text-sm font-medium">핏 태그</span>
                          <input
                            value={reviewForm.fitTag ?? ""}
                            onChange={(event) =>
                              setReviewForm((current) => ({
                                ...current,
                                fitTag: event.target.value,
                              }))
                            }
                            className="soft-input px-4 py-3"
                          />
                        </label>

                        <label className="grid gap-2">
                          <span className="text-sm font-medium">제목</span>
                          <input
                            value={reviewForm.title}
                            onChange={(event) =>
                              setReviewForm((current) => ({
                                ...current,
                                title: event.target.value,
                              }))
                            }
                            className="soft-input px-4 py-3"
                          />
                        </label>

                        <label className="grid gap-2">
                          <span className="text-sm font-medium">내용</span>
                          <textarea
                            rows={4}
                            value={reviewForm.content}
                            onChange={(event) =>
                              setReviewForm((current) => ({
                                ...current,
                                content: event.target.value,
                              }))
                            }
                            className="soft-input px-4 py-3"
                          />
                        </label>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-2">
                            <span className="text-sm font-medium">배송 만족도</span>
                            <select
                              value={reviewForm.deliverySatisfaction ?? 5}
                              onChange={(event) =>
                                setReviewForm((current) => ({
                                  ...current,
                                  deliverySatisfaction: Number(event.target.value),
                                }))
                              }
                              className="soft-input px-4 py-3"
                            >
                              <option value={5}>5점</option>
                              <option value={4}>4점</option>
                              <option value={3}>3점</option>
                              <option value={2}>2점</option>
                              <option value={1}>1점</option>
                            </select>
                          </label>
                          <label className="grid gap-2">
                            <span className="text-sm font-medium">포장 만족도</span>
                            <select
                              value={reviewForm.packagingSatisfaction ?? 5}
                              onChange={(event) =>
                                setReviewForm((current) => ({
                                  ...current,
                                  packagingSatisfaction: Number(event.target.value),
                                }))
                              }
                              className="soft-input px-4 py-3"
                            >
                              <option value={5}>5점</option>
                              <option value={4}>4점</option>
                              <option value={3}>3점</option>
                              <option value={2}>2점</option>
                              <option value={1}>1점</option>
                            </select>
                          </label>
                        </div>

                        <label className="flex items-center gap-3 rounded-[20px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--ink-soft)]">
                          <input
                            type="checkbox"
                            checked={Boolean(reviewForm.repurchaseYn)}
                            onChange={(event) =>
                              setReviewForm((current) => ({
                                ...current,
                                repurchaseYn: event.target.checked,
                              }))
                            }
                          />
                          재구매 의사/경험 있음
                        </label>

                        <label className="grid gap-2">
                          <span className="text-sm font-medium">포토 리뷰 URL</span>
                          <textarea
                            rows={3}
                            value={(reviewForm.imageUrls ?? []).join("\n")}
                            onChange={(event) =>
                              setReviewForm((current) => ({
                                ...current,
                                imageUrls: event.target.value
                                  .split(/\n|,/)
                                  .map((value) => value.trim())
                                  .filter(Boolean)
                                  .slice(0, 4),
                              }))
                            }
                            className="soft-input px-4 py-3"
                          />
                        </label>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="submit"
                            disabled={isSavingReview}
                            className="button-primary flex-1 px-5 py-3 disabled:opacity-60"
                          >
                            {isSavingReview ? "저장 중..." : "리뷰 저장"}
                          </button>
                          <button type="button" onClick={resetReviewForm} className="button-secondary px-5 py-3">
                            취소
                          </button>
                        </div>
                      </form>
                    ) : null}
                  </article>
                );
              })
            ) : (
              <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm leading-7 text-[var(--ink-soft)]">
                아직 작성한 리뷰가 없습니다. 구매 후 상품 상세에서 바로 작성할 수 있습니다.
              </div>
            )}
          </div>
          {reviewMessage ? <p className="mt-4 text-sm text-[var(--secondary)]">{reviewMessage}</p> : null}
          {reviewError ? <p className="mt-4 text-sm text-red-600">{reviewError}</p> : null}
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
                      <p className="text-sm text-[var(--ink-soft)]">상품 수량 {order.itemCount}개</p>
                    </div>
                    <div className="space-y-2 text-sm sm:text-right">
                      <p className="font-semibold text-[var(--ink)]">{formatOrderStatus(order.status)}</p>
                      <p>{formatPrice(order.total)}</p>
                      <p className="text-[var(--ink-soft)]">
                        {new Date(order.createdAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm leading-7 text-[var(--ink-soft)]">
                아직 주문 내역이 없습니다.
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
              <p className="text-lg font-semibold">상품 둘러보기</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                카테고리와 검색 화면으로 이동합니다.
              </p>
            </Link>
            <Link
              href="/cart"
              className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 transition hover:translate-y-[-2px]"
            >
              <p className="text-lg font-semibold">장바구니 확인</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                담아둔 상품을 확인하고 주문으로 이어갈 수 있습니다.
              </p>
            </Link>
            <Link
              href="/lookup-order"
              className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 transition hover:translate-y-[-2px]"
            >
              <p className="text-lg font-semibold">비회원 주문 조회</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                별도의 비회원 주문도 주문번호와 연락처로 다시 확인할 수 있습니다.
              </p>
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
