import { Component, createEffect, createSignal, For, onMount, Show } from 'solid-js';
import { createStore, produce } from 'solid-js/store';

import styles from './App.module.css';

import { NoteProps, QuizQuestion } from './interfaces'

import NoteItem from './components/NoteItem'
import SummarySection from './components/SummarySection';

import EasyMDE from 'easymde';
import QuizComponent from './components/QuizComponent'
import SummaryItem from './components/SummaryItem';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const [ notes, setNotes ] = createStore([]);
export const [ currentNote, setCurrentNote ] = createSignal<NoteProps>();

const [summaries, setSummaries] = createStore([]);
const [summaryLoading, setSummaryLoading] = createSignal(false);

const [quizLoading, setQuizLoading] = createSignal();
const [ questions, setQuestions ] = createSignal<QuizQuestion[]>();
const [ questionCount, setQuestionCount ] = createSignal<number>(5);

let editor: EasyMDE;

function getEditor() {
  return editor;
}

function addNote(note: NoteProps) {
  setNotes([...notes, note]);
  
  loadNote(note);

  setCurrentNote(note);
}

// loads the note into the editor (to set active note, etc)
function loadNote(note: NoteProps) {

  if (currentNote() !== undefined) {
    saveNote(currentNote());
  }

  setSummaries([]);
  setQuestions([]);

  setCurrentNote(note)
  editor.value(note.content);
}

function saveNote(note: NoteProps) {
  let textContent = editor.value();

  setNotes(
    (newNote: NoteProps) => newNote.id === note.id,
    produce((newNote: NoteProps) => (
    newNote.content = textContent,
    newNote.description = textContent.substring(0, 16) + '...'
    ))
  );

  console.log(note.content);
}

async function createSummary(content: string) {
  const summaryReqUrl = new URL(`http://localhost:8000/generate/summary`);
  summaryReqUrl.searchParams.append("text", content);
  
  let txt = await (await (await fetch(summaryReqUrl)).text());

  return txt.substring(1, txt.length - 1);
}

async function handleSummary(editor: EasyMDE) {
  let selectedText = editor.codemirror.getSelection();

  console.log(selectedText);

  if (editor.codemirror.somethingSelected()) {
      return createSummary(selectedText);
  } else {
      return createSummary(editor.value());
  }
}

async function generateQuestions(content: string, count: number) {
  const quizReqUrl = new URL(`http://localhost:8000/generate/questions`);
  quizReqUrl.searchParams.append("numq", count.toString());
  quizReqUrl.searchParams.append("text", content);

  return await (await fetch(quizReqUrl)).json();
}

export default function App() {
  let markdownEditorElement;

  onMount(() => {
    editor = new EasyMDE({
      element: markdownEditorElement,
      minHeight: "75vh",
      toolbar: false,
      spellChecker: false
    });

    let note = {
      id: new Date().getMilliseconds(),
      title: "Untitled Note",
      description: "...",
      content: ""
    };

    addNote(note);
  });

  

  return (
    <div class={styles.page}>
      <div class={styles.nav}>
        <div class={styles.button} onClick={() => {
          let title = prompt("Note title")
          if (title == "" || title == null) {
            title = "Untitled Note"
          }
          
          let note = {
            id: new Date().getMilliseconds(),
            title: title,
            description: "...",
            content: ""
          };

          addNote(note);
        }}>
            Create note
        </div>
 
        <For each={notes}>
          {(note: NoteProps, i) => (
            <NoteItem note={note} clickCallback={note => loadNote(note)} currentNote={currentNote}></NoteItem>
          )}
        </For>
     </div>

      <main>
        <h1 style="color: #FFFFFF; margin-left: 10px">{currentNote()?.title}</h1>
        <textarea ref={markdownEditorElement}></textarea>

        <div class={styles.aiGeneratedcontainer}>
          <div class={styles.aiGenerated}>
          

          <div>
            <div class={styles.section}>
                <h1>Summaries</h1>
                
                <button onClick={() => {
                    setSummaryLoading(true);
                    handleSummary(editor).then(summary => {
                        setSummaries([...summaries, summary ]);
                        setSummaryLoading(false);
                    });
                }}>
                    Summarize
                </button>

                <br/>

                <Show when={summaryLoading()}>
                    <img width={128} src="https://cdn.discordapp.com/attachments/1092077054540918805/1092171723882889376/simple_loading.gif" />
                </Show>

            </div>

            <For each={summaries}>
                {(summary: string, i) => (
                    <SummaryItem content={summary}/>
                )}
            </For>
        </div>
          </div>

          <div class={styles.aiGenerated}>
            <h1>Quiz yourself</h1>

            <div>
              <Show when={!quizLoading()} fallback={<img width={128} src="https://cdn.discordapp.com/attachments/1092077054540918805/1092171723882889376/simple_loading.gif" />}>
                  <label for="question-count">Question count: </label>
                  <input id="question-count" type="number" onChange={ e => setQuestionCount(parseInt(e.currentTarget.value)) } placeholder="Question count" value={5} />
                  <br />
                  <button onClick={() => {
                      setQuizLoading(true);
                      generateQuestions(editor.value(), questionCount()).then(qs => {
                          setQuestions(qs);
                          setQuizLoading(false);
                      });
                  }}>Create quiz</button>
                  
                  <For each={questions()}>
                      {(question: QuizQuestion, i) => (
                          <div>
                              <h2>{question.question}</h2>
                              
                              <ul>
                                  <For each={question.options}>
                                      {(option: string, i) => (
                                          <li><button onClick={e => {
                                              let correct = question.correct === i();
                                              console.log(correct);
                                              
                                              if (correct) {
                                                  e.currentTarget.style.backgroundColor = '#27ae60';
                                              } else {
                                                  e.currentTarget.style.backgroundColor = '#e74c3c';
                                              }
                                          }}>{ALPHABET[i()]}. {option}</button></li>
                                      )}
                                  </For>
                              </ul>
                          </div>
                      )}
                  </For>
              </Show>
          </div>
          </div>
        </div>
      </main>
    </div>
  )
}