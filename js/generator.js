import { removeDuplicateNotes, ticksToSeconds } from "./utils.js";

export function generateHiHatRolls(notes, type, complexity, ppq, startTick, totalTicks, midiData) {
  let newNotes = notes.map(note => ({ ...note }));

  const ticksPerBar = ppq * 4;
  const totalBars = Math.ceil(totalTicks / ticksPerBar);

  const phrasesToUse = getPhrasesByType(type, complexity);
  const spots = chooseMusicalSpots(totalBars, complexity, startTick, ticksPerBar);

  spots.forEach((spot, index) => {
    const phrase = phrasesToUse[index % phrasesToUse.length];

    newNotes = applyPhrase(
      newNotes,
      phrase,
      spot,
      ppq,
      midiData
    );
  });

  newNotes = removeDuplicateNotes(newNotes);
  newNotes.sort((a, b) => a.ticks - b.ticks);

  return newNotes;
}

function chooseMusicalSpots(totalBars, complexity, startTick, ticksPerBar) {
  const spots = [];

  const maxPhrases = complexity;

  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = startTick + bar * ticksPerBar;

    const possibleSpots = [
      barStart + ticksPerBar * 0.75,  // beat 4
      barStart + ticksPerBar * 0.5,   // beat 3
      barStart + ticksPerBar - ticksPerBar / 8 // final del compás
    ];

    if (bar === totalBars - 1) {
      spots.push(possibleSpots[2]);
    } else if (complexity >= 3 && Math.random() > 0.35) {
      spots.push(possibleSpots[Math.floor(Math.random() * possibleSpots.length)]);
    } else if (complexity <= 2 && Math.random() > 0.65) {
      spots.push(possibleSpots[0]);
    }

    if (spots.length >= maxPhrases) break;
  }

  return spots;
}

function getPhrasesByType(type, complexity) {
  const phrases = {
    roll: [
      "shortRoll",
      "endRoll",
      "fastBurst",
      "doubleTap",
      "reverseRoll"
    ],
    triplet: [
      "tripletPull",
      "tripletEnd",
      "tripletBounce"
    ],
    stutter: [
      "stutterShort",
      "stutterGap",
      "machineGun"
    ],
    bounce: [
      "bounceLowHigh",
      "bounceTrap",
      "bounceEnd"
    ]
  };

  let selected = phrases[type] || phrases.roll;

  if (complexity >= 4) {
    selected = [...selected, "machineGun", "fastBurst", "tripletEnd"];
  }

  return shuffle(selected);
}

function applyPhrase(currentNotes, phraseName, spotTick, ppq, midiData) {
  const baseNote = findClosestNoteBefore(currentNotes, spotTick);
  if (!baseNote) return currentNotes;

  const phrase = buildPhrase(phraseName, spotTick, ppq);

  const phraseStart = phrase.start;
  const phraseEnd = phrase.end;

  const cleanedNotes = currentNotes.filter(note =>
    !(note.ticks >= phraseStart && note.ticks <= phraseEnd)
  );

  const newPhraseNotes = phrase.events.map(event => {
    return createNote(
      baseNote,
      event.tick,
      event.velocity,
      event.duration,
      ppq,
      midiData
    );
  });

  return [...cleanedNotes, ...newPhraseNotes];
}

