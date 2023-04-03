import { createSignal, Show } from 'solid-js';
import styles from './SummaryItem.module.css'

interface SummaryItemProps {
    content: string;
}

export default function SummaryItem(props: SummaryItemProps){
    return (
        <div class={styles.section}>
            {props.content}
        </div>
    );
}