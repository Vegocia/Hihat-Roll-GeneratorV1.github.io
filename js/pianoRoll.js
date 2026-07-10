export function drawGrid(pianoRoll, ppq, totalTicks) {
  pianoRoll.querySelectorAll(".grid-line").forEach(el => el.remove());

  const rollWidth = pianoRoll.clientWidth;

  const ticksPerBar = ppq * 4;
  const ticksPerBeat = ppq;
  const ticksPerSixteenth = ppq / 4;

  for (let tick = 0; tick <= totalTicks; tick += ticksPerSixteenth) {
    const x = (tick / totalTicks) * rollWidth;

    const line = document.createElement("div");
    line.classList.add("grid-line");

    if (tick % ticksPerBar === 0) {
      line.classList.add("bar-line");
    } else if (tick % ticksPerBeat === 0) {
      line.classList.add("beat-line");
    } else {
      line.classList.add("sixteenth-line");
    }

    line.style.left = `${x}px`;
    pianoRoll.appendChild(line);
  }
}

export function drawPianoRoll(pianoRoll, notesToDraw, startTick, totalTicks) {
  pianoRoll.querySelectorAll(".note, .velocity").forEach(el => el.remove());

  const rollWidth = pianoRoll.clientWidth;
  const rollHeight = pianoRoll.clientHeight;

  notesToDraw.forEach((note) => {
    const relativeTick = note.ticks - startTick;
    const x = (relativeTick / totalTicks) * rollWidth;

    const y = rollHeight / 2 - 20;
    const noteWidth = Math.max(8, (note.durationTicks / totalTicks) * rollWidth);

    const noteDiv = document.createElement("div");
    noteDiv.classList.add("note");
    noteDiv.style.left = `${x}px`;
    noteDiv.style.top = `${y}px`;
    noteDiv.style.width = `${noteWidth}px`;

    pianoRoll.appendChild(noteDiv);

    const velocityDiv = document.createElement("div");
    velocityDiv.classList.add("velocity");
    velocityDiv.style.left = `${x}px`;
    velocityDiv.style.height = `${note.velocity * 65}px`;

    pianoRoll.appendChild(velocityDiv);
  });
}