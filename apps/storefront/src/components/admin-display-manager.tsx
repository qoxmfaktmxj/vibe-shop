"use client";

import Image from "next/image";
import { useState, useTransition } from "react";

import {
  createDisplayItem,
  deleteDisplayItem,
  updateDisplayItem,
  updateDisplaySection,
} from "@/lib/admin-client-api";
import type {
  AdminDisplay,
  AdminDisplayItem,
  AdminDisplaySection,
  DisplayItemPayload,
  UpdateAdminDisplaySectionPayload,
} from "@/lib/admin-contracts";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function sortItems(items: AdminDisplayItem[]) {
  return [...items].sort((left, right) => {
    if (left.displayOrder !== right.displayOrder) {
      return left.displayOrder - right.displayOrder;
    }
    return left.id - right.id;
  });
}

function createSectionForm(section: AdminDisplaySection): UpdateAdminDisplaySectionPayload {
  return {
    title: section.title,
    subtitle: section.subtitle,
    displayOrder: section.displayOrder,
    visible: section.visible,
  };
}

function createEmptyItemForm(sectionCode: string): DisplayItemPayload {
  return {
    sectionCode,
    title: "",
    subtitle: "",
    imageUrl: "/images/products/living-01.jpg",
    imageAlt: "",
    href: "/search",
    ctaLabel: "자세히 보기",
    accentColor: "#D6512D",
    displayOrder: 10,
    visible: true,
    startsAt: null,
    endsAt: null,
  };
}

function createItemForm(item: AdminDisplayItem, sectionCode: string): DisplayItemPayload {
  return {
    sectionCode,
    title: item.title,
    subtitle: item.subtitle,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    href: item.href,
    ctaLabel: item.ctaLabel,
    accentColor: item.accentColor,
    displayOrder: item.displayOrder,
    visible: item.visible,
    startsAt: item.startsAt,
    endsAt: item.endsAt,
  };
}

