(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* ignore */
      }
    },
  };

  const SWIPES_KEY = "ember-swipes-v1";
  const MATCHES_KEY = "ember-matches-v1";

  /* ================= Profiles (fictional) ================= */
  const PROFILES = [
    { id: "sofia", name: "Sofia", age: 27, distance: 2, job: "Product designer", bio: "Chasing good light and better coffee.", interests: ["Design", "Coffee", "Hiking"], photo: "https://randomuser.me/api/portraits/women/44.jpg", verified: true, matchesYou: true },
    { id: "arjun", name: "Arjun", age: 29, distance: 5, job: "Full-stack developer", bio: "Building things at 2am, debugging at 3.", interests: ["Tech", "Cricket", "Cooking"], photo: "https://randomuser.me/api/portraits/men/32.jpg", verified: false, matchesYou: true },
    { id: "mia", name: "Mia", age: 25, distance: 1, job: "Illustrator", bio: "Will draw your dog. No, really.", interests: ["Art", "Dogs", "Indie music"], photo: "https://randomuser.me/api/portraits/women/68.jpg", verified: true, matchesYou: false },
    { id: "daniel", name: "Daniel", age: 31, distance: 8, job: "Chef", bio: "Making dinner for two (recipes included).", interests: ["Food", "Vinyl", "Travel"], photo: "https://randomuser.me/api/portraits/men/85.jpg", verified: true, matchesYou: true },
    { id: "zara", name: "Zara", age: 28, distance: 3, job: "Data scientist", bio: "Numbers by day, novels by night.", interests: ["Books", "Data", "Yoga"], photo: "https://randomuser.me/api/portraits/women/12.jpg", verified: true, matchesYou: false },
    { id: "leo", name: "Leo", age: 26, distance: 12, job: "Musician", bio: "Always one song away from finishing an album.", interests: ["Music", "Skate", "Film"], photo: "https://randomuser.me/api/portraits/men/22.jpg", verified: false, matchesYou: true },
    { id: "hana", name: "Hana", age: 30, distance: 4, job: "Architect", bio: "I notice buildings before people. Sorry.", interests: ["Architecture", "Travel", "Photography"], photo: "https://randomuser.me/api/portraits/women/90.jpg", verified: true, matchesYou: false },
    { id: "omar", name: "Omar", age: 33, distance: 6, job: "Teacher", bio: "History nerd with strong opinions on pizza.", interests: ["History", "Pizza", "Cycling"], photo: "https://randomuser.me/api/portraits/men/46.jpg", verified: true, matchesYou: true },
    { id: "ines", name: "Ines", age: 24, distance: 9, job: "Barista", bio: "Latte art is my love language.", interests: ["Coffee", "Plants", "Running"], photo: "https://randomuser.me/api/portraits/women/33.jpg", verified: false, matchesYou: false },
    { id: "theo", name: "Theo", age: 28, distance: 2, job: "Photographer", bio: "Golden hour is the only deadline I respect.", interests: ["Photography", "Hiking", "Coffee"], photo: "https://randomuser.me/api/portraits/men/61.jpg", verified: true, matchesYou: false },
    { id: "priya", name: "Priya", age: 27, distance: 7, job: "Doctor", bio: "Fixing humans, collecting houseplants.", interests: ["Medicine", "Plants", "Baking"], photo: "https://randomuser.me/api/portraits/women/79.jpg", verified: false, matchesYou: true },
    { id: "mateo", name: "Mateo", age: 30, distance: 10, job: "Entrepreneur", bio: "Two startups in, still smiling.", interests: ["Startups", "Surfing", "Wine"], photo: "https://randomuser.me/api/portraits/men/11.jpg", verified: true, matchesYou: false },
  ];

  const saved = store.get(SWIPES_KEY, { liked: [], passed: [] });
  const liked = new Set(saved.liked);
  const passed = new Set(saved.passed);
  let matches = store.get(MATCHES_KEY, []).filter((m) => PROFILES.some((p) => p.id === m.id));

  const state = {
    view: "deck",
    animating: false,
    lastAction: null,
  };

  const persistSwipes = () => store.set(SWIPES_KEY, { liked: [...liked], passed: [...passed] });
  const persistMatches = () => store.set(MATCHES_KEY, matches);

  /* ================= Toast ================= */
  let toastTimer = null;
  const toast = (msg) => {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.hidden = true;
    }, 2200);
  };

  /* ================= Deck ================= */
  const deck = $("#deck");
  const unswiped = () => PROFILES.filter((p) => !liked.has(p.id) && !passed.has(p.id));

  const buildCard = (profile, pos) => {
    const card = el("article", `swipe-card pos-${pos}`);
    card.dataset.id = profile.id;

    const img = document.createElement("img");
    img.className = "photo";
    img.src = profile.photo;
    img.alt = `${profile.name}'s profile photo`;
    img.draggable = false;
    img.referrerPolicy = "no-referrer";
    img.addEventListener("error", () => {
      img.style.display = "none";
    }, { once: true });

    const shade = el("div", "shade");
    const likeStamp = el("span", "stamp like", "Like");
    const nopeStamp = el("span", "stamp nope", "Nope");
    const superStamp = el("span", "stamp super", "Super");

    const info = el("div", "card-info");
    const name = el("div", "card-name");
    name.append(el("span", null, `${profile.name}, ${profile.age}`));
    if (profile.verified) {
      const v = el("span", "verified", "✓");
      v.setAttribute("title", "Verified profile");
      name.append(v);
    }
    info.append(
      name,
      el("p", "card-meta", `${profile.job} · ${profile.distance} km away`),
      el("p", "card-bio", profile.bio)
    );
    const chips = el("div", "card-interests");
    profile.interests.forEach((i) => chips.append(el("span", "interest", i)));
    info.append(chips);

    card.append(img, shade, likeStamp, nopeStamp, superStamp, info);
    if (pos === 1) attachDrag(card, profile);
    return card;
  };

  const renderDeck = () => {
    deck.textContent = "";
    const stack = unswiped().slice(0, 3);
    for (let i = stack.length - 1; i >= 0; i--) {
      deck.append(buildCard(stack[i], i + 1));
    }
    const empty = stack.length === 0;
    $("#deck-empty").hidden = !empty;
    $("#pass-btn").disabled = empty;
    $("#like-btn").disabled = empty;
    $("#super-btn").disabled = empty;
    $("#undo-btn").disabled = !state.lastAction;
  };

  /* ================= Drag ================= */
  const setStamp = (card, dx, dy) => {
    const like = card.querySelector(".stamp.like");
    const nope = card.querySelector(".stamp.nope");
    const superS = card.querySelector(".stamp.super");
    const horizontal = Math.abs(dx) > Math.abs(dy);
    like.style.opacity = horizontal && dx > 0 ? Math.min(1, dx / 90).toFixed(2) : 0;
    nope.style.opacity = horizontal && dx < 0 ? Math.min(1, -dx / 90).toFixed(2) : 0;
    superS.style.opacity = !horizontal && dy < 0 ? Math.min(1, -dy / 110).toFixed(2) : 0;
  };

  const resetCard = (card) => {
    card.style.transition = "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)";
    card.style.transform = "";
    setStamp(card, 0, 0);
    setTimeout(() => {
      card.style.transition = "";
    }, 320);
  };

  function attachDrag(card, profile) {
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dy = 0;
    let dragging = false;
    let pointerId = null;

    card.addEventListener("pointerdown", (e) => {
      if (state.animating || state.view !== "deck" || !$("#match-modal").hidden) return;
      dragging = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      dx = 0;
      dy = 0;
      card.style.transition = "none";
      card.setPointerCapture(pointerId);
    });

    card.addEventListener("pointermove", (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dx = e.clientX - startX;
      dy = e.clientY - startY;
      card.style.transform = `translate(${dx}px, ${dy}px) rotate(${(dx * 0.06).toFixed(2)}deg)`;
      setStamp(card, dx, dy);
    });

    const finish = (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      const horizontal = Math.abs(dx) > Math.abs(dy);
      if (horizontal && Math.abs(dx) > 90) {
        swipe(dx > 0 ? "like" : "pass", card, profile);
      } else if (!horizontal && dy < -110) {
        swipe("super", card, profile);
      } else {
        resetCard(card);
      }
    };

    card.addEventListener("pointerup", finish);
    card.addEventListener("pointercancel", finish);
  }

  /* ================= Swipe ================= */
  const swipe = (dir, card, profile) => {
    if (!card || state.animating) return;
    state.animating = true;

    const outX = dir === "super" ? 0 : dir === "like" ? 720 : -720;
    const outY = dir === "super" ? -820 : 90;
    const rot = dir === "like" ? 26 : dir === "pass" ? -26 : 0;

    card.classList.add("leaving");
    card.style.transform = `translate(${outX}px, ${outY}px) rotate(${rot}deg)`;
    card.style.opacity = "0";

    setTimeout(() => {
      finalizeSwipe(dir, profile);
    }, 330);
  };

  const finalizeSwipe = (dir, profile) => {
    if (dir === "pass") passed.add(profile.id);
    else liked.add(profile.id);
    persistSwipes();

    const isNewMatch =
      (dir === "super" || profile.matchesYou) && !matches.some((m) => m.id === profile.id);
    if (isNewMatch) {
      matches.unshift({ id: profile.id, ts: Date.now() });
      persistMatches();
    }

    state.lastAction = { id: profile.id, dir, matched: isNewMatch };
    state.animating = false;
    renderDeck();
    syncMatchCount();
    if (state.view === "matches") renderMatches();

    if (isNewMatch) openMatch(profile);
  };

  const swipeTop = (dir) => {
    if (state.animating || state.view !== "deck") return;
    const card = deck.querySelector(".swipe-card.pos-1");
    if (!card) return;
    const profile = PROFILES.find((p) => p.id === card.dataset.id);
    swipe(dir, card, profile);
  };

  /* ================= Undo ================= */
  const undo = () => {
    if (!state.lastAction || state.animating) return;
    const { id, dir, matched } = state.lastAction;
    if (dir === "pass") passed.delete(id);
    else liked.delete(id);
    if (matched) {
      matches = matches.filter((m) => m.id !== id);
      persistMatches();
    }
    persistSwipes();
    state.lastAction = null;
    renderDeck();
    syncMatchCount();
    if (state.view === "matches") renderMatches();
    toast("Last swipe undone");
  };

  /* ================= Matches ================= */
  const syncMatchCount = () => {
    $("#match-count").textContent = String(matches.length);
  };

  const whenLabel = (ts) => {
    const days = Math.floor((Date.now() - ts) / 86400000);
    if (days < 1) return "Matched today";
    if (days === 1) return "Matched yesterday";
    return `Matched ${days} days ago`;
  };

  const renderMatches = () => {
    const grid = $("#matches-grid");
    grid.textContent = "";
    $("#matches-empty").hidden = matches.length > 0;

    matches.forEach((m, i) => {
      const p = PROFILES.find((x) => x.id === m.id);
      if (!p) return;
      const tile = el("div", "match-tile");
      tile.style.animationDelay = `${Math.min(i * 40, 320)}ms`;
      const img = document.createElement("img");
      img.src = p.photo;
      img.alt = `${p.name}`;
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      const info = el("div", "m-info");
      info.append(el("b", null, `${p.name}, ${p.age}`), el("span", null, whenLabel(m.ts)));
      tile.append(img, info);
      grid.append(tile);
    });
  };

  /* ================= Match modal ================= */
  const openMatch = (profile) => {
    $("#match-name").textContent = profile.name;
    $("#match-photo").src = profile.photo;
    $("#match-photo").alt = profile.name;
    $("#match-modal").hidden = false;
    document.body.style.overflow = "hidden";
    $("#match-keep").focus();
  };

  const closeMatch = () => {
    $("#match-modal").hidden = true;
    document.body.style.overflow = "";
  };

  $("#match-keep").addEventListener("click", closeMatch);
  $("#match-see").addEventListener("click", () => {
    closeMatch();
    showMatches();
  });

  /* ================= Views ================= */
  const showDeck = () => {
    state.view = "deck";
    $(".shell").classList.remove("show-matches");
    $(".app").hidden = false;
    $("#matches-view").hidden = true;
    $("#deck-btn").classList.add("active");
    $("#matches-btn").classList.remove("active");
  };

  const showMatchesView = () => {
    state.view = "matches";
    $(".shell").classList.add("show-matches");
    $(".app").hidden = true;
    $("#matches-view").hidden = false;
    $("#deck-btn").classList.remove("active");
    $("#matches-btn").classList.add("active");
    renderMatches();
  };
  const showMatches = showMatchesView;

  $("#deck-btn").addEventListener("click", showDeck);
  $("#matches-btn").addEventListener("click", showMatchesView);
  $("#back-deck").addEventListener("click", showDeck);

  /* ================= Reset ================= */
  $("#reset-deck").addEventListener("click", () => {
    liked.clear();
    passed.clear();
    state.lastAction = null;
    persistSwipes();
    renderDeck();
    toast("Deck reset — matches kept");
  });

  /* ================= Actions ================= */
  $("#pass-btn").addEventListener("click", () => swipeTop("pass"));
  $("#like-btn").addEventListener("click", () => swipeTop("like"));
  $("#super-btn").addEventListener("click", () => swipeTop("super"));
  $("#undo-btn").addEventListener("click", undo);

  document.querySelectorAll("[data-close]").forEach((n) => {
    n.addEventListener("click", closeMatch);
  });

  document.addEventListener("keydown", (e) => {
    if (!$("#match-modal").hidden) {
      if (e.key === "Escape") closeMatch();
      return;
    }
    if (state.view !== "deck") return;
    if (e.target instanceof Element && e.target.matches("input, textarea, select")) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      swipeTop("pass");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      swipeTop("like");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      swipeTop("super");
    } else if (e.key === "Backspace") {
      e.preventDefault();
      undo();
    }
  });

  /* ================= Init ================= */
  syncMatchCount();
  renderDeck();
  renderMatches();
})();
