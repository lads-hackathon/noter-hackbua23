import styles from './NoteItem.module.css';
import { NoteProps } from '../interfaces'
import { Accessor, onMount } from 'solid-js';
import {notes, setNotes, currentNote, setCurrentNote} from '../App'

interface NoteItemProps {
    note: NoteProps;
    clickCallback: (note: NoteProps) => void;
    deleteNote: (note: NoteProps) => void;
    currentNote: Accessor<NoteProps | undefined>;
}

export default function NoteItem(props: NoteItemProps) {
    let noteTitle;

    return (
        <div style={`background-color:${props.currentNote()?.id === props.note.id ? "#D8DEE9" : "#97a1b4"}`} class={styles.card} onClick={() => props.clickCallback(props.note)}>
            <div class={styles.header}>
                <p ref={noteTitle}>{props.note.title}</p>
            </div>

            <div class={styles.description}>
                {props.note.description}
            </div>

            {/* <button style="background-color: #BF616A;" onClick={() => props.deleteNote(props.note)}>Delete</button> */}
        </div>
    );
}