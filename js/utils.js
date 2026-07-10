export function getBpm(midiData) {
  return midiData && midiData.header.tempos.length > 0
    ? midiData.header.tempos[0].bpm
    : 120;
}

export function ticksToSeconds(ticks, ppq, midiData) {
  const bpm = getBpm(midiData);
  const beats = ticks / ppq;
  return (60 / bpm) * beats;
}

export function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

export function removeDuplicateNotes(notes) {
  const seen = new Set();

  return notes.filter((note) => {
    const key = Math.round(note.ticks);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}