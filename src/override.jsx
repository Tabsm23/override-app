import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useStripeCheckout } from "./hooks/useStripeCheckout";
import { supabase } from "./supabase";

/* ══════════════════════════════════════════════
   PROGRAM DATA
══════════════════════════════════════════════ */

const CHAPTERS = [
  {
    id: "grieve",
    number: "I",
    name: "Grieve",
    tagline: "Let it be real.",
    icon: "◎",
    description: "Every other program rushes you past grief. OVERRIDE doesn't. Grief is not a problem to solve — it's a passage to move through with full honesty. Here, you are allowed to fall apart.",
    weeklyTasks: [
      { id: "t1", text: "Write one honest sentence about how you feel today — no performance, no optimism required." },
      { id: "t2", text: "Delete one thing from your phone that keeps you tethered to the past (a photo, a contact note, a saved message)." },
      { id: "t3", text: "Tell one person the truth about how you're actually doing." },
      { id: "t4", text: "Do one thing this week that has nothing to do with the relationship or the breakup." },
      { id: "t5", text: "Write a list of 10 things that are true about your life right now — not good or bad, just real." },
    ],
    tools: [
      {
        id: "loss-inventory",
        name: "The Loss Inventory",
        subtitle: "Name everything you're actually mourning",
        icon: "◇",
        insight: "We grieve far more than people — we grieve futures, routines, the version of ourselves that existed inside that relationship, the ordinary Tuesday mornings. Naming every layer of loss is the first act of dignity toward yourself.",
        prompt: "Write freely about everything you've lost — not just the person, but the life you imagined, the identity you held inside that relationship, the plans you made, the small rituals that are gone. Nothing is too minor or too strange to name here.",
        placeholder: "I am grieving...",
        systemPrompt: `You are a deeply compassionate coach who specialises in heartbreak and divorce recovery. Someone has shared their loss inventory — everything they are grieving after a relationship ended.

Your role is to witness them completely. Reflect back the layers you notice in what they've shared. Help them see that grief of this complexity is not weakness — it is the mark of someone who loved fully. Gently name 2-3 dimensions of their loss they may not have consciously noticed themselves.

Do NOT offer silver linings or solutions. Do NOT rush them toward healing. Be warm, unhurried, and specific to what they actually wrote. 3-4 paragraphs. End with one tender, open question.`,
      },
      {
        id: "the-myth",
        name: "The Story You Were Told",
        subtitle: "Examine the narratives you inherited about love",
        icon: "◈",
        insight: "Much of our heartbreak is complicated by stories we absorbed about what relationships were supposed to look like, what staying or leaving says about us as a person. Separating inherited story from lived truth is liberating work.",
        prompt: "Answer these freely:\n\nWhat did you believe a relationship was supposed to give you — or look like — before this one?\n\nWhat 'rules' did you carry about love, marriage, or divorce that this experience has now challenged or broken?\n\nWhat would it mean to release a story that was never really yours?",
        placeholder: "I believed that a relationship was supposed to...\n\nThe rules I carried were...\n\nA story I might be ready to release is...",
        systemPrompt: `You are a sharp, compassionate coach who helps people examine the inherited narratives and beliefs they carry about love, relationships, and identity. Someone has written about the stories they were told — or told themselves — and how this experience has challenged them.

Reflect back the beliefs you notice. Help them see which ones are serving them and which are causing unnecessary pain. Be incisive but kind. Do not moralise. Help them feel the freedom that comes from questioning a story that was never really theirs. End with one question that opens new ground rather than closes it.`,
      },
      {
        id: "unsent-letter",
        name: "The Letter You'll Never Send",
        subtitle: "Say what was never said",
        icon: "✦",
        insight: "Unexpressed emotion doesn't dissolve — it goes underground and shapes us from below. This creates a private container for the words that need to exist somewhere, even if they are never read by anyone else.",
        prompt: "Write a letter to the person, to the relationship itself, or to the version of you that existed inside it. Say whatever was never said — the anger, the longing, the things you wish they knew, the things you're ashamed to feel. This is yours alone.",
        placeholder: "Dear...",
        systemPrompt: `You are a thoughtful coach and skilled writing guide. Someone has written an unsent letter after heartbreak or divorce.

Do not judge what they've expressed or suggest they should feel differently. Your role is to witness what they've written with full respect. Name the emotional territories you notice. Help them feel genuinely seen. End with a single powerful question that opens something rather than closes it. Be precise and unhurried. 3 paragraphs.`,
      },
    ],
  },
  {
    id: "rediscover",
    number: "II",
    name: "Rediscover",
    tagline: "Find what was buried.",
    icon: "◑",
    description: "Long relationships quietly ask us to become smaller. This chapter is about recovering the dreams, values, and pieces of self that were set aside, often without you even noticing.",
    weeklyTasks: [
      { id: "t6", text: "Do one thing this week that you used to love before this relationship — alone, just for you." },
      { id: "t7", text: "Write down 3 ambitions or interests you quietly shelved. Pick one to revisit, even in the smallest way." },
      { id: "t8", text: "Notice one moment this week where you made a choice that was entirely, authentically yours." },
      { id: "t9", text: "Have one conversation where you share an opinion without softening it for someone else's comfort." },
      { id: "t10", text: "Spend one hour doing something with no purpose other than the fact that you enjoy it." },
    ],
    tools: [
      {
        id: "before-we-were-we",
        name: "Before We Were 'We'",
        subtitle: "Recover the self that predates the relationship",
        icon: "◇",
        insight: "In close relationships, our identities gradually merge with our partner's. After separation, many people describe not knowing who they are anymore. This isn't failure — it's the natural consequence of loving someone fully. This tool begins the recovery.",
        prompt: "Think back to who you were before this relationship — or before relationships began to define you. What did you love? What were you curious about, proud of, drawn toward? What ambitions or interests did you quietly shelve because they didn't fit the life you were building together?",
        placeholder: "Before we were 'we', I was someone who...",
        systemPrompt: `You are a coach who specialises in identity reconstruction after major relationship transitions. Someone has written about who they were before their relationship.

Read carefully. Reflect back: what qualities, values, and desires appear in what they've shared? Name 4-5 specific things you notice about this person — their character, not their circumstances. Help them see themselves with fresh, admiring eyes. Be grounded in what they actually wrote. End with a question that invites them to reclaim one specific part of themselves.`,
      },
      {
        id: "values-underground",
        name: "Values Underground",
        subtitle: "Discover what you actually stand for",
        icon: "✧",
        insight: "Most values exercises hand you a list to pick from. This one works differently — your values are revealed through evidence: what you defend, what makes you angry, what you can't stop caring about even when it costs you something.",
        prompt: "Answer these three questions without overthinking:\n\n1. What makes you genuinely angry when you see it in the world or in relationships?\n2. What is something you have never been willing to compromise on, even under pressure?\n3. What do you quietly admire most in other people?",
        placeholder: "What makes me genuinely angry...\n\nWhat I've never been willing to compromise on...\n\nWhat I quietly admire in others...",
        systemPrompt: `You are a values-based coach with a gift for helping people discover what they genuinely stand for — not what they think they should stand for. Someone has answered three revealing questions about their values.

From their answers, identify 3-4 core values that run underneath the surface. Name each one clearly. Explain specifically where you see it in what they wrote. Help them feel the relief and clarity of having their values named accurately. Do not be generic. End with a practical question: how might these values guide the decisions they're facing right now?`,
      },
      {
        id: "the-inner-cast",
        name: "The Inner Cast",
        subtitle: "Meet the different voices inside you",
        icon: "❋",
        insight: "We are not one self — we are many. There is the one who is furious, the one who still hopes, the one who is exhausted, the one who knows more than the others admit. After heartbreak, some of these inner voices go quiet while others get very loud. This tool maps them.",
        prompt: "Imagine the different voices or 'parts' of yourself as characters. There might be a wounded one, a fierce one, a playful one that's gone very quiet, a wise one you rarely listen to, an angry one, a hopeful one, a frightened one. Name as many as you can. What does each one most want right now? What is each one most afraid of?",
        placeholder: "There is a part of me that...\n\nThere is also a part that...\n\nAnd somewhere inside, there is a part...",
        systemPrompt: `You are an insightful coach who understands that people contain multitudes — especially during times of upheaval. Someone has mapped the different inner voices or 'parts' they can feel right now.

Respond with warmth and genuine curiosity. Reflect back what you notice about the inner landscape they've described — which voices seem to be in conflict, which are trying to protect, which have gone underground. Help them approach this inner world with compassion rather than judgment. Gently name one or two things you notice that they may not have articulated. End with an invitation: which part most needs to be heard right now?`,
      },
    ],
  },
  {
    id: "reclaim",
    number: "III",
    name: "Reclaim",
    tagline: "Choose who you are.",
    icon: "◕",
    description: "You are not returning to who you were before. You are becoming someone shaped by what you've survived and what you now choose. This chapter is about authoring that person deliberately.",
    weeklyTasks: [
      { id: "t11", text: "Write your 'from now on' list — 5 things you are choosing for yourself, starting this week." },
      { id: "t12", text: "Do one thing this week that the person you are becoming would do." },
      { id: "t13", text: "Set one boundary this week — with someone else, or with yourself." },
      { id: "t14", text: "Introduce yourself differently in one context this week — lead with something new." },
      { id: "t15", text: "Write one paragraph about who you are, written in the present tense, as if it's already true." },
    ],
    tools: [
      {
        id: "future-self-letter",
        name: "Letter from Your Future Self",
        subtitle: "Write from three years ahead",
        icon: "◉",
        insight: "Writing FROM the future — not toward it — shifts how your mind processes possibility. It moves desire from abstract wish to felt reality. People who practise this kind of concrete visioning consistently report greater clarity and more purposeful action.",
        prompt: "Write a letter from your future self — three years from today — back to the person you are right now. What did you build? What did you let go of? What surprised you about who you became? What would you want this version of yourself to feel or know? Write it as a real letter — warm, specific, true.",
        placeholder: "Dear [your name],\n\nThree years from now, I want you to know...",
        systemPrompt: `You are a coach specialising in post-divorce reinvention and identity reconstruction. Someone has written a letter from their future self.

Take their vision seriously as a real document of desire and becoming. Identify 3-4 specific themes or wishes embedded in what they've written. Help them see which of these feels most alive or urgent right now. Then identify one small, concrete action they could take this week that genuinely moves toward that future — something real, not symbolic. Be warm, specific, and grounded in what they actually wrote.`,
      },
      {
        id: "the-no-list",
        name: "The Architecture of No",
        subtitle: "Define your life by what you refuse",
        icon: "◬",
        insight: "Identity is shaped as much by what we refuse as by what we choose. Most recovery programs focus on affirmations and positive thinking. This tool takes a different angle — the clarifying, dignifying power of an honest 'never again.'",
        prompt: "Write two lists:\n\nNEVER AGAIN — What have you learned, through hard experience, that you will never again accept in a relationship, a friendship, a work situation, or from yourself? Be specific and honest.\n\nNO LONGER — What patterns, habits, or ways of making yourself smaller are you formally retiring?",
        placeholder: "Never again will I...\n\nI am no longer someone who...",
        systemPrompt: `You are a direct, warm coach who helps people build lives from clarity and self-respect. Someone has written their 'architecture of no' — the things they are refusing to accept going forward.

Honour the courage and self-knowledge in what they've written. Reflect back what you notice — the patterns, the growth, the dignity embedded in these refusals. Then help them see the positive identity claim implied by each refusal: every 'never again' contains a 'from now on I choose...' Help them articulate 2-3 of those positive claims. End with one powerful sentence that names who they are becoming.`,
      },
      {
        id: "my-manifesto",
        name: "Your Personal Manifesto",
        subtitle: "Claim your story in your own words",
        icon: "✦",
        insight: "The stories we tell about ourselves shape who we become — this is not metaphor, it is how the mind works. A manifesto is not an affirmation. It is an act of authorship — you deciding what your story means and who gets to be the protagonist.",
        prompt: "Write your manifesto. Not who you wish you were — who you are discovering yourself to actually be. Include: the truths you now live by, what you are choosing from this point forward, what you know about yourself that you didn't know before, and one fierce, honest sentence about the person you are becoming. Make it yours. Make it real. Make it something you'd want to read on a hard day.",
        placeholder: "I am someone who...\n\nI know now that...\n\nI choose...\n\nI am becoming...",
        systemPrompt: `You are a skilled coach and writing guide. Someone has written their personal manifesto — a declaration of who they are and are choosing to become after heartbreak or divorce.

This is a significant document. Treat it as such. Reflect back the most powerful and true lines. Name specifically what strikes or moves you about what they've written. Gently suggest 1-2 ways to deepen or sharpen the language — not to change their words, but to help them be more fully themselves on the page. End with a short, fierce affirmation built entirely from their own words.`,
      },
    ],
  },
];

