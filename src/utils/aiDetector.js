/**
 * CyberGuard-NLP: Context-Aware Cyberbullying Detection Engine (Client & Hybrid Bridge)
 * Features:
 * 1. Leetspeak & Obfuscation Normalizer (e.g. b!tch -> bitch, f00l -> fool, looooser -> loser)
 * 2. N-Gram Tokenizer & Phrase Matching
 * 3. Context & Negation Scope Analysis (correctly marks "not ugly", "never stupid" as Safe)
 * 4. Multi-Class Weighted Scoring (Threat, Harassment, Insult, Exclusion)
 */

const NEGATION_WORDS = new Set([
  'not', 'never', 'no', "don't", 'dont', "isn't", 'isnt', "aren't", 'arent', 
  "wasn't", 'wasnt', 'hardly', 'barely', 'scarcely', 'without'
]);

const CATEGORY_KEYWORDS = {
  Threat: [
    'die', 'kill', 'kill yourself', 'threat', 'destroy', 'hurt', 'hang', 'suicide', 'murder', 'stab',
    'beat you', 'beat you up', 'break your', 'cut yourself', 'watch your back', 'punch you', 'end your life', 'burn you',
    'shoot', 'strangle', 'drown', 'knife', 'weapon', 'slit', 'bullet', 'not worth living', 'not worth for living',
    'dont deserve to live', 'waste of life', 'waste of space', 'better off dead', 'not worth',
    'hunt you down', 'finish you', 'finish your chapter', 'under my control', 'hunt', 'scared of me', 'be scared'
  ],
  Harassment: [
    'creep', 'stalk', 'stalker', 'harass', 'bitch', 'slut', 'whore', 'bastard', 'target', 'freak',
    'pervert', 'psychopath', 'bully', 'abuse', 'torture', 'terrorize', 'chase', 'humiliate'
  ],
  Insult: [
    'cow', 'elephant', 'pig', 'fat', 'ugly', 'jerk', 'loser', 'idiot', 'dumb', 'fool', 'useless', 'rude',
    'shut up', 'clown', 'stupid', 'garbage', 'trash', 'worthless', 'moron', 'pathetic', 'donkey',
    'monkey', 'dog', 'filth', 'scum', 'disgusting', 'shame', 'dummy', 'not fit', 'not fit for anything',
    'good for nothing', 'fit for nothing', 'waste'
  ],
  Exclusion: [
    'isolate', 'isolated', 'exclude', 'ignore', 'not friend', 'never include', 'nobody likes you',
    'no one cares', 'stay away', 'get out', 'you dont belong', 'leave us', 'unwanted', 'kicked out'
  ]
};

export function normalizeLeetspeak(input) {
  if (!input) return '';
  let s = input.toLowerCase();

  // Common leetspeak symbol mappings
  s = s
    .replace(/@/g, 'a')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/!/g, 'i')
    .replace(/\$/g, 's')
    .replace(/5/g, 's')
    .replace(/3/g, 'e')
    .replace(/\+/g, 't')
    .replace(/7/g, 't')
    .replace(/4/g, 'a')
    .replace(/8/g, 'b');

  // Collapse repeated characters (e.g. "looooser" -> "loser", "faaaat" -> "fat")
  s = s.replace(/([a-z])\1{2,}/g, '$1');

  // Collapse single letter spaced words (e.g. "u g l y" -> "ugly") without stripping normal spaces
  s = s.replace(/\b([a-z])\s+([a-z])\s+([a-z])\s+([a-z])\s+([a-z])\b/g, '$1$2$3$4$5');
  s = s.replace(/\b([a-z])\s+([a-z])\s+([a-z])\s+([a-z])\b/g, '$1$2$3$4');
  s = s.replace(/\b([a-z])\s+([a-z])\s+([a-z])\b/g, '$1$2$3');

  return s.trim();
}

export function analyzeCyberbullying(text) {
  if (!text || !text.trim()) {
    return {
      severityScore: 0,
      flagStatus: 'Safe',
      result: 'Safe ------ 0% ------ Low',
      category: 'Clean',
      isBullying: false,
      flaggedTerms: []
    };
  }

  // Meta-discussion check (e.g. "Calling someone useless is wrong")
  const lowerText = text.toLowerCase();
  const safePhrases = [
    'is wrong',
    'is bad',
    'is unacceptable',
    'is inappropriate',
    'is not correct',
    'is not allowed',
    'should not call',
    'should never call',
    'is forbidden',
    'is illegal',
    'not correct to call',
    'is disrespectful',
    'is not polite',
    'is mean'
  ];
  if (safePhrases.some(phrase => lowerText.includes(phrase))) {
    return {
      severityScore: 2,
      flagStatus: 'Safe',
      result: 'Safe ------ 2% ------ Low',
      category: 'Clean',
      isBullying: false,
      flaggedTerms: []
    };
  }

  const normalized = normalizeLeetspeak(text);
  const tokens = normalized.split(/[\s,;:.!?]+/);
  const flaggedTerms = [];

  let threatScore = 0;
  let harassmentScore = 0;
  let insultScore = 0;
  let exclusionScore = 0;

  for (let i = 0; i < tokens.length; i++) {
    const unigram = tokens[i];
    const bigram = i + 1 < tokens.length ? `${tokens[i]} ${tokens[i + 1]}` : '';
    const trigram = i + 2 < tokens.length ? `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}` : '';

    // Check negation scope in previous 3 tokens
    let isNegated = false;
    for (let k = Math.max(0, i - 3); k < i; k++) {
      if (NEGATION_WORDS.has(tokens[k])) {
        isNegated = true;
        break;
      }
    }

    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        const matches =
          unigram === kw ||
          (bigram && bigram === kw) ||
          (trigram && trigram === kw);

        if (matches) {
          if (isNegated) {
            // Negated phrase (e.g. "not ugly", "never stupid") -> Do NOT flag!
            continue;
          }

          if (!flaggedTerms.includes(kw)) {
            flaggedTerms.push(kw);
          }

          if (cat === 'Threat') threatScore += 35;
          else if (cat === 'Harassment') harassmentScore += 25;
          else if (cat === 'Insult') insultScore += 20;
          else if (cat === 'Exclusion') exclusionScore += 18;
        }
      }
    }
  }

  let dominantCategory = 'Clean';
  let totalScore = 0;

  if (threatScore > 0) {
    dominantCategory = 'Threat';
    totalScore = 95;
  } else if (harassmentScore > 0) {
    dominantCategory = 'Harassment';
    totalScore = 80;
  } else if (insultScore > 0) {
    dominantCategory = 'Insult';
    totalScore = 60;
  } else if (exclusionScore > 0) {
    dominantCategory = 'Exclusion';
    totalScore = 50;
  }

  const isBullying = totalScore >= 30;
  const flagStatus = isBullying ? 'Flagged' : 'Safe';

  let tier = 'Low';
  if (totalScore >= 75) tier = 'At Risk';
  else if (totalScore >= 50) tier = 'High';
  else if (totalScore >= 30) tier = 'Average';

  const resultStr = `${isBullying ? dominantCategory : 'Safe'} ------ ${isBullying ? totalScore : Math.max(2, totalScore)}% ------ ${tier}`;

  return {
    severityScore: isBullying ? totalScore : Math.max(2, totalScore),
    flagStatus,
    result: resultStr,
    category: dominantCategory,
    isBullying,
    flaggedTerms
  };
}
