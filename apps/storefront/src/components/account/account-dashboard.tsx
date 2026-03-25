"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ReactNode } from "react";

import {
  createShippingAddress,
  deleteAccountReview,
  deleteShippingAddress,
  removeWishlistItem,
  updateAccountProfile,
  updateAccountReview,
  updateShippingAddress,
} from "@/lib/client-api";
import { useAuth } from "@/lib/auth-store";
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
import { formatOrderStatus } from "@/lib/order-status";

const PROVIDER_LABELS: Record<string, string> = {
  LOCAL: "일반 회원",
  KAKAO: "카카오 로그인",
  NAVER: "네이버 로그인",
  GOOGLE: "구글 로그인",
};

const REVIEW_STATUS_LABELS: Record<string, string> = {
  PUBLISHED: "공개",
  HIDDEN: "숨김",
};

const EMPTY_ADDRESS_FORM: ShippingAddressPayload = {
  label: "",
  recipientName: "",
  phone: "",
  postalCode: "",
  address1: "",
  address2: "",
  isDefault: false,
};

function renderStars(rating: number) {
  return `${"★".repeat(rating)}${"☆".repeat(Math.max(0, 5 - rating))}`;
}

function SummaryStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-4 sm:p-5">
      <p className="display-eyebrow">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-[var(--ink)]">{value}</p>
    </div>
  );
}

function QuickActionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="button-secondary min-h-11 w-full px-4 py-3 text-center">
      {children}
    </Link>
  );
}

function QuickActionButton({
  type = "button",
  onClick,
  disabled,
  children,
}: {
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="button-secondary min-h-11 w-full px-4 py-3 text-center disabled:cursor-wait disabled:opacity-60 sm:w-auto"
    >
      {children}
    </button>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm leading-7 text-[var(--ink-soft)]">
      {children}
    </div>
  );
}

function buildReviewPayload(review: MyReview, draft: ReviewDraft): UpdateReviewPayload {
  return {
    rating: draft.rating,
    title: draft.title.trim(),
    content: draft.content.trim(),
    fitTag: review.fitTag ?? undefined,
    repurchaseYn: review.repurchaseYn,
    deliverySatisfaction: review.deliverySatisfaction,
    packagingSatisfaction: review.packagingSatisfaction,
    imageUrls: review.images.map((image) => image.imageUrl),
  };
}

function createReviewDraft(review: MyReview): ReviewDraft {
  return {
    rating: review.rating,
    title: review.title,
    content: review.content,
  };
}

function hasReviewDraftChanged(review: MyReview, draft: ReviewDraft | null) {
  if (!draft) {
    return false;
  }

  return (
    review.rating !== draft.rating ||
    review.title !== draft.title ||
    review.content !== draft.content
  );
}

function upsertAddress(current: ShippingAddress[], saved: ShippingAddress) {
  const merged = current.some((address) => address.id === saved.id)
    ? current.map((address) => (address.id === saved.id ? saved : address))
    : [saved, ...current];

  if (!saved.isDefault) {
    return merged;
  }

  return merged.map((address) =>
    address.id === saved.id ? saved : { ...address, isDefault: false },
  );
}

