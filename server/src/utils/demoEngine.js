/**
 * Offline Demo Engine
 * --------------------
 * A deterministic, dependency-free content generator used when no
 * GEMINI_API_KEY is configured. It performs real text analysis
 * (sentence scoring, keyword extraction, concept detection) so the
 * application remains fully functional for demos, viva and offline use.
 */

const STOP_WORDS = new Set(
  `a about above after again against all am an and any are as at be because been before being below between both but by can cannot could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not of off on once only or other ought our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why with would you your yours yourself yourselves also may can will shall must many much one two three using used use`
    .split(' ')
    .map((w) => w.trim())
    .filter(Boolean)
);

const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();

const splitSentences = (text) =>
  clean(text)
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);

const splitWords = (text) =>
  clean(text)
    .toLowerCase()
    .split(/[^a-z0-9+#.-]+/)
    .map((w) => w.replace(/^[.-]+|[.-]+$/g, ''))
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

const getKeywords = (text, limit = 12) => {
  const freq = {};
  splitWords(text).forEach((w) => {
    freq[w] = (freq[w] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
};

const titleCase = (str) =>
  str
    .split(' ')
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

const getConcepts = (text, limit = 8) => {
  const patterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|are|was|were|refers to|means|defined as|denotes)\s+([^.;]{10,150})/g,
    /\b([A-Z][A-Za-z0-9+#]{2,})\b(?:\s*[:\-–]\s*|\s+is\s+|\s+are\s+)([^.;]{10,150})/g,
  ];
  const found = [];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text)) !== null && found.length < limit * 2) {
      found.push({ term: clean(m[1]).trim(), detail: clean(m[2]).trim() });
    }
  }
  return found;
};

const scoreSentence = (sentence, keywordSet) => {
  const words = splitWords(sentence);
  let score = 0;
  words.forEach((w) => {
    if (keywordSet.has(w)) score += 2;
  });
  score += Math.min(words.length, 30) / 30;
  if (/\b(is|are|means|refers to|defined as|formula|theorem|principle|important|key)\b/i.test(sentence)) score += 2;
  return score;
};

const summarise = (text) => {
  const sentences = splitSentences(text);
  if (sentences.length === 0) {
    return {
      summary:
        'The provided material is too brief for automatic summarisation. Please upload a longer study material (at least a few paragraphs) for a meaningful summary.',
      keyPoints: [],
    };
  }

  const keywords = getKeywords(text, 15);
  const keywordSet = new Set(keywords);
  const maxSentences = Math.max(3, Math.min(7, Math.round(sentences.length * 0.3)));

  const ranked = sentences
    .map((sentence, index) => ({ sentence, index, score: scoreSentence(sentence, keywordSet) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence);

  const keyPoints = ranked.slice(0, 5);

  return {
    summary: ranked.join(' '),
    keyPoints,
    keywords,
  };
};

const buildFlashcards = (text, count) => {
  const n = Math.max(4, Math.min(Number(count) || 8, 20));
  const sentences = splitSentences(text);
  const keywords = getKeywords(text, 14);
  const concepts = getConcepts(text, n);
  const cards = [];

  concepts.forEach((c) => {
    if (cards.length >= n) return;
    cards.push({
      question: `What is ${titleCase(c.term)}?`,
      answer: c.detail.charAt(0).toUpperCase() + c.detail.slice(1),
      difficulty: 'Easy',
    });
  });

  sentences.forEach((s) => {
    if (cards.length >= n) return;
    const words = splitWords(s);
    if (words.length < 12) return;
    const focus = keywords.find((k) => s.toLowerCase().includes(k)) || keywords[0];
    cards.push({
      question: `Explain the role of "${titleCase(focus || 'this concept')}" in the context: "${s.slice(0, 90)}..."`,
      answer: s,
      difficulty: 'Medium',
    });
  });

  keywords.forEach((k) => {
    if (cards.length >= n) return;
    cards.push({
      question: `Define "${titleCase(k)}" as used in this material.`,
      answer: `"${titleCase(k)}" appears ${(clean(text).toLowerCase().match(new RegExp(`\\b${k}\\b`, 'g')) || []).length} time(s) in the material. Review the passages where it is introduced for its exact definition.`,
      difficulty: 'Medium',
    });
  });

  let guard = 0;
  while (cards.length < n && keywords.length && guard < n * 3) {
    const k = keywords[guard % keywords.length];
    cards.push({
      question: `Write a short note on "${titleCase(k)}" (revision point ${guard + 1}).`,
      answer: `Discuss the definition, working and one real-life example related to ${titleCase(k)}.`,
      difficulty: 'Hard',
    });
    guard += 1;
  }

  return cards.slice(0, n);
};

const buildQuiz = (text, count) => {
  const n = Math.max(4, Math.min(Number(count) || 5, 15));
  const sentences = splitSentences(text);
  const keywords = getKeywords(text, 16);
  const concepts = getConcepts(text, n);
  const questions = [];
  const usedQuestions = new Set();

  const distractorPool = keywords.filter((k) => k.length > 3);

  const makeOptions = (correct, seed) => {
    const pool = distractorPool.filter((d) => d !== correct.toLowerCase());
    const opts = new Set();
    opts.add(correct);
    let i = seed;
    while (opts.size < 4 && pool.length) {
      opts.add(titleCase(pool[i % pool.length]));
      i += 1;
    }
    while (opts.size < 4) {
      opts.add(`Option ${opts.size + 1}`);
    }
    const arr = Array.from(opts);
    for (let j = arr.length - 1; j > 0; j -= 1) {
      const k = (seed + j) % (j + 1);
      [arr[j], arr[k]] = [arr[k], arr[j]];
    }
    return arr;
  };

  const add = (question, correct, explanation) => {
    if (questions.length >= n || usedQuestions.has(question)) return;
    usedQuestions.add(question);
    questions.push({
      question,
      options: makeOptions(correct, questions.length * 3 + 1),
      correctAnswer: correct,
      explanation,
    });
  };

  concepts.forEach((c) => {
    add(
      `According to the material, ${c.term} refers to:`,
      c.detail.charAt(0).toUpperCase() + c.detail.slice(1),
      `The material states that ${c.term} refers to ${c.detail.toLowerCase()}.`
    );
  });

  sentences.slice(0, n * 2).forEach((s, i) => {
    const words = splitWords(s);
    if (words.length < 14) return;
    const focus = keywords.find((k) => s.toLowerCase().includes(k));
    if (!focus) return;
    const snippet = s.length > 150 ? `${s.slice(0, 150)}...` : s;
    add(
      `Which statement from the material best explains "${titleCase(focus)}" (question ${i + 1})?`,
      snippet,
      `This question checks your understanding of the key idea surrounding ${focus}.`
    );
  });

  keywords.slice(0, n).forEach((k) => {
    add(
      `Which of these terms is discussed most often in the material: option ${titleCase(k)}?`,
      titleCase(k),
      `"${titleCase(k)}" is one of the highest-frequency terms in the provided study material.`
    );
  });

  let guard = 0;
  while (questions.length < n && guard < n * 3) {
    const k = keywords[guard % keywords.length] || 'the core topic';
    add(
      `Revision priority ${guard + 1}: which topic should you revise first based on this material?`,
      titleCase(k),
      `${titleCase(k)} is a high-priority term in this material.`
    );
    guard += 1;
  }

  return questions.slice(0, n);
};

const buildStudyPlan = ({ subject, examDate, availableHoursPerDay, weakAreas, content }) => {
  const days = Math.max(1, Math.min(30, Math.ceil((new Date(examDate) - Date.now()) / 86400000)));
  const totalHours = (days * (Number(availableHoursPerDay) || 2)).toFixed(1);
  const keywords = getKeywords(content || '', 12);
  const topics = weakAreas.length ? weakAreas : keywords.slice(0, 6).map(titleCase);

  const phases = [
    { name: 'Foundation', focus: 'Building core understanding', tasks: ['Read the full material once without notes', 'Highlight key definitions and formulas'] },
    { name: 'Active Recall', focus: 'Flashcards and self-testing', tasks: ['Create flashcards for every topic', 'Attempt a 15-question quiz without notes'] },
    { name: 'Deep Revision', focus: 'Weak areas and problem solving', tasks: ['Re-solve previous year questions', 'Explain each topic aloud in 2 minutes'] },
    { name: 'Final Polish', focus: 'Rapid revision', tasks: ['Revise only the summary and key points', 'Sleep 7 hours the night before the exam'] },
  ];

  const dailyTasks = [];
  for (let d = 1; d <= days; d += 1) {
    const phase = phases[Math.min(phases.length - 1, Math.floor(((d - 1) / days) * phases.length))];
    const topic = topics[(d - 1) % Math.max(1, topics.length)] || subject;
    const date = new Date(Date.now() + d * 86400000);
    dailyTasks.push({
      day: d,
      date,
      focus: `${phase.name}: ${topic}`,
      tasks: [
        `Study "${topic}" for ${availableHoursPerDay || 2} hour(s)`,
        phase.tasks[d % phase.tasks.length],
        `Write 5 flashcards for ${topic} and review yesterday's cards`,
      ],
      duration: `${availableHoursPerDay || 2} hours`,
    });
  }

  const plan = [
    `SUBJECT: ${subject}`,
    `EXAM DATE: ${new Date(examDate).toDateString()}`,
    `DAYS REMAINING: ${days}`,
    `DAILY COMMITMENT: ${availableHoursPerDay || 2} hours  |  TOTAL: ${totalHours} hours`,
    '',
    '=== WEEKLY MILESTONES ===',
    ...Array.from({ length: Math.ceil(days / 7) }, (_, i) => {
      const from = i * 7 + 1;
      const to = Math.min(days, (i + 1) * 7);
      return `Week ${i + 1} (Day ${from}-${to}): Cover ${topics[i % Math.max(1, topics.length)] || subject} and complete one self-test.`;
    }),
    '',
    '=== DAILY SCHEDULE ===',
    ...dailyTasks.map(
      (d) =>
        `Day ${d.day} (${new Date(d.date).toDateString()}) - ${d.focus}\n` +
        d.tasks.map((t) => `   - ${t}`).join('\n')
    ),
    '',
    '=== EXAM DAY RULES ===',
    '  1. Sleep 7 hours the previous night.',
    '  2. Revise only the summary and key points in the final 60 minutes.',
    '  3. Attempt easy questions first, then attempt the rest.',
    '',
    '=== HIGH-PRIORITY TOPICS ===',
    ...topics.map((t, i) => `  ${i + 1}. ${t}`),
  ].join('\n');

  return { plan, dailyTasks, days, totalHours: Number(totalHours) };
};

module.exports = {
  summarise,
  buildFlashcards,
  buildQuiz,
  buildStudyPlan,
  getKeywords,
};
