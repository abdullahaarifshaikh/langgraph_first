import { useEffect, useState } from "react";
import "./HomePage.css"; // import the CSS

export default function HomePage() {
  const text = "PORTS";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Typing animation
  useEffect(() => {
    let timer;
    if (typing && index < text.length) {
      timer = setTimeout(() => setIndex(index + 1), 200);
    } else if (typing && index === text.length) {
      timer = setTimeout(() => setTyping(false), 1000);
    } else if (!typing && index > 0) {
      timer = setTimeout(() => setIndex(index - 1), 100);
    } else if (!typing && index === 0) {
      timer = setTimeout(() => setTyping(true), 500);
    }

    setDisplayText(text.substring(0, index));
    return () => clearTimeout(timer);
  }, [index, typing]);

  return (
    <div className={`home-page ${darkMode ? "dark" : "light"}`}>
      {/* Toggle */}
      <button onClick={() => setDarkMode(!darkMode)} className="toggle-btn">
        {darkMode ? "☀️" : "🌙"}
      </button>

      {/* Typing text */}
      <div className="typing">
        <span>{displayText}</span>
        <span className="cursor">_</span>
      </div>

      {/* Chat link */}
      <a href="/chat" className="chat-link">
        Chat →
      </a>
    </div>
  );
}