type ReviewDraft = {
  rating: number;
  title: string;
  content: string;
};

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
  const router = useRouter();
  const { signOut } = useAuth();

  const [profile, setProfile] = useState(initialProfile);
  const [nameDraft, setNameDraft] = useState(initialProfile.name);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [reviews, setReviews] = useState(initialReviews);
  const [profileEditing, setProfileEditing] = useState(false);
  const [addressManagerOpen, setAddressManagerOpen] = useState(initialAddresses.length === 0);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressDraft, setAddressDraft] = useState<ShippingAddressPayload>(EMPTY_ADDRESS_FORM);
  const [reviewEditorId, setReviewEditorId] = useState<number | null>(null);
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [wishlistPendingId, setWishlistPendingId] = useState<number | null>(null);
  const [reviewPendingId, setReviewPendingId] = useState<number | null>(null);
  const [addressPendingId, setAddressPendingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const joinedDate = new Date(profile.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const providerLabel = PROVIDER_LABELS[profile.provider] ?? profile.provider;
  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) ?? addresses[0] ?? null,
    [addresses],
  );
  const additionalAddresses = useMemo(
    () => addresses.filter((address) => address.id !== defaultAddress?.id).slice(0, 2),
    [addresses, defaultAddress],
  );
  const hiddenAddressCount = Math.max(
    0,
    addresses.length - (defaultAddress ? 1 : 0) - additionalAddresses.length,
  );
  const wishlistPreview = wishlist.slice(0, 4);
  const reviewPreview = reviews.slice(0, 3);
  const initials = profile.name.trim().charAt(0) || "M";

  const scrollAddressManagerIntoView = () => {
    setTimeout(() => {
      document.getElementById("account-address-manager")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const openAddressManager = () => {
    setAddressManagerOpen(true);
    scrollAddressManagerIntoView();
  };

  const beginNewAddress = () => {
    resetAddressEditor();
    setAddressManagerOpen(true);
    scrollAddressManagerIntoView();
  };

  const resetAddressEditor = () => {
    setEditingAddressId(null);
    setAddressDraft({
      ...EMPTY_ADDRESS_FORM,
      isDefault: addresses.length === 0,
    });
  };

  const beginAddressEdit = (address: ShippingAddress) => {
    setEditingAddressId(address.id);
    setAddressDraft({
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      postalCode: address.postalCode,
      address1: address.address1,
      address2: address.address2,
      isDefault: address.isDefault,
    });
    setAddressManagerOpen(true);
  };

  const handleProfileSave = () => {
    const nextName = nameDraft.trim();

    if (!nextName || nextName === profile.name) {
      setProfileEditing(false);
      setNameDraft(profile.name);
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      try {
        const nextProfile = await updateAccountProfile({ name: nextName });
        setProfile(nextProfile);
        setNameDraft(nextProfile.name);
        setProfileEditing(false);
        setFeedback("회원정보를 업데이트했습니다.");
      } catch (error) {
        console.error(error);
        setFeedback("회원정보 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  };

  const handleWishlistRemove = (productId: number) => {
    setFeedback(null);
    setWishlistPendingId(productId);
    startTransition(async () => {
      try {
        await removeWishlistItem(productId);
        setWishlist((current) => current.filter((item) => item.productId !== productId));
        setProfile((current) => ({
          ...current,
          wishlistCount: Math.max(0, current.wishlistCount - 1),
        }));
        setFeedback("찜한 상품에서 제거했습니다.");
      } catch (error) {
        console.error(error);
        setFeedback("찜 해제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        setWishlistPendingId(null);
      }
    });
  };

  const handleReviewDelete = (reviewId: number) => {
    setFeedback(null);
    setReviewPendingId(reviewId);
    startTransition(async () => {
      try {
        await deleteAccountReview(reviewId);
        setReviews((current) => current.filter((review) => review.id !== reviewId));
        setProfile((current) => ({
          ...current,
          reviewCount: Math.max(0, current.reviewCount - 1),
        }));
        if (reviewEditorId === reviewId) {
          setReviewEditorId(null);
          setReviewDraft(null);
        }
        setFeedback("리뷰를 삭제했습니다.");
      } catch (error) {
        console.error(error);
        setFeedback("리뷰 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        setReviewPendingId(null);
      }
    });
  };

  const handleReviewSave = (review: MyReview) => {
    if (!reviewDraft) {
      return;
    }

    const payload = buildReviewPayload(review, reviewDraft);
    if (!payload.title || !payload.content) {
      setFeedback("리뷰 제목과 내용을 입력해 주세요.");
      return;
    }

    setFeedback(null);
    setReviewPendingId(review.id);
    startTransition(async () => {
      try {
        const updated = await updateAccountReview(review.id, payload);
        setReviews((current) => current.map((item) => (item.id === review.id ? updated : item)));
        setReviewEditorId(null);
        setReviewDraft(null);
        setFeedback("리뷰를 수정했습니다.");
      } catch (error) {
        console.error(error);
        setFeedback("리뷰 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        setReviewPendingId(null);
      }
    });
  };

  const handleAddressSave = () => {
    const payload: ShippingAddressPayload = {
      label: addressDraft.label.trim(),
      recipientName: addressDraft.recipientName.trim(),
      phone: addressDraft.phone.trim(),
      postalCode: addressDraft.postalCode.trim(),
      address1: addressDraft.address1.trim(),
      address2: addressDraft.address2.trim(),
      isDefault: addresses.length === 0 ? true : addressDraft.isDefault,
    };

    if (!payload.label || !payload.recipientName || !payload.phone || !payload.postalCode || !payload.address1) {
      setFeedback("배송지 이름, 받는 분, 연락처, 우편번호, 주소를 모두 입력해 주세요.");
      return;
    }

    setFeedback(null);
    setAddressPendingId(editingAddressId ?? 0);
    startTransition(async () => {
      try {
        const saved = editingAddressId
          ? await updateShippingAddress(editingAddressId, payload)
          : await createShippingAddress(payload);

        setAddresses((current) => upsertAddress(current, saved));
        setProfile((current) => ({
          ...current,
          addressCount: editingAddressId ? current.addressCount : current.addressCount + 1,
        }));
        resetAddressEditor();
        setAddressManagerOpen(true);
        setFeedback(editingAddressId ? "배송지를 수정했습니다." : "배송지를 추가했습니다.");
      } catch (error) {
        console.error(error);
        setFeedback("배송지 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        setAddressPendingId(null);
      }
    });
  };

  const handleAddressDelete = (addressId: number) => {
    setFeedback(null);
    setAddressPendingId(addressId);
    startTransition(async () => {
      try {
        await deleteShippingAddress(addressId);
        setAddresses((current) => current.filter((address) => address.id !== addressId));
        setProfile((current) => ({
          ...current,
          addressCount: Math.max(0, current.addressCount - 1),
        }));
        if (editingAddressId === addressId) {
          resetAddressEditor();
        }
        setFeedback("배송지를 삭제했습니다.");
      } catch (error) {
        console.error(error);
        setFeedback("배송지 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        setAddressPendingId(null);
      }
    });
  };


  const handleAddressSetDefault = (address: ShippingAddress) => {
    if (address.isDefault) {
      return;
    }

    setFeedback(null);
    setAddressPendingId(address.id);
    startTransition(async () => {
      try {
        const saved = await updateShippingAddress(address.id, {
          label: address.label,
          recipientName: address.recipientName,
          phone: address.phone,
          postalCode: address.postalCode,
          address1: address.address1,
          address2: address.address2,
          isDefault: true,
        });
        setAddresses((current) => upsertAddress(current, saved));
        setFeedback("기본 배송지를 변경했습니다.");
      } catch (error) {
        console.error(error);
        setFeedback("기본 배송지 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        setAddressPendingId(null);
      }
    });
  };

  return (
    <div className="grid-shell space-y-5 sm:space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <article className="surface-card rounded-[32px] p-6 sm:rounded-[36px] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.82)] text-xl font-semibold text-[var(--ink)] sm:h-20 sm:w-20 sm:text-3xl">
                {initials}
              </div>
              <div>
                <p className="display-eyebrow">My Account</p>
                <h1 className="display-heading mt-4 text-4xl">내 계정</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base sm:leading-8">
                  주문, 배송지, 찜, 리뷰를 한곳에서 빠르게 확인하고 바로 관리할 수 있도록 정리했습니다.
                </p>
                <div className="mt-5 space-y-2 text-xs text-[var(--ink-soft)] sm:text-sm">
                  <p className="font-semibold text-[var(--ink)]">{profile.name}</p>
                  <p>{profile.email}</p>
                  <p>
                    {providerLabel} · 가입일 {joinedDate}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[340px]">
              <QuickActionButton onClick={() => setProfileEditing((current) => !current)}>
                회원정보 수정
              </QuickActionButton>
              <QuickActionButton onClick={openAddressManager}>배송지 관리</QuickActionButton>
              <QuickActionLink href="/orders">전체 주문 보기</QuickActionLink>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setFeedback(null);
                  startTransition(async () => {
                    await signOut();
                    router.replace("/");
                    router.refresh();
                  });
                }}
                className="button-primary min-h-11 w-full px-4 py-3 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
              >
                로그아웃
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryStat label="주문" value={profile.orderCount} />
            <SummaryStat label="배송지" value={profile.addressCount} />
            <SummaryStat label="찜" value={profile.wishlistCount} />
            <SummaryStat label="리뷰" value={profile.reviewCount} />
            <SummaryStat label="가입일" value={<span className="text-base">{joinedDate}</span>} />
          </div>

          {feedback ? (
            <div className="mt-6 rounded-[20px] border border-[rgba(28,107,81,0.18)] bg-[rgba(166,242,209,0.2)] px-4 py-3 text-sm text-[var(--secondary)]">
              {feedback}
            </div>
          ) : null}
        </article>

        <article id="account-profile" className="surface-card rounded-[32px] p-6 sm:rounded-[36px] sm:p-8 lg:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">Profile</p>
              <h2 className="display-heading mt-4 text-3xl">기본 정보</h2>
            </div>
            <QuickActionButton onClick={() => setProfileEditing((current) => !current)}>
              {profileEditing ? "닫기" : "회원정보 수정"}
            </QuickActionButton>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-4 sm:p-5">
              <p className="display-eyebrow">이름</p>
              {profileEditing ? (
                <div className="mt-4 space-y-3">
                  <input
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    className="soft-input w-full rounded-[20px] px-4 py-3"
                    placeholder="이름을 입력하세요"
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleProfileSave}
                      className="button-primary min-h-11 w-full px-4 py-3 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                    >
                      저장
                    </button>
                    <QuickActionButton
                      onClick={() => {
                        setNameDraft(profile.name);
                        setProfileEditing(false);
                      }}
                    >
                      취소
                    </QuickActionButton>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xl font-semibold">{profile.name}</p>
              )}
            </div>
            <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-4 sm:p-5">
              <p className="display-eyebrow">이메일</p>
              <p className="mt-3 text-sm text-[var(--ink-soft)]">{profile.email}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-4 sm:p-5">
              <p className="display-eyebrow">가입 방식</p>
              <p className="mt-3 text-sm text-[var(--ink-soft)]">{providerLabel}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <article className="surface-card rounded-[32px] p-6 sm:rounded-[36px] sm:p-8 lg:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">Orders</p>
              <h2 className="display-heading mt-4 text-3xl">최근 주문</h2>
            </div>
            <QuickActionLink href="/orders">전체 주문 보기</QuickActionLink>
          </div>
          <div className="mt-6 space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link
                  key={order.orderNumber}
                  href={`/orders/${order.orderNumber}`}
                  className="block rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 transition hover:-translate-y-[2px] hover:border-[var(--ink)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold sm:text-lg">{order.orderNumber}</p>
                      <p className="mt-2 text-sm text-[var(--ink-soft)]">
                        {new Date(order.createdAt).toLocaleDateString("ko-KR")} · {order.customerName}
                      </p>
                    </div>
                    <div className="space-y-1 text-sm sm:text-right">
                      <p className="font-semibold">{formatOrderStatus(order.status)}</p>
                      <p>{formatPrice(order.total)}원</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState>아직 주문 내역이 없습니다. 첫 주문을 완료하면 여기에서 바로 확인할 수 있습니다.</EmptyState>
            )}
          </div>
        </article>

        <article id="account-addresses" className="surface-card rounded-[32px] p-6 sm:rounded-[36px] sm:p-8 lg:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">Address Book</p>
              <h2 className="display-heading mt-4 text-3xl">기본 배송지</h2>
            </div>
            <div className="flex w-full flex-col gap-3 text-sm text-[var(--ink-soft)] sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <span>총 {addresses.length}개 등록됨</span>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <QuickActionButton onClick={beginNewAddress}>배송지 추가</QuickActionButton>
                <QuickActionButton onClick={() => setAddressManagerOpen((current) => !current)}>
                  {addressManagerOpen ? "관리 닫기" : "배송지 관리"}
                </QuickActionButton>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {defaultAddress ? (
              <article className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold sm:text-lg">{defaultAddress.label}</p>
                  <span className="rounded-full bg-[rgba(28,107,81,0.12)] px-3 py-1 text-xs font-semibold text-[var(--secondary)]">
                    기본 배송지
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  {defaultAddress.recipientName} · {defaultAddress.phone}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                  ({defaultAddress.postalCode}) {defaultAddress.address1}
                  {defaultAddress.address2 ? `, ${defaultAddress.address2}` : ""}
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <QuickActionButton onClick={() => beginAddressEdit(defaultAddress)}>
                    기본 배송지 수정
                  </QuickActionButton>
                  <QuickActionButton onClick={beginNewAddress}>배송지 추가</QuickActionButton>
                  <QuickActionButton onClick={openAddressManager}>전체 배송지 보기</QuickActionButton>
                </div>
              </article>
            ) : (
              <EmptyState>
                <div className="space-y-4">
                  <p>첫 배송지를 등록하면 주문서 입력이 더 빨라집니다. 다음 주문부터는 기본 배송지를 바로 불러올 수 있습니다.</p>
                  <QuickActionButton onClick={beginNewAddress}>첫 배송지 추가</QuickActionButton>
                </div>
              </EmptyState>
            )}

            {additionalAddresses.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {additionalAddresses.map((address) => (
                  <article
                    key={address.id}
                    className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-4 sm:p-5"
                  >
                    <p className="text-base font-semibold">{address.label}</p>
                    <p className="mt-2 text-sm text-[var(--ink-soft)]">{address.recipientName}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                      ({address.postalCode}) {address.address1}
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <QuickActionButton onClick={() => handleAddressSetDefault(address)}>
                        기본으로 설정
                      </QuickActionButton>
                      <QuickActionButton onClick={() => beginAddressEdit(address)}>
                        수정
                      </QuickActionButton>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {hiddenAddressCount > 0 ? (
              <div className="rounded-[20px] border border-dashed border-[var(--line-strong)] bg-[rgba(255,255,255,0.5)] px-4 py-4 text-sm text-[var(--ink-soft)]">
                추가 배송지 {hiddenAddressCount}개가 더 있습니다. 배송지 관리에서 전체 목록을 확인하고 기본 배송지를 바로 바꿀 수 있습니다.
              </div>
            ) : null}
          </div>

          {addressManagerOpen ? (
            <div id="account-address-manager" className="mt-8 space-y-4 border-t border-[var(--line)] pt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div>
                  <p className="display-eyebrow">Manage</p>
                  <h3 className="mt-3 text-xl font-semibold">배송지 관리</h3>
                </div>
                <QuickActionButton onClick={beginNewAddress}>새 배송지 추가</QuickActionButton>
              </div>

              {addresses.length > 0 ? (
                <div className="grid gap-4">
                  {addresses.map((address) => (
                    <article
                      key={address.id}
                      className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold">{address.label}</p>
                            {address.isDefault ? (
                              <span className="rounded-full bg-[rgba(28,107,81,0.12)] px-3 py-1 text-xs font-semibold text-[var(--secondary)]">
                                기본 배송지
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm text-[var(--ink-soft)]">
                            {address.recipientName} · {address.phone}
                          </p>
                          <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                            ({address.postalCode}) {address.address1}
                            {address.address2 ? `, ${address.address2}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {!address.isDefault ? (
                            <QuickActionButton
                              disabled={addressPendingId === address.id}
                              onClick={() => handleAddressSetDefault(address)}
                            >
                              기본으로 설정
                            </QuickActionButton>
                          ) : null}
                          <QuickActionButton
                            disabled={addressPendingId === address.id}
                            onClick={() => beginAddressEdit(address)}
                          >
                            수정
                          </QuickActionButton>
                          <QuickActionButton
                            disabled={addressPendingId === address.id}
                            onClick={() => handleAddressDelete(address.id)}
                          >
                            삭제
                          </QuickActionButton>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

              <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div>
                    <p className="display-eyebrow">Editor</p>
                    <h3 className="mt-3 text-xl font-semibold">
                      {editingAddressId ? "배송지 수정" : "새 배송지 추가"}
                    </h3>
                  </div>
                  {editingAddressId ? (
                    <QuickActionButton onClick={resetAddressEditor}>새로 입력</QuickActionButton>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <input
                    value={addressDraft.label}
                    onChange={(event) => setAddressDraft((current) => ({ ...current, label: event.target.value }))}
                    className="soft-input min-h-11 rounded-[20px] px-4 py-3"
                    placeholder="배송지 이름"
                  />
                  <input
                    value={addressDraft.recipientName}
                    onChange={(event) =>
                      setAddressDraft((current) => ({ ...current, recipientName: event.target.value }))
                    }
                    className="soft-input min-h-11 rounded-[20px] px-4 py-3"
                    placeholder="받는 분"
                  />
                  <input
                    value={addressDraft.phone}
                    onChange={(event) => setAddressDraft((current) => ({ ...current, phone: event.target.value }))}
                    className="soft-input min-h-11 rounded-[20px] px-4 py-3"
                    placeholder="연락처"
                  />
                  <input
                    value={addressDraft.postalCode}
                    onChange={(event) =>
                      setAddressDraft((current) => ({ ...current, postalCode: event.target.value }))
                    }
                    className="soft-input min-h-11 rounded-[20px] px-4 py-3"
                    placeholder="우편번호"
                  />
                  <input
                    value={addressDraft.address1}
                    onChange={(event) => setAddressDraft((current) => ({ ...current, address1: event.target.value }))}
                    className="soft-input rounded-[20px] px-4 py-3 md:col-span-2"
                    placeholder="기본 주소"
                  />
                  <input
                    value={addressDraft.address2}
                    onChange={(event) => setAddressDraft((current) => ({ ...current, address2: event.target.value }))}
                    className="soft-input rounded-[20px] px-4 py-3 md:col-span-2"
                    placeholder="상세 주소"
                  />
                </div>

                <p className="mt-5 text-sm leading-7 text-[var(--ink-soft)]">
                  {addresses.length === 0
                    ? "첫 배송지는 자동으로 기본 배송지로 저장됩니다."
                    : "기본 배송지로 저장하면 다음 주문서에서 가장 먼저 불러옵니다."}
                </p>

                <label className="mt-4 flex items-center gap-3 text-sm text-[var(--ink-soft)]">
                  <input
                    type="checkbox"
                    checked={addressDraft.isDefault}
                    onChange={(event) =>
                      setAddressDraft((current) => ({ ...current, isDefault: event.target.checked }))
                    }
                  />
                  기본 배송지로 저장
                </label>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    disabled={addressPendingId !== null}
                    onClick={handleAddressSave}
                    className="button-primary min-h-11 w-full px-4 py-3 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                  >
                    {editingAddressId ? "배송지 수정 저장" : "배송지 추가"}
                  </button>
                  <QuickActionButton onClick={resetAddressEditor}>초기화</QuickActionButton>
                </div>
              </div>
            </div>
          ) : null}
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="surface-card rounded-[32px] p-6 sm:rounded-[36px] sm:p-8 lg:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">Wishlist</p>
              <h2 className="display-heading mt-4 text-3xl">찜한 상품</h2>
            </div>
            <QuickActionLink href="/search">상품 더 보기</QuickActionLink>
          </div>
          <div className="mt-6 space-y-4">
            {wishlistPreview.length > 0 ? (
              wishlistPreview.map((item) => (
                <article
                  key={item.productId}
                  className="grid gap-4 rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-4 sm:p-5 sm:grid-cols-[120px_minmax(0,1fr)]"
                >
                  <Link href={`/products/${item.slug}`} className="relative min-h-[180px] overflow-hidden rounded-[24px] sm:min-h-[140px]">
                    <Image src={item.imageUrl} alt={item.imageAlt} fill sizes="120px" className="object-cover" />
                  </Link>
                  <div>
                    <p className="display-eyebrow">{item.categoryName}</p>
                    <Link href={`/products/${item.slug}`} className="mt-2 block text-xl font-semibold">
                      {item.name}
                    </Link>
                    <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{item.summary}</p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                      <p className="text-base font-semibold sm:text-lg">{formatPrice(item.price)}원</p>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Link href={`/products/${item.slug}`} className="button-secondary min-h-11 w-full px-4 py-3 sm:w-auto">
                          상품 보기
                        </Link>
                        <button
                          type="button"
                          disabled={wishlistPendingId === item.productId}
                          onClick={() => handleWishlistRemove(item.productId)}
                          className="button-secondary min-h-11 w-full px-4 py-3 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                        >
                          찜 해제
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState>
                마음에 드는 상품을 찜하면 여기에서 다시 볼 수 있습니다. 상품 탐색 중 놓친 아이템을 쉽게 이어서 확인해 보세요.
              </EmptyState>
            )}
          </div>
        </article>

        <article className="surface-card rounded-[32px] p-6 sm:rounded-[36px] sm:p-8 lg:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">Reviews</p>
              <h2 className="display-heading mt-4 text-3xl">내 리뷰</h2>
            </div>
            <span className="text-sm text-[var(--ink-soft)]">최근 {reviewPreview.length}개 미리보기</span>
          </div>
          <div className="mt-6 space-y-4">
            {reviewPreview.length > 0 ? (
              reviewPreview.map((review) => {
                const isEditing = reviewEditorId === review.id && reviewDraft;
                const reviewChanged = hasReviewDraftChanged(review, reviewDraft);

                return (
                  <article key={review.id} className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5 sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
                      <Link href={`/products/${review.productSlug}`} className="relative min-h-[112px] overflow-hidden rounded-[24px] border border-[var(--line)] bg-white">
                        <Image
                          src={review.productImageUrl}
                          alt={review.productImageAlt}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      </Link>

                      <div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <Link href={`/products/${review.productSlug}`} className="text-base font-semibold sm:text-lg">
                              {review.productName}
                            </Link>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--ink-soft)]">
                              <span>{renderStars(review.rating)}</span>
                              <span>·</span>
                              <span>{REVIEW_STATUS_LABELS[review.status] ?? review.status}</span>
                              {review.fitTag ? (
                                <>
                                  <span>·</span>
                                  <span>{review.fitTag}</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-[var(--ink-soft)] sm:text-right">
                            <p>{new Date(review.createdAt).toLocaleDateString("ko-KR")}</p>
                            <p>도움돼요 {review.helpfulCount}회</p>
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="mt-5 space-y-4">
                            <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(255,255,255,0.6)] px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
                              평점, 제목, 내용을 다듬어 더 읽기 쉽게 정리할 수 있습니다. 저장 전에는 현재 공개 상태가 유지됩니다.
                            </div>
                            <div className="grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)]">
                              <select
                                value={reviewDraft.rating}
                                onChange={(event) =>
                                  setReviewDraft((current) =>
                                    current
                                      ? { ...current, rating: Number(event.target.value) }
                                      : current,
                                  )
                                }
                                className="soft-input min-h-11 rounded-[20px] px-4 py-3"
                              >
                                {[5, 4, 3, 2, 1].map((value) => (
                                  <option key={value} value={value}>
                                    평점 {value}점
                                  </option>
                                ))}
                              </select>
                              <input
                                value={reviewDraft.title}
                                onChange={(event) =>
                                  setReviewDraft((current) =>
                                    current ? { ...current, title: event.target.value } : current,
                                  )
                                }
                                className="soft-input min-h-11 rounded-[20px] px-4 py-3"
                                placeholder="리뷰 제목"
                              />
                            </div>
                            <textarea
                              value={reviewDraft.content}
                              onChange={(event) =>
                                setReviewDraft((current) =>
                                  current ? { ...current, content: event.target.value } : current,
                                )
                              }
                              className="soft-input min-h-[148px] w-full rounded-[24px] px-4 py-4"
                              placeholder="리뷰 내용을 입력해 주세요"
                            />
                            <div className="flex flex-col gap-2 text-sm text-[var(--ink-soft)] sm:flex-row sm:items-center sm:justify-between">
                              <p>제목 {reviewDraft.title.trim().length}자 · 본문 {reviewDraft.content.trim().length}자</p>
                              <p>{reviewChanged ? '수정 내용이 있습니다.' : '변경된 내용이 없습니다.'}</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                disabled={reviewPendingId === review.id || !reviewChanged}
                                onClick={() => handleReviewSave(review)}
                                className="button-primary min-h-11 w-full px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                              >
                                리뷰 저장
                              </button>
                              <QuickActionButton
                                onClick={() => {
                                  setReviewEditorId(null);
                                  setReviewDraft(null);
                                }}
                              >
                                취소
                              </QuickActionButton>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="mt-4 text-base font-semibold">{review.title}</p>
                            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{review.content}</p>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--ink-soft)]">
                              {review.buyerReview ? (
                                <span className="rounded-full border border-[var(--line)] px-3 py-1">실구매 리뷰</span>
                              ) : null}
                              {review.deliverySatisfaction ? (
                                <span className="rounded-full border border-[var(--line)] px-3 py-1">배송 만족 {review.deliverySatisfaction}/5</span>
                              ) : null}
                              {review.packagingSatisfaction ? (
                                <span className="rounded-full border border-[var(--line)] px-3 py-1">포장 만족 {review.packagingSatisfaction}/5</span>
                              ) : null}
                            </div>
                            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                              <Link href={`/products/${review.productSlug}`} className="button-secondary min-h-11 w-full px-4 py-3 sm:w-auto">
                                상품 보기
                              </Link>
                              <QuickActionButton
                                onClick={() => {
                                  setReviewEditorId(review.id);
                                  setReviewDraft(createReviewDraft(review));
                                }}
                              >
                                리뷰 수정
                              </QuickActionButton>
                              <button
                                type="button"
                                disabled={reviewPendingId === review.id}
                                onClick={() => handleReviewDelete(review.id)}
                                className="button-secondary min-h-11 w-full px-4 py-3 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                              >
                                리뷰 삭제
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyState>
                구매한 상품에 리뷰를 남기면 여기에 모아 볼 수 있습니다. 다음 주문 후 첫 리뷰를 남겨 보세요.
              </EmptyState>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
