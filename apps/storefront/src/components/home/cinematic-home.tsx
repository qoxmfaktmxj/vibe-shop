"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";

import type { Category, HomeDisplayItem } from "@/lib/contracts";

const MOTION_QUERY = "(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)";

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useCinematicMotion() {
  return useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );
}

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={diagonal ? "cinema-arrow cinema-arrow-diagonal" : "cinema-arrow"}>
      <path d="M4 12h15M13 5l7 7-7 7" />
    </svg>
  );
}

export function CinematicHero({ imageUrl, imageAlt, title, subtitle, href, ctaLabel, price, exploreCollections, exploreCurated }: {
  imageUrl: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  price?: string;
  exploreCollections: boolean;
  exploreCurated: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const canAnimate = useCinematicMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.18]);
  const wordmarkX = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const rotateX = useSpring(0, { stiffness: 90, damping: 25 });
  const rotateY = useSpring(0, { stiffness: 90, damping: 25 });

  function moveImage(event: PointerEvent<HTMLDivElement>) {
    if (!canAnimate || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    rotateX.set((0.5 - (event.clientY - bounds.top) / bounds.height) * 2);
    rotateY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
  }

  return (
    <section ref={ref} className="cinema-hero" aria-labelledby="home-title">
      <div className="cinema-hero-intro">
        <h1 id="home-title" className="display-heading">{title}</h1>
        <div className="cinema-hero-copy">
          <p>{subtitle}</p>
          <div className="cinema-hero-actions">
            <Link href={href} className="cinema-text-link">{ctaLabel}<Arrow diagonal /></Link>
            {exploreCurated ? <a href="#home-curated" className="cinema-shortcut">이번 계절의 상품 바로 보기</a> : null}
          </div>
        </div>
      </div>
      <div className="cinema-hero-stage" onPointerMove={moveImage} onPointerLeave={() => { rotateX.set(0); rotateY.set(0); }}>
        <motion.div className="cinema-hero-image" style={canAnimate ? { y: imageY, scale: imageScale, rotateX, rotateY, transformPerspective: 1400 } : undefined}>
          <Image src={imageUrl} alt={imageAlt} fill sizes="(min-width: 1380px) 800px, (min-width: 1024px) 60vw, 100vw" priority className="object-cover" />
        </motion.div>
        <div className="cinema-hero-shade" />
        <motion.div className="cinema-wordmark" aria-hidden="true" style={canAnimate ? { x: wordmarkX } : undefined}>MARU</motion.div>
        {exploreCollections ? <a href="#home-collections" className="cinema-explore" aria-label="아래 컬렉션 둘러보기"><Arrow /><span>아래로 탐색</span></a> : null}
      </div>
      <div className="cinema-hero-caption"><span>좋은 소재, 편안한 디자인</span>{price ? <span>{price}원</span> : null}</div>
    </section>
  );
}

function CollectionScene({ category, index, count }: {
  category: Category;
  index: number;
  count: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const canAnimate = useCinematicMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [20 + index * 4, -20 - index * 4]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  return (
    <article ref={ref} className="cinema-collection-scene">
      <div className="cinema-collection-media">
        <motion.div className="cinema-collection-photo" style={canAnimate ? { y, scale } : undefined}>
          <Image src={category.coverImageUrl} alt={category.coverImageAlt} fill sizes="(min-width: 1380px) 480px, (min-width: 1024px) 36vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
        </motion.div>
      </div>
      <div className="cinema-collection-copy">
        <span className="cinema-scene-position" aria-label={`${count}개 공간 중 ${index + 1}번째`}>{String(index + 1).padStart(2, "0")}<span> / {String(count).padStart(2, "0")}</span></span>
        <h3 className="display-heading">{category.heroTitle || category.name}</h3>
        <p>{category.heroSubtitle || category.description}</p>
        <Link href={`/category/${category.slug}`} className="cinema-text-link">{category.name} 둘러보기<Arrow diagonal /></Link>
      </div>
    </article>
  );
}

export function CinematicCollections({ categories, title, subtitle }: { categories: Category[]; title: string; subtitle: string }) {
  return (
    <section id="home-collections" className="cinema-collections" aria-labelledby="collections-title">
      <div className="cinema-section-heading">
        <h2 id="collections-title" className="display-heading">{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="cinema-collection-scenes">
        {categories.map((category, index) => <CollectionScene key={category.id} category={category} index={index} count={categories.length} />)}
      </div>
    </section>
  );
}

export function CinematicStory({ story }: { story: HomeDisplayItem }) {
  const ref = useRef<HTMLElement>(null);
  const canAnimate = useCinematicMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={ref} className="cinema-material" aria-labelledby="material-title">
      <div className="cinema-material-image">
        <motion.div className="cinema-material-photo" style={canAnimate ? { scale, y } : undefined}>
          <Image src={story.imageUrl} alt={story.imageAlt} fill sizes="(min-width: 1024px) 65vw, 100vw" className="object-cover" />
        </motion.div>
      </div>
      <div className="cinema-material-copy">
        <h2 id="material-title" className="display-heading">{story.title}</h2>
        <p>{story.subtitle}</p>
        <Link href={story.href} className="cinema-text-link">{story.ctaLabel}<Arrow diagonal /></Link>
      </div>
    </section>
  );
}

export function ProductEntrance({ children, index }: { children: ReactNode; index: number }) {
  const canAnimate = useCinematicMotion();
  return <motion.div className="cinema-product" initial={false} whileInView={canAnimate ? { y: [32, 0] } : { y: 0 }} transition={{ duration: 0.7, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true, amount: 0.12 }}>{children}</motion.div>;
}
