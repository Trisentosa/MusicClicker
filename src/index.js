import { Howl } from 'howler';
import { note} from "@tonaljs/tonal";

const sound = new Howl({
    src: ['assets/pianosprite.mp3'],
    onload() {
        console.log('Sound file successfully loaded');
        soundEngine.init();
    },
    onloaderror(e, msg) {
        console.log('Error', e, msg)
    }
});

const startNotes = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

const startNoteSelector = document.getElementById('start-note');
const octaveSelector = document.getElementById('octave');
const durationSelector = document.getElementById('duration');
const playButton = document.getElementById('playButton');
const addButton = document.getElementById('addButton');
const breakButton = document.getElementById('breakButton');
const notesToPlay = document.getElementById('notes-to-play');
const undoButton = document.getElementById('undoButton');
const deleteButton = document.getElementById('deleteButton');
const playAllButton = document.getElementById('play-all-button');


let selectedStartNote = 'C';
let selectedOctave = 1;
let selectedDuration = 400;
let notesToPlayArr = [];
let soundsArr = [];
let isPlaying = false;

const app = {
    init() {
        this.setupStartNotes();
        this.setupOctaves();
        this.setupEventListener();
        this.playNote();
        this.addNote();
        this.playAllNotes();
        this.undo();
        this.deleteAll();
        this.setupDuration();
        this.addBreak();
    },
    playNote(){
        playButton.addEventListener('click',()=>{
            if (!isPlaying) {
                isPlaying = true;
                const selectedNote = selectedStartNote + selectedOctave;
                soundEngine.playOne(selectedNote);
            }    
        })
    },
    playAllNotes(){
        playAllButton.addEventListener('click',()=>{
            if(!isPlaying && soundsArr.length>0){
                isPlaying = true;
                soundEngine.play(soundsArr);
            }            
        })
    },
    addNote(){
        addButton.addEventListener('click',()=>{
            const selectedNote = selectedStartNote + selectedOctave;
            soundsArr.push(new mySound(selectedNote,false,selectedDuration));
            notesToPlayArr = soundsArr.map(s =>{return s.noteName})
            notesToPlay.innerText = notesToPlayArr.join(' | ');
        })
    },
    undo(){
        undoButton.addEventListener('click',()=>{
            if(soundsArr.length>0){
                soundsArr.pop();
                notesToPlayArr.pop();
            if(notesToPlayArr.length === 0){
                notesToPlay.innerText = 'Added notes will be shown here';
            }else{
                notesToPlay.innerText = notesToPlayArr.join(' | ');
            }
        }   
        })
    },
    deleteAll(){
        deleteButton.addEventListener('click',()=>{
            soundsArr = [];
            notesToPlayArr = [];
            notesToPlay.innerText = 'Added notes will be shown here';
        })
    },
    addBreak(){
        breakButton.addEventListener('click',()=>{
            soundsArr.push(new mySound('break',true,selectedDuration))
            notesToPlayArr.push('break');
            notesToPlay.innerText = notesToPlayArr.join(' | ');
        })
    },
    createElement(elementName, content) {
        let element = document.createElement(elementName);
        element.innerHTML = content;
        return element;
    },
    setupStartNotes() {
        startNotes.forEach((noteName) => {
            let noteNameOption = this.createElement('option', noteName);
            startNoteSelector.appendChild(noteNameOption);
        });
    },
    setupOctaves() {
        for (let i = 1; i <= 7; i++) {
            let octaveNumber = this.createElement('option', i);
            octaveSelector.appendChild(octaveNumber);
        }
    },
    setupDuration(){
        for (let i = 400; i <= 2400; i+= 400) {
            let durationTime = this.createElement('option', i);
            durationSelector.appendChild(durationTime);
        }
    },
    setupEventListener() {
        startNoteSelector.addEventListener('change', () => {
            selectedStartNote = startNoteSelector.value;
        });
        octaveSelector.addEventListener('change', () => {
            selectedOctave = octaveSelector.value;
        });
        durationSelector.addEventListener('change',()=>{
            selectedDuration = durationSelector.value;
        });
    },
}

class mySound {
    constructor(noteName, isBreak, duration) {
        this.noteName = noteName;
        this.isBreak = isBreak;
        this.duration = duration;
    }
    midify() {
        if (this.isBreak) {
            return note('C1').midi;
        } else {
            return note(this.noteName).midi;
        }
    }
    play() {
        sound.volume(0.5);
        this.isBreak ? sound.volume(0) : sound.play(this.midify().toString());
    }
}

const soundEngine = {
    init() {
        const lengthOfNote = 2400;
        let timeIndex = 0;
        for (let i = 24; i <= 96; i++) {
            sound['_sprite'][i] = [timeIndex, lengthOfNote];
            timeIndex += lengthOfNote;
        }
    },
    play(allSounds) {
        let i = 0;
        const length = allSounds.length; 
        function myLoop() {
            if(i === 0){
                allSounds[i].play();
                i++;
            }
            if(length >1){
            setTimeout(function () {
                allSounds[i].play();            
                i++;
                if (i < length) {
                    myLoop();
                }else{
                    isPlaying = false;
                }
            }, allSounds[i-1].duration)}
        }
        myLoop();
    },
    playOne(selectedNote){
        sound.volume(0.5);
        const midiNumber = this.noteToMidi(selectedNote);
        sound.play(midiNumber.toString());
        setTimeout(() => { sound.volume(0);isPlaying = false},selectedDuration);
    },
    noteToMidi(noteToConvert){
        if(noteToConvert!=='break'){
            return note(noteToConvert).midi;
        }
    }
}

app.init();
