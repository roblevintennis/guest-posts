import "./App.css";
import styles from "./button.module.css";

const Button = () => {
  return <button className={styles.btn}>Go</button>;
};

function App() {
  return (
    <div className="App">
      <Button />
    </div>
  );
}

export default App;
