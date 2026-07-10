import { guardarUsuario } from "./firebase.js";
import { readMidiFile } from "./midi.js";
import { loadHiHatSample, playNotes, stopPlayback } from "./player.js";
import { drawGrid, drawPianoRoll } from "./pianoRoll.js";
import { generateHiHatRolls } from "./generator.js";
import { ticksToSeconds } from "./utils.js";
import { exportGeneratedMidi } from "./exportMidi.js";
import { analyzePattern, findRollCandidates } from "./analyzer.js";

let midiState = null;

const fileInput = document.getElementById("midiFile");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const sampleSelect = document.getElementById("sampleSelect");
const pianoRoll = document.getElementById("pianoRoll");
const playhead = document.getElementById("playhead");
const rollType = document.getElementById("rollType");
const complexitySlider = document.getElementById("complexitySlider");
const complexityValue = document.getElementById("complexityValue");
const generateBtn = document.getElementById("generateBtn");
const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("appPage");
const emailInput = document.getElementById("emailInput");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");
const exportBtn = document.getElementById("exportBtn");

loginBtn.addEventListener("click", async function () {
  console.log("Click en entrar detectado");

  const email = emailInput.value.trim();

  if (!email || !email.includes("@")) {
    loginMessage.textContent = "Ingresa un correo válido.";
    return;
  }

  try {
    await guardarUsuario(email);

    loginPage.classList.add("hidden");
    appPage.classList.remove("hidden");

  } catch (error) {
    console.error(error);
    loginMessage.textContent = "No se pudo guardar el correo.";
  }
});

loadHiHatSample(sampleSelect.value);

sampleSelect.addEventListener("change", function () {
  loadHiHatSample(sampleSelect.value);
});

fileInput.addEventListener("change", async function (event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    midiState = await readMidiFile(file);

    const analysis = analyzePattern(
      midiState.allNotes,
      midiState.ppq,
      midiState.startTick,
      midiState.totalTicks
    );

    const candidates = findRollCandidates(analysis);

    console.log("Análisis del patrón:", analysis);
    console.table(candidates);

    drawGrid(pianoRoll, midiState.ppq, midiState.totalTicks);

    drawPianoRoll(
      pianoRoll,
      midiState.generatedNotes,
      midiState.startTick,
      midiState.totalTicks
    );

    playBtn.disabled = false;
    stopBtn.disabled = false;
    generateBtn.disabled = false;
    exportBtn.disabled = false;

  } catch (error) {
    console.error(error);
    alert("Hubo un error leyendo el MIDI. Revisa que el archivo sea .mid o .midi válido.");
  }
});

playBtn.addEventListener("click", async function () {
  if (!midiState || midiState.generatedNotes.length === 0) return;

  await playNotes(
    midiState.generatedNotes,
    midiState.startTick,
    midiState.ppq,
    midiState.midiData,
    midiState.midiDuration,
    playhead,
    pianoRoll,
    ticksToSeconds
  );
});

stopBtn.addEventListener("click", function () {
  stopPlayback(playhead);
});

complexitySlider.addEventListener("input", function () {
  complexityValue.textContent = complexitySlider.value;
});

generateBtn.addEventListener("click", function () {
  if (!midiState || midiState.allNotes.length === 0) return;

  const selectedType = rollType.value;
  const complexity = parseInt(complexitySlider.value);

  midiState.generatedNotes = generateHiHatRolls(
    midiState.allNotes,
    selectedType,
    complexity,
    midiState.ppq,
    midiState.startTick,
    midiState.totalTicks,
    midiState.midiData
  );

  drawPianoRoll(
    pianoRoll,
    midiState.generatedNotes,
    midiState.startTick,
    midiState.totalTicks
  );
});

exportBtn.addEventListener("click", function () {
  if (!midiState || midiState.generatedNotes.length === 0) return;

  exportGeneratedMidi(
    midiState.generatedNotes,
    midiState.midiData,
    "VEGOCIA_HiHat.mid"
  );
});