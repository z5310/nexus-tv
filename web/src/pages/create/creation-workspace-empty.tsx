// 创作页空态：横幅、推荐提示词与精选作品。

import { useAppearanceStore } from "@/stores/use-appearance-store";
import type { CreationMode } from "./creation-assets";
import { ArrowUp, ChevronDown, Bookmark } from "lucide-react";
import { useState } from "react";
import { curatedInspirations, inspirationSourceOf, inspirationSources } from "@/lib/inspirations/catalog";
import { modeLabels } from "./creation-types";
import { Button } from "antd";

export const creationEmptyBannerFrames = [
    { src: "/short-drama-styles/cyberpunk-neon.jpg", caption: "镜头01 · 雨夜霓虹" },
    { src: "/short-drama-styles/suspense-noir.jpg", caption: "镜头02 · 暗巷追逐" },
    { src: "/short-drama-styles/retro-hong-kong.jpg", caption: "镜头03 · 天台重逢" },
];

export function CreationEmptyBanner() {
    const brandName = useAppearanceStore((state) => state.appearance.brandName);
    return (
        <div className="creation-empty-art" aria-hidden="true">
            {creationEmptyBannerFrames.map((frame, index) => (
                <figure key={frame.caption} className={`creation-empty-art-frame ${index === 1 ? "is-main" : index === 0 ? "is-back" : "is-front"}`}>
                    <img src={frame.src} alt="" />
                    <span>{frame.caption}</span>
                </figure>
            ))}
            <span className="creation-empty-art-caption">
                <span>{brandName}</span>把每一帧，交给镜头导演
            </span>
        </div>
    );
}


export function CreationFeaturedWorks({ onStartPrompt }: { onStartPrompt: (mode: CreationMode, prompt: string) => void }) {
    const [filter, setFilter] = useState<"all" | CreationMode>("all");
    const [limit, setLimit] = useState(12);
    const filtered = curatedInspirations.filter((item) => filter === "all" || item.mode === filter);
    // 只列出真正用到的外部来源；原创条目不写来源声明。
    const declaredSources = Array.from(new Set(curatedInspirations.map((item) => item.sourceId ?? "original")))
        .map((id) => inspirationSources[id])
        .filter((source) => source.notice);
    return (
        <section className="creation-featured-works" aria-labelledby="creation-featured-title">
            <div className="creation-featured-heading">
                <div>
                    <h2 id="creation-featured-title">精选灵感</h2>
                </div>
                <p>{curatedInspirations.length} 个创意起点 · 点击填入提示词，不自动生成</p>
            </div>
            <div className="creation-inspiration-filters" role="group" aria-label="灵感类型">
                {(["all", "video", "image", "text"] as const).map((value) => (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={filter === value}
                        onClick={() => {
                            setFilter(value);
                            setLimit(12);
                        }}
                    >
                        {value === "all" ? "全部灵感" : modeLabels[value]}
                        <span>{curatedInspirations.filter((item) => value === "all" || item.mode === value).length}</span>
                    </button>
                ))}
            </div>
            <div className="creation-featured-layout">
                {filtered.slice(0, limit).map((item, index) => (
                    <button key={item.title} type="button" className={`product-collection-card creation-featured-card ${index === 0 ? "is-featured-hero" : ""}`} onClick={() => onStartPrompt(item.mode, item.prompt)}>
                        <span className="creation-featured-media">
                            <img src={item.image} alt="" loading="lazy" />
                            <span className="creation-inspiration-overlay">
                                <ArrowUp />
                                使用这个创意
                            </span>
                        </span>
                        <span className="creation-featured-copy">
                            <strong>{item.title}</strong>
                            <span>{item.description}</span>
                            <em>
                                <Bookmark />
                                {inspirationSourceOf(item).label} · {modeLabels[item.mode]}
                            </em>
                        </span>
                    </button>
                ))}
            </div>
            <footer className="creation-inspiration-footer">
                {limit < filtered.length ? (
                    <Button onClick={() => setLimit((count) => count + 12)}>
                        展开更多灵感
                        <ChevronDown />
                    </Button>
                ) : (
                    <span>已展示全部 {filtered.length} 个创意</span>
                )}
                <details>
                    <summary>模板与封面来源</summary>
                    {declaredSources.map((source) => (
                        <div key={source.name ?? source.label}>
                            <p>{source.notice}</p>
                            {source.repository ? (
                                <a href={source.repository} target="_blank" rel="noreferrer">
                                    {source.name} · {source.license}
                                </a>
                            ) : null}
                        </div>
                    ))}
                </details>
            </footer>
        </section>
    );
}
