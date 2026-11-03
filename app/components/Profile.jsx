"use client";

import { useEffect, useRef, useState } from "react";

// Profile pieces for the website: prompt cards woven into the existing card
// sections, and the Watch section. Copy lives in data/site-content.json;
// anything still "[Ed to write: …]" is hidden on the live site.

const isDraft = (value) => typeof value === "string" && value.trim().startsWith("[Ed to write");
// Drafts show (dashed) on the local preview so Ed can see where his words go,
// and never on the live site.
const SHOW_DRAFTS = process.env.NODE_ENV === "development";
const isFilled = (value) => typeof value === "string" && Boolean(value.trim()) && (SHOW_DRAFTS || !isDraft(value));

function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), options);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

// A card in Marius's CTA-row style with an optional dating-profile prompt
// above the title ("Currently obsessed with…") and its own photo pair.
export function ProfileCard({ item, images, PhotoStack }) {
  if (!hasCards([item])) return null;
  const draft = isDraft(item.title) || isDraft(item.description);
  return (
    <article className={`cta-row giving-card reveal${draft ? " is-draft" : ""}`}>
      <div className="cta-copy">
        {item.prompt ? <p className="profile-card-prompt">{item.prompt}</p> : null}
        <h3>{item.title}</h3>
        {isFilled(item.description) ? <p>{item.description}</p> : null}
        {item.href ? (
          <a className="event-cta" href={item.href} target="_blank" rel="noopener noreferrer">{item.linkLabel || "Find out more"}</a>
        ) : null}
      </div>
      <PhotoStack images={images} />
    </article>
  );
}

// True when at least one card would show (drafts only count on the local preview).
export function hasCards(items = []) {
  return items.some((item) => isFilled(item?.title));
}

const youTubeId = (value) => {
  if (!value) return "";
  const match = String(value).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return match ? match[1] : /^[\w-]{11}$/.test(value) ? value : "";
};

export function ProfileWatch({ videos = [], channelUrl }) {
  const list = videos.map((video) => ({ ...video, id: youTubeId(video.url || video.id) })).filter((video) => video.id);
  const [active, setActive] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [stageRef, stageInView] = useInView({ threshold: 0.35 });
  const floating = Boolean(active) && !stageInView && !dismissed;

  const play = (video) => {
    setActive(video);
    setDismissed(false);
  };

  return (
    <section className="profile-section" id="watch" aria-labelledby="watch-title">
      <div className="section-title reveal">
        <h2 id="watch-title">Watch</h2>
      </div>
      {list.length ? (
        <>
          <div className="profile-watch-stage reveal" ref={stageRef}>
            {active ? (
              <div className={`profile-player${floating ? " is-floating" : ""}`}>
                {floating ? (
                  <div className="profile-player-bar">
                    <span>{active.title}</span>
                    <button type="button" onClick={() => document.getElementById("watch")?.scrollIntoView({ behavior: "smooth" })}>Back</button>
                    <button type="button" aria-label="Close video" onClick={() => { setDismissed(true); setActive(null); }}>✕</button>
                  </div>
                ) : null}
                <div className="profile-player-frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${active.id}?autoplay=1&rel=0`}
                    title={active.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <button className="profile-watch-hero" type="button" onClick={() => play(list[0])}>
                <img src={`https://i.ytimg.com/vi/${list[0].id}/maxresdefault.jpg`} alt="" />
                <span className="profile-watch-play" aria-hidden="true">▶</span>
                <span className="profile-watch-caption">{list[0].title}</span>
              </button>
            )}
          </div>
          {list.length > 1 ? (
            <div className="profile-watch-grid">
              {list.map((video) => (
                <button
                  className={`profile-watch-card reveal${active?.id === video.id ? " is-active" : ""}`}
                  type="button"
                  key={video.id}
                  onClick={() => play(video)}
                >
                  <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" />
                  <span>{video.title}</span>
                </button>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
      {channelUrl ? (
        <p className="profile-watch-channel reveal">
          <a className="event-cta" href={channelUrl} target="_blank" rel="noopener noreferrer">Watch more on YouTube</a>
        </p>
      ) : null}
    </section>
  );
}
