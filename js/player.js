let hihatPlayer = null;
let animationId = null;

export function loadHiHatSample(samplePath) {
  if (hihatPlayer) {
    hihatPlayer.dispose();
  }

  hihatPlayer = new Tone.Player({
    url: samplePath,
    autostart: false
  }).toDestination();
}

export async function playNotes(notes, startTick, ppq, midiData, midiDuration, playhead, pianoRoll, ticksToSeconds) {
  if (!notes.length) return;

  await Tone.start();
  await Tone.loaded();

  stopPlayback(playhead);

  notes.forEach((note) => {
    const normalizedSeconds = ticksToSeconds(note.ticks, ppq, midiData) - ticksToSeconds(startTick, ppq, midiData);

    Tone.Transport.schedule((time) => {
      hihatPlayer.start(time, 0, undefined, 0, note.velocity);
    }, normalizedSeconds);
  });

  Tone.Transport.scheduleOnce(() => {
    stopPlayback(playhead);
  }, midiDuration);

  Tone.Transport.start();

  playhead.style.display = "block";

  const playStartTime = Tone.now();

  function animatePlayhead() {
    const elapsed = Tone.now() - playStartTime;
    const progress = elapsed / midiDuration;
    const rollWidth = pianoRoll.clientWidth;

    playhead.style.left = `${progress * rollWidth}px`;

    if (progress < 1) {
      animationId = requestAnimationFrame(animatePlayhead);
    }
  }

  animatePlayhead();
}

export function stopPlayback(playhead) {
  Tone.Transport.stop();
  Tone.Transport.cancel();

  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  playhead.style.display = "none";
  playhead.style.left = "0px";
}