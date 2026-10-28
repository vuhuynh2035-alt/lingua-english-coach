"use client";

import { useEffect, useId, useRef } from "react";

export type AvatarKind = "woman" | "man" | "mascot";
export type AvatarEmotion = "neutral" | "happy" | "cheer" | "thinking" | "surprised";
export type AvatarStatus = "idle" | "thinking" | "speaking" | "listening";

type Props = {
  kind: AvatarKind;
  status?: AvatarStatus;
  emotion?: AvatarEmotion;
  size?: number;
  /** Head follows the pointer. Turn off for small icons. */
  interactive?: boolean;
  className?: string;
};

const SKIN = ["#ffe6d4", "#f6c2a2", "#d9967a"];

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <radialGradient id={`${id}-skin`} cx="38%" cy="30%" r="80%">
        <stop offset="0" stopColor={SKIN[0]} />
        <stop offset="0.55" stopColor={SKIN[1]} />
        <stop offset="1" stopColor={SKIN[2]} />
      </radialGradient>
      <radialGradient id={`${id}-eye`} cx="40%" cy="35%" r="75%">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#e3e8ee" />
      </radialGradient>
      <radialGradient id={`${id}-iris`} cx="40%" cy="35%" r="70%">
        <stop offset="0" stopColor="#8a5a34" />
        <stop offset="1" stopColor="#2e1a0d" />
      </radialGradient>
      <linearGradient id={`${id}-hairW`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#6b4129" />
        <stop offset="1" stopColor="#2a160b" />
      </linearGradient>
      <linearGradient id={`${id}-hairM`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#4b4f5a" />
        <stop offset="1" stopColor="#15171c" />
      </linearGradient>
      <linearGradient id={`${id}-suitW`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2cb5a5" />
        <stop offset="1" stopColor="#0b5d57" />
      </linearGradient>
      <linearGradient id={`${id}-suitM`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4f7bd6" />
        <stop offset="1" stopColor="#18327a" />
      </linearGradient>
      <radialGradient id={`${id}-owl`} cx="40%" cy="30%" r="85%">
        <stop offset="0" stopColor="#ffd88a" />
        <stop offset="0.55" stopColor="#f0a23a" />
        <stop offset="1" stopColor="#b3601a" />
      </radialGradient>
      <radialGradient id={`${id}-belly`} cx="50%" cy="35%" r="70%">
        <stop offset="0" stopColor="#fffdf3" />
        <stop offset="1" stopColor="#f7e2b0" />
      </radialGradient>
      <radialGradient id={`${id}-ring`} cx="45%" cy="35%" r="75%">
        <stop offset="0" stopColor="#fff7d6" />
        <stop offset="1" stopColor="#f6cf6b" />
      </radialGradient>
      <radialGradient id={`${id}-bg`} cx="50%" cy="40%" r="65%">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

function Eye({ id, cx, cy, lookX, lookY, r = 10.5 }: { id: string; cx: number; cy: number; lookX: number; lookY: number; r?: number }) {
  return (
    <g className="av-blink">
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.86} fill={`url(#${id}-eye)`} stroke="#00000018" strokeWidth="0.8" />
      <circle cx={cx + lookX} cy={cy + lookY} r={r * 0.56} fill={`url(#${id}-iris)`} />
      <circle cx={cx + lookX} cy={cy + lookY} r={r * 0.27} fill="#0a0604" />
      <circle cx={cx + lookX - r * 0.2} cy={cy + lookY - r * 0.22} r={r * 0.16} fill="#fff" />
      <circle cx={cx + lookX + r * 0.18} cy={cy + lookY + r * 0.2} r={r * 0.07} fill="#ffffffaa" />
    </g>
  );
}

function browParams(emotion: AvatarEmotion) {
  switch (emotion) {
    case "thinking": return { ly: -7, ry: -1, lr: -8, rr: 4 };
    case "surprised": return { ly: -9, ry: -9, lr: -4, rr: 4 };
    case "cheer": return { ly: -4, ry: -4, lr: -3, rr: 3 };
    case "happy": return { ly: -2, ry: -2, lr: -2, rr: 2 };
    default: return { ly: 0, ry: 0, lr: 0, rr: 0 };
  }
}

function mouthShape(emotion: AvatarEmotion): string {
  switch (emotion) {
    case "cheer": return "M82 130 Q100 156 118 130 Q100 138 82 130 Z";
    case "happy": return "M86 133 Q100 147 114 133";
    case "surprised": return "M95 134 Q100 130 105 134 Q108 142 100 145 Q92 142 95 134 Z";
    case "thinking": return "M91 138 Q100 136 109 140";
    default: return "M91 136 Q100 141 109 136";
  }
}

function Mouth({ talking, emotion, lip }: { talking: boolean; emotion: AvatarEmotion; lip: string }) {
  if (talking) {
    return (
      <g className="av-mouth-talk">
        <ellipse cx="100" cy="137" rx="10" ry="7" fill="#7a1f2b" />
        <path d="M92 133 Q100 130 108 133 Q100 136 92 133Z" fill="#fff" />
        <ellipse cx="100" cy="142" rx="6" ry="3" fill="#e0707f" />
        <ellipse cx="100" cy="137" rx="10.5" ry="7.5" fill="none" stroke={lip} strokeWidth="2.2" />
      </g>
    );
  }
  const filled = emotion === "cheer" || emotion === "surprised";
  return (
    <path
      d={mouthShape(emotion)}
      fill={filled ? "#7a1f2b" : "none"}
      stroke={lip}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="av-mouth-idle"
    />
  );
}

function Human({ id, kind, emotion, talking, look }: { id: string; kind: "woman" | "man"; emotion: AvatarEmotion; talking: boolean; look: { x: number; y: number } }) {
  const woman = kind === "woman";
  const brows = browParams(emotion);
  const lip = woman ? "#c2415c" : "#a8504a";
  const browColor = woman ? "#3a2113" : "#1e2026";
  return (
    <g>
      {woman && (
        <path d="M48 96 C40 40 78 22 100 22 C124 22 160 42 152 100 C158 150 150 178 138 190 L62 190 C50 178 44 150 48 96Z" fill={`url(#${id}-hairW)`} />
      )}
      {/* shoulders / jacket */}
      <path d="M22 240 C22 196 58 176 100 176 C142 176 178 196 178 240Z" fill={`url(#${woman ? `${id}-suitW` : `${id}-suitM`})`} />
      <path d="M100 176 L76 240 L124 240Z" fill={woman ? "#f5fbfa" : "#f7f8fb"} />
      {woman
        ? <path d="M84 178 L100 214 L116 178 Q100 190 84 178Z" fill="#e8f3f1" />
        : <path d="M94 184 L106 184 L110 236 L100 244 L90 236Z" fill="#c8374a" />}
      <path d="M22 240 C22 196 58 176 100 176" fill="none" stroke="#ffffff33" strokeWidth="2" />
      {/* neck */}
      <path d="M82 150 L82 182 Q100 196 118 182 L118 150Z" fill={`url(#${id}-skin)`} />
      <path d="M82 164 Q100 178 118 164 L118 182 Q100 196 82 182Z" fill="#00000026" />
      <g className="av-head">
        {/* ears */}
        <ellipse cx="52" cy="104" rx="7" ry="11" fill={`url(#${id}-skin)`} />
        <ellipse cx="148" cy="104" rx="7" ry="11" fill={`url(#${id}-skin)`} />
        {woman && (<><circle cx="52" cy="116" r="3" fill="#f6cf6b" /><circle cx="148" cy="116" r="3" fill="#f6cf6b" /></>)}
        {/* face */}
        <ellipse cx="100" cy="100" rx="49" ry="57" fill={`url(#${id}-skin)`} />
        <ellipse cx="100" cy="100" rx="49" ry="57" fill="none" stroke="#00000012" strokeWidth="1.5" />
        {/* hair front */}
        {woman ? (
          <path d="M50 92 C46 46 82 30 104 34 C130 36 152 56 150 94 C140 70 124 60 104 58 C84 60 62 68 50 92Z" fill={`url(#${id}-hairW)`} />
        ) : (
          <path d="M51 90 C44 40 80 26 102 28 C130 28 156 48 149 92 C146 72 134 58 118 54 C100 62 70 58 56 78Z" fill={`url(#${id}-hairM)`} />
        )}
        <path d="M70 44 C86 36 108 36 126 46" fill="none" stroke="#ffffff30" strokeWidth="3" strokeLinecap="round" />
        {/* blush */}
        <ellipse cx="68" cy="120" rx="10" ry="6" fill="#ff8aa0" opacity={emotion === "cheer" || emotion === "happy" ? 0.45 : 0.22} />
        <ellipse cx="132" cy="120" rx="10" ry="6" fill="#ff8aa0" opacity={emotion === "cheer" || emotion === "happy" ? 0.45 : 0.22} />
        {/* brows */}
        <path d="M63 82 Q76 76 90 82" fill="none" stroke={browColor} strokeWidth={woman ? 3 : 4.2} strokeLinecap="round"
          style={{ transform: `translateY(${brows.ly}px) rotate(${brows.lr}deg)`, transformOrigin: "76px 82px" }} className="av-brow" />
        <path d="M110 82 Q124 76 137 82" fill="none" stroke={browColor} strokeWidth={woman ? 3 : 4.2} strokeLinecap="round"
          style={{ transform: `translateY(${brows.ry}px) rotate(${brows.rr}deg)`, transformOrigin: "124px 82px" }} className="av-brow" />
        {/* eyes */}
        <Eye id={id} cx={76} cy={98} lookX={look.x} lookY={look.y} />
        <Eye id={id} cx={124} cy={98} lookX={look.x} lookY={look.y} />
        {woman && (
          <>
            <path d="M64 92 Q70 86 78 86" stroke="#22110a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M136 92 Q130 86 122 86" stroke="#22110a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </>
        )}
        {!woman && (
          <g fill="none" stroke="#2b2f3a" strokeWidth="2.2">
            <rect x="58" y="86" width="36" height="25" rx="9" fill="#ffffff14" />
            <rect x="106" y="86" width="36" height="25" rx="9" fill="#ffffff14" />
            <path d="M94 97 H106" />
          </g>
        )}
        {/* nose */}
        <path d="M100 104 Q96 118 101 121 Q106 120 104 118" fill="none" stroke="#b9775a" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        <ellipse cx="98" cy="108" rx="2.6" ry="5" fill="#fff" opacity="0.28" />
        <Mouth talking={talking} emotion={emotion} lip={lip} />
        {!woman && <path d="M70 140 Q100 168 130 140 Q100 150 70 140Z" fill="#00000010" />}
      </g>
    </g>
  );
}

function Owl({ id, emotion, talking, look }: { id: string; emotion: AvatarEmotion; talking: boolean; look: { x: number; y: number } }) {
  const brows = browParams(emotion);
  return (
    <g>
      {/* wings */}
      <path d="M26 150 C6 170 14 214 46 226 C56 200 52 170 40 148Z" fill={`url(#${id}-owl)`} className="av-wing av-wing-l" />
      <path d="M174 150 C194 170 186 214 154 226 C144 200 148 170 160 148Z" fill={`url(#${id}-owl)`} className="av-wing av-wing-r" />
      {/* body */}
      <ellipse cx="100" cy="172" rx="62" ry="64" fill={`url(#${id}-owl)`} />
      <ellipse cx="100" cy="184" rx="40" ry="48" fill={`url(#${id}-belly)`} />
      {[0, 1, 2].map((row) => [0, 1, 2].map((col) => (
        <path key={`${row}${col}`} d={`M${80 + col * 20 - (row % 2) * 10} ${164 + row * 17} q6 8 12 0`} fill="none" stroke="#e4b97a" strokeWidth="2.2" strokeLinecap="round" />
      )))}
      <g className="av-head">
        {/* tufts */}
        <path d="M44 62 L34 20 L74 44Z" fill={`url(#${id}-owl)`} />
        <path d="M156 62 L166 20 L126 44Z" fill={`url(#${id}-owl)`} />
        {/* head */}
        <ellipse cx="100" cy="96" rx="64" ry="58" fill={`url(#${id}-owl)`} />
        <ellipse cx="100" cy="96" rx="64" ry="58" fill="none" stroke="#00000014" strokeWidth="1.5" />
        <path d="M72 40 C90 30 114 30 132 42" fill="none" stroke="#ffffff55" strokeWidth="4" strokeLinecap="round" />
        {/* eye rings */}
        <circle cx="70" cy="92" r="26" fill={`url(#${id}-ring)`} stroke="#c47a24" strokeWidth="2" />
        <circle cx="130" cy="92" r="26" fill={`url(#${id}-ring)`} stroke="#c47a24" strokeWidth="2" />
        <path d="M48 70 Q70 60 90 68" fill="none" stroke="#7a3f12" strokeWidth="4" strokeLinecap="round"
          style={{ transform: `translateY(${brows.ly}px) rotate(${brows.lr}deg)`, transformOrigin: "70px 68px" }} className="av-brow" />
        <path d="M110 68 Q130 60 152 70" fill="none" stroke="#7a3f12" strokeWidth="4" strokeLinecap="round"
          style={{ transform: `translateY(${brows.ry}px) rotate(${brows.rr}deg)`, transformOrigin: "130px 68px" }} className="av-brow" />
        <Eye id={id} cx={70} cy={92} lookX={look.x * 1.2} lookY={look.y * 1.2} r={18} />
        <Eye id={id} cx={130} cy={92} lookX={look.x * 1.2} lookY={look.y * 1.2} r={18} />
        {/* beak */}
        <path d="M88 112 Q100 104 112 112 L100 140Z" fill="#ff9a2e" stroke="#c4600a" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M92 114 Q100 110 108 114" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2.4" strokeLinecap="round" />
        {talking && <path d="M91 124 Q100 148 109 124 Q100 130 91 124Z" fill="#d9701a" className="av-mouth-talk" />}
        {/* cap */}
        <path d="M44 48 L100 22 L156 48 L100 72Z" fill="#26324a" />
        <path d="M70 58 V74 Q100 90 130 74 V58 L100 72Z" fill="#1a2336" />
        <path d="M156 48 V76" stroke="#f6c23e" strokeWidth="3" strokeLinecap="round" />
        <circle cx="156" cy="80" r="5" fill="#f6c23e" />
        <circle cx="100" cy="47" r="4" fill="#f6c23e" />
        {(emotion === "happy" || emotion === "cheer") && (
          <><ellipse cx="46" cy="116" rx="8" ry="5" fill="#ff7a8a" opacity=".4" /><ellipse cx="154" cy="116" rx="8" ry="5" fill="#ff7a8a" opacity=".4" /></>
        )}
      </g>
      <path d="M78 232 l-6 8 M88 234 l-4 8 M122 234 l4 8 M132 232 l6 8" stroke="#e08a1a" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

export function TutorAvatar({ kind, status = "idle", emotion, size = 120, interactive = true, className = "" }: Props) {
  const rawId = useId();
  const id = `av${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const stageRef = useRef<HTMLDivElement | null>(null);

  const talking = status === "speaking";
  const resolved: AvatarEmotion = emotion
    ?? (status === "thinking" ? "thinking" : status === "speaking" ? "cheer" : status === "listening" ? "surprised" : "happy");
  const look = status === "thinking" ? { x: 3, y: -3 } : status === "listening" ? { x: 0, y: 1 } : { x: 0, y: 0 };

  useEffect(() => {
    const stage = stageRef.current;
    if (!interactive || !stage) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = stage.getBoundingClientRect();
        const dx = (event.clientX - (box.left + box.width / 2)) / Math.max(window.innerWidth / 2, 1);
        const dy = (event.clientY - (box.top + box.height * 0.4)) / Math.max(window.innerHeight / 2, 1);
        const clamp = (v: number) => Math.max(-1, Math.min(1, v));
        stage.style.setProperty("--av-ry", `${clamp(dx) * 14}deg`);
        stage.style.setProperty("--av-rx", `${clamp(-dy) * 9}deg`);
        stage.style.setProperty("--av-tx", `${clamp(dx) * 3}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [interactive]);

  const label = kind === "woman" ? "Cô giáo AI" : kind === "man" ? "Thầy giáo AI" : "Cú Alex";
  return (
    <div
      ref={stageRef}
      className={`av-stage av-${kind} av-status-${status} av-emo-${resolved} ${className}`.trim()}
      style={{ width: size, height: size * 1.2 }}
      role="img"
      aria-label={label}
    >
      <div className="av-glow" />
      {status === "listening" && <><i className="av-ring av-ring-1" /><i className="av-ring av-ring-2" /></>}
      <div className="av-float">
        <svg viewBox="0 0 200 250" width={size} height={size * 1.2} className="av-svg">
          <Defs id={id} />
          {kind === "mascot"
            ? <Owl id={id} emotion={resolved} talking={talking} look={look} />
            : <Human id={id} kind={kind} emotion={resolved} talking={talking} look={look} />}
        </svg>
      </div>
      <div className="av-shadow" />
      {status === "thinking" && <div className="av-think"><i /><i /><i /></div>}
    </div>
  );
}
