"use client";

import { useEffect, useId, useRef, useState } from "react";
import { realMouthLevel } from "@/lib/lipsync";
import { LANG, type MascotKind } from "@/lib/language";

export type AvatarKind = "woman" | "man" | "mascot";
export type AvatarEmotion = "neutral" | "happy" | "cheer" | "thinking" | "surprised";
/** "sleeping": not connected yet, eyes shut and Zzz. Leaving it makes the tutor wake up with a hop and a few blinks. */
export type AvatarStatus = "idle" | "thinking" | "speaking" | "listening" | "sleeping";

type Props = {
  kind: AvatarKind;
  /** Which mascot a "mascot" tutor is; defaults to the one of the language being learned. */
  mascot?: MascotKind;
  status?: AvatarStatus;
  emotion?: AvatarEmotion;
  size?: number;
  /** Eyes and head follow the pointer. Turn off for small icons. */
  interactive?: boolean;
  /** The tutor jumps into view when it appears. */
  entrance?: boolean;
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
      <radialGradient id={`${id}-owliris`} cx="45%" cy="40%" r="65%">
        <stop offset="0" stopColor="#ffd25a" />
        <stop offset="0.7" stopColor="#f59e0b" />
        <stop offset="1" stopColor="#a8560f" />
      </radialGradient>
      <radialGradient id={`${id}-owl`} cx="40%" cy="28%" r="85%">
        <stop offset="0" stopColor="#ffcf7a" />
        <stop offset="0.55" stopColor="#ea9530" />
        <stop offset="1" stopColor="#a8561a" />
      </radialGradient>
      <radialGradient id={`${id}-disc`} cx="50%" cy="40%" r="70%">
        <stop offset="0" stopColor="#fff6e2" />
        <stop offset="1" stopColor="#f6d9a4" />
      </radialGradient>
      <radialGradient id={`${id}-belly`} cx="50%" cy="35%" r="70%">
        <stop offset="0" stopColor="#fffdf3" />
        <stop offset="1" stopColor="#f7e2b0" />
      </radialGradient>
      <linearGradient id={`${id}-beak`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffb547" />
        <stop offset="1" stopColor="#e2741a" />
      </linearGradient>
      <radialGradient id={`${id}-nova`} cx="38%" cy="30%" r="78%">
        <stop offset="0" stopColor="#fff4c7" />
        <stop offset="0.55" stopColor="#ffd98a" />
        <stop offset="1" stopColor="#f4ad52" />
      </radialGradient>
      <radialGradient id={`${id}-pupil`} cx="45%" cy="35%" r="75%">
        <stop offset="0" stopColor="#4a2e1f" />
        <stop offset="1" stopColor="#140a05" />
      </radialGradient>
      <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#9be8a8" />
        <stop offset="1" stopColor="#36a86a" />
      </linearGradient>
      <radialGradient id={`${id}-fur`} cx="40%" cy="30%" r="80%">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.7" stopColor="#f1f2f4" />
        <stop offset="1" stopColor="#cfd3da" />
      </radialGradient>
      <linearGradient id={`${id}-patch`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#4a4d57" />
        <stop offset="1" stopColor="#17181d" />
      </linearGradient>
      <linearGradient id={`${id}-scarf`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f04a4a" />
        <stop offset="1" stopColor="#b91c1c" />
      </linearGradient>
    </defs>
  );
}

/**
 * An eye with a moving iris (--look-x/--look-y) and a lid that closes from the top
 * (--lid for blinks, `rest` for a squint). `lid` is the lid colour.
 */
function Eye({ id, name, cx, cy, rx, ry, iris, irisFill, lid, rest = 0, lash }: {
  id: string; name: string; cx: number; cy: number; rx: number; ry: number;
  iris: number; irisFill: string; lid: string; rest?: number; lash?: string;
}) {
  const clip = `${id}-${name}`;
  return (
    <g>
      <clipPath id={clip}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}-eye)`} />
      <g clipPath={`url(#${clip})`}>
        <g className="av-iris">
          <circle cx={cx} cy={cy} r={iris} fill={irisFill} />
          <circle cx={cx} cy={cy} r={iris * 0.5} fill="#0a0604" />
          <circle cx={cx - iris * 0.38} cy={cy - iris * 0.4} r={iris * 0.28} fill="#fff" />
          <circle cx={cx + iris * 0.3} cy={cy + iris * 0.34} r={iris * 0.12} fill="#ffffffb0" />
        </g>
        <rect className="av-lid" x={cx - rx - 1} y={cy - ry - 1} width={rx * 2 + 2} height={ry * 2 + 2} fill={lid}
          style={{ "--lid-rest": rest } as React.CSSProperties} />
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#00000022" strokeWidth="1.2" />
      {lash && <path d={`M${cx - rx} ${cy - ry * 0.3} Q${cx} ${cy - ry * 1.25} ${cx + rx} ${cy - ry * 0.3}`} fill="none" stroke={lash} strokeWidth="2.6" strokeLinecap="round" />}
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

function restingMouth(emotion: AvatarEmotion): string {
  switch (emotion) {
    case "cheer": return "M84 131 Q100 154 116 131 Q100 139 84 131 Z";
    case "happy": return "M86 133 Q100 147 114 133";
    case "surprised": return "M95 134 Q100 130 105 134 Q108 142 100 145 Q92 142 95 134 Z";
    case "thinking": return "M91 138 Q100 136 109 140";
    default: return "M91 136 Q100 141 109 136";
  }
}

/** Human mouth: a resting shape, or while talking a mouth whose opening follows --mouth. */
function HumanMouth({ talking, emotion, lip }: { talking: boolean; emotion: AvatarEmotion; lip: string }) {
  if (talking) {
    return (
      <g className="av-mouth-live">
        <ellipse cx="100" cy="137" rx="11" ry="8" fill="#6b1726" stroke={lip} strokeWidth="2.4" />
        <path d="M91 132.5 Q100 130 109 132.5 L108 135 Q100 133.5 92 135Z" fill="#fff" />
        <ellipse cx="100" cy="142" rx="6.5" ry="3" fill="#e0707f" />
      </g>
    );
  }
  const filled = emotion === "cheer" || emotion === "surprised";
  return <path d={restingMouth(emotion)} fill={filled ? "#7a1f2b" : "none"} stroke={lip} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />;
}

function Human({ id, kind, emotion, talking }: { id: string; kind: "woman" | "man"; emotion: AvatarEmotion; talking: boolean }) {
  const woman = kind === "woman";
  const brows = browParams(emotion);
  const lip = woman ? "#c2415c" : "#a8504a";
  const browColor = woman ? "#3a2113" : "#1e2026";
  const rest = emotion === "thinking" ? 0.25 : emotion === "cheer" ? 0.15 : 0;
  return (
    <g>
      {woman && (
        <path d="M48 96 C40 40 78 22 100 22 C124 22 160 42 152 100 C158 150 150 178 138 190 L62 190 C50 178 44 150 48 96Z" fill={`url(#${id}-hairW)`} />
      )}
      <path d="M22 240 C22 196 58 176 100 176 C142 176 178 196 178 240Z" fill={`url(#${woman ? `${id}-suitW` : `${id}-suitM`})`} />
      <path d="M100 176 L76 240 L124 240Z" fill={woman ? "#f5fbfa" : "#f7f8fb"} />
      {woman
        ? <path d="M84 178 L100 214 L116 178 Q100 190 84 178Z" fill="#e8f3f1" />
        : <path d="M94 184 L106 184 L110 236 L100 244 L90 236Z" fill="#c8374a" />}
      <path d="M82 150 L82 182 Q100 196 118 182 L118 150Z" fill={`url(#${id}-skin)`} />
      <path d="M82 164 Q100 178 118 164 L118 182 Q100 196 82 182Z" fill="#00000026" />
      <g className="av-head">
        <ellipse cx="52" cy="104" rx="7" ry="11" fill={`url(#${id}-skin)`} />
        <ellipse cx="148" cy="104" rx="7" ry="11" fill={`url(#${id}-skin)`} />
        {woman && (<><circle cx="52" cy="116" r="3" fill="#f6cf6b" /><circle cx="148" cy="116" r="3" fill="#f6cf6b" /></>)}
        <ellipse cx="100" cy="100" rx="49" ry="57" fill={`url(#${id}-skin)`} />
        {woman ? (
          <path d="M50 92 C46 46 82 30 104 34 C130 36 152 56 150 94 C140 70 124 60 104 58 C84 60 62 68 50 92Z" fill={`url(#${id}-hairW)`} />
        ) : (
          <path d="M51 90 C44 40 80 26 102 28 C130 28 156 48 149 92 C146 72 134 58 118 54 C100 62 70 58 56 78Z" fill={`url(#${id}-hairM)`} />
        )}
        <path d="M70 44 C86 36 108 36 126 46" fill="none" stroke="#ffffff30" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="68" cy="121" rx="10" ry="6" fill="#ff8aa0" opacity={emotion === "cheer" || emotion === "happy" ? 0.45 : 0.2} />
        <ellipse cx="132" cy="121" rx="10" ry="6" fill="#ff8aa0" opacity={emotion === "cheer" || emotion === "happy" ? 0.45 : 0.2} />
        <path d="M63 82 Q76 76 90 82" fill="none" stroke={browColor} strokeWidth={woman ? 3 : 4.2} strokeLinecap="round"
          style={{ transform: `translateY(${brows.ly}px) rotate(${brows.lr}deg)`, transformOrigin: "76px 82px" }} className="av-brow" />
        <path d="M110 82 Q124 76 137 82" fill="none" stroke={browColor} strokeWidth={woman ? 3 : 4.2} strokeLinecap="round"
          style={{ transform: `translateY(${brows.ry}px) rotate(${brows.rr}deg)`, transformOrigin: "124px 82px" }} className="av-brow" />
        <Eye id={id} name="l" cx={76} cy={98} rx={11} ry={9.5} iris={6} irisFill={`url(#${id}-iris)`} lid={SKIN[1]} rest={rest} lash={woman ? "#22110a" : undefined} />
        <Eye id={id} name="r" cx={124} cy={98} rx={11} ry={9.5} iris={6} irisFill={`url(#${id}-iris)`} lid={SKIN[1]} rest={rest} lash={woman ? "#22110a" : undefined} />
        {!woman && (
          <g fill="none" stroke="#2b2f3a" strokeWidth="2.2">
            <rect x="58" y="86" width="36" height="25" rx="9" fill="#ffffff14" />
            <rect x="106" y="86" width="36" height="25" rx="9" fill="#ffffff14" />
            <path d="M94 97 H106" />
          </g>
        )}
        <path d="M100 104 Q96 118 101 121 Q106 120 104 118" fill="none" stroke="#b9775a" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        <ellipse cx="98" cy="108" rx="2.6" ry="5" fill="#fff" opacity="0.28" />
        <HumanMouth talking={talking} emotion={emotion} lip={lip} />
      </g>
    </g>
  );
}

/** Alex the owl: the lower half of the beak drops with the voice while it talks. */
function Owl({ id, emotion }: { id: string; emotion: AvatarEmotion }) {
  const brows = browParams(emotion);
  // Only a thinking owl narrows its eyes; happy owls keep them wide open.
  const rest = emotion === "thinking" ? 0.3 : 0;
  const feather = "#e08a2c";
  return (
    <g>
      {/* wings */}
      <path d="M30 148 C6 172 12 218 48 230 C58 202 54 170 42 146Z" fill={`url(#${id}-owl)`} className="av-wing av-wing-l" />
      <path d="M170 148 C194 172 188 218 152 230 C142 202 146 170 158 146Z" fill={`url(#${id}-owl)`} className="av-wing av-wing-r" />
      {/* body */}
      <g className="av-body">
        <ellipse cx="100" cy="176" rx="60" ry="62" fill={`url(#${id}-owl)`} />
        <ellipse cx="100" cy="188" rx="40" ry="46" fill={`url(#${id}-belly)`} />
        {[0, 1, 2].map((row) => [0, 1, 2].map((col) => (
          <path key={`${row}${col}`} d={`M${80 + col * 20 - (row % 2) * 10} ${168 + row * 16} q6 8 12 0`} fill="none" stroke="#e4b97a" strokeWidth="2.2" strokeLinecap="round" />
        )))}
      </g>
      <g className="av-head">
        {/* ear tufts */}
        <path d="M46 66 L30 18 L78 46Z" fill={`url(#${id}-owl)`} className="av-tuft av-tuft-l" />
        <path d="M154 66 L170 18 L122 46Z" fill={`url(#${id}-owl)`} className="av-tuft av-tuft-r" />
        {/* head */}
        <ellipse cx="100" cy="96" rx="66" ry="60" fill={`url(#${id}-owl)`} />
        <path d="M70 40 C88 30 112 30 130 42" fill="none" stroke="#ffffff55" strokeWidth="4" strokeLinecap="round" />
        {/* facial disc: the heart-shaped face of an owl */}
        <path d="M100 66 C86 46 42 48 40 92 C38 128 76 140 100 128 C124 140 162 128 160 92 C158 48 114 46 100 66Z" fill={`url(#${id}-disc)`} />
        <path d="M100 66 L100 104" stroke="#e9c48a" strokeWidth="2" />
        {/* brows (feather ridges) */}
        <path d="M46 72 Q68 58 94 72" fill="none" stroke="#9a4f16" strokeWidth="5" strokeLinecap="round"
          style={{ transform: `translateY(${brows.ly}px) rotate(${brows.lr}deg)`, transformOrigin: "70px 68px" }} className="av-brow" />
        <path d="M106 72 Q132 58 154 72" fill="none" stroke="#9a4f16" strokeWidth="5" strokeLinecap="round"
          style={{ transform: `translateY(${brows.ry}px) rotate(${brows.rr}deg)`, transformOrigin: "130px 68px" }} className="av-brow" />
        <Eye id={id} name="l" cx={71} cy={94} rx={21} ry={21} iris={13} irisFill={`url(#${id}-owliris)`} lid={feather} rest={rest} />
        <Eye id={id} name="r" cx={129} cy={94} rx={21} ry={21} iris={13} irisFill={`url(#${id}-owliris)`} lid={feather} rest={rest} />
        {/* beak: the lower half drops with the voice, showing a dark mouth between the halves */}
        <ellipse className="av-mouth-cavity" cx="100" cy="125" rx="10.5" ry="9" fill="#4a1508" />
        <ellipse className="av-mouth-cavity" cx="100" cy="131" rx="6" ry="3" fill="#e0707f" />
        <path className="av-beak-low" d="M90 121 Q100 118 110 121 Q107 131 100 134 Q93 131 90 121Z" fill="#d9661a" stroke="#a9480c" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M85 106 Q100 97 115 106 Q114 118 100 127 Q86 118 85 106Z" fill={`url(#${id}-beak)`} stroke="#a9480c" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M91 107 Q100 102 109 107" fill="none" stroke="#fff" strokeOpacity=".65" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="95" cy="106" r="1.3" fill="#7a3409" /><circle cx="105" cy="106" r="1.3" fill="#7a3409" />
        {(emotion === "happy" || emotion === "cheer") && (
          <><ellipse cx="50" cy="118" rx="9" ry="5.5" fill="#ff7a8a" opacity=".45" /><ellipse cx="150" cy="118" rx="9" ry="5.5" fill="#ff7a8a" opacity=".45" /></>
        )}
        {/* cap */}
        <g className="av-cap">
          <path d="M46 46 L100 22 L154 46 L100 70Z" fill="#26324a" />
          <path d="M72 56 V72 Q100 86 128 72 V56 L100 70Z" fill="#1a2336" />
          <path d="M154 46 V74" stroke="#f6c23e" strokeWidth="3" strokeLinecap="round" />
          <circle cx="154" cy="78" r="5" fill="#f6c23e" className="av-tassel" />
          <circle cx="100" cy="45" r="4" fill="#f6c23e" />
        </g>
      </g>
      <path d="M80 236 l-6 9 M90 238 l-3 9 M110 238 l3 9 M120 236 l6 9" stroke="#e08a1a" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

/** Big glossy chibi eye; the lid (body colour) closes from the top for blinks. */
function NovaEye({ id, name, cx, rest }: { id: string; name: string; cx: number; rest: number }) {
  const cy = 120;
  const clip = `${id}-${name}`;
  return (
    <g>
      <clipPath id={clip}><ellipse cx={cx} cy={cy} rx="12.5" ry="15.5" /></clipPath>
      <g clipPath={`url(#${clip})`}>
        <ellipse cx={cx} cy={cy} rx="12.5" ry="15.5" fill={`url(#${id}-pupil)`} />
        <g className="av-iris">
          <ellipse cx={cx} cy={cy + 7} rx="8" ry="5" fill="#7b5cff" opacity=".35" />
          <circle cx={cx - 4} cy={cy - 6} r="4.6" fill="#fff" />
          <circle cx={cx + 4.5} cy={cy + 4} r="2.1" fill="#fff" opacity=".9" />
        </g>
        <rect className="av-lid" x={cx - 14} y={cy - 17} width="28" height="34" fill="#ffd98a"
          style={{ "--lid-rest": rest } as React.CSSProperties} />
      </g>
    </g>
  );
}

function novaMouth(emotion: AvatarEmotion) {
  switch (emotion) {
    case "cheer": return <path d="M89 140 Q100 158 111 140 Q100 144 89 140Z" fill="#7a2a2a" stroke="#7a2a2a" strokeWidth="2" strokeLinejoin="round" />;
    case "surprised": return <ellipse cx="100" cy="145" rx="4.5" ry="5.5" fill="#7a2a2a" />;
    case "thinking": return <path d="M94 145 Q100 142 106 146" fill="none" stroke="#7a2a2a" strokeWidth="2.6" strokeLinecap="round" />;
    default: return <path d="M92 141 Q96 147 100 142 Q104 147 108 141" fill="none" stroke="#7a2a2a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />;
  }
}

/**
 * Nova: an original mascot — a round, sunny little bean with big shiny eyes, rosy cheeks
 * and a leaf sprout on top (it grows a little with every lesson). Its mouth follows the
 * voice while it talks.
 */
function Nova({ id, emotion, talking }: { id: string; emotion: AvatarEmotion; talking: boolean }) {
  const brows = browParams(emotion);
  const rest = emotion === "thinking" ? 0.25 : 0;
  const happyEyes = emotion === "cheer";
  return (
    <g>
      {/* feet */}
      <ellipse cx="78" cy="230" rx="17" ry="9" fill="#f2a446" />
      <ellipse cx="122" cy="230" rx="17" ry="9" fill="#f2a446" />
      {/* arms */}
      <path d="M40 146 C24 150 20 174 30 184 C38 190 48 180 50 168Z" fill={`url(#${id}-nova)`} className="av-wing av-wing-l" />
      <path d="M160 146 C176 150 180 174 170 184 C162 190 152 180 150 168Z" fill={`url(#${id}-nova)`} className="av-wing av-wing-r" />
      <g className="av-body">
        {/* round bean body */}
        <path d="M100 50 C150 50 172 94 172 144 C172 198 140 228 100 228 C60 228 28 198 28 144 C28 94 50 50 100 50Z" fill={`url(#${id}-nova)`} />
        <ellipse cx="100" cy="186" rx="44" ry="32" fill="#fff6dd" opacity=".85" />
        <path d="M58 84 C68 66 86 58 104 58" fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" opacity=".7" />
      </g>
      {/* leaf sprout */}
      <g className="av-sprout">
        <path d="M100 54 C100 44 101 36 103 28" fill="none" stroke="#3fae6e" strokeWidth="4" strokeLinecap="round" />
        <path d="M102 34 C90 18 72 20 68 32 C80 40 94 40 102 34Z" fill={`url(#${id}-leaf)`} />
        <path d="M103 30 C114 12 136 12 140 26 C128 36 112 36 103 30Z" fill={`url(#${id}-leaf)`} />
        <path d="M74 31 Q88 30 100 34 M134 24 Q118 28 105 30" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
      </g>
      <g className="av-head">
        {/* brows */}
        <path d="M70 100 Q78 96 86 100" fill="none" stroke="#a8692a" strokeWidth="2.6" strokeLinecap="round"
          style={{ transform: `translateY(${brows.ly}px) rotate(${brows.lr}deg)`, transformOrigin: "78px 100px" }} className="av-brow" />
        <path d="M114 100 Q122 96 130 100" fill="none" stroke="#a8692a" strokeWidth="2.6" strokeLinecap="round"
          style={{ transform: `translateY(${brows.ry}px) rotate(${brows.rr}deg)`, transformOrigin: "122px 100px" }} className="av-brow" />
        {happyEyes ? (
          <g fill="none" stroke="#3b2414" strokeWidth="4" strokeLinecap="round">
            <path d="M67 124 Q78 110 89 124" />
            <path d="M111 124 Q122 110 133 124" />
          </g>
        ) : (
          <>
            <NovaEye id={id} name="l" cx={78} rest={rest} />
            <NovaEye id={id} name="r" cx={122} rest={rest} />
          </>
        )}
        {/* rosy cheeks */}
        <ellipse cx="60" cy="140" rx="11" ry="7" fill="#ff9eb5" opacity=".6" />
        <ellipse cx="140" cy="140" rx="11" ry="7" fill="#ff9eb5" opacity=".6" />
        {talking ? (
          <g className="av-mouth-live">
            <ellipse cx="100" cy="146" rx="8.5" ry="7.5" fill="#7a2a2a" />
            <ellipse cx="100" cy="150" rx="5" ry="3" fill="#ff8a9a" />
          </g>
        ) : novaMouth(emotion)}
      </g>
    </g>
  );
}

function pandaMouth(emotion: AvatarEmotion) {
  switch (emotion) {
    case "cheer": return <path d="M89 146 Q100 162 111 146 Q100 150 89 146Z" fill="#5a1e24" stroke="#5a1e24" strokeWidth="2" strokeLinejoin="round" />;
    case "surprised": return <ellipse cx="100" cy="150" rx="4.5" ry="5.5" fill="#5a1e24" />;
    case "thinking": return <path d="M94 150 Q100 147 106 151" fill="none" stroke="#2a2a30" strokeWidth="2.6" strokeLinecap="round" />;
    default: return <path d="M91 145 Q96 151 100 146 Q104 151 109 145" fill="none" stroke="#2a2a30" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />;
  }
}

/**
 * Panda: a round, friendly panda cub with a red scarf. The eyes sit in the black eye
 * patches; its mouth follows the voice while it talks.
 */
function Panda({ id, emotion, talking }: { id: string; emotion: AvatarEmotion; talking: boolean }) {
  const brows = browParams(emotion);
  const rest = emotion === "thinking" ? 0.3 : 0;
  const happyEyes = emotion === "cheer";
  return (
    <g>
      {/* feet */}
      <ellipse cx="74" cy="232" rx="20" ry="11" fill={`url(#${id}-patch)`} />
      <ellipse cx="126" cy="232" rx="20" ry="11" fill={`url(#${id}-patch)`} />
      {/* arms */}
      <path d="M44 156 C22 162 18 194 32 204 C42 210 54 196 58 180Z" fill={`url(#${id}-patch)`} className="av-wing av-wing-l" />
      <path d="M156 156 C178 162 182 194 168 204 C158 210 146 196 142 180Z" fill={`url(#${id}-patch)`} className="av-wing av-wing-r" />
      <g className="av-body">
        <ellipse cx="100" cy="190" rx="56" ry="46" fill={`url(#${id}-fur)`} />
        <ellipse cx="100" cy="198" rx="34" ry="28" fill="#ffffff" opacity=".8" />
        {/* scarf */}
        <path d="M54 160 Q100 178 146 160 L144 172 Q100 190 56 172Z" fill={`url(#${id}-scarf)`} />
        <path d="M120 172 L132 204 L118 200 L112 176Z" fill={`url(#${id}-scarf)`} />
      </g>
      <g className="av-head">
        {/* ears */}
        <circle cx="50" cy="56" r="22" fill={`url(#${id}-patch)`} className="av-tuft av-tuft-l" />
        <circle cx="150" cy="56" r="22" fill={`url(#${id}-patch)`} className="av-tuft av-tuft-r" />
        <circle cx="50" cy="56" r="10" fill="#6b6f7a" opacity=".55" />
        <circle cx="150" cy="56" r="10" fill="#6b6f7a" opacity=".55" />
        {/* head */}
        <ellipse cx="100" cy="106" rx="70" ry="62" fill={`url(#${id}-fur)`} />
        <path d="M62 60 C80 48 120 48 138 60" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity=".8" />
        {/* eye patches */}
        <ellipse cx="70" cy="108" rx="22" ry="27" transform="rotate(28 70 108)" fill={`url(#${id}-patch)`} />
        <ellipse cx="130" cy="108" rx="22" ry="27" transform="rotate(-28 130 108)" fill={`url(#${id}-patch)`} />
        {/* brows */}
        <path d="M60 80 Q70 74 80 78" fill="none" stroke="#2a2a30" strokeWidth="3" strokeLinecap="round"
          style={{ transform: `translateY(${brows.ly}px) rotate(${brows.lr}deg)`, transformOrigin: "70px 78px" }} className="av-brow" />
        <path d="M120 78 Q130 74 140 80" fill="none" stroke="#2a2a30" strokeWidth="3" strokeLinecap="round"
          style={{ transform: `translateY(${brows.ry}px) rotate(${brows.rr}deg)`, transformOrigin: "130px 78px" }} className="av-brow" />
        {happyEyes ? (
          <g fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round">
            <path d="M62 112 Q72 100 82 112" />
            <path d="M118 112 Q128 100 138 112" />
          </g>
        ) : (
          <>
            <Eye id={id} name="l" cx={73} cy={106} rx={11} ry={12} iris={8} irisFill="#2b1a10" lid="#2a2b31" rest={rest} />
            <Eye id={id} name="r" cx={127} cy={106} rx={11} ry={12} iris={8} irisFill="#2b1a10" lid="#2a2b31" rest={rest} />
          </>
        )}
        {/* nose */}
        <path d="M91 128 Q100 123 109 128 Q106 137 100 138 Q94 137 91 128Z" fill="#1f2026" />
        <ellipse cx="97" cy="128" rx="3" ry="1.6" fill="#ffffff" opacity=".5" />
        <path d="M100 138 V143" stroke="#2a2a30" strokeWidth="2.4" strokeLinecap="round" />
        {/* rosy cheeks */}
        <ellipse cx="52" cy="140" rx="10" ry="6" fill="#ff9eb5" opacity={emotion === "happy" || emotion === "cheer" ? 0.6 : 0.35} />
        <ellipse cx="148" cy="140" rx="10" ry="6" fill="#ff9eb5" opacity={emotion === "happy" || emotion === "cheer" ? 0.6 : 0.35} />
        {talking ? (
          <g className="av-mouth-live">
            <ellipse cx="100" cy="151" rx="8.5" ry="7.5" fill="#5a1e24" />
            <ellipse cx="100" cy="155" rx="5" ry="3" fill="#ff8a9a" />
          </g>
        ) : pandaMouth(emotion)}
      </g>
    </g>
  );
}

const MASCOT_NAMES: Record<MascotKind, string> = { nova: "Nova", owl: "Alex", panda: "Panda" };

/** Calm, natural-looking random numbers between a and b. */
const between = (a: number, b: number) => a + Math.random() * (b - a);

export function TutorAvatar({ kind, mascot, status = "idle", emotion, size = 120, interactive = true, entrance = false, className = "" }: Props) {
  const rawId = useId();
  const id = `av${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef(status);
  statusRef.current = status;
  const previousStatus = useRef<AvatarStatus>(status);
  const wakeStart = useRef(0);
  const [waking, setWaking] = useState(false);

  // Leaving "sleeping": hop, blink a few times and show sparkles for a moment.
  useEffect(() => {
    const was = previousStatus.current;
    previousStatus.current = status;
    if (was !== "sleeping" || status === "sleeping") return;
    wakeStart.current = performance.now();
    setWaking(true);
    const timer = window.setTimeout(() => setWaking(false), 1800);
    return () => window.clearTimeout(timer);
  }, [status]);

  const talking = status === "speaking";
  const resolved: AvatarEmotion = status === "sleeping" ? "neutral" : emotion
    ?? (status === "thinking" ? "thinking" : status === "speaking" ? "happy" : status === "listening" ? "surprised" : "happy");

  // One animation loop drives the mouth, blinks, eye movement and pointer-follow through
  // CSS variables, so React does not re-render 60 times a second.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let frame = 0;
    let mouth = 0;
    let lid = 0;
    let nextBlink = performance.now() + between(1500, 4000);
    let blinkUntil = 0;
    let look = { x: 0, y: 0 };
    let lookTarget = { x: 0, y: 0 };
    let nextGlance = performance.now() + between(1200, 3000);
    let pointer: { x: number; y: number; at: number } | null = null;
    // Synthetic speech rhythm for when no real audio signal is available.
    let syllableEnd = 0;
    let syllableOpen = 0;

    const onMove = (event: PointerEvent) => { pointer = { x: event.clientX, y: event.clientY, at: performance.now() }; };
    if (interactive && !reduced) window.addEventListener("pointermove", onMove, { passive: true });

    const tick = (now: number) => {
      const speaking = statusRef.current === "speaking";

      // Mouth: real loudness, else a babble of syllables while speaking.
      let target = 0;
      if (speaking) {
        const real = realMouthLevel();
        if (real !== null) {
          target = real;
        } else {
          if (now > syllableEnd) {
            const pause = Math.random() < 0.12;
            syllableOpen = pause ? 0 : between(0.35, 1);
            syllableEnd = now + (pause ? between(120, 260) : between(90, 170));
          }
          target = syllableOpen;
        }
      }
      mouth += (target - mouth) * (target > mouth ? 0.55 : 0.3);

      // Blinks: random, sometimes double.
      if (now > nextBlink) {
        blinkUntil = now + 130;
        nextBlink = now + (Math.random() < 0.18 ? 260 : between(2200, 5500));
      }
      lid = now < blinkUntil ? 1 : Math.max(0, lid - 0.25);
      const sinceWake = now - wakeStart.current;
      if (statusRef.current === "sleeping") lid = 1;
      else if (sinceWake >= 0 && sinceWake < 1500) lid = Math.floor(sinceWake / 260) % 2 === 0 ? 1 : 0;

      // Eyes: follow the pointer for a while, otherwise glance around.
      const box = stage.getBoundingClientRect();
      if (pointer && now - pointer.at < 2500) {
        const dx = (pointer.x - (box.left + box.width / 2)) / Math.max(window.innerWidth / 2, 1);
        const dy = (pointer.y - (box.top + box.height * 0.4)) / Math.max(window.innerHeight / 2, 1);
        lookTarget = { x: Math.max(-1, Math.min(1, dx)), y: Math.max(-1, Math.min(1, dy)) };
      } else if (now > nextGlance) {
        lookTarget = Math.random() < 0.45 ? { x: 0, y: 0 } : { x: between(-0.9, 0.9), y: between(-0.6, 0.6) };
        nextGlance = now + between(900, 2800);
      }
      if (statusRef.current === "thinking") lookTarget = { x: 0.7, y: -0.8 };
      look = { x: look.x + (lookTarget.x - look.x) * 0.18, y: look.y + (lookTarget.y - look.y) * 0.18 };

      stage.style.setProperty("--mouth", mouth.toFixed(3));
      stage.style.setProperty("--lid", lid.toFixed(2));
      stage.style.setProperty("--look-x", (look.x * 4).toFixed(2));
      stage.style.setProperty("--look-y", (look.y * 3).toFixed(2));
      stage.style.setProperty("--av-ry", `${(look.x * 10).toFixed(2)}deg`);
      stage.style.setProperty("--av-rx", `${(-look.y * 6).toFixed(2)}deg`);
      frame = requestAnimationFrame(tick);
    };
    if (!reduced) frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [interactive]);

  const mascotKind: MascotKind = kind === "mascot" ? (mascot ?? LANG.mascot.kind) : "nova";
  const label = kind === "woman" ? "Cô giáo AI" : kind === "man" ? "Thầy giáo AI" : `Linh vật ${MASCOT_NAMES[mascotKind]}`;
  return (
    <div
      ref={stageRef}
      className={`av-stage av-${kind} av-status-${status} av-emo-${resolved}${entrance ? " av-enter" : ""}${waking ? " av-waking" : ""} ${className}`.trim()}
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
            ? (mascotKind === "owl" ? <Owl id={id} emotion={resolved} />
              : mascotKind === "panda" ? <Panda id={id} emotion={resolved} talking={talking} />
                : <Nova id={id} emotion={resolved} talking={talking} />)
            : <Human id={id} kind={kind} emotion={resolved} talking={talking} />}
        </svg>
      </div>
      <div className="av-shadow" />
      {status === "thinking" && <div className="av-think"><i /><i /><i /></div>}
      {status === "sleeping" && <div className="av-zzz" aria-hidden="true"><i>z</i><i>Z</i><i>Z</i></div>}
      {waking && <div className="av-sparks" aria-hidden="true"><i>✦</i><i>✦</i><i>✦</i><i>✦</i></div>}
    </div>
  );
}
