import { Component, For } from "solid-js";

// import logo from './logo.svg';
import styles from "./App.module.scss";
import { BiSolidRightArrow } from "solid-icons/bi";

interface AHDSymbol {
  symbol: string;
  chord: string;
}

class Node {
  aHDSymbol: AHDSymbol | undefined;
  children: Map<string, Node>;

  constructor(aHDSymbol?: AHDSymbol) {
    this.children = new Map();

    this.aHDSymbol = aHDSymbol;
  }
}

const App: Component = () => {
  const AHDSymbols: AHDSymbol[] = [
    {
      symbol: "ˌ",
      chord: ",",
    },
    {
      symbol: "ˈ",
      chord: "'",
    },
    {
      symbol: "ā",
      chord: "a-",
    },
    {
      symbol: "ä",
      chord: 'a"',
    },
    {
      symbol: "ē",
      chord: "e-",
    },
    {
      symbol: "ī",
      chord: "i-",
    },
    {
      symbol: "ō",
      chord: "o-",
    },
    {
      symbol: "ô",
      chord: "o^",
    },
    {
      symbol: "o͝o",
      chord: "ooB",
    },
    {
      symbol: "o͞o",
      chord: "oo-",
    },
    {
      symbol: "ə",
      chord: "e3",
    },
  ];

  let input: HTMLInputElement;

  // build hashmap from ahdsymbols for quick access
  const backmap: Map<string, Node> = new Map();

  AHDSymbols.forEach(({ chord }, idx) => {
    // chords can be of any length greater than or equal to 1
    if (chord.length === 1) {
      backmap.set(chord, new Node(AHDSymbols[idx]));
      return;
    }

    let i = chord.length - 1;

    if (!backmap.has(chord[i])) {
      backmap.set(chord[i], new Node());
    }

    let ptr = backmap.get(chord[i])!;

    while (true) {
      i--;
      if (i === 0) {
        ptr.children.set(chord[i], new Node(AHDSymbols[idx]));
        break;
      } else {
        if (!ptr.children.has(chord[i])) {
          ptr.children.set(chord[i], new Node());
        }
        ptr = ptr.children.get(chord[i])!;
      }
    }
  });

  function processKey(e: KeyboardEvent) {
    switch (e.key) {
      case "Shift": {
        break;
      }
      default: {
        // traverse from right to left
        let node = backmap.get(e.key);

        if (!node) {
          return;
        }
        let i = input.value.length - 1;

        while (true) {
          const ne: Node | undefined = node!.children.get(input.value[i]);

          if (!ne) {
            if (node!.aHDSymbol) {
              input.value =
                input.value.slice(0, i + 1) + node!.aHDSymbol!.symbol;
              e.preventDefault();
            }
            return;
          }

          node = ne;
          i--;
        }
      }
    }
  }

  return (
    <div class={styles.App}>
      <div>
        <label>
          <BiSolidRightArrow size={24} color="#000000" />
          <input ref={input!} onKeyDown={processKey}></input>
        </label>
      </div>
      <div class={styles.symbolWrapper}>
        <For each={AHDSymbols}>
          {(AHD) => (
            <div class={styles.symbol}>
              <button
                onClick={() => {
                  input.value += AHD.symbol;
                  input.focus();
                }}
              >
                {AHD.symbol}
              </button>
              <For each={AHD.chord.split("")}>{(c) => <div>{c}</div>}</For>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default App;
