import { LANG } from "@/lib/language";
import { deviceVoicesForAccent, guessDeviceVoiceGender, voiceQuality, type VoiceGender, type VoiceProfile } from "@/lib/voices";

export type DialogueLine = { speaker: string; text: string };

/** Lines like "Agent: Good morning." of a reading text; empty when it is not a conversation of two or more people. */
export function parseDialogue(reading: string): DialogueLine[] {
  const lines: DialogueLine[] = [];
  const speakers = new Set<string>();
  for (const raw of reading.split(/\n+/)) {
    const line = raw.trim();
    if (!line) continue;
    const match = /^([^\s:：][^:：\d]{0,24}?)\s*[:：]\s*(.+)$/.exec(line);
    if (match) {
      speakers.add(match[1].trim());
      lines.push({ speaker: match[1].trim(), text: match[2].trim() });
    } else if (lines.length) {
      lines.push({ speaker: "", text: line });
    }
  }
  return speakers.size >= 2 ? lines : [];
}

export const isConversation = (lines: DialogueLine[]) => new Set(lines.map((line) => line.speaker).filter(Boolean)).size >= 2;

const CLOUD_FEMALE = { google: ["Kore", "Aoede", "Zephyr", "Leda"], openai: ["shimmer", "coral", "nova", "sage"] };
const CLOUD_MALE = { google: ["Charon", "Orus", "Iapetus", "Achird"], openai: ["echo", "onyx", "ash", "fable"] };

export type DialogueCast = { speakers: VoiceProfile[]; narrator: VoiceProfile };

/**
 * One voice per person: the first speaker female, the second male, then alternating with other
 * voices; a third, calmer voice reads the names. Cloud voices and device voices are both set,
 * so the cast stays the same whichever one ends up playing.
 */
export function castDialogue(base: VoiceProfile, voices: SpeechSynthesisVoice[]): DialogueCast {
  const accentVoices = deviceVoicesForAccent(voices, base.accent);
  const pool = (accentVoices.length ? accentVoices : voices.filter((voice) => voice.lang.toLowerCase().startsWith(LANG.langPrefix)))
    .sort((a, b) => voiceQuality(b) - voiceQuality(a));
  const female = pool.filter((voice) => guessDeviceVoiceGender(voice) === "female");
  const male = pool.filter((voice) => guessDeviceVoiceGender(voice) === "male");
  const unknown = pool.filter((voice) => guessDeviceVoiceGender(voice) === "unknown");

  const deviceFor = (gender: VoiceGender, index: number): string => {
    const list = [...(gender === "female" ? female : male), ...unknown];
    const chosen = list.length ? list[index % list.length] : pool[index % Math.max(pool.length, 1)];
    return chosen?.voiceURI ?? "";
  };
  const make = (gender: VoiceGender, index: number): VoiceProfile => ({
    ...base,
    childlike: false,
    gender,
    style: "teacher",
    googleVoice: (gender === "female" ? CLOUD_FEMALE : CLOUD_MALE).google[index % 4],
    openaiVoice: (gender === "female" ? CLOUD_FEMALE : CLOUD_MALE).openai[index % 4],
    deviceVoice: deviceFor(gender, index),
  });
  const speakers = [make("female", 0), make("male", 0), make("female", 1), make("male", 1)];
  // the narrator takes a voice nobody else uses when the device has one
  const used = new Set(speakers.slice(0, 2).map((profile) => profile.deviceVoice));
  const spare = pool.find((voice) => !used.has(voice.voiceURI));
  const narrator: VoiceProfile = {
    ...base, childlike: false, gender: "female", style: "formal", speed: Math.min(base.speed, 0.9),
    googleVoice: "Sulafat", openaiVoice: "sage", deviceVoice: spare?.voiceURI ?? speakers[0].deviceVoice,
  };
  return { speakers, narrator };
}