function buildPhrase(name, spotTick, ppq) {
  const s16 = ppq / 4;
  const s32 = ppq / 8;
  const s64 = ppq / 16;
  const trip = ppq / 6;

  const phraseMap = {
    shortRoll: {
      start: spotTick - s16,
      end: spotTick + s16,
      events: [
        { tick: spotTick - s16, velocity: 0.65, duration: s64 },
        { tick: spotTick - s32, velocity: 0.75, duration: s64 },
        { tick: spotTick, velocity: 0.95, duration: s64 }
      ]
    },

    endRoll: {
      start: spotTick - s16,
      end: spotTick + s16,
      events: [
        { tick: spotTick - s16, velocity: 0.55, duration: s64 },
        { tick: spotTick - s32, velocity: 0.68, duration: s64 },
        { tick: spotTick, velocity: 0.85, duration: s64 },
        { tick: spotTick + s32, velocity: 0.95, duration: s64 }
      ]
    },

    fastBurst: {
      start: spotTick - s32,
      end: spotTick + s16,
      events: [
        { tick: spotTick - s32, velocity: 0.55, duration: s64 },
        { tick: spotTick - s64, velocity: 0.7, duration: s64 },
        { tick: spotTick, velocity: 0.82, duration: s64 },
        { tick: spotTick + s64, velocity: 0.95, duration: s64 }
      ]
    },

    doubleTap: {
      start: spotTick - s16,
      end: spotTick + s16,
      events: [
        { tick: spotTick - s16, velocity: 0.8, duration: s64 },
        { tick: spotTick, velocity: 0.6, duration: s64 },
        { tick: spotTick + s32, velocity: 0.92, duration: s64 }
      ]
    },

    reverseRoll: {
      start: spotTick - s16,
      end: spotTick + s16,
      events: [
        { tick: spotTick - s16, velocity: 0.95, duration: s64 },
        { tick: spotTick - s32, velocity: 0.75, duration: s64 },
        { tick: spotTick, velocity: 0.55, duration: s64 }
      ]
    },

    tripletPull: {
      start: spotTick - ppq / 2,
      end: spotTick + s16,
      events: [
        { tick: spotTick - trip * 2, velocity: 0.55, duration: s64 },
        { tick: spotTick - trip, velocity: 0.75, duration: s64 },
        { tick: spotTick, velocity: 0.95, duration: s64 }
      ]
    },

    tripletEnd: {
      start: spotTick - ppq / 2,
      end: spotTick + s16,
      events: [
        { tick: spotTick - trip * 3, velocity: 0.6, duration: s64 },
        { tick: spotTick - trip * 2, velocity: 0.72, duration: s64 },
        { tick: spotTick - trip, velocity: 0.85, duration: s64 },
        { tick: spotTick, velocity: 1.0, duration: s64 }
      ]
    },

    tripletBounce: {
      start: spotTick - ppq / 2,
      end: spotTick + s16,
      events: [
        { tick: spotTick - trip * 2, velocity: 0.9, duration: s64 },
        { tick: spotTick - trip, velocity: 0.45, duration: s64 },
        { tick: spotTick, velocity: 0.85, duration: s64 }
      ]
    },

    stutterShort: {
      start: spotTick - s16,
      end: spotTick + s16,
      events: [
        { tick: spotTick - s32, velocity: 0.85, duration: s64 },
        { tick: spotTick, velocity: 0.65, duration: s64 }
      ]
    },

    stutterGap: {
      start: spotTick - s16,
      end: spotTick + s16,
      events: [
        { tick: spotTick - s16, velocity: 0.9, duration: s64 },
        { tick: spotTick + s32, velocity: 0.7, duration: s64 }
      ]
    },

    machineGun: {
      start: spotTick - s16,
      end: spotTick + s16,
      events: [
        { tick: spotTick - s16, velocity: 0.55, duration: s64 },
        { tick: spotTick - s16 + s64, velocity: 0.62, duration: s64 },
        { tick: spotTick - s16 + s64 * 2, velocity: 0.74, duration: s64 },
        { tick: spotTick - s16 + s64 * 3, velocity: 0.86, duration: s64 },
        { tick: spotTick, velocity: 0.98, duration: s64 }
      ]
    },

    bounceLowHigh: {
      start: spotTick - s16,
      end: spotTick + s16,
      events: [
        { tick: spotTick - s16, velocity: 0.95, duration: s64 },
        { tick: spotTick - s32, velocity: 0.45, duration: s64 },
        { tick: spotTick, velocity: 0.85, duration: s64 }
      ]
    },

    bounceTrap: {
      start: spotTick - s16,
      end: spotTick + s16,
      events: [
        { tick: spotTick - s16, velocity: 0.8, duration: s64 },
        { tick: spotTick - s64, velocity: 0.5, duration: s64 },
        { tick: spotTick + s64, velocity: 0.92, duration: s64 }
      ]
    },

    bounceEnd: {
      start: spotTick - s16,
      end: spotTick + s16,
      events: [
        { tick: spotTick - s16, velocity: 0.65, duration: s64 },
        { tick: spotTick - s32, velocity: 0.4, duration: s64 },
        { tick: spotTick, velocity: 0.78, duration: s64 },
        { tick: spotTick + s32, velocity: 0.95, duration: s64 }
      ]
    }
  };

  return phraseMap[name] || phraseMap.shortRoll;
}

function createNote(baseNote, ticks, velocity, durationTicks, ppq, midiData) {
  return {
    ...baseNote,
    ticks: Math.max(0, Math.round(ticks)),
    time: ticksToSeconds(ticks, ppq, midiData),
    velocity: clamp(velocity, 0.15, 1),
    durationTicks: Math.max(20, Math.round(durationTicks)),
    duration: ticksToSeconds(ticks + durationTicks, ppq, midiData) - ticksToSeconds(ticks, ppq, midiData)
  };
}

function findClosestNoteBefore(notes, tick) {
  let closest = notes[0];

  notes.forEach(note => {
    if (note.ticks <= tick) {
      closest = note;
    }
  });

  return closest;
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}