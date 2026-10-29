export type GrammarQuestion = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type GrammarTopic = {
  id: string;
  level: "A1" | "A2" | "B1" | "B2";
  title: string;
  structure: string;
  overview: string;
  /** "Sentence [reading] (Vietnamese meaning)". Text in [brackets] is never read aloud. */
  examples: string[];
  questions: GrammarQuestion[];
};