const TOOL_LOOKUP = {};
const TASK_LOOKUP = {};
CHAPTERS.forEach((chapter) => {
  chapter.tools.forEach((tool) => {
    TOOL_LOOKUP[`${chapter.id}:${tool.id}`] = { chapter, tool };
  });
  chapter.weeklyTasks.forEach((task) => {
    TASK_LOOKUP[task.id] = { chapter, task };
  });
});

function entrySortKey(date, time) {
  if (!date) return 0;
  const timePart = time || "12:00";
  let parsed = Date.parse(time ? `${date} ${timePart}` : date);
  if (Number.isNaN(parsed) && !/\d{4}/.test(date)) {
    parsed = Date.parse(`${date} ${new Date().getFullYear()} ${timePart}`);
  }
  return Number.isNaN(parsed) ? 0 : parsed;
}

function buildAllJournalEntries({ toolEntries, journalEntries, taskNotes, urgeLog, weatherLog }) {
  const items = [];

  Object.entries(toolEntries || {}).forEach(([key, entries]) => {
    const meta = TOOL_LOOKUP[key];
    if (!meta) return;
    const { chapter, tool } = meta;
    (entries || []).forEach((e, i) => {
      items.push({
        id: `tool-${key}-${i}-${e.date}-${e.time || ""}`,
        sortKey: entrySortKey(e.date, e.time),
        section: `Chapter ${chapter.number} · ${chapter.name}`,
        source: tool.name,
        date: e.date,
        time: e.time,
        text: e.text,
        reflection: e.reflection || null,
      });
    });
  });

  (journalEntries || []).forEach((e, i) => {
    items.push({
      id: `ritual-${i}-${e.date}`,
      sortKey: entrySortKey(e.date),
      section: "Daily Ritual",
      source: "Journal entry",
      date: e.date,
      text: e.text,
      meta: e.prompt,
    });
  });

  Object.entries(taskNotes || {}).forEach(([taskId, notes]) => {
    const meta = TASK_LOOKUP[taskId];
    const taskLabel = meta
      ? (meta.task.text.length > 90 ? `${meta.task.text.slice(0, 90)}…` : meta.task.text)
      : "Task note";
    (notes || []).forEach((n, i) => {
      items.push({
        id: `task-${taskId}-${i}-${n.date}-${n.time || ""}`,
        sortKey: entrySortKey(n.date, n.time),
        section: meta ? `Weekly Task · ${meta.chapter.name}` : "Weekly Task",
        source: taskLabel,
        date: n.date,
        time: n.time,
        text: n.text,
      });
    });
  });

  (urgeLog || []).forEach((e, i) => {
    items.push({
      id: `pause-${i}-${e.date}-${e.time || ""}`,
      sortKey: entrySortKey(e.date, e.time),
      section: "The Pause",
      source: "Held the line",
      date: e.date,
      time: e.time,
      text: e.text,
    });
  });

  (weatherLog || []).forEach((e, i) => {
    const body = e.note?.trim() ? e.note : `${e.icon} ${e.label}`;
    items.push({
      id: `weather-${i}-${e.date}-${e.time || ""}`,
      sortKey: entrySortKey(e.date, e.time),
      section: "Emotional Weather",
      source: e.label,
      date: e.date,
      time: e.time,
      text: body,
      meta: e.note?.trim() ? `${e.icon} ${e.label}` : null,
    });
  });

  return items.sort((a, b) => b.sortKey - a.sortKey);
}

const WEATHER_OPTIONS = [
  { id: "storm", label: "Stormy", icon: "⛈", desc: "Overwhelmed, tearful, heavy" },
  { id: "fog", label: "Foggy", icon: "🌫", desc: "Numb, disconnected, unclear" },
  { id: "cloud", label: "Overcast", icon: "☁", desc: "Low but functional, moving through it" },
  { id: "clearing", label: "Clearing", icon: "🌤", desc: "Moments of okay, brief lightness" },
  { id: "calm", label: "Calm", icon: "🌙", desc: "Quiet steadiness, not forced" },
  { id: "bright", label: "Bright", icon: "☀", desc: "Genuinely good, present, alive" },
];

const PAUSE_REDIRECTS = [
  "What are you actually hoping will happen if you send it?",
  "Write what you want to say here instead — then close this window.",
  "Name the feeling underneath the urge. Just the feeling. Not the story.",
  "What would you tell your best friend to do right now?",
  "What does the wiser version of you already know about this moment?",
  "Is this about connection, or about control? Be honest.",
  "Write one thing you're proud of since this ended. Read it twice.",
  "What are you really missing right now — the person, or the feeling they gave you?",
];

const DAILY_PROMPTS = [
  "What surprised you about yourself today?",
  "Name one small thing you did today that the old you wouldn't have done.",
  "What are you slowly letting go of?",
  "What would you tell a close friend who was in exactly your situation?",
  "Name one way you showed up for yourself this week.",
  "What part of your old life are you secretly relieved to be free from?",
  "What do you want that you've never admitted out loud?",
  "What became clearer to you today?",
  "Where are you being harder on yourself than you deserve?",
  "What's one thing you're genuinely proud of since this all began?",
  "If your wisest self were watching you right now, what would she say?",
  "What does a braver version of you do next?",
  "What small thing would feel like a real act of care toward yourself today?",
];

/* ══════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════ */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --ink: #1E1C1E; --paper: #F0EBE8; --gold: #C49090; --gold-dim: #A87878;
  --text-dim: #C8B8B8; --text-faint: #A89898;
  --border: rgba(196,144,144,0.28); --border-strong: rgba(196,144,144,0.55);
  --pause-red: #8B3A3A; --pause-red-dim: rgba(139,58,58,0.15);
  --grain: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
}
html, body { height: 100%; background: #1E1C1E; }
body { font-family: 'Crimson Pro', Georgia, serif; background: var(--ink); color: var(--paper); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 2px; }

/* WELCOME */
.welcome { min-height: 100vh; display: flex; flex-direction: column; align-items: center; position: relative; overflow-x: hidden; overflow-y: auto; padding: 3rem 2rem 1.5rem; background: #1E1C1E; }
.welcome::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 20% 30%, rgba(160,110,110,0.14) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 70%, rgba(100,70,70,0.18) 0%, transparent 60%); pointer-events: none; }
.welcome::after { content: ''; position: absolute; inset: 0; background-image: var(--grain); opacity: 0.4; pointer-events: none; }
.welcome-inner { flex: 1 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 700px; width: 100%; text-align: center; animation: fadeUp 1.2s ease forwards; position: relative; z-index: 1; padding: 0.5rem 0 0; margin-bottom: 0; }
.welcome-cta { width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; margin-top: 0.5rem; }
.override-wordmark { display: block; width: 100%; text-align: center; font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 400; letter-spacing: 0.15em; color: #F0EBE8; line-height: 1; margin-bottom: 0.15em; text-shadow: 0 0 40px rgba(196,168,122,0.2); padding-right: 0.15em; box-sizing: border-box; }
.override-wordmark span { color: var(--gold); }
.welcome-eyebrow { font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 0.25em; color: var(--gold); text-transform: uppercase; margin-bottom: 3rem; }
.welcome-rule { width: 1px; height: 60px; background: linear-gradient(to bottom, transparent, var(--gold-dim), transparent); margin: 0 auto 3rem; animation: grow 1.5s ease 0.5s both; }
.welcome-headline { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2.2rem, 6vw, 3.8rem); font-weight: 300; font-style: italic; color: var(--paper); line-height: 1.5; margin-bottom: 1.5rem; opacity: 0; animation: fadeUp 1s ease 0.6s forwards; }
.welcome-body { font-size: 1.25rem; line-height: 1.8; color: var(--text-faint); max-width: 520px; margin: 0 auto 1.5rem; opacity: 0; animation: fadeUp 1s ease 0.9s forwards; }
.welcome-features { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin: 2rem auto; max-width: 580px; text-align: left; opacity: 0; animation: fadeUp 1s ease 1.1s forwards; }
@media (max-width: 520px) { .welcome-features { grid-template-columns: 1fr; } }
.feature-pill { background: rgba(196,144,144,0.05); border: 1px solid var(--border); padding: 0.85rem 1rem; display: flex; align-items: flex-start; gap: 0.75rem; }
.feature-pill-icon { font-size: 1rem; flex-shrink: 0; margin-top: 0.1rem; }
.feature-pill-text { font-size: 1.1rem; line-height: 1.5; color: var(--text-faint); }
.feature-pill-label { font-family: 'DM Mono', monospace; font-size: 0.52rem; letter-spacing: 0.18em; color: var(--gold); text-transform: uppercase; display: block; margin-bottom: 0.25rem; }
.btn-begin { display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem; background: transparent; border: 1px solid var(--gold-dim); color: var(--paper); font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; letter-spacing: 0.15em; padding: 0.9rem 2.5rem; cursor: pointer; transition: all 0.3s ease; margin: 0; opacity: 0; animation: fadeUp 1s ease 1.3s forwards; position: relative; overflow: hidden; text-decoration: none; }
.btn-begin::before { content: ''; position: absolute; inset: 0; background: rgba(196,144,144,0.08); transform: translateX(-100%); transition: transform 0.4s ease; }
.btn-begin:hover { border-color: var(--gold); } .btn-begin:hover::before { transform: translateX(0); }
.welcome-preview-link { display: block; margin: 1.25rem 0 0; background: none; border: none; font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-faint); cursor: pointer; opacity: 0; animation: fadeUp 1s ease 1.4s forwards; transition: color 0.2s; text-align: center; }
.welcome-preview-link:hover { color: var(--gold-dim); }
.welcome-footer { position: relative; flex-shrink: 0; width: 100%; max-width: 700px; margin: 0 auto; padding: 1rem 1rem 0.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.65rem; z-index: 2; }
.welcome-mark { font-family: 'DM Mono', monospace; font-size: 0.48rem; letter-spacing: 0.3em; color: rgba(196,144,144,0.16); text-transform: uppercase; }
.preview-lock { font-family: 'DM Mono', monospace; font-size: 0.58rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold-dim); border: 1px solid var(--border); padding: 1.25rem 1.5rem; text-align: center; background: rgba(196,144,144,0.04); line-height: 1.6; }
.tool-card.locked { cursor: default; }
.tool-card.locked:hover { border-color: var(--border); }
.tool-card.locked:hover::after { transform: scaleY(0); }
.tool-card.locked .tool-badge { color: var(--gold-dim); border-color: var(--border); }

