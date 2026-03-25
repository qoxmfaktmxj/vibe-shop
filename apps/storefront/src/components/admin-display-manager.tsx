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
    ctaLabel: "View details",
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

export function AdminDisplayManager({ initialDisplay }: { initialDisplay: AdminDisplay }) {
  const [sections, setSections] = useState(initialDisplay.sections);
  const [selectedSectionCode, setSelectedSectionCode] = useState(initialDisplay.sections[0]?.code ?? "HERO");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(initialDisplay.sections[0]?.items[0]?.id ?? null);
  const [sectionMessage, setSectionMessage] = useState("");
  const [sectionError, setSectionError] = useState("");
  const [itemMessage, setItemMessage] = useState("");
  const [itemError, setItemError] = useState("");
  const [isSavingSection, startSavingSection] = useTransition();
  const [isSavingItem, startSavingItem] = useTransition();
  const [isDeletingItem, startDeletingItem] = useTransition();

  const selectedSection = sections.find((section) => section.code === selectedSectionCode) ?? sections[0] ?? null;
  const selectedItem = selectedSection?.items.find((item) => item.id === selectedItemId) ?? null;

  const [sectionForm, setSectionForm] = useState<UpdateAdminDisplaySectionPayload>(
    selectedSection ? createSectionForm(selectedSection) : { title: "", subtitle: "", displayOrder: 0, visible: true },
  );
  const [itemForm, setItemForm] = useState<DisplayItemPayload>(
    selectedItem && selectedSection ? createItemForm(selectedItem, selectedSection.code) : createEmptyItemForm(selectedSectionCode),
  );

  function replaceSection(nextSection: AdminDisplaySection) {
    setSections((current) => current.map((section) => (section.code === nextSection.code ? nextSection : section)));
  }

  function selectSection(sectionCode: string, sourceSections = sections) {
    const nextSection = sourceSections.find((section) => section.code === sectionCode) ?? sourceSections[0] ?? null;
    if (!nextSection) {
      return;
    }
    const nextItem = nextSection.items[0] ?? null;
    setSelectedSectionCode(nextSection.code);
    setSectionForm(createSectionForm(nextSection));
    setSelectedItemId(nextItem?.id ?? null);
    setItemForm(nextItem ? createItemForm(nextItem, nextSection.code) : createEmptyItemForm(nextSection.code));
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
          <h2 className="display mt-4 text-3xl font-semibold">Display Sections</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Tune section copy and banner items for the main storefront from one editor.
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
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">{section.code}</span>
              </div>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{section.subtitle}</p>
              <p className="mt-3 text-xs text-[var(--ink-soft)]">{section.items.length} items · {section.visible ? "visible" : "hidden"}</p>
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
                    setSectionMessage("Section saved.");
                  } catch (error) {
                    setSectionError(getErrorMessage(error, "Failed to save the section."));
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
                <input type="checkbox" checked={sectionForm.visible} onChange={(event) => setSectionForm((current) => ({ ...current, visible: event.target.checked }))} />
                Visible
              </label>
            </div>
            <label className="grid gap-2"><span className="text-sm font-medium">Section title</span><input name="displaySectionTitle" value={sectionForm.title} onChange={(event) => setSectionForm((current) => ({ ...current, title: event.target.value }))} className="admin-input px-4 py-3" /></label>
            <label className="grid gap-2"><span className="text-sm font-medium">Section subtitle</span><textarea name="displaySectionSubtitle" rows={3} value={sectionForm.subtitle} onChange={(event) => setSectionForm((current) => ({ ...current, subtitle: event.target.value }))} className="admin-input px-4 py-3" /></label>
            <label className="grid gap-2 sm:max-w-[220px]"><span className="text-sm font-medium">Display order</span><input name="displaySectionDisplayOrder" type="number" min={0} value={sectionForm.displayOrder} onChange={(event) => setSectionForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))} className="admin-input px-4 py-3" /></label>
            {sectionMessage ? <p className="text-sm text-[var(--teal)]">{sectionMessage}</p> : null}
            {sectionError ? <p className="text-sm text-red-600">{sectionError}</p> : null}
            <button type="submit" disabled={isSavingSection} className="admin-button px-6 py-4 disabled:opacity-60">{isSavingSection ? "Saving..." : "Save section"}</button>
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
                  New banner
                </button>
              </div>

              {selectedSection.items.length > 0 ? selectedSection.items.map((item) => (
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
                  <p className="mt-3 text-xs text-[var(--ink-soft)]">order {item.displayOrder} · {item.visible ? "visible" : "hidden"}</p>
                </button>
              )) : <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/60 px-5 py-6 text-sm text-[var(--ink-soft)]">No banner items in this section yet.</div>}
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
                      const nextItem = selectedItemId ? await updateDisplayItem(selectedItemId, itemForm) : await createDisplayItem(itemForm);
                      const nextSections = sections.map((section) => {
                        if (section.code !== itemForm.sectionCode) {
                          return selectedItemId && selectedSection.code === section.code
                            ? { ...section, items: section.items.filter((item) => item.id !== selectedItemId) }
                            : section;
                        }
                        const nextItems = selectedItemId
                          ? section.items.some((item) => item.id === nextItem.id)
                            ? section.items.map((item) => (item.id === nextItem.id ? nextItem : item))
                            : [...section.items, nextItem]
                          : [...section.items, nextItem];
                        return { ...section, items: sortItems(nextItems) };
                      });
                      setSections(nextSections);
                      selectSection(itemForm.sectionCode, nextSections);
                      setSelectedItemId(nextItem.id);
                      setItemForm(createItemForm(nextItem, itemForm.sectionCode));
                      setItemMessage(selectedItemId ? "Banner updated." : "Banner created.");
                    } catch (error) {
                      setItemError(getErrorMessage(error, "Failed to save the banner."));
                    }
                  })();
                });
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow text-[var(--ink-soft)]">Banner Editor</p>
                  <h3 className="mt-2 text-xl font-semibold">{selectedItemId ? "Edit banner" : "New banner"}</h3>
                </div>
                <label className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                  <input type="checkbox" checked={itemForm.visible} onChange={(event) => setItemForm((current) => ({ ...current, visible: event.target.checked }))} />
                  Visible
                </label>
              </div>
              <label className="grid gap-2"><span className="text-sm font-medium">Section</span><select name="displayItemSectionCode" value={itemForm.sectionCode} onChange={(event) => setItemForm((current) => ({ ...current, sectionCode: event.target.value }))} className="admin-input px-4 py-3">{sections.map((section) => <option key={section.code} value={section.code}>{section.code}</option>)}</select></label>
              <label className="grid gap-2"><span className="text-sm font-medium">Banner title</span><input name="displayItemTitle" value={itemForm.title} onChange={(event) => setItemForm((current) => ({ ...current, title: event.target.value }))} className="admin-input px-4 py-3" /></label>
              <label className="grid gap-2"><span className="text-sm font-medium">Banner subtitle</span><textarea name="displayItemSubtitle" rows={4} value={itemForm.subtitle} onChange={(event) => setItemForm((current) => ({ ...current, subtitle: event.target.value }))} className="admin-input px-4 py-3" /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2"><span className="text-sm font-medium">Image URL</span><input name="displayItemImageUrl" value={itemForm.imageUrl} onChange={(event) => setItemForm((current) => ({ ...current, imageUrl: event.target.value }))} className="admin-input px-4 py-3" /></label>
                <label className="grid gap-2"><span className="text-sm font-medium">Image alt</span><input name="displayItemImageAlt" value={itemForm.imageAlt} onChange={(event) => setItemForm((current) => ({ ...current, imageAlt: event.target.value }))} className="admin-input px-4 py-3" /></label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2"><span className="text-sm font-medium">Link</span><input name="displayItemHref" value={itemForm.href} onChange={(event) => setItemForm((current) => ({ ...current, href: event.target.value }))} className="admin-input px-4 py-3" /></label>
                <label className="grid gap-2"><span className="text-sm font-medium">CTA label</span><input name="displayItemCtaLabel" value={itemForm.ctaLabel} onChange={(event) => setItemForm((current) => ({ ...current, ctaLabel: event.target.value }))} className="admin-input px-4 py-3" /></label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2"><span className="text-sm font-medium">Accent color</span><input name="displayItemAccentColor" value={itemForm.accentColor} onChange={(event) => setItemForm((current) => ({ ...current, accentColor: event.target.value }))} className="admin-input px-4 py-3" /></label>
                <label className="grid gap-2"><span className="text-sm font-medium">Display order</span><input name="displayItemDisplayOrder" type="number" min={0} value={itemForm.displayOrder} onChange={(event) => setItemForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))} className="admin-input px-4 py-3" /></label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2"><span className="text-sm font-medium">Start time</span><input name="displayItemStartsAt" type="datetime-local" value={itemForm.startsAt ? itemForm.startsAt.slice(0, 16) : ""} onChange={(event) => setItemForm((current) => ({ ...current, startsAt: event.target.value ? `${event.target.value}:00+09:00` : null }))} className="admin-input px-4 py-3" /></label>
                <label className="grid gap-2"><span className="text-sm font-medium">End time</span><input name="displayItemEndsAt" type="datetime-local" value={itemForm.endsAt ? itemForm.endsAt.slice(0, 16) : ""} onChange={(event) => setItemForm((current) => ({ ...current, endsAt: event.target.value ? `${event.target.value}:00+09:00` : null }))} className="admin-input px-4 py-3" /></label>
              </div>
              <div className="relative min-h-[220px] overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface-low)]">
                <Image src={itemForm.imageUrl} alt={itemForm.imageAlt || itemForm.title || "Display banner preview"} fill sizes="100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(11,14,22,0.64)] to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-6 text-white">
                  <p className="eyebrow text-white/70">{itemForm.sectionCode}</p>
                  <p className="mt-3 text-2xl font-semibold">{itemForm.title || "Banner preview"}</p>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/76">{itemForm.subtitle || "Add banner supporting copy here."}</p>
                </div>
              </div>
              {itemMessage ? <p className="text-sm text-[var(--teal)]">{itemMessage}</p> : null}
              {itemError ? <p className="text-sm text-red-600">{itemError}</p> : null}
              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={isSavingItem} className="admin-button px-6 py-4 disabled:opacity-60">{isSavingItem ? "Saving..." : selectedItemId ? "Update banner" : "Create banner"}</button>
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
                                  ? { ...section, items: section.items.filter((item) => item.id !== selectedItemId) }
                                  : section,
                              ),
                            );
                            setSelectedItemId(null);
                            setItemForm(createEmptyItemForm(selectedSection.code));
                            setSectionForm(createSectionForm(selectedSection));
                            setItemMessage("Banner deleted.");
                            setItemError("");
                          } catch (error) {
                            setItemError(getErrorMessage(error, "Failed to delete the banner."));
                          }
                        })();
                      });
                    }}
                    className="admin-button-secondary px-6 py-4 disabled:opacity-60"
                  >
                    {isDeletingItem ? "Deleting..." : "Delete banner"}
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