export function AdminDisplayManager({
  initialDisplay,
}: {
  initialDisplay: AdminDisplay;
}) {
  const [sections, setSections] = useState(initialDisplay.sections);
  const [selectedSectionCode, setSelectedSectionCode] = useState(initialDisplay.sections[0]?.code ?? "HERO");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(
    initialDisplay.sections[0]?.items[0]?.id ?? null,
  );
  const [sectionMessage, setSectionMessage] = useState("");
  const [sectionError, setSectionError] = useState("");
  const [itemMessage, setItemMessage] = useState("");
  const [itemError, setItemError] = useState("");
  const [isSavingSection, startSavingSection] = useTransition();
  const [isSavingItem, startSavingItem] = useTransition();
  const [isDeletingItem, startDeletingItem] = useTransition();

  const selectedSection =
    sections.find((section) => section.code === selectedSectionCode) ?? sections[0] ?? null;

  const [sectionForm, setSectionForm] = useState<UpdateAdminDisplaySectionPayload>(
    selectedSection ? createSectionForm(selectedSection) : { title: "", subtitle: "", displayOrder: 0, visible: true },
  );

  const selectedItem =
    selectedSection?.items.find((item) => item.id === selectedItemId) ?? null;

  const [itemForm, setItemForm] = useState<DisplayItemPayload>(
    selectedItem && selectedSection
      ? createItemForm(selectedItem, selectedSection.code)
      : createEmptyItemForm(selectedSectionCode),
  );

  function replaceSection(nextSection: AdminDisplaySection) {
    setSections((current) =>
      current.map((section) => (section.code === nextSection.code ? nextSection : section)),
    );
  }

  function selectSection(sectionCode: string, sourceSections = sections) {
    const nextSection =
      sourceSections.find((section) => section.code === sectionCode) ?? sourceSections[0] ?? null;
    if (!nextSection) {
      return;
    }

    const nextSelectedItem = nextSection.items[0] ?? null;
    setSelectedSectionCode(nextSection.code);
    setSectionForm(createSectionForm(nextSection));
    setSelectedItemId(nextSelectedItem?.id ?? null);
    setItemForm(
      nextSelectedItem
        ? createItemForm(nextSelectedItem, nextSection.code)
        : createEmptyItemForm(nextSection.code),
    );
  }

  function selectItem(itemId: number, sourceSection = selectedSection) {
    const nextItem = sourceSection?.items.find((item) => item.id === itemId);
    if (!nextItem || !sourceSection) {
      return;
    }

    setSelectedItemId(nextItem.id);
    setItemForm(createItemForm(nextItem, sourceSection.code));
  }

  if (!selectedSection) {
    return null;
  }

  return (
    <article className="admin-card rounded-[36px] p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-[var(--ink-soft)]">Display</p>
          <h2 className="display mt-4 text-3xl font-semibold">배너와 전시 섹션</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            홈에 노출되는 섹션 제목과 배너 아이템을 관리자에서 직접 조정합니다.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-3">
          {sections.map((section) => (
            <button
              key={section.code}
              type="button"
              onClick={() => selectSection(section.code)}
              className={`w-full rounded-[26px] border px-5 py-4 text-left transition ${
                selectedSection.code === section.code
                  ? "border-[var(--accent)] bg-[rgba(214,81,45,0.08)]"
                  : "border-[var(--line)] bg-white/70 hover:border-[var(--line-strong)]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold">{section.title}</p>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                  {section.code}
                </span>
              </div>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{section.subtitle}</p>
              <p className="mt-3 text-xs text-[var(--ink-soft)]">
                항목 {section.items.length}개 · {section.visible ? "노출중" : "비노출"}
              </p>
            </button>
          ))}
        </div>

        <div className="grid gap-6">
          <form
            className="grid gap-4 rounded-[28px] border border-[var(--line)] bg-white/70 p-6"
            onSubmit={(event) => {
              event.preventDefault();
              setSectionMessage("");
              setSectionError("");

              startSavingSection(() => {
                void (async () => {
                  try {
                    const nextSection = await updateDisplaySection(selectedSection.code, sectionForm);
                    replaceSection(nextSection);
                    setSectionForm(createSectionForm(nextSection));
                    setSectionMessage("전시 섹션 정보를 저장했습니다.");
                  } catch (error) {
                    setSectionError(getErrorMessage(error, "전시 섹션 저장 중 문제가 발생했습니다."));
                  }
                })();
              });
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-[var(--ink-soft)]">Section Metadata</p>
                <h3 className="mt-2 text-xl font-semibold">{selectedSection.code}</h3>
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                <input
                  type="checkbox"
                  checked={sectionForm.visible}
                  onChange={(event) =>
                    setSectionForm((current) => ({ ...current, visible: event.target.checked }))
                  }
                />
                노출
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium">섹션 제목</span>
              <input
                name="displaySectionTitle"
                value={sectionForm.title}
                onChange={(event) =>
                  setSectionForm((current) => ({ ...current, title: event.target.value }))
                }
                className="admin-input px-4 py-3"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">섹션 설명</span>
              <textarea
                name="displaySectionSubtitle"
                rows={3}
                value={sectionForm.subtitle}
                onChange={(event) =>
                  setSectionForm((current) => ({ ...current, subtitle: event.target.value }))
                }
                className="admin-input px-4 py-3"
              />
            </label>

            <label className="grid gap-2 sm:max-w-[220px]">
              <span className="text-sm font-medium">정렬 순서</span>
              <input
                name="displaySectionDisplayOrder"
                type="number"
                min={0}
                value={sectionForm.displayOrder}
                onChange={(event) =>
                  setSectionForm((current) => ({
                    ...current,
                    displayOrder: Number(event.target.value),
                  }))
                }
                className="admin-input px-4 py-3"
              />
            </label>

            {sectionMessage ? <p className="text-sm text-[var(--teal)]">{sectionMessage}</p> : null}
            {sectionError ? <p className="text-sm text-red-600">{sectionError}</p> : null}

            <button type="submit" disabled={isSavingSection} className="admin-button px-6 py-4 disabled:opacity-60">
              {isSavingSection ? "저장 중입니다." : "섹션 저장"}
            </button>
          </form>

          <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow text-[var(--ink-soft)]">Banner Items</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItemId(null);
                    setItemForm(createEmptyItemForm(selectedSection.code));
                    setItemMessage("");
                    setItemError("");
                  }}
                  className="admin-button-secondary px-4 py-2"
                >
                  새 배너
                </button>
              </div>

              {selectedSection.items.length > 0 ? (
                selectedSection.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectItem(item.id)}
                    className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                      selectedItem?.id === item.id
                        ? "border-[var(--accent)] bg-[rgba(214,81,45,0.08)]"
                        : "border-[var(--line)] bg-white/70 hover:border-[var(--line-strong)]"
                    }`}
                  >
                    <p className="text-base font-semibold">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{item.subtitle}</p>
                    <p className="mt-3 text-xs text-[var(--ink-soft)]">
                      순서 {item.displayOrder} · {item.visible ? "노출중" : "비노출"}
                    </p>
                  </button>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/60 px-5 py-6 text-sm text-[var(--ink-soft)]">
                  이 섹션에는 아직 배너가 없습니다.
                </div>
              )}
            </div>

            <form
              className="grid gap-4 rounded-[28px] border border-[var(--line)] bg-white/70 p-6"
              onSubmit={(event) => {
                event.preventDefault();
                setItemMessage("");
                setItemError("");

                startSavingItem(() => {
                  void (async () => {
                    try {
                      const nextItem = selectedItemId
                        ? await updateDisplayItem(selectedItemId, itemForm)
                        : await createDisplayItem(itemForm);

                      const nextSections = sections.map((section) => {
                        if (section.code !== itemForm.sectionCode) {
                          return selectedItemId && selectedSection.code === section.code
                            ? {
                                ...section,
                                items: section.items.filter((item) => item.id !== selectedItemId),
                              }
                            : section;
                        }

                        const nextItems = selectedItemId
                          ? section.items.some((item) => item.id === nextItem.id)
                            ? section.items.map((item) => (item.id === nextItem.id ? nextItem : item))
                            : [...section.items, nextItem]
                          : [...section.items, nextItem];

                        return {
                          ...section,
                          items: sortItems(nextItems),
                        };
                      });

                      setSections(nextSections);
                      selectSection(itemForm.sectionCode, nextSections);
                      setSelectedItemId(nextItem.id);
                      setItemForm(createItemForm(nextItem, itemForm.sectionCode));
                      setItemMessage(selectedItemId ? "배너를 수정했습니다." : "배너를 추가했습니다.");
                    } catch (error) {
                      setItemError(getErrorMessage(error, "배너 저장 중 문제가 발생했습니다."));
                    }
                  })();
                });
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow text-[var(--ink-soft)]">Banner Editor</p>
                  <h3 className="mt-2 text-xl font-semibold">
                    {selectedItemId ? "배너 수정" : "새 배너"}
                  </h3>
                </div>
                <label className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                  <input
                    type="checkbox"
                    checked={itemForm.visible}
                    onChange={(event) =>
                      setItemForm((current) => ({ ...current, visible: event.target.checked }))
                    }
                  />
                  노출
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium">섹션</span>
                <select
                  name="displayItemSectionCode"
                  value={itemForm.sectionCode}
                  onChange={(event) =>
                    setItemForm((current) => ({ ...current, sectionCode: event.target.value }))
                  }
                  className="admin-input px-4 py-3"
                >
                  {sections.map((section) => (
                    <option key={section.code} value={section.code}>
                      {section.code}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">배너 제목</span>
                <input
                  name="displayItemTitle"
                  value={itemForm.title}
                  onChange={(event) =>
                    setItemForm((current) => ({ ...current, title: event.target.value }))
                  }
                  className="admin-input px-4 py-3"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">배너 설명</span>
                <textarea
                  name="displayItemSubtitle"
                  rows={4}
                  value={itemForm.subtitle}
                  onChange={(event) =>
                    setItemForm((current) => ({ ...current, subtitle: event.target.value }))
                  }
                  className="admin-input px-4 py-3"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">이미지 경로</span>
                  <input
                    name="displayItemImageUrl"
                    value={itemForm.imageUrl}
                    onChange={(event) =>
                      setItemForm((current) => ({ ...current, imageUrl: event.target.value }))
                    }
                    className="admin-input px-4 py-3"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">이미지 ALT</span>
                  <input
                    name="displayItemImageAlt"
                    value={itemForm.imageAlt}
                    onChange={(event) =>
                      setItemForm((current) => ({ ...current, imageAlt: event.target.value }))
                    }
                    className="admin-input px-4 py-3"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">링크</span>
                  <input
                    name="displayItemHref"
                    value={itemForm.href}
                    onChange={(event) =>
                      setItemForm((current) => ({ ...current, href: event.target.value }))
                    }
                    className="admin-input px-4 py-3"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">CTA 문구</span>
                  <input
                    name="displayItemCtaLabel"
                    value={itemForm.ctaLabel}
                    onChange={(event) =>
                      setItemForm((current) => ({ ...current, ctaLabel: event.target.value }))
                    }
                    className="admin-input px-4 py-3"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">강조 색상</span>
                  <input
                    name="displayItemAccentColor"
                    value={itemForm.accentColor}
                    onChange={(event) =>
                      setItemForm((current) => ({ ...current, accentColor: event.target.value }))
                    }
                    className="admin-input px-4 py-3"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">정렬 순서</span>
                  <input
                    name="displayItemDisplayOrder"
                    type="number"
                    min={0}
                    value={itemForm.displayOrder}
                    onChange={(event) =>
                      setItemForm((current) => ({
                        ...current,
                        displayOrder: Number(event.target.value),
                      }))
                    }
                    className="admin-input px-4 py-3"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">노출 시작 시각</span>
                  <input
                    name="displayItemStartsAt"
                    type="datetime-local"
                    value={itemForm.startsAt ? itemForm.startsAt.slice(0, 16) : ""}
                    onChange={(event) =>
                      setItemForm((current) => ({
                        ...current,
                        startsAt: event.target.value ? `${event.target.value}:00+09:00` : null,
                      }))
                    }
                    className="admin-input px-4 py-3"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">노출 종료 시각</span>
                  <input
                    name="displayItemEndsAt"
                    type="datetime-local"
                    value={itemForm.endsAt ? itemForm.endsAt.slice(0, 16) : ""}
                    onChange={(event) =>
                      setItemForm((current) => ({
                        ...current,
                        endsAt: event.target.value ? `${event.target.value}:00+09:00` : null,
                      }))
                    }
                    className="admin-input px-4 py-3"
                  />
                </label>
              </div>

              <div className="relative min-h-[180px] overflow-hidden rounded-[24px] border border-[var(--line)]">
                <Image
                  src={itemForm.imageUrl}
                  alt={itemForm.imageAlt || itemForm.title || "Display banner preview"}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>

              {itemMessage ? <p className="text-sm text-[var(--teal)]">{itemMessage}</p> : null}
              {itemError ? <p className="text-sm text-red-600">{itemError}</p> : null}

              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={isSavingItem} className="admin-button px-6 py-4 disabled:opacity-60">
                  {isSavingItem ? "저장 중입니다." : selectedItemId ? "배너 수정" : "배너 추가"}
                </button>
                {selectedItemId ? (
                  <button
                    type="button"
                    disabled={isDeletingItem}
                    onClick={() => {
                      startDeletingItem(() => {
                        void (async () => {
                          try {
                            await deleteDisplayItem(selectedItemId);
                            setSections((current) =>
                              current.map((section) =>
                                section.code === selectedSection.code
                                  ? {
                                      ...section,
                                      items: section.items.filter((item) => item.id !== selectedItemId),
                                    }
                                  : section,
                              ),
                            );
                            setSelectedItemId(null);
                            setItemForm(createEmptyItemForm(selectedSection.code));
                            setSectionForm(createSectionForm(selectedSection));
                            setItemMessage("배너를 삭제했습니다.");
                            setItemError("");
                          } catch (error) {
                            setItemError(getErrorMessage(error, "배너 삭제 중 문제가 발생했습니다."));
                          }
                        })();
                      });
                    }}
                    className="admin-button-secondary px-6 py-4 disabled:opacity-60"
                  >
                    {isDeletingItem ? "삭제 중입니다." : "배너 삭제"}
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </article>
  );
}
