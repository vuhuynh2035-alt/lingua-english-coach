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
  questions: GrammarQuestion[];
};

export const grammarTopics: GrammarTopic[] = [
  {
    id: "be-present",
    level: "A1",
    title: "Present simple: be",
    structure: "Subject + am / is / are",
    questions: [
      { prompt: "Choose the correct sentence.", options: ["They is ready.", "They are ready.", "They be ready."], answer: 1, explanation: "Use are with the subject they." },
      { prompt: "Complete: “I ___ a technician.”", options: ["am", "is", "are"], answer: 0, explanation: "Use am with the subject I." },
      { prompt: "Choose the correct question.", options: ["Is you tired?", "Are you tired?", "Do you be tired?"], answer: 1, explanation: "Form a question with be by placing are before you." },
    ],
  },
  {
    id: "present-simple",
    level: "A1",
    title: "Present simple: routines",
    structure: "Subject + base verb (add -s/-es for he, she, or it)",
    questions: [
      { prompt: "Complete: “Mai ___ the bus to work.”", options: ["take", "takes", "taking"], answer: 1, explanation: "Add -s to the present simple verb with a third-person singular subject." },
      { prompt: "Choose the correct negative sentence.", options: ["He doesn't work on Sundays.", "He don't works on Sundays.", "He not work on Sundays."], answer: 0, explanation: "Use doesn't + base verb for he, she, or it." },
      { prompt: "Complete: “___ they start at nine?”", options: ["Does", "Do", "Are"], answer: 1, explanation: "Use do to form present simple questions with they." },
    ],
  },
  {
    id: "articles",
    level: "A1",
    title: "Articles: a, an, and the",
    structure: "a/an + singular countable noun; the + specific noun",
    questions: [
      { prompt: "Complete: “She is ___ engineer.”", options: ["a", "an", "the"], answer: 1, explanation: "Use an before a singular countable noun that begins with a vowel sound." },
      { prompt: "Choose the correct sentence.", options: ["I need a information.", "I need an information.", "I need some information."], answer: 2, explanation: "Information is uncountable, so do not use a or an directly before it." },
      { prompt: "Complete: “Please close ___ door; it is making a noise.”", options: ["a", "an", "the"], answer: 2, explanation: "Use the when both speakers know which specific door is meant." },
    ],
  },
  {
    id: "possessives",
    level: "A1",
    title: "Possessive adjectives",
    structure: "my / your / his / her / its / our / their + noun",
    questions: [
      { prompt: "Complete: “Mr. Lee is a doctor. ___ office is on the second floor.”", options: ["His", "Her", "Their"], answer: 0, explanation: "Use his for a male person." },
      { prompt: "Choose the correct sentence.", options: ["We company is in Hanoi.", "Our company is in Hanoi.", "Ours company is in Hanoi."], answer: 1, explanation: "Use our before a noun to show that something belongs to us." },
      { prompt: "Complete: “The machine is old, but ___ motor still works.”", options: ["its", "it's", "their"], answer: 0, explanation: "Its is a possessive adjective; it's means it is." },
    ],
  },
  {
    id: "present-continuous",
    level: "A2",
    title: "Present continuous",
    structure: "Subject + am/is/are + verb-ing",
    questions: [
      { prompt: "Complete: “The team ___ the new system right now.”", options: ["tests", "is testing", "tested"], answer: 1, explanation: "Use the present continuous for an action happening now." },
      { prompt: "Choose the correct sentence.", options: ["I am waiting for the report.", "I waiting for the report.", "I am wait for the report."], answer: 0, explanation: "The present continuous needs be + verb-ing." },
      { prompt: "Complete: “What ___ you ___?”", options: ["do / do", "are / doing", "are / do"], answer: 1, explanation: "Form present continuous questions with am/is/are before the subject." },
    ],
  },
  {
    id: "comparatives",
    level: "A2",
    title: "Comparatives",
    structure: "short adjective + -er / more + adjective + than",
    questions: [
      { prompt: "Complete: “This model is ___ than the old one.”", options: ["quiet", "quieter", "the quietest"], answer: 1, explanation: "Use the comparative form + than to compare two things." },
      { prompt: "Choose the correct sentence.", options: ["The second route is more safe than the first.", "The second route is safer than the first.", "The second route is safest than the first."], answer: 1, explanation: "The comparative form of safe is safer." },
      { prompt: "Complete: “The new process is ___ complicated than before.”", options: ["less", "least", "few"], answer: 0, explanation: "Use less + adjective + than to describe a lower degree." },
    ],
  },
  {
    id: "going-to",
    level: "A2",
    title: "Be going to: plans",
    structure: "Subject + am/is/are + going to + base verb",
    questions: [
      { prompt: "Complete: “We ___ going to inspect the unit tomorrow.”", options: ["is", "are", "be"], answer: 1, explanation: "Use are with the subject we." },
      { prompt: "Choose the correct question.", options: ["Are you going to call the supplier?", "Do you going to call the supplier?", "Are you go to call the supplier?"], answer: 0, explanation: "Place am/is/are before the subject in a going-to question." },
      { prompt: "Complete: “She isn't going to ___ the meeting.”", options: ["attends", "attend", "attending"], answer: 1, explanation: "Going to is followed by the base form of the verb." },
    ],
  },
  {
    id: "past-simple",
    level: "A2",
    title: "Past simple",
    structure: "Subject + past verb; did + base verb in questions and negatives",
    questions: [
      { prompt: "Complete: “We ___ the client yesterday.”", options: ["meet", "met", "have met"], answer: 1, explanation: "Use the past simple for a finished action at a stated past time." },
      { prompt: "Choose the correct negative sentence.", options: ["She didn't called me.", "She didn't call me.", "She doesn't called me."], answer: 1, explanation: "After didn't, use the base form of the verb." },
      { prompt: "Complete: “___ you finish the report last night?”", options: ["Did", "Do", "Have"], answer: 0, explanation: "Use did + subject + base verb for past simple questions." },
    ],
  },
  {
    id: "future-forms",
    level: "B1",
    title: "Future plans and predictions",
    structure: "Present continuous for arrangements; will for predictions and decisions",
    questions: [
      { prompt: "The appointment is confirmed: “I ___ the doctor at 3 p.m. tomorrow.”", options: ["see", "am seeing", "will seeing"], answer: 1, explanation: "The present continuous commonly describes a fixed future arrangement." },
      { prompt: "The phone is ringing. “I ___ it.”", options: ["am answering", "will answer", "answering"], answer: 1, explanation: "Use will for a decision made at the moment of speaking." },
      { prompt: "Complete: “I think prices ___ next year.”", options: ["will rise", "are rise", "rising"], answer: 0, explanation: "Will is commonly used for predictions." },
    ],
  },
  {
    id: "modals-obligation",
    level: "B1",
    title: "Modals: advice and obligation",
    structure: "should + base verb; must/have to + base verb",
    questions: [
      { prompt: "Choose the best advice: “The report has several errors.”", options: ["You should check the figures again.", "You should to check the figures again.", "You checking the figures again."], answer: 0, explanation: "Use should + base verb to give advice." },
      { prompt: "Complete: “Employees ___ wear protective equipment in this area.”", options: ["must", "must to", "must wearing"], answer: 0, explanation: "Use must + base verb to express an obligation." },
      { prompt: "Complete: “I ___ submit the form today because the deadline is tomorrow.”", options: ["have to", "have", "should to"], answer: 0, explanation: "Use have to + base verb to describe an external requirement." },
    ],
  },
  {
    id: "first-conditional",
    level: "B1",
    title: "First conditional",
    structure: "If + present simple, will + base verb",
    questions: [
      { prompt: "Complete: “If the customer ___ now, I will answer the call.”", options: ["calls", "will call", "called"], answer: 0, explanation: "Use present simple in the if-clause of the first conditional." },
      { prompt: "Choose the correct sentence.", options: ["If we leave early, we will arrive on time.", "If we will leave early, we arrive on time.", "If we left early, we will arrive on time."], answer: 0, explanation: "The first conditional uses present simple after if and will in the result clause." },
      { prompt: "Complete: “The meeting will start on time if everyone ___ ready.”", options: ["is", "will be", "was"], answer: 0, explanation: "Use present simple in an if-clause referring to a real future possibility." },
    ],
  },
  {
    id: "present-perfect",
    level: "B1",
    title: "Present perfect",
    structure: "Subject + have/has + past participle",
    questions: [
      { prompt: "Complete: “I ___ this model before.”", options: ["have used", "used", "am using"], answer: 0, explanation: "Use the present perfect for experience without a specific finished time." },
      { prompt: "Choose the correct sentence.", options: ["She has worked here since 2022.", "She have worked here since 2022.", "She worked here since 2022."], answer: 0, explanation: "Use has with she and the present perfect with since for a period continuing to now." },
      { prompt: "Complete: “They ___ the inspection yet.”", options: ["haven't completed", "didn't completed", "aren't complete"], answer: 0, explanation: "Use haven't + past participle with yet for an unfinished action." },
    ],
  },
  {
    id: "passive-voice",
    level: "B2",
    title: "Passive voice",
    structure: "Subject + be + past participle",
    questions: [
      { prompt: "Choose the correct sentence.", options: ["The forms checked every morning.", "The forms are checked every morning.", "The forms are checking every morning."], answer: 1, explanation: "Use be + past participle to form the present simple passive." },
      { prompt: "Complete: “The appointment ___ by the clinic yesterday.”", options: ["was confirmed", "confirmed", "is confirming"], answer: 0, explanation: "Use was + past participle for a past simple passive with a singular subject." },
      { prompt: "Complete: “The results will ___ tomorrow.”", options: ["announce", "be announced", "be announcing"], answer: 1, explanation: "Use will be + past participle to form the future passive." },
    ],
  },
  {
    id: "reported-speech",
    level: "B2",
    title: "Reported statements",
    structure: "Reporting verb + (that) + tense-shifted statement",
    questions: [
      { prompt: "Report: “I am busy,” said Lan.", options: ["Lan said that she was busy.", "Lan said that I am busy.", "Lan said that she is busy yesterday."], answer: 0, explanation: "In reported speech, present simple or continuous often shifts back when the reporting verb is in the past." },
      { prompt: "Report: “We finished the task,” they said.", options: ["They said they have finished the task.", "They said they had finished the task.", "They said they finish the task."], answer: 1, explanation: "Past simple commonly shifts to past perfect in reported speech." },
      { prompt: "Choose the correct reported statement: “I will call you,” Minh said.", options: ["Minh said that he would call me.", "Minh said that he will called me.", "Minh said that I would call him."], answer: 0, explanation: "Will commonly changes to would when reported with a past reporting verb." },
    ],
  },
  {
    id: "conditionals",
    level: "B2",
    title: "Second conditional",
    structure: "If + past simple, would + base verb",
    questions: [
      { prompt: "Complete: “If the unit ___ quieter, it would suit this office.”", options: ["is", "were", "will be"], answer: 1, explanation: "The second conditional uses a past form in the if-clause for an unreal or hypothetical situation." },
      { prompt: "Choose the correct sentence.", options: ["If I knew the answer, I would tell you.", "If I would know the answer, I told you.", "If I know the answer, I would told you."], answer: 0, explanation: "Use past simple in the if-clause and would + base verb in the result clause." },
      { prompt: "Complete: “What ___ you do if a customer reported a safety issue?”", options: ["will", "would", "did"], answer: 1, explanation: "Use would to ask about a hypothetical result." },
    ],
  },
  {
    id: "relative-clauses",
    level: "B2",
    title: "Defining relative clauses",
    structure: "Noun + who / which / that + defining information",
    questions: [
      { prompt: "Choose the correct sentence.", options: ["The nurse which spoke to me was helpful.", "The nurse who spoke to me was helpful.", "The nurse where spoke to me was helpful."], answer: 1, explanation: "Use who for a person in a defining relative clause." },
      { prompt: "Complete: “The valve ___ controls the flow is damaged.”", options: ["who", "which", "where"], answer: 1, explanation: "Use which for a thing in a defining relative clause." },
      { prompt: "Choose the sentence with the correct defining clause.", options: ["A warranty is a document that explains the coverage.", "A warranty is a document who explains the coverage.", "A warranty is a document where explains the coverage."], answer: 0, explanation: "That can introduce a defining relative clause referring to a thing." },
    ],
  },
];
