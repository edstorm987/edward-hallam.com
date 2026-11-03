"use client";

import { useEffect, useRef, useState } from "react";
import siteContent from "../../data/site-content.json";
import { ProfileCard, ProfileWatch, hasCards } from "../components/Profile";

const {
  about,
  assets,
  companies,
  earlyLife,
  education,
  eventExperience,
  fashion,
  featuredEvents,
  forms = {},
  formQuestions,
  giving,
  mentors,
  popups = {},
  profile = {},
  seo,
  sections = {},
  socialLinks,
} = siteContent;

const AQUA_ORIGIN = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:3032"
  : "https://www.aqua-crm.co.uk";

function newSubmissionId() {
  const random = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "") : `${Date.now()}${Math.random().toString(36).slice(2)}`;
  return `aqua_sub_${random}`;
}

// Enquiries go to AquaCRM, the same endpoint the link-tree page uses.
async function sendToAqua(form, payload) {
  const captchaToken = form?.querySelector('input[name="captchaToken"]')?.value || undefined;
  const response = await fetch(`${AQUA_ORIGIN}/api/public/brand-enquiry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      brand: "edward-hallam",
      consent: true,
      sourceUrl: window.location.href,
      submissionId: newSubmissionId(),
      captchaToken,
    }),
  });
  if (!response.ok) throw new Error("Enquiry failed");
  if (window.AquaBotChallenge?.reset && form) window.AquaBotChallenge.reset(form);
}

const defaultContactCopy = {
  emailError: "Please enter a valid email address.",
  enterHint: "press Enter ↵",
  nextButton: "OK",
  requiredError: "Please answer this question before continuing.",
  sendAnotherButton: "Send another message",
  source: "Main contact form",
  startBody: "Let us know how we can work together.",
  startButton: "Start",
  startTitle: "Want to send me a message?",
  submitButton: "Submit",
  thankYouEyebrow: "Thank you",
  thankYouTitle: "I will contact you back as soon as possible.",
};

const defaultPopupCopy = {
  gift: {
    body: "Leave your email and I will send you something useful for business, growth, and upcoming opportunities.",
    button: "Claim gift",
    emailLabel: "Email address",
    emailPlaceholder: "name@example.com",
    eyebrow: "A gift for you",
    source: "Gift popup",
    success: "Thank you. We will be in touch soon :)",
    title: "Receive the gift",
  },
  upcomingEvents: {
    body: "Be first to hear more about Business Mastery, future dates, and early access opportunities.",
    button: "Join list",
    emailLabel: "Email address",
    emailPlaceholder: "name@example.com",
    eyebrow: "Get notified",
    source: "Company waiting list popup",
    success: "Thank you. We will be in touch soon :)",
    title: "Join the mailing list",
  },
};

function renderText(text) {
  return String(text)
    .split("\n\n")
    .flatMap((paragraph, index) => (index === 0 ? [paragraph] : [<br key={`br-${index}-a`} />, <br key={`br-${index}-b`} />, paragraph]));
}

function buildFormValues(questions) {
  return questions.reduce((values, question) => {
    values[question.field] = "";
    return values;
  }, {});
}

function SocialIcon({ icon }) {
  if (icon === "youtube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.58 7.18a2.72 2.72 0 0 0-1.9-1.92C18 4.8 12 4.8 12 4.8s-6 0-7.68.46a2.72 2.72 0 0 0-1.9 1.92A28.36 28.36 0 0 0 2 12a28.36 28.36 0 0 0 .42 4.82 2.72 2.72 0 0 0 1.9 1.92c1.68.46 7.68.46 7.68.46s6 0 7.68-.46a2.72 2.72 0 0 0 1.9-1.92A28.36 28.36 0 0 0 22 12a28.36 28.36 0 0 0-.42-4.82ZM10 15.2V8.8l5.3 3.2L10 15.2Z" />
      </svg>
    );
  }

  if (icon === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.7 2h8.6A5.71 5.71 0 0 1 22 7.7v8.6a5.71 5.71 0 0 1-5.7 5.7H7.7A5.71 5.71 0 0 1 2 16.3V7.7A5.71 5.71 0 0 1 7.7 2Zm0 2A3.71 3.71 0 0 0 4 7.7v8.6A3.71 3.71 0 0 0 7.7 20h8.6a3.71 3.71 0 0 0 3.7-3.7V7.7A3.71 3.71 0 0 0 16.3 4H7.7Zm8.8 2.2a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v10.74H3V9.75Zm6.25 0h3.84v1.47h.05c.54-.94 1.84-1.72 3.56-1.72 3.81 0 4.3 2.48 4.3 5.72v5.27h-4v-4.66c0-1.12-.02-2.55-1.58-2.55-1.58 0-1.82 1.2-1.82 2.47v4.74h-4V9.75Z" />
    </svg>
  );
}

function DoublePhotoCard({ id, eyebrow, title, children, images, reverse = false }) {
  return (
    <article className={`story-card${reverse ? " reverse" : ""} reveal`} id={id}>
      <div className="story-copy">
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        <p>{children}</p>
      </div>
      <div className={`stacked-media${reverse ? " alt" : ""}`}>
        <img className="stack-one" src={images[0].src} alt={images[0].alt} />
        <img className="stack-two" src={images[1].src} alt={images[1].alt} />
      </div>
    </article>
  );
}

function PhotoStack({ images }) {
  const stackImages = images?.length >= 2 ? images : about.images;

  return (
    <div className="photo-stack">
      <div className="photo-card one">
        <img src={stackImages[0].src} alt={stackImages[0].alt || ""} />
      </div>
      <div className="photo-card two">
        <img src={stackImages[1].src} alt={stackImages[1].alt || ""} />
      </div>
    </div>
  );
}

export default function Home() {
  const contactCopy = { ...defaultContactCopy, ...(forms.contact || {}) };
  const [formStep, setFormStep] = useState(0);
  const [formComplete, setFormComplete] = useState(false);
  const [formExpanded, setFormExpanded] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const [formStatus, setFormStatus] = useState("");
  const [formValues, setFormValues] = useState(() => buildFormValues(formQuestions));
  const [mailingEmail, setMailingEmail] = useState("");
  const [mailingConsent, setMailingConsent] = useState(false);
  const [mailingSubject, setMailingSubject] = useState("");
  const contactFormRef = useRef(null);
  const [mailingKind, setMailingKind] = useState("events");
  const [mailingOpen, setMailingOpen] = useState(false);
  const [mailingStatus, setMailingStatus] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const eventSwipeStartRef = useRef(null);
  const eventSwipeConsumedRef = useRef(false);
  const eventHoverTimerRef = useRef(null);
  const eventHoverLockedRef = useRef(false);
  const giftLeftAtRef = useRef(0);
  const giftShownRef = useRef(false);

  useEffect(() => () => {
    if (eventHoverTimerRef.current !== null) {
      window.clearTimeout(eventHoverTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const activeTitle = seo.title;
    const awayTitle = seo.awayTitle;
    giftShownRef.current = sessionStorage.getItem("edGiftShown") === "true";

    const updateTitle = () => {
      document.title = document.hidden ? awayTitle : activeTitle;
    };

    const onVisibilityChange = () => {
      updateTitle();

      if (document.hidden) {
        giftLeftAtRef.current = Date.now();
        return;
      }

      const wasAwayLongEnough = giftLeftAtRef.current && Date.now() - giftLeftAtRef.current > 1400;
      if (wasAwayLongEnough && !giftShownRef.current && popups.gift?.enabled !== false) {
        giftShownRef.current = true;
        sessionStorage.setItem("edGiftShown", "true");
        setMailingKind("gift");
        setMailingStatus("");
        setMailingOpen(true);
      }
    };

    updateTitle();
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", updateTitle);
    window.addEventListener("blur", updateTitle);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", updateTitle);
      window.removeEventListener("blur", updateTitle);
      document.title = activeTitle;
    };
  }, []);

  useEffect(() => {
    const nav = document.getElementById("nav");
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let contactCompleted = false;
    const settleContactScene = (contact) => {
      contactCompleted = true;
      contact.classList.add("contact-complete");
      contact.style.setProperty("--contact-width", "var(--contact-small-width)");
      contact.style.setProperty("--contact-height", "var(--contact-small-height)");
      contact.style.setProperty("--contact-radius", "var(--contact-small-radius)");
      contact.style.setProperty("--contact-top", "calc((100svh - var(--contact-small-height)) / 2)");
      contact.style.setProperty("--contact-form-opacity", "1");
      contact.style.setProperty("--contact-form-y", "0px");
    };
    const updateContactScene = () => {
      const contact = document.getElementById("contact");
      const stage = contact?.querySelector(".contact-stage");
      if (!contact) return;
      if (contactCompleted || contact.classList.contains("contact-complete")) {
        settleContactScene(contact);
        return;
      }

      const isMobile = window.innerWidth <= 620;
      const isTablet = window.innerWidth <= 980;
      const isLandscape = window.innerWidth <= 820 && window.innerHeight < window.innerWidth;
      const smallWidth = isMobile ? 84 : isLandscape ? 72 : isTablet ? 68 : 58;
      const smallHeight = isMobile ? 58 : isLandscape ? 58 : 46;
      const smallRadius = isMobile ? 8 : 10;
      const stageStart = stage
        ? contact.offsetTop + stage.offsetTop - window.innerHeight * 0.08
        : contact.offsetTop;
      const stageLength = stage ? Math.max(stage.offsetHeight - window.innerHeight, 1) : window.innerHeight * 2.8;
      const progress = clamp((window.scrollY - stageStart) / stageLength, 0, 1);
      if (progress >= 0.995) {
        settleContactScene(contact);
        return;
      }
      const expand = easeInOutCubic(clamp(progress / 0.28, 0, 1));
      const shrink = easeInOutCubic(clamp((progress - 0.58) / 0.42, 0, 1));
      const formIn = easeInOutCubic(clamp((progress - 0.38) / 0.12, 0, 1));
      const formOut = easeInOutCubic(clamp((progress - 0.62) / 0.38, 0, 1));
      const formOpacity = Math.max(0, Math.min(1, formIn * (1 - formOut)));
      const fullWidth = smallWidth + (100 - smallWidth) * expand;
      const fullHeight = smallHeight + (100 - smallHeight) * expand;
      const fullRadius = smallRadius * (1 - expand);
      const width = fullWidth - (fullWidth - smallWidth) * shrink;
      const height = fullHeight - (fullHeight - smallHeight) * shrink;
      const radius = fullRadius + (smallRadius - fullRadius) * shrink;

      contact.style.setProperty("--contact-width", `${width.toFixed(3)}vw`);
      contact.style.setProperty("--contact-height", `${height.toFixed(3)}svh`);
      contact.style.setProperty("--contact-radius", `${radius.toFixed(3)}px`);
      contact.style.setProperty("--contact-top", `calc((100svh - ${height.toFixed(3)}svh) / 2)`);
      contact.style.setProperty("--contact-form-opacity", formOpacity.toFixed(3));
      contact.style.setProperty("--contact-form-y", `${((1 - formOpacity) * 22).toFixed(3)}px`);
    };
    window.__updateContactScene = updateContactScene;

    let scrollFrame;
    let slowedWheelFrame;
    let pendingWheelDelta = 0;

    const onScroll = () => {
      const hero = document.querySelector(".hero-section");
      const heroSwitchPoint = hero ? hero.offsetTop + hero.offsetHeight - 80 : window.innerHeight - 80;
      nav?.classList.toggle("scrolled", window.scrollY > 40);
      document.documentElement.classList.toggle("hero-scroll", window.scrollY < heroSwitchPoint);
      document.documentElement.style.setProperty("--scroll-y", `${window.scrollY}px`);
      updateContactScene();
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("wheel", updateContactScene, { passive: true });
    window.addEventListener("touchmove", updateContactScene, { passive: true });

    let contactSceneFrame;
    const tickContactScene = () => {
      updateContactScene();
      contactSceneFrame = requestAnimationFrame(tickContactScene);
    };
    contactSceneFrame = requestAnimationFrame(tickContactScene);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("visible", entry.isIntersecting);
        });
      },
      { rootMargin: "-8% 0px -8% 0px", threshold: [0, 0.14, 0.32] }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
    const isNativeScrollArea = (target) => {
      if (!(target instanceof Element)) return false;

      const nativeTarget = target.closest(
        "input, textarea, select, .event-card-row, .typeform-wrapper, .mailing-modal, .mailing-card"
      );

      if (nativeTarget) return true;

      const scrollable = target.closest("[data-native-scroll]");
      return Boolean(scrollable);
    };
    const getAnchorTargetY = (target, hash) => {
      const rawTop = target.getBoundingClientRect().top + window.scrollY;
      const sectionOffset = Math.min(48, window.innerHeight * 0.06);

      if (hash === "#upcoming-events") return Math.max(0, rawTop);
      if (hash === "#contact") return Math.max(0, rawTop + Math.min(24, window.innerHeight * 0.03));
      return Math.max(0, rawTop - sectionOffset);
    };

    const smoothScrollTo = (targetY) => {
      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = Math.min(1550, Math.max(620, Math.abs(distance) * 0.72));
      const startTime = performance.now();

      if (scrollFrame) cancelAnimationFrame(scrollFrame);

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const weightedProgress = progress < 0.82
          ? easeInOutCubic(progress / 0.82) * 0.94
          : 0.94 + easeOutQuint((progress - 0.82) / 0.18) * 0.06;
        window.scrollTo(0, startY + distance * weightedProgress);

        if (progress < 1) {
          scrollFrame = requestAnimationFrame(tick);
        } else {
          window.scrollTo(0, targetY);
          updateContactScene();
        }
      };

      scrollFrame = requestAnimationFrame(tick);
    };

    const onSlowedWheel = (event) => {
      if (event.ctrlKey || event.metaKey || event.defaultPrevented || isNativeScrollArea(event.target)) return;
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

      event.preventDefault();
      if (scrollFrame) cancelAnimationFrame(scrollFrame);

      const deltaUnit = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? window.innerHeight : 1;
      pendingWheelDelta += event.deltaY * deltaUnit * 0.56;

      if (slowedWheelFrame) return;

      slowedWheelFrame = requestAnimationFrame(() => {
        window.scrollBy({ top: pendingWheelDelta, left: 0, behavior: "auto" });
        pendingWheelDelta = 0;
        slowedWheelFrame = undefined;
        updateContactScene();
      });
    };

    const onAnchorClick = (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      setMenuOpen(false);
      smoothScrollTo(getAnchorTargetY(target, hash));
      window.history.pushState(null, "", hash);
    };

    document.addEventListener("click", onAnchorClick);
    window.addEventListener("wheel", onSlowedWheel, { passive: false });

    return () => {
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      if (contactSceneFrame) cancelAnimationFrame(contactSceneFrame);
      if (slowedWheelFrame) cancelAnimationFrame(slowedWheelFrame);
      document.removeEventListener("click", onAnchorClick);
      window.removeEventListener("wheel", onSlowedWheel);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("wheel", updateContactScene);
      window.removeEventListener("touchmove", updateContactScene);
      delete window.__updateContactScene;
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!formStarted || formComplete) return;
    document.querySelector(`[name="${formQuestions[formStep].field}"]`)?.focus({ preventScroll: true });
  }, [formStep, formStarted, formComplete]);

  useEffect(() => {
    if (!formExpanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [formExpanded]);

  useEffect(() => {
    if (!mailingOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMailingOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    setTimeout(() => document.querySelector('[name="mailing-email"]')?.focus({ preventScroll: true }), 60);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mailingOpen]);

  const activeQuestion = formQuestions[formStep];
  const isLastQuestion = formStep === formQuestions.length - 1;
  const eventCount = featuredEvents.length;

  const cancelEventHover = () => {
    if (eventHoverTimerRef.current !== null) {
      window.clearTimeout(eventHoverTimerRef.current);
      eventHoverTimerRef.current = null;
    }
  };

  const scheduleEventHover = (index) => {
    if (eventHoverLockedRef.current) return;
    cancelEventHover();
    eventHoverTimerRef.current = window.setTimeout(() => {
      eventHoverTimerRef.current = null;
      eventHoverLockedRef.current = true;
      setActiveEventIndex(index);
    }, 620);
  };

  const selectAdjacentEvent = (direction) => {
    if (eventCount < 2) return;
    cancelEventHover();
    setActiveEventIndex((current) => (current + direction + eventCount) % eventCount);
  };

  const openMailingPopup = (eventItem) => {
    if (eventItem?.ctaAction === "external" && eventItem.href) {
      if (eventItem.newTab) {
        window.open(eventItem.href, "_blank", "noopener,noreferrer");
        return;
      }

      window.location.href = eventItem.href;
      return;
    }

    setMailingSubject(eventItem?.name || "");
    setMailingKind("events");
    setMailingOpen(true);
    setMailingStatus("");
  };


  const submitMailingList = (event) => {
    event.preventDefault();
    const email = mailingEmail.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMailingStatus("Please enter a valid email address.");
      return;
    }

    if (!mailingConsent) {
      setMailingStatus("Please tick the box so I can use your email for this.");
      return;
    }
    const form = event.currentTarget;
    const subject = mailingSubject || "Website waiting list";
    sendToAqua(form, {
      name: "Edward Hallam site visitor",
      email,
      contactMethod: "email",
      services: [subject],
      message: `Waiting list request: ${subject}`,
      campaign: mailingCopy.source,
    })
      .then(() => {
        setMailingStatus(mailingCopy.success || "Thank you. We will be in touch soon :)");
        setMailingEmail("");
        setMailingConsent(false);
      })
      .catch(() => setMailingStatus(contactCopy.failure || "Sorry, that didn't send."));
  };

  const advanceForm = () => {
    if (!formStarted) {
      setFormComplete(false);
      setFormExpanded(true);
      setFormStarted(true);
      setFormStatus("");
      setFormStep(0);
      return;
    }

    const answer = activeQuestion.type === "consent"
      ? (formValues[activeQuestion.field] ? "yes" : "")
      : String(formValues[activeQuestion.field] ?? "").trim();

    if (!answer) {
      setFormStatus(contactCopy.requiredError);
      return;
    }

    if ((activeQuestion.field === "email" || activeQuestion.type === "email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer)) {
      setFormStatus(contactCopy.emailError);
      return;
    }

    setFormStatus("");

    if (isLastQuestion) {
      sendToAqua(contactFormRef.current, {
        name: String(formValues.name || "").trim(),
        email: String(formValues.email || "").trim(),
        contactMethod: "email",
        services: ["Personal site enquiry"],
        message: String(formValues.message || "").trim(),
        campaign: contactCopy.source,
      })
        .then(() => {
          setFormComplete(true);
          setFormValues(buildFormValues(formQuestions));
          setFormStep(0);
        })
        .catch(() => setFormStatus(contactCopy.failure || "Sorry, that didn't send."));
      return;
    }

    setFormStep((step) => step + 1);
  };

  const resetContactForm = () => {
    setFormComplete(false);
    setFormExpanded(false);
    setFormStarted(false);
    setFormStatus("");
    setFormStep(0);
    setFormValues(buildFormValues(formQuestions));
  };

  const mailingCopy = mailingKind === "gift"
    ? { ...defaultPopupCopy.gift, ...(popups.gift || {}) }
    : { ...defaultPopupCopy.upcomingEvents, ...(popups.upcomingEvents || {}) };

  return (
    <>
      <nav id="nav" className={`site-nav ${menuOpen ? "menu-open" : ""}`}>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="nav-cluster nav-left">
          {(sections.nav || []).slice(0, 2).map(([href, label]) => <a href={href} key={href}>{label}</a>)}
        </div>
        <a className="nav-brand" href="#">
          {seo.name}
        </a>
        <div className="nav-cluster nav-right">
          {(sections.nav || []).slice(2).map(([href, label]) => <a href={href} key={href}>{label}</a>)}
        </div>
      </nav>

      <main>
        <section className="hero-section">
          <img className="hero-bg" src={assets.heroBackground} alt="" aria-hidden="true" />
          <div className="hero-gradient" />
          <h1 className="hero-title reveal eh-name" aria-label={seo.name}>
            <span>{seo.firstName}</span>
            <span>{seo.lastName}</span>
          </h1>
          <a className="links-mode-button" href="/links" data-mode-switch>
            <span aria-hidden="true">←</span> Quick links
          </a>
          <a className="scroll-cue" href="#upcoming-events" aria-label="Scroll to what I'm building">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <polyline className="chevron-one" points="18 22 32 34 46 22" />
              <polyline className="chevron-two" points="18 36 32 48 46 36" />
            </svg>
          </a>
        </section>

        <section className="event-showcase reveal" id="upcoming-events" aria-label={sections.carousel}>
          <div className="event-showcase-header">
            <h2>{sections.carousel}</h2>
            <div className="event-showcase-actions" aria-label="Explore companies">
              <span className="event-selector-label">Select company</span>
              <span aria-hidden="true">›</span>
              <button
                type="button"
                aria-label="Previous company"
                disabled={eventCount < 2}
                onClick={() => selectAdjacentEvent(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next company"
                disabled={eventCount < 2}
                onClick={() => selectAdjacentEvent(1)}
              >
                ›
              </button>
            </div>
          </div>

          <div
            className="event-card-row"
            onMouseLeave={() => {
              cancelEventHover();
              eventHoverLockedRef.current = false;
            }}
            onPointerDown={(event) => {
              if (event.target.closest("button") || (event.pointerType === "mouse" && event.button !== 0)) return;
              cancelEventHover();
              eventHoverLockedRef.current = true;
              eventSwipeConsumedRef.current = false;
              eventSwipeStartRef.current = { pointerId: event.pointerId, x: event.clientX };
              event.currentTarget.setPointerCapture?.(event.pointerId);
              event.currentTarget.classList.add("is-dragging");
            }}
            onPointerMove={(event) => {
              const start = eventSwipeStartRef.current;
              if (!start || start.pointerId !== event.pointerId) return;
              const distance = event.clientX - start.x;
              event.currentTarget.style.setProperty("--event-drag-x", `${Math.max(-58, Math.min(58, distance * 0.32))}px`);
            }}
            onPointerUp={(event) => {
              const start = eventSwipeStartRef.current;
              if (!start || start.pointerId !== event.pointerId) return;
              const distance = event.clientX - start.x;
              eventSwipeStartRef.current = null;
              event.currentTarget.classList.remove("is-dragging");
              event.currentTarget.style.removeProperty("--event-drag-x");
              eventSwipeConsumedRef.current = Math.abs(distance) > 8;
              if (eventSwipeConsumedRef.current) {
                window.setTimeout(() => {
                  eventSwipeConsumedRef.current = false;
                }, 0);
              }
              if (Math.abs(distance) > 46) selectAdjacentEvent(distance < 0 ? 1 : -1);
            }}
            onPointerCancel={(event) => {
              eventSwipeStartRef.current = null;
              event.currentTarget.classList.remove("is-dragging");
              event.currentTarget.style.removeProperty("--event-drag-x");
            }}
          >
            {featuredEvents.map((event, index) => {
              const rawOffset = (index - activeEventIndex + eventCount) % eventCount;
              const eventOffset = rawOffset > eventCount / 2 ? rawOffset - eventCount : rawOffset;
              const positionClass = eventOffset === 0
                ? "is-center"
                : eventOffset === -1
                  ? "is-prev"
                  : eventOffset === 1
                    ? "is-next"
                    : eventOffset < -1
                      ? "is-hidden-prev"
                      : "is-hidden-next";
              const isVisiblePreview = Math.abs(eventOffset) === 1;
              const isActiveEvent = eventOffset === 0;

              return (
              <article
                aria-current={isActiveEvent ? "true" : undefined}
                aria-hidden={!isActiveEvent && !isVisiblePreview}
                aria-label={isActiveEvent ? `${event.name}, selected company` : `Select ${event.name}`}
                className={`event-card ${event.image ? "with-image" : "is-empty"} ${isActiveEvent ? "is-active" : "is-inactive"} ${positionClass}`}
                key={event.name}
                onClick={() => {
                  cancelEventHover();
                  eventHoverLockedRef.current = true;
                  if (eventSwipeConsumedRef.current) {
                    eventSwipeConsumedRef.current = false;
                    return;
                  }
                  if (isVisiblePreview) setActiveEventIndex(index);
                }}
                onMouseEnter={() => {
                  if (isVisiblePreview) scheduleEventHover(index);
                }}
                onMouseLeave={cancelEventHover}
                onKeyDown={(keyboardEvent) => {
                  if (!isVisiblePreview) return;
                  if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                    keyboardEvent.preventDefault();
                    setActiveEventIndex(index);
                  }
                }}
                role={isVisiblePreview ? "button" : undefined}
                tabIndex={isVisiblePreview ? 0 : -1}
              >
                {event.image ? (
                  <img src={event.image} alt="" aria-hidden="true" />
                ) : (
                  <div className="event-card-plus" aria-hidden="true">+</div>
                )}
                <div className="event-card-shade" aria-hidden="true" />
                <div className="event-card-tab" aria-hidden={isActiveEvent}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <strong>{event.name}</strong>
                  <span>›</span>
                </div>
                <div className="event-card-copy">
                  <p>{sections.carouselLabel}</p>
                  <h3>{event.name}</h3>
                  <span>{event.tagline}</span>
                  <div className="event-meta">
                    {event.dates?.[0] && (
                      <small>{[event.dates[0].label, event.dates[0].date, event.dates[0].time].filter(Boolean).join(" · ")}</small>
                    )}
                    {event.venue && <small>{event.venue}</small>}
                    {event.spotsAvailable && <small>{event.spotsAvailable}</small>}
                  </div>
                  <button
                    type="button"
                    className="event-cta"
                    onClick={() => openMailingPopup(event)}
                    tabIndex={isActiveEvent ? 0 : -1}
                  >
                    {event.ctaLabel || "Explore now"}
                  </button>
                </div>
              </article>
              );
            })}
          </div>

          <div className="event-dots" aria-label="Choose a company">
            {featuredEvents.map((event, index) => (
              <button
                aria-label={`Show ${event.name}`}
                aria-pressed={index === activeEventIndex}
                className={index === activeEventIndex ? "active" : ""}
                key={event.name}
                onClick={() => setActiveEventIndex(index)}
                type="button"
              />
            ))}
          </div>
        </section>

        <section className="story-section" id="about">
          <DoublePhotoCard
            title={about.title}
            images={about.images}
          >
            {renderText(about.body)}
          </DoublePhotoCard>

          <DoublePhotoCard
            id="early-life"
            eyebrow={earlyLife.eyebrow}
            title={earlyLife.title}
            reverse
            images={earlyLife.images}
          >
            {renderText(earlyLife.body)}
          </DoublePhotoCard>
          <div className="story-divider" aria-hidden="true" />
        </section>

        <ProfileWatch videos={profile.videos} channelUrl={profile.channelUrl} />

        {companies.length ? (
          <section className="companies-section" id="companies">
            <div className="section-title reveal">
              <h2>{sections.companies}</h2>
            </div>
            <div className="cta-list">
              {companies.map((company) => (
                <ProfileCard
                  key={company.name}
                  item={{ ...company, title: company.name, linkLabel: `Visit ${company.name}` }}
                  images={company.images || about.images}
                  PhotoStack={PhotoStack}
                />
              ))}
            </div>
          </section>
        ) : null}

        {hasCards(giving) ? (
          <>
            <section className="giving-section" id="the-vibe">
              <div className="section-title reveal">
                <h2>{sections.giving}</h2>
              </div>
              <div className="cta-list">
                {giving.map((item, index) => (
                  <ProfileCard key={`${index}-${item.prompt || item.title}`} item={item} images={item.images || about.images} PhotoStack={PhotoStack} />
                ))}
              </div>
            </section>

            <div className="story-divider contact-divider" aria-hidden="true" />
          </>
        ) : null}

        <section className="giving-double-section">
          <div className="section-title reveal">
            <h2>{sections.education}</h2>
          </div>
          <div className="story-section double-photo-card-list">
            {education.filter((item) => hasCards([item])).map((item) => (
              <DoublePhotoCard
                title={item.title}
                reverse={Boolean(item.reverse)}
                images={item.images}
                key={item.title}
              >
                {renderText(item.description)}
              </DoublePhotoCard>
            ))}
          </div>
        </section>

        <div className="story-divider contact-divider" aria-hidden="true" />

        {fashion?.title ? (
          <>
            <section className="story-section single-double-photo-section">
              <DoublePhotoCard
                title={fashion.title}
                images={fashion.images}
              >
                {renderText(fashion.description)}
              </DoublePhotoCard>
            </section>

            <div className="story-divider contact-divider" aria-hidden="true" />
          </>
        ) : null}

        <section className="giving-section" id="what-i-love">
          <div className="section-title reveal">
            <h2>{sections.mentors}</h2>
          </div>
          <div className="cta-list">
            {mentors.map((item, index) => (
              <ProfileCard key={`${index}-${item.title}`} item={item} images={item.images || about.images} PhotoStack={PhotoStack} />
            ))}
          </div>
        </section>

        <div className="story-divider contact-divider" aria-hidden="true" />

        <section className="giving-section">
          <div className="section-title reveal">
            <h2>{sections.eventExperience}</h2>
          </div>
          <div className="cta-list">
            {eventExperience.map((item, index) => (
              <ProfileCard key={`${index}-${item.title}`} item={item} images={item.images || about.images} PhotoStack={PhotoStack} />
            ))}
          </div>
        </section>

        <div className="story-divider contact-divider" aria-hidden="true" />

        <section
          className={`contact-section reveal ${formStarted ? "contact-form-active" : ""} ${
            formExpanded ? "contact-form-fullscreen" : "contact-form-minimized"
          }`}
          id="contact"
        >
          <div className="contact-intro">
            <h2>{sections.contact}</h2>
            <div className="contact-socials" aria-label="Social links">
              {socialLinks.map((link) => (
                <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name} key={link.name}>
                  <SocialIcon icon={link.icon} />
                </a>
              ))}
            </div>
          </div>
          <div className="contact-stage">
            <div className="contact-frame">
              <img className="contact-bg" src={assets.contactBackground} alt="" aria-hidden="true" />
              <div className="contact-overlay" />
              <a className="contact-brand" href="#">
                {seo.name}
              </a>
              {formStarted && (
                <button
                  type="button"
                  className="typeform-toggle"
                  aria-label={formExpanded ? "Minimize contact form" : "Expand contact form"}
                  onClick={() => setFormExpanded((expanded) => !expanded)}
                >
                  {formExpanded ? "Minimize" : "Full screen"}
                </button>
              )}
              <div className="typeform-wrapper">
                <form
                  ref={contactFormRef}
                  data-aqua-challenge-action="brand-enquiry"
                  className="typeform-card"
                  onSubmit={(event) => {
                    event.preventDefault();
                    advanceForm();
                  }}
                >
                  {formComplete ? (
                    <div className="typeform-thank-you" key="thank-you">
                      <p>Thank you</p>
                      <p>{contactCopy.thankYouEyebrow}</p>
                      <h3>{contactCopy.thankYouTitle}</h3>
                      <button type="button" onClick={resetContactForm}>
                        {contactCopy.sendAnotherButton}
                      </button>
                    </div>
                  ) : !formStarted ? (
                    <div className="typeform-start" key="start">
                      <div>
                        <h3>{contactCopy.startTitle}</h3>
                        <p>{contactCopy.startBody}</p>
                      </div>
                    </div>
                  ) : (
                    <label className="typeform-question" key={activeQuestion.field}>
                      <span className="question-title">{activeQuestion.title}</span>
                      {activeQuestion.type === "consent" ? (
                        <span className="consent-answer">
                          <input
                            name={activeQuestion.field}
                            type="checkbox"
                            checked={Boolean(formValues[activeQuestion.field])}
                            onChange={(event) =>
                              setFormValues((values) => ({ ...values, [activeQuestion.field]: event.target.checked }))
                            }
                          />
                          <span>{activeQuestion.label}</span>
                        </span>
                      ) : activeQuestion.type === "textarea" ? (
                        <textarea
                          name={activeQuestion.field}
                          rows="2"
                          placeholder={activeQuestion.placeholder}
                          value={formValues[activeQuestion.field] ?? ""}
                          onChange={(event) =>
                            setFormValues((values) => ({ ...values, [activeQuestion.field]: event.target.value }))
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              advanceForm();
                            }
                          }}
                        />
                      ) : (
                        <input
                          name={activeQuestion.field}
                          type={activeQuestion.type}
                          placeholder={activeQuestion.placeholder}
                          value={formValues[activeQuestion.field] ?? ""}
                          onChange={(event) =>
                            setFormValues((values) => ({ ...values, [activeQuestion.field]: event.target.value }))
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              advanceForm();
                            }
                          }}
                        />
                      )}
                    </label>
                  )}
                  {!formComplete && (
                    <div className="typeform-actions">
                      <button type="button" onClick={advanceForm}>
                        {formStarted ? (isLastQuestion ? contactCopy.submitButton : contactCopy.nextButton) : contactCopy.startButton}
                      </button>
                      {formStarted && <span>{contactCopy.enterHint}</span>}
                    </div>
                  )}
                  {formStarted && !formComplete && (
                    <div className="typeform-progress">
                      {formQuestions.map((question, index) => (
                        <button
                          type="button"
                          key={question.field}
                          className={index === formStep ? "active" : ""}
                          aria-label={`Go to question ${index + 1}`}
                          onClick={() => setFormStep(index)}
                        />
                      ))}
                    </div>
                  )}
                  {formStatus && !formComplete && <p className="form-status">{formStatus}</p>}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>2026 {seo.name}</strong>
          <span>Suffolk, England · <a href="/privacy">Privacy</a></span>
        </div>
        <div className="footer-links">
          {socialLinks.map((link) => (
            <a href={link.href} target="_blank" rel="noopener noreferrer" key={link.name}>
              {link.name}
            </a>
          ))}
        </div>
      </footer>

      {mailingOpen && (
        <div
          className="mailing-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mailing-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMailingOpen(false);
          }}
        >
          <div className="mailing-card">
            <button
              type="button"
              className="mailing-close"
              aria-label="Close mailing list popup"
              onClick={() => setMailingOpen(false)}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
            <p>{mailingCopy.eyebrow}</p>
            <h2 id="mailing-title">{mailingCopy.title}</h2>
            <span>{mailingCopy.body}</span>
            <form onSubmit={submitMailingList} data-aqua-challenge-action="brand-enquiry">
              <label>
                <span>{mailingCopy.emailLabel}</span>
                <input
                  name="mailing-email"
                  type="email"
                  placeholder={mailingCopy.emailPlaceholder}
                  value={mailingEmail}
                  onChange={(event) => setMailingEmail(event.target.value)}
                />
              </label>
              <label className="mailing-consent">
                <input type="checkbox" checked={mailingConsent} onChange={(event) => setMailingConsent(event.target.checked)} />
                <span>{mailingCopy.consentLabel} <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a></span>
              </label>
              <button type="submit">{mailingCopy.button}</button>
              {mailingStatus && <small>{mailingStatus}</small>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