/* SHELL */
.app-shell { min-height: 100vh; display: flex; flex-direction: column; background: #1E1C1E; }
.top-nav { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1.5rem; background: rgba(28,26,28,0.94); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); gap: 1rem; }
.nav-wordmark { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.2rem; font-weight: 400; letter-spacing: 0.3em; color: #F0EBE8; cursor: pointer; flex-shrink: 0; }
.nav-wordmark span { color: var(--gold); }
.nav-tabs { display: flex; gap: 0.15rem; flex-wrap: wrap; }
.nav-tab { background: transparent; border: none; color: var(--text-faint); font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.12em; text-transform: uppercase; padding: 0.4rem 0.7rem; cursor: pointer; transition: color 0.2s; border-bottom: 1px solid transparent; white-space: nowrap; }
.nav-tab:hover { color: var(--paper); } .nav-tab.active { color: var(--gold); border-bottom-color: var(--gold); }
.nav-tab.pause-tab { color: rgba(200,100,80,0.7); }
.nav-tab.pause-tab:hover { color: #C49090; }
.nav-tab.pause-tab.active { color: #C49090; border-bottom-color: #C49090; }
.nav-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; justify-content: flex-end; }
.nav-pricing-link { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold-dim); border: 1px solid var(--border); padding: 0.4rem 0.75rem; text-decoration: none; white-space: nowrap; flex-shrink: 0; transition: color 0.2s, border-color 0.2s; background: transparent; cursor: pointer; }
.nav-pricing-link:hover:not(:disabled) { color: var(--gold); border-color: var(--border-strong); }
.nav-pricing-link:disabled { opacity: 0.55; cursor: default; }
.nav-logout {
  background: transparent;
  border: none;
  font-family: 'DM Mono', monospace;
  font-size: 0.56rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-faint);
  padding: 0.4rem 0.5rem;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color 0.2s;
}
.nav-logout:hover { color: var(--text-dim); }
.progress-bar-container { width: 100%; height: 2px; background: rgba(255,255,255,0.04); }
.progress-bar-fill { height: 100%; background: linear-gradient(to right, #B07878, #C49090); transition: width 0.6s ease; }

/* CHAPTER MAP */
.chapter-map { padding: 2.5rem 2rem; max-width: 960px; margin: 0 auto; width: 100%; }
.map-header { text-align: center; margin-bottom: 2.5rem; }
.map-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(1.8rem, 5vw, 3rem); font-weight: 300; color: var(--paper); margin-bottom: 0.4rem; }
.map-subtitle { font-size: 1.25rem; color: var(--text-faint); font-style: italic; margin-bottom: 1.5rem; }
.progress-summary { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.progress-label { font-family: 'DM Mono', monospace; font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-faint); }
.progress-count { font-family: 'DM Mono', monospace; font-size: 0.55rem; color: var(--gold-dim); }
.chapters-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
@media (max-width: 640px) { .chapters-grid { grid-template-columns: 1fr; } }
.chapter-card { position: relative; border: 1px solid var(--border); padding: 1.75rem 1.5rem; cursor: pointer; transition: all 0.35s ease; overflow: hidden; background: rgba(255,255,255,0.015); }
.chapter-card::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 0.35s ease; }
.chapter-card:nth-child(1)::before { background: radial-gradient(circle at 30% 40%, rgba(160,110,110,0.14), transparent 70%); }
.chapter-card:nth-child(2)::before { background: radial-gradient(circle at 70% 40%, rgba(107,127,139,0.14), transparent 70%); }
.chapter-card:nth-child(3)::before { background: radial-gradient(circle at 50% 40%, rgba(123,139,107,0.14), transparent 70%); }
.chapter-card:hover { border-color: var(--border-strong); transform: translateY(-2px); } .chapter-card:hover::before { opacity: 1; }
.chapter-number { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 0.75rem; letter-spacing: 0.3em; color: var(--text-faint); margin-bottom: 0.6rem; font-style: italic; }
.chapter-icon { font-size: 1.4rem; margin-bottom: 0.8rem; display: block; }
.chapter-name { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.7rem; font-weight: 300; color: var(--paper); margin-bottom: 0.25rem; }
.chapter-tagline { font-size: 1.1rem; color: var(--text-faint); font-style: italic; margin-bottom: 1rem; }
.chapter-desc { font-size: 1rem; line-height: 1.7; color: var(--text-dim); }
.chapter-dots { margin-top: 1.25rem; display: flex; gap: 0.35rem; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border-strong); }
.dot.done { background: var(--gold); }

/* CHAPTER DETAIL */
.chapter-detail { max-width: 860px; margin: 0 auto; padding: 2.5rem 2rem; width: 100%; animation: fadeUp 0.4s ease; }
.back-btn { display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; border: none; color: var(--text-faint); font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; padding: 0; margin-bottom: 2rem; transition: color 0.2s; }
.back-btn:hover { color: var(--paper); }
.chapter-header { display: flex; align-items: flex-start; gap: 1.5rem; margin-bottom: 2.5rem; padding-bottom: 2rem; border-bottom: 1px solid var(--border); }
.ch-icon { font-size: 2.5rem; line-height: 1; flex-shrink: 0; }
.ch-text h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2rem, 6vw, 3.5rem); font-weight: 300; color: var(--paper); line-height: 1.1; }
.ch-text .roman { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 0.95rem; letter-spacing: 0.3em; color: var(--gold-dim); display: block; margin-bottom: 0.35rem; font-style: italic; }
.ch-text p { font-size: 1.1rem; line-height: 1.75; color: var(--text-dim); margin-top: 0.65rem; max-width: 520px; }

/* DETAIL COLUMNS */
.detail-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
@media (max-width: 680px) { .detail-cols { grid-template-columns: 1fr; } }
.col-label { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem; }
.col-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

/* TASKS */
.tasks-list { display: flex; flex-direction: column; gap: 0.75rem; }
.task-item { display: flex; align-items: flex-start; gap: 0.85rem; padding: 0.9rem; border: 1px solid var(--border); background: rgba(255,255,255,0.015); cursor: pointer; transition: all 0.25s; }
.task-item:hover { border-color: var(--border-strong); }
.task-item.done { opacity: 0.55; }
.task-check { width: 16px; height: 16px; border: 1px solid var(--gold-dim); border-radius: 50%; flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center; transition: all 0.25s; }
.task-item.done .task-check { background: var(--gold-dim); border-color: var(--gold-dim); }
.task-check-inner { width: 6px; height: 6px; border-radius: 50%; background: var(--ink); opacity: 0; transition: opacity 0.2s; }
.task-item.done .task-check-inner { opacity: 1; }
.task-text { font-size: 1.1rem; line-height: 1.65; color: var(--text-dim); }
.task-item.done .task-text { text-decoration: line-through; color: var(--text-faint); }
.tasks-unlock-prompt {
  font-family: 'DM Mono', monospace;
  font-size: 0.56rem;
  letter-spacing: 0.1em;
  color: var(--gold-dim);
  border: 1px solid var(--border);
  padding: 1rem 1.1rem;
  text-align: center;
  background: rgba(196,144,144,0.03);
  text-decoration: none;
  display: block;
  transition: color 0.2s, border-color 0.2s;
}
.tasks-unlock-prompt:hover { color: var(--gold); border-color: var(--border-strong); }
.task-expand-btn { background: transparent; border: none; color: var(--text-faint); font-family: 'DM Mono', monospace; font-size: 0.52rem; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; padding: 0.35rem 0 0 1.85rem; transition: color 0.2s; display: block; text-align: left; }
.task-expand-btn:hover { color: var(--gold); }
.task-notes-area { padding: 0.85rem 0.85rem 0.85rem 1.85rem; border-top: 1px solid var(--border); margin-top: 0.5rem; animation: fadeUp 0.25s ease; }
.task-note-textarea { width: 100%; min-height: 90px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); color: var(--paper); font-family: 'Crimson Pro', Georgia, serif; font-size: 1.1rem; line-height: 1.75; padding: 0.75rem 1rem; resize: vertical; outline: none; transition: border-color 0.25s; caret-color: var(--gold); margin-bottom: 0.6rem; }
.task-note-textarea:focus { border-color: var(--border-strong); }
.task-note-textarea::placeholder { color: var(--text-faint); font-style: italic; }
.task-saved-notes { margin-top: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem; }
.task-note-entry { border-left: 2px solid var(--border-strong); padding: 0.5rem 0.75rem; }
.task-note-entry-date { font-family: 'DM Mono', monospace; font-size: 0.48rem; letter-spacing: 0.12em; color: var(--gold-dim); margin-bottom: 0.3rem; }
.task-note-entry-text { font-size: 1rem; line-height: 1.65; color: var(--text-dim); }

