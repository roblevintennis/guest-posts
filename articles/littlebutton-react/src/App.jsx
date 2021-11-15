import "./App.css";
import styles from "./button.module.css";

const Button = ({ mode }) => {
  const primaryClass = mode ? styles[`btn${mode.charAt(0).toUpperCase()}${mode.slice(1)}`] : '';
  const classes = primaryClass ? `${styles.btn} ${primaryClass}` : styles.btn;
  return <button className={classes}>Go</button>;
};

function App() {
  return (
    <div className="App">
      <Button mode="primary" />
    </div>
  );
}

export default App;
