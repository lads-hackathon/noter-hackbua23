import { Store } from "solid-js/store";

export interface NoteProps {
    id: number;
    title: string;
    description: string;
    content: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correct: number;
}