/* TOOLS */
.tools-list { display: flex; flex-direction: column; gap: 1rem; }
.tool-card { border: 1px solid var(--border); padding: 1.5rem; cursor: pointer; transition: all 0.3s ease; position: relative; background: rgba(255,255,255,0.015); overflow: hidden; }
.tool-card::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--gold); transform: scaleY(0); transform-origin: bottom; transition: transform 0.3s ease; }
.tool-card:hover { border-color: var(--border-strong); } .tool-card:hover::after { transform: scaleY(1); }
.tool-card.completed::after { transform: scaleY(1); opacity: 0.5; }
.tool-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.65rem; }
.tool-left { flex: 1; }
.tool-icon { font-size: 1rem; color: var(--gold-dim); margin-bottom: 0.4rem; display: block; }
.tool-name { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.3rem; font-weight: 400; color: var(--paper); margin-bottom: 0.15rem; }
.tool-sub { font-size: 1.1rem; color: var(--text-faint); font-style: italic; }
.tool-badge { font-family: 'DM Mono', monospace; font-size: 0.5rem; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.25rem 0.55rem; border: 1px solid var(--border); color: var(--text-faint); flex-shrink: 0; }
.tool-badge.done { color: var(--gold); border-color: rgba(196,168,122,0.4); }
.tool-insight { background: rgba(196,144,144,0.04); border-left: 2px solid var(--gold-dim); padding: 0.65rem 0.9rem; margin-top: 0.65rem; }
.insight-label { font-family: 'DM Mono', monospace; font-size: 0.48rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 0.3rem; }
.tool-insight p { font-size: 1.1rem; line-height: 1.7; color: var(--text-dim); font-style: italic; }

/* WORKSPACE */
.workspace { max-width: 760px; margin: 0 auto; padding: 2.5rem 2rem; width: 100%; animation: fadeUp 0.4s ease; }
.ws-chapter { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 0.65rem; }
.ws-name { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(1.8rem, 5vw, 2.8rem); font-weight: 300; color: var(--paper); margin-bottom: 0.25rem; }
.ws-sub { font-size: 1.1rem; color: var(--text-faint); font-style: italic; margin-bottom: 2rem; }
.insight-box { background: rgba(196,144,144,0.04); border: 1px solid var(--border); border-left: 2px solid var(--gold-dim); padding: 0.95rem 1.15rem; margin-bottom: 2rem; }
.insight-box .insight-label { margin-bottom: 0.35rem; }
.insight-box p { font-size: 1.1rem; line-height: 1.75; color: var(--text-dim); font-style: italic; }
.ws-rule { height: 1px; background: linear-gradient(to right, var(--gold-dim), transparent); margin: 0 0 1.75rem; }
.prompt-label { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-faint); margin-bottom: 0.65rem; }
.prompt-text { font-size: 1.25rem; line-height: 1.8; color: var(--text-dim); margin-bottom: 1.5rem; white-space: pre-line; }
.ws-textarea { width: 100%; min-height: 210px; background: rgba(255,255,255,0.025); border: 1px solid var(--border); color: var(--paper); font-family: 'Crimson Pro', Georgia, serif; font-size: 1.25rem; line-height: 1.8; padding: 1.1rem 1.4rem; resize: vertical; outline: none; transition: border-color 0.3s; caret-color: var(--gold); }
.ws-textarea:focus { border-color: var(--border-strong); }
.ws-textarea::placeholder { color: var(--text-faint); font-style: italic; }
.ws-actions { display: flex; gap: 1rem; margin-top: 1rem; align-items: center; flex-wrap: wrap; }
.btn-main { background: transparent; border: 1px solid var(--gold-dim); color: var(--paper); font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; letter-spacing: 0.08em; padding: 0.7rem 1.9rem; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; }
.btn-main::before { content: ''; position: absolute; inset: 0; background: rgba(196,144,144,0.1); transform: translateX(-100%); transition: 0.3s ease; }
.btn-main:hover::before { transform: translateX(0); } .btn-main:hover { border-color: var(--gold); }
.btn-main:disabled { opacity: 0.35; cursor: not-allowed; }
.btn-ghost { background: transparent; border: none; color: var(--text-faint); font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; padding: 0.7rem 0; transition: color 0.2s; }
.btn-ghost:hover { color: var(--paper); }
.ai-block { margin-top: 2.5rem; animation: fadeUp 0.6s ease; }
.ai-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.1rem; }
.ai-label { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold-dim); }
.ai-line { flex: 1; height: 1px; background: linear-gradient(to right, var(--border-strong), transparent); }
.ai-body { font-size: 1.2rem; line-height: 1.95; color: var(--text-dim); white-space: pre-wrap; font-style: normal; padding: 1.4rem; border: 1px solid var(--border); border-left: 2px solid var(--gold-dim); background: rgba(196,144,144,0.03); }
.dots { display: flex; gap: 0.4rem; padding: 0.8rem 1.2rem; }
.dot-anim { width: 5px; height: 5px; border-radius: 50%; background: var(--gold-dim); animation: pulse 1.2s ease-in-out infinite; }
.dot-anim:nth-child(2) { animation-delay: 0.2s; } .dot-anim:nth-child(3) { animation-delay: 0.4s; }

/* WEATHER TRACKER */
.weather-page { max-width: 720px; margin: 0 auto; padding: 2.5rem 2rem; width: 100%; }
.page-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2rem, 5vw, 3rem); font-weight: 300; color: var(--paper); margin-bottom: 0.4rem; }
.page-sub { font-size: 1.25rem; color: var(--text-faint); font-style: italic; margin-bottom: 0.5rem; }
.page-desc { font-size: 1rem; line-height: 1.7; color: var(--text-dim); margin-bottom: 2.5rem; max-width: 500px; }
.weather-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem; margin-bottom: 2rem; }
@media (max-width: 480px) { .weather-grid { grid-template-columns: repeat(2, 1fr); } }
.weather-option { border: 1px solid var(--border); padding: 1.1rem; cursor: pointer; text-align: center; transition: all 0.25s; background: rgba(255,255,255,0.015); }
.weather-option:hover { border-color: var(--border-strong); }
.weather-option.selected { border-color: var(--gold-dim); background: rgba(196,144,144,0.08); }
.weather-emoji { font-size: 1.8rem; display: block; margin-bottom: 0.5rem; }
.weather-label { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; color: var(--paper); margin-bottom: 0.2rem; }
.weather-desc { font-size: 0.7rem; color: var(--text-faint); line-height: 1.4; }
.weather-note-label { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-faint); margin-bottom: 0.6rem; }
.weather-textarea { width: 100%; min-height: 120px; background: rgba(255,255,255,0.025); border: 1px solid var(--border); color: var(--paper); font-family: 'Crimson Pro', Georgia, serif; font-size: 1.25rem; line-height: 1.75; padding: 1rem 1.25rem; resize: vertical; outline: none; transition: border-color 0.3s; caret-color: var(--gold); margin-bottom: 1rem; }
.weather-textarea:focus { border-color: var(--border-strong); }
.weather-textarea::placeholder { color: var(--text-faint); font-style: italic; }
.weather-history { margin-top: 2.5rem; }
.history-label { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-faint); margin-bottom: 1.1rem; display: flex; align-items: center; gap: 1rem; }
.history-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.history-chart { display: flex; align-items: flex-end; gap: 4px; height: 60px; margin-bottom: 1.5rem; }
.chart-bar { flex: 1; border-radius: 2px 2px 0 0; min-width: 8px; transition: opacity 0.2s; opacity: 0.7; cursor: default; position: relative; }
.chart-bar:hover { opacity: 1; }
.chart-bar-tip { position: absolute; bottom: 105%; left: 50%; transform: translateX(-50%); background: rgba(28,26,28,0.95); border: 1px solid var(--border); padding: 0.3rem 0.5rem; font-family: 'DM Mono', monospace; font-size: 0.5rem; letter-spacing: 0.1em; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.2s; }
.chart-bar:hover .chart-bar-tip { opacity: 1; }
.weather-entry { border: 1px solid var(--border); padding: 1rem 1.1rem; margin-bottom: 0.65rem; background: rgba(255,255,255,0.015); display: flex; gap: 1rem; align-items: flex-start; }
.we-emoji { font-size: 1.4rem; flex-shrink: 0; }
.we-meta { flex: 1; }
.we-date { font-family: 'DM Mono', monospace; font-size: 0.5rem; letter-spacing: 0.15em; color: var(--gold-dim); margin-bottom: 0.3rem; }
.we-label { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; color: var(--paper); margin-bottom: 0.25rem; }
.we-note { font-size: 1rem; line-height: 1.6; color: var(--text-dim); font-style: italic; }

/* THE PAUSE */
.pause-page { max-width: 640px; margin: 0 auto; padding: 2.5rem 2rem; width: 100%; }
.pause-header { text-align: center; margin-bottom: 2.5rem; }
.pause-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 300; color: var(--paper); margin-bottom: 0.4rem; }
.pause-sub { font-size: 1rem; color: var(--text-faint); font-style: italic; }
.pause-intro { border: 1px solid rgba(196,144,144,0.3); background: var(--pause-red-dim); padding: 1.4rem; margin-bottom: 2rem; }
.pause-intro-label { font-family: 'DM Mono', monospace; font-size: 0.52rem; letter-spacing: 0.2em; text-transform: uppercase; color: #C49090; margin-bottom: 0.65rem; }
.pause-intro p { font-size: 1rem; line-height: 1.75; color: var(--text-dim); }
.pause-section { margin-bottom: 2rem; }
.pause-section-label { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--text-faint); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem; }
.pause-section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

