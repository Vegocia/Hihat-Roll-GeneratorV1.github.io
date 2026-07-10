import { Midi } from "https://cdn.jsdelivr.net/npm/@tonejs/midi/+esm";

export function exportGeneratedMidi(
    generatedNotes,
    originalMidi,
    fileName = "VEGOCIA_HiHat.mid"
){

    // Copiamos el MIDI original completo
    const newMidi = new Midi(originalMidi.toArray());

    // Nos aseguramos de tener al menos un track
    if(newMidi.tracks.length===0){
        newMidi.addTrack();
    }

    const track = newMidi.tracks[0];

    // Eliminamos únicamente las notas del track
    track.notes = [];

    // Insertamos las nuevas notas
    generatedNotes.forEach(note=>{

        track.addNote({

            midi: note.midi,

            ticks: note.ticks,

            durationTicks: note.durationTicks,

            velocity: note.velocity

        });

    });

    const bytes = newMidi.toArray();

    const blob = new Blob([bytes],{
        type:"audio/midi"
    });

    const url = URL.createObjectURL(blob);

    const a=document.createElement("a");

    a.href=url;

    a.download=fileName;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

}
