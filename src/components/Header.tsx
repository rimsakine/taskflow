import styles from "./Header.module.css";
interface HeaderProps {
  title: string;
  userName?: string;
  onLogout?: () => void;
  onMenuClick: () => void;
}
export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.logo}>{title}</h1>
      </div>
      <span className={styles.avatar}>RS</span>
    </header>
  );
}