/* TIMER */
.pause-timer { border: 1px solid var(--border); padding: 2rem; text-align: center; margin-bottom: 2rem; background: rgba(255,255,255,0.015); }
.timer-display { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 4rem; font-weight: 300; color: var(--paper); line-height: 1; margin-bottom: 0.5rem; letter-spacing: 0.05em; }
.timer-label { font-family: 'DM Mono', monospace; font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-faint); margin-bottom: 1.5rem; }
.timer-actions { display: flex; gap: 0.75rem; justify-content: center; }
.btn-timer { background: transparent; border: 1px solid var(--border); color: var(--paper); font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.6rem 1.25rem; cursor: pointer; transition: all 0.25s; }
.btn-timer:hover { border-color: var(--border-strong); }
.btn-timer.start { border-color: rgba(139,58,42,0.5); color: #C49090; }
.btn-timer.start:hover { border-color: #C49090; background: var(--pause-red-dim); }

/* REDIRECT */
.redirect-card { border: 1px solid var(--border); padding: 1.5rem; background: rgba(255,255,255,0.02); margin-bottom: 1rem; }
.redirect-question { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.3rem; font-weight: 300; font-style: italic; color: var(--paper); line-height: 1.5; margin-bottom: 1rem; }
.btn-new-redirect { background: transparent; border: none; color: var(--text-faint); font-family: 'DM Mono', monospace; font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: color 0.2s; padding: 0; }
.btn-new-redirect:hover { color: var(--gold); }
.pause-textarea { width: 100%; min-height: 130px; background: rgba(255,255,255,0.025); border: 1px solid var(--border); color: var(--paper); font-family: 'Crimson Pro', Georgia, serif; font-size: 1.25rem; line-height: 1.78; padding: 1rem 1.25rem; resize: vertical; outline: none; transition: border-color 0.3s; caret-color: var(--gold); }
.pause-textarea:focus { border-color: var(--border-strong); }
.pause-textarea::placeholder { color: var(--text-faint); font-style: italic; }

/* URGE LOG */
.urge-log { margin-top: 0.75rem; }
.urge-entry { border: 1px solid var(--border); padding: 0.85rem 1rem; margin-bottom: 0.55rem; background: rgba(255,255,255,0.015); display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.urge-date { font-family: 'DM Mono', monospace; font-size: 0.5rem; letter-spacing: 0.12em; color: var(--gold-dim); flex-shrink: 0; }
.urge-text { font-size: 1rem; line-height: 1.55; color: var(--text-dim); font-style: italic; flex: 1; }
.urge-survived { font-family: 'DM Mono', monospace; font-size: 0.5rem; letter-spacing: 0.15em; color: var(--gold-dim); text-transform: uppercase; flex-shrink: 0; }

/* DAILY RITUAL */
.ritual-page { max-width: 680px; margin: 0 auto; padding: 2.5rem 2rem; width: 100%; text-align: left; }
.prompt-box { border: 1px solid var(--border); padding: 1.75rem; margin-bottom: 1.5rem; background: rgba(255,255,255,0.02); }
.prompt-eyebrow { font-family: 'DM Mono', monospace; font-size: 0.53rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 0.65rem; }
.prompt-q { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.4rem; font-weight: 300; font-style: italic; color: var(--paper); line-height: 1.5; margin-bottom: 0.9rem; }
.btn-prompt-swap { background: transparent; border: none; color: var(--text-faint); font-family: 'DM Mono', monospace; font-size: 0.53rem; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; transition: color 0.2s; padding: 0; }
.btn-prompt-swap:hover { color: var(--gold); }
.ritual-textarea { width: 100%; min-height: 190px; background: rgba(255,255,255,0.025); border: 1px solid var(--border); color: var(--paper); font-family: 'Crimson Pro', Georgia, serif; font-size: 1.25rem; line-height: 1.85; padding: 1.1rem 1.35rem; resize: vertical; outline: none; transition: border-color 0.3s; caret-color: var(--gold); margin-bottom: 1rem; }
.ritual-textarea:focus { border-color: var(--border-strong); }
.ritual-textarea::placeholder { color: var(--text-faint); font-style: italic; }
.entry-stack { margin-top: 2.5rem; overflow: visible; }
.entry-header { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-faint); margin-bottom: 1.1rem; display: flex; align-items: center; gap: 1rem; }
.entry-header::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.entry-card { border: 1px solid var(--border); padding: 1.1rem; margin-bottom: 0.65rem; background: rgba(255,255,255,0.015); overflow: visible; max-height: none; }
.entry-date { font-family: 'DM Mono', monospace; font-size: 0.5rem; letter-spacing: 0.15em; color: var(--gold-dim); margin-bottom: 0.4rem; }
.entry-prompt-text { font-size: 0.95rem; color: var(--text-faint); font-style: italic; margin-bottom: 0.4rem; white-space: pre-wrap; overflow-wrap: break-word; word-wrap: break-word; }
.entry-body { font-family: 'Crimson Pro', Georgia, serif; font-size: 1.25rem; line-height: 1.7; color: var(--text-dim); display: block; max-height: none; min-height: 0; overflow: visible; text-overflow: clip; white-space: pre-wrap; overflow-wrap: break-word; word-wrap: break-word; -webkit-line-clamp: unset; line-clamp: unset; }
.ws-entries { margin-top: 2rem; }
.ws-entries-toggle { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: rgba(196,144,144,0.04); border: 1px solid var(--border); border-left: 2px solid var(--gold-dim); color: var(--paper); font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.12em; text-transform: uppercase; padding: 0.9rem 1.15rem; cursor: pointer; transition: border-color 0.2s, background 0.2s; text-align: left; }
.ws-entries-toggle:hover { border-color: var(--border-strong); background: rgba(196,144,144,0.08); }
.ws-entries-toggle-label { color: var(--text-faint); transition: color 0.2s; }
.ws-entries-toggle:hover .ws-entries-toggle-label { color: var(--paper); }
.ws-entries-chevron { color: var(--gold-dim); font-size: 0.7rem; line-height: 1; transition: transform 0.25s ease; flex-shrink: 0; }
.ws-entries.open .ws-entries-chevron { transform: rotate(180deg); }
.ws-entries-panel { margin-top: 0.85rem; animation: fadeUp 0.35s ease; }
.entry-writing-label { font-family: 'DM Mono', monospace; font-size: 0.48rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-faint); margin-bottom: 0.35rem; }
.entry-reflection-block { margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px solid var(--border); }
.entry-reflection-label { font-family: 'DM Mono', monospace; font-size: 0.5rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 0.4rem; }
.entry-reflection-body { font-size: 1rem; line-height: 1.75; color: var(--text-faint); font-style: italic; }

/* MY JOURNAL */
.journal-page { max-width: 760px; margin: 0 auto; padding: 2.5rem 2rem; width: 100%; text-align: left; animation: fadeUp 0.4s ease; }
.journal-intro { font-size: 1.1rem; line-height: 1.75; color: var(--text-dim); margin-bottom: 2rem; max-width: 560px; }
.journal-count { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-faint); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem; }
.journal-count::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.journal-empty { font-family: 'Crimson Pro', Georgia, serif; font-size: 1.15rem; line-height: 1.8; color: var(--text-faint); font-style: italic; border: 1px solid var(--border); border-left: 2px solid var(--gold-dim); padding: 2rem 1.5rem; background: rgba(196,144,144,0.03); }
.journal-entry { border: 1px solid var(--border); border-left: 2px solid var(--gold-dim); padding: 1.25rem 1.35rem; margin-bottom: 0.85rem; background: rgba(255,255,255,0.015); overflow: visible; }
.journal-entry-top { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0.35rem 1rem; margin-bottom: 0.5rem; }
.journal-entry-section { font-family: 'DM Mono', monospace; font-size: 0.52rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold-dim); }
.journal-entry-date { font-family: 'DM Mono', monospace; font-size: 0.5rem; letter-spacing: 0.15em; color: var(--text-faint); }
.journal-entry-source { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.25rem; font-weight: 300; color: var(--paper); margin-bottom: 0.5rem; line-height: 1.35; }
.journal-entry-prompt { font-family: 'Crimson Pro', Georgia, serif; font-size: 1.1rem; line-height: 1.65; color: var(--text-faint); font-style: italic; margin-bottom: 0.65rem; }
.journal-entry-body { font-family: 'Crimson Pro', Georgia, serif; font-size: 1.15rem; line-height: 1.75; color: var(--text-dim); white-space: pre-wrap; overflow-wrap: break-word; }
.journal-entry-reflection { margin-top: 0.9rem; padding-top: 0.9rem; border-top: 1px solid var(--border); }
.journal-entry-reflection .entry-reflection-label { margin-bottom: 0.45rem; }
.journal-entry-reflection .entry-reflection-body { font-size: 1.1rem; }

/* PHILOSOPHY */
.philosophy { max-width: 700px; margin: 0 auto; padding: 2.5rem 2rem 5rem; animation: fadeUp 0.5s ease; }
.phil-section { margin-bottom: 2.75rem; }
.phil-label { font-family: 'DM Mono', monospace; font-size: 0.56rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 0.85rem; }
.phil-heading { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(1.5rem, 4vw, 2.4rem); font-weight: 300; color: var(--paper); margin-bottom: 0.9rem; line-height: 1.2; }
.phil-body { font-size: 1.25rem; line-height: 1.9; color: var(--text-dim); }
.phil-body + .phil-body { margin-top: 0.9rem; }
.phil-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; margin-top: 1.25rem; }
@media (max-width: 500px) { .phil-grid { grid-template-columns: 1fr; } }
.phil-card { border: 1px solid var(--border); padding: 1.1rem; background: rgba(255,255,255,0.02); }
.phil-card-icon { font-size: 0.95rem; color: var(--gold-dim); margin-bottom: 0.65rem; display: block; }
.phil-card-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.05rem; color: var(--paper); margin-bottom: 0.35rem; }
.phil-card-text { font-size: 0.95rem; line-height: 1.65; color: var(--text-faint); }
.phil-disclaimer { margin-top: 3rem; font-family: 'Crimson Pro', Georgia, serif; font-size: 0.6rem; font-style: italic; line-height: 1.85; color: rgba(196,144,144,0.5); text-align: center; opacity: 0.45; }
.phil-disclaimer a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }

