import { create } from "zustand";
import { Toast, ToastParams, useToastStore } from "./Toast";

const firstCharsRow = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];

const secondCharsRow = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];

const thirdCharsRow = ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"];

interface WordleStore {
  squares: string[][];
  currentRowIndex: number;
  handleChar: (char: string) => void;
  status: "active" | "guessed" | "missed";
  wordToGuess: string;
}

const useWordleStore = create<WordleStore>((set, get) => ({
  squares: [
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
  ],
  status: "active",
  wordToGuess: "prone",
  currentRowIndex: 0,
  handleChar: (char) => {
    const squaresCopy = [...get().squares];
    const currentRowIndex = get().currentRowIndex;
    const currentRow = squaresCopy[currentRowIndex];
    const wordToGuess = get().wordToGuess;

    const sendToast = (params: ToastParams) => {
      useToastStore.getState().toast(params);
    };

    const handleRowSubmit = () => {
      const isWordGuessedCorrectly = wordToGuess === currentRow.join("");
      const isWordGuessedIncorrectly =
        wordToGuess !== currentRow.join("") &&
        currentRowIndex === squaresCopy?.length - 1;
      const submittedRowIsNotFilled = currentRow[currentRow.length - 1] === "";
      if (submittedRowIsNotFilled) {
        sendToast({ message: "Fill all the letters to enter a new word" });
      } else if (isWordGuessedCorrectly) {
        set({ status: "guessed", currentRowIndex: currentRowIndex + 1 });
        sendToast({
          message:
            "You guessed the word correctly! You can try again with another word.",
          timeout: "infinity",
        });
      } else if (isWordGuessedIncorrectly) {
        set({ status: "missed", currentRowIndex: currentRowIndex + 1 });
        sendToast({
          message: "You missed the current word. Try again later.",
          timeout: "infinity",
        });
      } else {
        set({ currentRowIndex: currentRowIndex + 1 });
      }
    };

    const deleteChar = () => {
      let currentEmptyCellIndex = squaresCopy[currentRowIndex].findIndex(
        (char) => !char
      );
      const currentRowIsFilled = currentEmptyCellIndex === -1;

      if (currentRowIsFilled) {
        currentEmptyCellIndex = squaresCopy[currentRowIndex].length;
      }

      currentRow[currentEmptyCellIndex - 1] = "";
      set({ squares: squaresCopy });
    };

    const updateChar = () => {
      const currentEmptyCell = squaresCopy[currentRowIndex].findIndex(
        (c) => !c
      );

      currentRow[currentEmptyCell] = char;
      set({ squares: squaresCopy });
    };

    if (char === "enter") {
      handleRowSubmit();
    } else if (char === "backspace") {
      deleteChar();
    } else {
      updateChar();
    }
  },
}));

const ButtonGroup = ({ charRow }: { charRow: string[] }) => {
  const { handleChar, squares, wordToGuess, currentRowIndex, status } =
    useWordleStore();

  const handleCharClick = (char: string) => {
    handleChar(char);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {charRow.map((char) => {
        const nonExistantChar =
          squares.find(
            (square, i) =>
              square.find((row) => row.includes(char)) && i < currentRowIndex
          ) && !wordToGuess.includes(char);
        const isDisabled = status !== "active";
        return (
          <button
            disabled={isDisabled}
            style={{
              textTransform: "capitalize",
              fontWeight: "bold",
              border: "0px",
              color: "white",
              fontFamily: "arial",
              fontSize: 24,
              padding: 10,
              cursor: isDisabled ? "default" : "pointer",
              width: 40,
              height: 50,
              display: "flex",
              borderRadius: 4,
              alignItems: "center",
              justifyContent: "center",
              background: nonExistantChar ? "#2d2d2d" : "#848484",
            }}
            onClick={() => {
              handleCharClick(char);
            }}
            type="button"
          >
            {char === "enter" ? "↵" : char === "backspace" ? "⌫" : char}
          </button>
        );
      })}
    </div>
  );
};

const App = () => {
  const { squares, currentRowIndex, wordToGuess } = useWordleStore();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "48px 0px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toast />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "max-content",
          margin: "0 auto",
        }}
      >
        {squares.map((square, i) => {
          const isRowSubmitted = currentRowIndex > i;
          let remainingLetters = [...wordToGuess];

          return (
            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
              key={i}
            >
              {square.map((letter, i) => {
                const isLetterCorrect =
                  letter === wordToGuess[i] && isRowSubmitted;

                const letterExistsInAnotherPosition =
                  !isLetterCorrect &&
                  isRowSubmitted &&
                  remainingLetters?.includes(letter);

                if (isLetterCorrect || letterExistsInAnotherPosition) {
                  const indexFirstFoundLetter = remainingLetters.findIndex(
                    (l) => l !== letter
                  );

                  remainingLetters = remainingLetters.filter(
                    (_, i) => i !== indexFirstFoundLetter
                  );
                }
                return (
                  <div
                    style={{
                      width: 65,
                      height: 65,
                      fontSize: "32px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textTransform: "capitalize",
                      fontWeight: "bold",
                      lineHeight: "18px",
                      color: "white",
                      border: "1px solid #3c3c3c",
                      background: isLetterCorrect
                        ? "green"
                        : letterExistsInAnotherPosition
                        ? "#919139"
                        : isRowSubmitted
                        ? "#2d2d2d"
                        : "transparent",
                    }}
                    key={letter + i}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 32,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <ButtonGroup charRow={firstCharsRow} />
        <ButtonGroup charRow={secondCharsRow} />
        <ButtonGroup charRow={thirdCharsRow} />
      </div>
    </div>
  );
};

export default App;
