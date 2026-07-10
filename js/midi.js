import { ticksToSeconds } from "./utils.js";

export async function readMidiFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const midiData = new window.Midi(arrayBuffer);

  const ppq = midiData.header.ppq || 480;

  let allNotes = [];

  midiData.tracks.forEach((track) => {
    track.notes.forEach((note) => {
      allNotes.push(note);
    });
  });

  allNotes.sort((a, b) => a.ticks - b.ticks);

  if (allNotes.length === 0) {
    throw new Error("No se detectaron notas MIDI.");
  }

  const startTick = allNotes[0].ticks;
  const endTick = Math.max(...allNotes.map(n => n.ticks + n.durationTicks));

  const ticksPerBar = ppq * 4;

  let totalTicks = endTick - startTick;
  totalTicks = Math.ceil(totalTicks / ticksPerBar) * ticksPerBar;

  const midiDuration = ticksToSeconds(startTick + totalTicks, ppq, midiData) - ticksToSeconds(startTick, ppq, midiData);

  return {
    midiData,
    ppq,
    allNotes,
    generatedNotes: allNotes.map(note => ({ ...note })),
    startTick,
    endTick,
    totalTicks,
    midiDuration
  };
}