/* TOAST & MARK */
.toast { position: fixed; bottom: 2rem; right: 2rem; background: rgba(28,26,28,0.97); border: 1px solid var(--gold-dim); color: var(--paper); font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.7rem 1.15rem; z-index: 200; animation: fadeUp 0.3s ease; }
.welcome-legal-links { display: flex; align-items: center; justify-content: center; gap: 0.6rem; font-family: 'DM Mono', monospace; font-size: 0.48rem; letter-spacing: 0.22em; text-transform: uppercase; }
.welcome-legal-links a { color: rgba(196,144,144,0.28); text-decoration: none; transition: color 0.2s; }
.welcome-legal-links a:hover { color: rgba(196,144,144,0.5); }
.welcome-legal-links span { color: rgba(196,144,144,0.16); pointer-events: none; }
.override-mark { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); font-family: 'DM Mono', monospace; font-size: 0.48rem; letter-spacing: 0.3em; color: rgba(196,144,144,0.16); text-transform: uppercase; pointer-events: none; z-index: 10; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
`;

/* ══════════════════════════════════════════════
   WEATHER COLORS
══════════════════════════════════════════════ */
const WEATHER_COLORS = {
  storm: "#5A3A3A", fog: "#4A4A5A", cloud: "#4A5060",
  clearing: "#5A6050", calm: "#3A4050", bright: "#7A6A40",
};
const WEATHER_HEIGHTS = { storm: 1, fog: 2, cloud: 3, clearing: 4, calm: 4.5, bright: 6 };

/* ══════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════ */

/* ── STORAGE HELPERS ── */
async function storageGet(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function storageSet(key, value) {
  try { await window.storage.set(key, JSON.stringify(value)); } catch {}
}

const PREVIEW_LOCK_MSG = "Preview only — unlock with Override";

function PreviewLock() {
  return <div className="preview-lock">{PREVIEW_LOCK_MSG}</div>;
}

export default function Override() {
  const location = useLocation();
  const { isLoggedIn, hasPaid, loading: authLoading } = useAuth();
  const { checkout: startCheckout, loading: checkoutLoading } = useStripeCheckout();
  const isProgramRoute = location.pathname === "/program";
  const isPreviewLocked = authLoading || !hasPaid;

  const [screen, setScreen] = useState(() => (isProgramRoute ? "app" : "welcome"));
  const [activeChapter, setActiveChapter] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [userText, setUserText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  // Persistent state
  const [completedTools, setCompletedTools] = useState(new Set());
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [toolEntries, setToolEntries] = useState({});   // { "chapterId:toolId": [{date, text, reflection}] }
  const [weatherLog, setWeatherLog] = useState([]);
  const [urgeLog, setUrgeLog] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);

  const [taskNotes, setTaskNotes] = useState({});
  const [expandedTask, setExpandedTask] = useState(null);
  const [taskDraftText, setTaskDraftText] = useState({});
  const [activeNav, setActiveNav] = useState("program");

  // Weather UI state
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [weatherNote, setWeatherNote] = useState("");

  // Pause state
  const [pauseText, setPauseText] = useState("");
  const [pauseRedirectIdx, setPauseRedirectIdx] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);

  // Daily ritual
  const [dailyText, setDailyText] = useState("");
  const [dailyPromptIdx, setDailyPromptIdx] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toolEntriesOpen, setToolEntriesOpen] = useState(false);

  // Inject styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Load all persisted data on mount
  useEffect(() => {
    async function loadAll() {
      const [cTools, cTasks, tEntries, wLog, uLog, jEntries, tNotes] = await Promise.all([
        storageGet("completedTools"),
        storageGet("completedTasks"),
        storageGet("toolEntries"),
        storageGet("weatherLog"),
        storageGet("urgeLog"),
        storageGet("journalEntries"),
        storageGet("taskNotes"),
      ]);
      if (cTools) setCompletedTools(new Set(cTools));
      if (cTasks) setCompletedTasks(new Set(cTasks));
      if (tEntries) setToolEntries(tEntries);
      if (wLog) setWeatherLog(wLog);
      if (uLog) setUrgeLog(uLog);
      if (jEntries) setJournalEntries(jEntries);
      if (tNotes) setTaskNotes(tNotes);
      setStorageReady(true);
    }
    loadAll();
    setDailyPromptIdx(Math.floor(Math.random() * DAILY_PROMPTS.length));
    setPauseRedirectIdx(Math.floor(Math.random() * PAUSE_REDIRECTS.length));
  }, []);

  useEffect(() => {
    setToolEntriesOpen(false);
  }, [activeTool?.id, activeChapter?.id]);

  // Timer
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    } else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const toast = (msg) => { setShowToast(msg); setTimeout(() => setShowToast(false), 2500); };

  const navReset = (nav) => {
    setActiveNav(nav); setActiveChapter(null); setActiveTool(null);
    setAiResponse(""); setUserText(""); setToolEntriesOpen(false);
  };

  // Persist helpers
  const saveCompletedTools = (next) => { setCompletedTools(next); storageSet("completedTools", [...next]); };
  const saveCompletedTasks = (next) => { setCompletedTasks(next); storageSet("completedTasks", [...next]); };
  const saveToolEntries = (next) => { setToolEntries(next); storageSet("toolEntries", next); };
  const saveWeatherLog = (next) => { setWeatherLog(next); storageSet("weatherLog", next); };
  const saveUrgeLog = (next) => { setUrgeLog(next); storageSet("urgeLog", next); };
  const saveJournalEntries = (next) => { setJournalEntries(next); storageSet("journalEntries", next); };
  const saveTaskNotes = (next) => { setTaskNotes(next); storageSet("taskNotes", next); };

  const callClaude = useCallback(async (systemPrompt, userContent) => {
    setLoading(true);
    setAiResponse("");
    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userContent }]
        })
      });
      const data = await res.json();
      if (data.content && data.content[0]) {
        setAiResponse(data.content[0].text);
      } else {
        setAiResponse(JSON.stringify(data));
      }
    } catch (err) {
      setAiResponse("Something went quiet. Please try again.");
      console.error(err);
    }
    setLoading(false);
  }, []);

  const formatTimer = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const now = () => ({
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    dateShort: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
  });

  const totalTools = CHAPTERS.reduce((a, c) => a + c.tools.length, 0);
  const totalTasks = CHAPTERS.reduce((a, c) => a + c.weeklyTasks.length, 0);
  const progress = Math.round(((completedTools.size + completedTasks.size) / (totalTools + totalTasks)) * 100);

  const allJournalEntries = useMemo(
    () => buildAllJournalEntries({ toolEntries, journalEntries, taskNotes, urgeLog, weatherLog }),
    [toolEntries, journalEntries, taskNotes, urgeLog, weatherLog],
  );

  useEffect(() => {
    if (authLoading) return;

    if (isProgramRoute && !isLoggedIn) {
      window.location.href = "/auth";
      return;
    }

    if (isProgramRoute || isLoggedIn) {
      setScreen("app");
    }
  }, [authLoading, isProgramRoute, isLoggedIn]);

  const handleLogout = () => {
    Promise.race([
      supabase.auth.signOut(),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]).finally(() => {
      window.location.href = "/auth";
    });
  };

  /* ── WELCOME */
  if (screen === "welcome") {
    return (
      <div className="welcome">
        <div className="welcome-inner">
          <div className="override-wordmark">O<span>V</span>ERRIDE</div>
          <div className="welcome-eyebrow">A program for identity reconstruction</div>
          <div className="welcome-rule" />
          <h1 className="welcome-headline">You're the author now.</h1>
          <p className="welcome-body">You've been through heartbreak or divorce. Now comes the part where you decide who you become.</p>
          <div className="welcome-features">
            {[
              ["◎", "Structured Program", "Three chapters of deep reflective tools that move in sequence — Grieve, Rediscover, Reclaim."],
              ["◇", "Identity Tasks", "Weekly real-world micro-challenges that build a new self through action, not just insight."],
              ["🌤", "Emotional Weather", "A private, pattern-aware tracking system that honours how you actually feel day to day."],
              ["✦", "The Pause", "A 'don't contact your ex' intervention — turning the urge into self-knowledge instead of a mistake."],
            ].map(([icon, label, text]) => (
              <div className="feature-pill" key={label}>
                <span className="feature-pill-icon">{icon}</span>
                <div className="feature-pill-text">
                  <span className="feature-pill-label">{label}</span>
                  {text}
                </div>
              </div>
            ))}
          </div>
          <div className="welcome-cta">
            <Link to="/auth" className="btn-begin">
              Begin your program <span style={{ color: "var(--gold)" }}>→</span>
            </Link>
            <button type="button" className="welcome-preview-link" onClick={() => setScreen("app")}>
              Or explore a preview →
            </button>
          </div>
        </div>
        <footer className="welcome-footer">
          <nav className="welcome-legal-links" aria-label="Legal">
            <Link to="/terms">Terms</Link>
            <span aria-hidden="true">·</span>
            <Link to="/privacy">Privacy</Link>
          </nav>
          <div className="welcome-mark">OVERRIDE · Identity Reconstruction Program</div>
        </footer>
      </div>
    );
  }

  /* ── RENDER */
  const renderContent = () => {

    /* Tool workspace */
    if (activeTool && activeChapter) {
      const toolKey = `${activeChapter.id}:${activeTool.id}`;
      const isDone = completedTools.has(toolKey);
      const entries = toolEntries[toolKey] || [];
      if (isPreviewLocked) {
        return (
          <div className="workspace">
            <button className="back-btn" onClick={() => { setActiveTool(null); setAiResponse(""); setUserText(""); }}>← Back to {activeChapter.name}</button>
            <div className="ws-chapter">Chapter {activeChapter.number} · {activeChapter.name}</div>
            <div className="ws-name">{activeTool.name}</div>
            <div className="ws-sub">{activeTool.subtitle}</div>
            <div className="insight-box">
              <div className="insight-label">Why this tool</div>
              <p>{activeTool.insight}</p>
            </div>
            <div className="ws-rule" />
            <PreviewLock />
          </div>
        );
      }

      const handleSaveEntry = () => {
        if (!userText.trim()) return;
        const entry = { ...now(), text: userText, reflection: aiResponse };
        const next = { ...toolEntries, [toolKey]: [entry, ...entries] };
        saveToolEntries(next);
        toast("Entry saved ✦");
      };

      const handleMarkDone = () => {
        // Save current entry before marking done
        if (userText.trim()) {
          const entry = { ...now(), text: userText, reflection: aiResponse };
          const next = { ...toolEntries, [toolKey]: [entry, ...entries] };
          saveToolEntries(next);
        }
        const next = new Set([...completedTools, toolKey]);
        saveCompletedTools(next);
        toast("Marked complete ✦");
        setActiveTool(null); setUserText(""); setAiResponse("");
      };

      return (
        <div className="workspace">
          <button className="back-btn" onClick={() => { setActiveTool(null); setAiResponse(""); setUserText(""); }}>← Back to {activeChapter.name}</button>
          <div className="ws-chapter">Chapter {activeChapter.number} · {activeChapter.name}</div>
          <div className="ws-name">{activeTool.name}</div>
          <div className="ws-sub">{activeTool.subtitle}</div>
          <div className="insight-box">
            <div className="insight-label">Why this tool</div>
            <p>{activeTool.insight}</p>
          </div>
          <div className="ws-rule" />
          <div className="prompt-label">Your prompt</div>
          <div className="prompt-text">{activeTool.prompt}</div>
          <textarea className="ws-textarea" placeholder={activeTool.placeholder} value={userText} onChange={(e) => setUserText(e.target.value)} />
          <div className="ws-actions">
            <button className="btn-main" onClick={() => callClaude(activeTool.systemPrompt, userText)} disabled={loading || !userText.trim()}>{loading ? "Reflecting…" : "Get your reflection →"}</button>
            {userText.trim() && !loading && (
              <button className="btn-ghost" onClick={handleSaveEntry}>Save entry</button>
            )}
            {!isDone && entries.length > 0 && (
              <button className="btn-ghost" onClick={handleMarkDone}>Mark complete</button>
            )}
            {isDone && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.56rem", letterSpacing: "0.15em", color: "var(--gold)", textTransform: "uppercase" }}>✦ Complete</span>}
          </div>

          {entries.length > 0 && (
            <div className={`ws-entries${toolEntriesOpen ? " open" : ""}`}>
              <button
                type="button"
                className="ws-entries-toggle"
                onClick={() => setToolEntriesOpen((open) => !open)}
                aria-expanded={toolEntriesOpen}
              >
                <span className="ws-entries-toggle-label">Your previous entries ({entries.length})</span>
                <span className="ws-entries-chevron" aria-hidden="true">{toolEntriesOpen ? "▴" : "▾"}</span>
              </button>
              {toolEntriesOpen && (
                <div className="ws-entries-panel">
                  {entries.map((e, i) => (
                    <div key={`${e.date}-${e.time}-${i}`} className="entry-card">
                      <div className="entry-date">{e.date}{e.time ? ` · ${e.time}` : ""}</div>
                      <div className="entry-writing-label">Your writing</div>
                      <div className="entry-body">{e.text}</div>
                      {e.reflection && (
                        <div className="entry-reflection-block">
                          <div className="entry-reflection-label">AI reflection</div>
                          <div className="entry-reflection-body">{e.reflection}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(loading || aiResponse) && (
            <div className="ai-block">
              <div className="ai-header"><span className="ai-label">Your reflection</span><div className="ai-line" /></div>
              {loading
                ? <div className="ai-body"><div className="dots"><div className="dot-anim" /><div className="dot-anim" /><div className="dot-anim" /></div></div>
                : (
                  <>
                    <div className="ai-body">{aiResponse}</div>
                    <button className="btn-ghost" style={{ marginTop: "0.75rem" }} onClick={handleSaveEntry}>Save this entry ✦</button>
                  </>
                )}
            </div>
          )}
        </div>
      );
    }

    /* Chapter detail */
    if (activeChapter && activeNav === "program") {
      return (
        <div className="chapter-detail">
          <button className="back-btn" onClick={() => setActiveChapter(null)}>← All chapters</button>
          <div className="chapter-header">
            <div className="ch-icon">{activeChapter.icon}</div>
            <div className="ch-text">
              <span className="roman">Chapter {activeChapter.number}</span>
              <h2>{activeChapter.name}</h2>
              <p>{activeChapter.description}</p>
            </div>
          </div>
          <div className="detail-cols">
            {/* Tasks col */}
            <div>
              <div className="col-label">Weekly Tasks</div>
              <div className="tasks-list">
                {activeChapter.weeklyTasks.map((task, taskIndex) => {
                  if (isPreviewLocked && taskIndex > 0) return null;

                  const done = completedTasks.has(task.id);
                  const isExpanded = expandedTask === task.id;
                  const notes = taskNotes[task.id] || [];
                  const draft = taskDraftText[task.id] || "";
                  return (
                    <div key={task.id} className={`task-item${done ? " done" : ""}`} style={{ flexDirection: "column", alignItems: "stretch", cursor: "default" }}>
                      {/* Top row — tick + text */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", cursor: "pointer" }}
                        onClick={() => {
                          const n = new Set(completedTasks);
                          done ? n.delete(task.id) : n.add(task.id);
                          saveCompletedTasks(n);
                        }}>
                        <div className="task-check"><div className="task-check-inner" /></div>
                        <div className="task-text">{task.text}</div>
                      </div>
                      {/* Notes toggle */}
                      <button className="task-expand-btn" onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                        {isExpanded ? "Hide notes ↑" : `Notes${notes.length > 0 ? ` (${notes.length})` : " +"}`}
                      </button>
                      {/* Expanded notes area */}
                      {isExpanded && (
                        <div className="task-notes-area">
                          <textarea
                            className="task-note-textarea"
                            placeholder="Write here — what did you do, notice, or feel?"
                            value={draft}
                            onChange={(e) => setTaskDraftText((p) => ({ ...p, [task.id]: e.target.value }))}
                          />
                          <button className="btn-ghost" style={{ fontSize: "0.58rem", padding: "0.4rem 0" }}
                            disabled={!draft.trim()}
                            onClick={() => {
                              const t = now();
                              const entry = { date: t.date, time: t.time, text: draft };
                              const next = { ...taskNotes, [task.id]: [entry, ...(taskNotes[task.id] || [])] };
                              saveTaskNotes(next);
                              setTaskDraftText((p) => ({ ...p, [task.id]: "" }));
                              toast("Note saved ✦");
                            }}>
                            Save note ✦
                          </button>
                          {notes.length > 0 && (
                            <div className="task-saved-notes">
                              {notes.map((n, i) => (
                                <div key={i} className="task-note-entry">
                                  <div className="task-note-entry-date">{n.date} · {n.time}</div>
                                  <div className="task-note-entry-text">{n.text}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {isPreviewLocked && activeChapter.weeklyTasks.length > 1 && (
                  <Link to="/pricing" className="tasks-unlock-prompt">
                    Unlock all tasks with Override →
                  </Link>
                )}
              </div>
            </div>
            {/* Tools col */}
            <div>
              <div className="col-label">Reflection Tools</div>
              <div className="tools-list">
                {activeChapter.tools.map((tool) => {
                  const isDone = completedTools.has(`${activeChapter.id}:${tool.id}`);
                  const isLocked = isPreviewLocked;
                  return (
                    <div
                      key={tool.id}
                      className={`tool-card${isDone ? " completed" : ""}${isLocked ? " locked" : ""}`}
                      onClick={() => {
                        if (isLocked) return;
                        setActiveTool(tool);
                        setUserText("");
                        setAiResponse("");
                      }}
                    >
                      <div className="tool-top">
                        <div className="tool-left">
                          <span className="tool-icon">{tool.icon}</span>
                          <div className="tool-name">{tool.name}</div>
                          <div className="tool-sub">{tool.subtitle}</div>
                        </div>
                        <div className={`tool-badge${isDone ? " done" : ""}`}>{isLocked ? "Preview" : isDone ? "Done" : "Open"}</div>
                      </div>
                      {isLocked ? (
                        <PreviewLock />
                      ) : (
                        <div className="tool-insight">
                          <div className="insight-label">Why this exists</div>
                          <p>{tool.insight}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    /* Program overview */
    if (activeNav === "program") {
      return (
        <div className="chapter-map">
          <div className="map-header">
            <h2 className="map-title">Your Program</h2>
            <p className="map-subtitle">Three chapters. Nine tools. Fifteen real-world tasks.</p>
            <div className="progress-summary">
              <span className="progress-label">Overall Progress</span>
              <span className="progress-count">{completedTools.size + completedTasks.size}/{totalTools + totalTasks} · {progress}%</span>
            </div>
            <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="chapters-grid">
            {CHAPTERS.map((chapter) => {
              const doneTasks = chapter.weeklyTasks.filter((t) => completedTasks.has(t.id)).length;
              const doneTools = chapter.tools.filter((t) => completedTools.has(`${chapter.id}:${t.id}`)).length;
              return (
                <div key={chapter.id} className="chapter-card" onClick={() => setActiveChapter(chapter)}>
                  <div className="chapter-number">Chapter {chapter.number}</div>
                  <span className="chapter-icon">{chapter.icon}</span>
                  <div className="chapter-name">{chapter.name}</div>
                  <div className="chapter-tagline">{chapter.tagline}</div>
                  <div className="chapter-desc">{chapter.description.slice(0, 105)}…</div>
                  <div className="chapter-dots" style={{ marginTop: "1.25rem" }}>
                    {chapter.tools.map((t, i) => <div key={i} className={`dot${completedTools.has(`${chapter.id}:${t.id}`) ? " done" : ""}`} />)}
                    <span style={{ width: "6px" }} />
                    {chapter.weeklyTasks.map((t, i) => <div key={i} className={`dot${completedTasks.has(t.id) ? " done" : ""}`} style={{ borderRadius: "2px" }} />)}
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.12em", color: "var(--text-faint)", textTransform: "uppercase", marginTop: "0.75rem" }}>
                    {doneTools}/{chapter.tools.length} tools · {doneTasks}/{chapter.weeklyTasks.length} tasks
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    /* Emotional Weather */
    if (activeNav === "weather") {
      return (
        <div className="weather-page">
          <h2 className="page-title">Emotional Weather</h2>
          <p className="page-sub">Not a mood tracker. A pattern witness.</p>
          <p className="page-desc">You don't need to optimise how you feel. You need to witness it honestly, over time. This is a private record — not of progress, but of truth.</p>

          {isPreviewLocked ? (
            <PreviewLock />
          ) : (
            <>
              <div className="col-label">How are you today?</div>
              <div className="weather-grid">
                {WEATHER_OPTIONS.map((w) => (
                  <div key={w.id} className={`weather-option${selectedWeather === w.id ? " selected" : ""}`} onClick={() => setSelectedWeather(w.id)}>
                    <span className="weather-emoji">{w.icon}</span>
                    <div className="weather-label">{w.label}</div>
                    <div className="weather-desc">{w.desc}</div>
                  </div>
                ))}
              </div>

              <div className="weather-note-label">A note (optional)</div>
              <textarea className="weather-textarea" placeholder="What's underneath it today?..." value={weatherNote} onChange={(e) => setWeatherNote(e.target.value)} />

              <button className="btn-main" disabled={!selectedWeather} onClick={() => {
                const opt = WEATHER_OPTIONS.find((w) => w.id === selectedWeather);
                const t = now();
                const entry = { id: selectedWeather, label: opt.label, icon: opt.icon, note: weatherNote, date: t.date, time: t.time };
                saveWeatherLog([entry, ...weatherLog]);
                setSelectedWeather(null); setWeatherNote(""); toast("Recorded ✦");
              }}>Record today's weather ✦</button>
            </>
          )}

          {weatherLog.length > 0 && (
            <div className="weather-history">
              <div className="history-label">Your weather history</div>
              {/* Mini chart */}
              <div className="history-chart">
                {[...weatherLog].reverse().slice(-20).map((entry, i) => (
                  <div key={i} className="chart-bar" style={{ background: WEATHER_COLORS[entry.id] || "#4A4040", height: `${(WEATHER_HEIGHTS[entry.id] || 3) * 10}px` }}>
                    <div className="chart-bar-tip">{entry.icon} {entry.label} · {entry.date}</div>
                  </div>
                ))}
              </div>
              {weatherLog.map((entry, i) => (
                <div key={i} className="weather-entry">
                  <div className="we-emoji">{entry.icon}</div>
                  <div className="we-meta">
                    <div className="we-date">{entry.date} · {entry.time}</div>
                    <div className="we-label">{entry.label}</div>
                    {entry.note && <div className="we-note">"{entry.note}"</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    /* The Pause */
    if (activeNav === "pause") {
      return (
        <div className="pause-page">
          <div className="pause-header">
            <h2 className="pause-title">The Pause</h2>
            <p className="pause-sub">Before you reach out.</p>
          </div>

          <div className="pause-intro">
            <div className="pause-intro-label">What this is for</div>
            <p>You're about to contact your ex — or someone you know you shouldn't. This space exists so that urge becomes something useful instead of something you regret. Use it. Wait it out. Write through it. Most urges pass within 20 minutes.</p>
          </div>

          {/* Timer */}
          <div className="pause-section-label">Hold the urge</div>
          <div className="pause-timer">
            <div className="timer-display">{formatTimer(timerSeconds)}</div>
            <div className="timer-label">{timerActive ? "Hold on. You're doing it." : "Start a 20-minute hold"}</div>
            <div className="timer-actions">
              <button className={`btn-timer start`} onClick={() => { setTimerActive(!timerActive); if (!timerActive && timerSeconds === 0) setTimerSeconds(0); }}>
                {timerActive ? "Pause" : timerSeconds > 0 ? "Resume" : "Start timer"}
              </button>
              {timerSeconds > 0 && (
                <button className="btn-timer" onClick={() => { setTimerActive(false); setTimerSeconds(0); }}>Reset</button>
              )}
            </div>
          </div>

          {/* Redirect question */}
          <div className="pause-section-label">A question for this moment</div>
          <div className="redirect-card">
            <div className="redirect-question">"{PAUSE_REDIRECTS[pauseRedirectIdx]}"</div>
            <button className="btn-new-redirect" onClick={() => setPauseRedirectIdx((i) => (i + 1) % PAUSE_REDIRECTS.length)}>Different question →</button>
          </div>

          {/* Write-through */}
          <div className="pause-section-label">Write through it</div>
          <textarea className="pause-textarea" placeholder="Write what you're feeling, what you want to say, what's underneath the urge — here instead of sending it..." value={pauseText} onChange={(e) => setPauseText(e.target.value)} />
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            <button className="btn-main" disabled={!pauseText.trim()} onClick={() => {
              const t = now();
              saveUrgeLog([{ text: pauseText, date: t.dateShort, time: t.time }, ...urgeLog]);
              setPauseText(""); setTimerActive(false); setTimerSeconds(0); toast("You held the line ✦");
            }}>I held the line ✦</button>
            <button className="btn-ghost" onClick={() => { setPauseText(""); setTimerActive(false); setTimerSeconds(0); }}>Clear</button>
          </div>

          {/* Urge log */}
          {urgeLog.length > 0 && (
            <div>
              <div className="pause-section-label">Times you held the line</div>
              <div className="urge-log">
                {urgeLog.map((entry, i) => (
                  <div key={i} className="urge-entry">
                    <div className="urge-text">"{entry.text.slice(0, 120)}{entry.text.length > 120 ? "…" : ""}"</div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div className="urge-date">{entry.date} · {entry.time}</div>
                      <div className="urge-survived">Survived</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    /* Daily Ritual */
    if (activeNav === "ritual") {
      return (
        <div className="ritual-page">
          <h2 className="page-title" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 300, color: "var(--paper)", marginBottom: "0.4rem" }}>Daily Ritual</h2>
          <p className="page-sub" style={{ fontSize: "1.25rem", color: "var(--text-faint)", fontStyle: "italic", marginBottom: "2rem" }}>A few honest minutes with yourself, every day.</p>
          <div className="prompt-box">
            <div className="prompt-eyebrow">Today's prompt</div>
            <div className="prompt-q">"{DAILY_PROMPTS[dailyPromptIdx]}"</div>
            <button className="btn-prompt-swap" onClick={() => setDailyPromptIdx((i) => (i + 1) % DAILY_PROMPTS.length)}>Different prompt →</button>
          </div>
          {isPreviewLocked ? (
            <PreviewLock />
          ) : (
            <>
              <textarea className="ritual-textarea" placeholder="Write freely. This is just for you." value={dailyText} onChange={(e) => setDailyText(e.target.value)} />
              <button className="btn-main" onClick={() => {
                if (!dailyText.trim()) return;
                const t = now();
                saveJournalEntries([{ date: t.date, prompt: DAILY_PROMPTS[dailyPromptIdx], text: dailyText }, ...journalEntries]);
                setDailyText(""); toast("Entry saved ✦");
              }} disabled={!dailyText.trim()}>Save entry ✦</button>
            </>
          )}

          {journalEntries.length > 0 && (
            <div className="entry-stack">
              <div className="entry-header">Previous entries</div>
              {journalEntries.map((e, i) => (
                <div key={i} className="entry-card">
                  <div className="entry-date">{e.date}</div>
                  <div className="entry-prompt-text">"{e.prompt}"</div>
                  <div className="entry-body">{e.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    /* My Journal */
    if (activeNav === "journal") {
      return (
        <div className="journal-page">
          <h2 className="page-title">My Journal</h2>
          <p className="page-sub">Everything you&apos;ve written, in one place.</p>
          <p className="journal-intro">
            Reflection tools, daily ritual, weekly task notes, emotional weather, and pause entries — sorted newest first.
          </p>
          {allJournalEntries.length === 0 ? (
            <div className="journal-empty">
              No saved entries yet. Write in a reflection tool, save a daily ritual entry, add task notes, log your weather, or hold the line in The Pause — they&apos;ll appear here.
            </div>
          ) : (
            <>
              <div className="journal-count">{allJournalEntries.length} {allJournalEntries.length === 1 ? "entry" : "entries"}</div>
              {allJournalEntries.map((entry) => (
                <article key={entry.id} className="journal-entry">
                  <div className="journal-entry-top">
                    <span className="journal-entry-section">{entry.section}</span>
                    <span className="journal-entry-date">
                      {entry.date}{entry.time ? ` · ${entry.time}` : ""}
                    </span>
                  </div>
                  <h3 className="journal-entry-source">{entry.source}</h3>
                  {entry.meta && entry.section === "Daily Ritual" && (
                    <p className="journal-entry-prompt">&ldquo;{entry.meta}&rdquo;</p>
                  )}
                  {entry.meta && entry.section === "Emotional Weather" && (
                    <p className="journal-entry-prompt">{entry.meta}</p>
                  )}
                  <div className="journal-entry-body">{entry.text}</div>
                  {entry.reflection && (
                    <div className="journal-entry-reflection">
                      <div className="entry-reflection-label">AI reflection</div>
                      <div className="entry-reflection-body">{entry.reflection}</div>
                    </div>
                  )}
                </article>
              ))}
            </>
          )}
        </div>
      );
    }

    /* Philosophy */
    if (activeNav === "philosophy") {
      return (
        <div className="philosophy">
          <div className="phil-section">
            <div className="phil-label">What OVERRIDE Is</div>
            <h2 className="phil-heading">A program that treats grief as a passage, not a problem.</h2>
            <p className="phil-body">Every other app in this space manages logistics (co-parenting, expense tracking) or symptoms (anxiety apps, mood trackers). None of them ask the deeper question: <em>who are you becoming?</em></p>
            <p className="phil-body">OVERRIDE is built on a different premise. Heartbreak and divorce are identity crises that, when moved through with intention, become the most clarifying passage of a person's life.</p>
          </div>
          <div className="phil-section">
            <div className="phil-label">Four Systems, One Program</div>
            <h2 className="phil-heading">Built around what actually moves people forward.</h2>
            <div className="phil-grid">
              {[
                ["◎", "Structured Chapters", "Three sequential phases — Grieve, Rediscover, Reclaim — each with deep reflective tools designed to be worked in order."],
                ["◇", "Identity Tasks", "Fifteen weekly real-world challenges that build a new self through action, not just insight. Small, doable, cumulative."],
                ["🌤", "Emotional Weather", "A private tracking system that witnesses how you actually feel over time — revealing patterns without judging progress."],
                ["✦", "The Pause", "A dedicated intervention for the urge to reach out. A timer, a question, a writing space — turning impulse into self-knowledge."],
                ["◈", "AI Reflections", "Every response is specific to what you actually wrote — not generic wellness language or one-size-fits-all prompts."],
                ["◇", "Daily Ritual", "A rotating journal prompt for the small, honest check-in that keeps you oriented to yourself every day."],
              ].map(([icon, title, text]) => (
                <div key={title} className="phil-card">
                  <span className="phil-card-icon">{icon}</span>
                  <div className="phil-card-title">{title}</div>
                  <div className="phil-card-text">{text}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="phil-section">
            <div className="phil-label">A Note</div>
            <h2 className="phil-heading">A self-directed program, not a substitute for professional support.</h2>
            <p className="phil-body">The AI reflections in OVERRIDE are a mirror — thoughtful, specific, and deeply responsive to what you've written. They work best alongside human support — a counsellor, a trusted community, or people who have walked a similar path. OVERRIDE is for the hard, hopeful work of rebuilding — not for crisis. If you're in crisis, please reach out to a qualified professional.</p>
          </div>
          <p className="phil-disclaimer">
            Override is a self-directed identity reconstruction program, not a mental health service or crisis support. The AI reflections within Override are thinking prompts, not clinical advice. If you are struggling or need immediate support, please reach out to a qualified professional or visit <a href="https://findahelpline.com" target="_blank">findahelpline.com</a> — a free directory of crisis helplines in over 30 countries.
          </p>
        </div>
      );
    }
  };

  /* ── SHELL */
  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="nav-wordmark" onClick={() => navReset("program")}>O<span>V</span>ERRIDE</div>
        <div className="nav-right">
          <div className="nav-tabs">
            {[
              ["program", "Program", false],
              ["weather", "Weather", false],
              ["pause", "The Pause", true],
              ["ritual", "Daily Ritual", false],
              ["journal", "My Journal", false],
              ["philosophy", "Philosophy", false],
            ].map(([key, label, isPause]) => (
              <button key={key} className={`nav-tab${isPause ? " pause-tab" : ""}${activeNav === key ? " active" : ""}`} onClick={() => navReset(key)}>
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="nav-pricing-link"
            onClick={startCheckout}
            disabled={checkoutLoading || hasPaid}
          >
            {hasPaid ? "Override unlocked ✦" : checkoutLoading ? "Opening checkout…" : "Get Override — $47"}
          </button>
          {isLoggedIn && (
            <button
              type="button"
              className="nav-logout"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLogout();
              }}
            >
              Log out
            </button>
          )}
        </div>
      </nav>
      <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
      <main style={{ flex: "1 0 auto", width: "100%" }}>{renderContent()}</main>
      {showToast && <div className="toast">{showToast}</div>}
      <div className="override-mark">OVERRIDE · Identity Reconstruction Program</div>
    </div>
  );
}
