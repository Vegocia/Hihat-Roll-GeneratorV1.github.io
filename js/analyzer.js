export function analyzePattern(notes, ppq, startTick, totalTicks) {
  const ticksPerBar = ppq * 4;
  const ticksPerBeat = ppq;

  const bars = [];
  const totalBars = Math.ceil(totalTicks / ticksPerBar);

  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = startTick + bar * ticksPerBar;
    const barEnd = barStart + ticksPerBar;

    const barNotes = notes.filter(note =>
      note.ticks >= barStart &&
      note.ticks < barEnd
    );

    const beats = [];

    for (let beat = 0; beat < 4; beat++) {
      const beatStart = barStart + beat * ticksPerBeat;
      const beatEnd = beatStart + ticksPerBeat;

      const beatNotes = barNotes.filter(note =>
        note.ticks >= beatStart &&
        note.ticks < beatEnd
      );

      beats.push({
        beat: beat + 1,
        startTick: beatStart,
        endTick: beatEnd,
        notes: beatNotes,
        density: beatNotes.length
      });
    }

    bars.push({
      number: bar + 1,
      startTick: barStart,
      endTick: barEnd,
      notes: barNotes,
      beats
    });
  }

  return bars;
}

export function findRollCandidates(bars) {
  const candidates = [];

  bars.forEach(bar => {
    bar.beats.forEach(beat => {
      let score = 0;

      if (beat.beat === 4) score += 5;
      if (beat.beat === 3) score += 2;
      if (beat.density <= 4) score += 2;
      if (beat.density > 10) score -= 4;

      candidates.push({
        bar: bar.number,
        beat: beat.beat,
        startTick: beat.startTick,
        endTick: beat.endTick,
        score,
        density: beat.density,
        notes: beat.notes
      });
    });
  });

  candidates.sort((a, b) => b.score - a.score);

  return candidates;
}