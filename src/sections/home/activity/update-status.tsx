import styles from './update-status.module.css';

type Status = 'idle' | 'pending' | 'error';

type Props = {
  status: Status;
  messages: Record<Status, string>;
};

export function UpdateStatus({ status, messages }: Props) {
  return (
    <div
      className={styles.status}
      role={status === 'error' ? 'alert' : 'status'}
      aria-atomic="true"
    >
      {Object.entries(messages).map(([state, message]) => (
        <span key={state} aria-hidden={state !== status}>
          {message}
        </span>
      ))}
    </div>
  );
}
