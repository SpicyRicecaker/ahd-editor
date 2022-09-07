import { Component, createSignal, For } from "solid-js";

import styles from "./App.module.scss";
import { BiSolidRightArrow } from "solid-icons/bi";
import { BiSolidMoon } from "solid-icons/bi";

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
  const [isDark, setIsDark] = createSignal(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

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
        let i = input.selectionStart! - 1;

        while (true) {
          const ne: Node | undefined = node!.children.get(input.value[i]);

          if (!ne) {
            if (node!.aHDSymbol) {
              input.value =
                input.value.slice(0, i + 1) +
                node!.aHDSymbol!.symbol +
                input.value.slice(input.selectionStart!);
              input.setSelectionRange(
                i + 1 + node!.aHDSymbol!.symbol.length,
                i + 1 + node!.aHDSymbol!.symbol.length
              );
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
    <div class={`${isDark() ? styles.dark : styles.light} ${styles.App}`}>
      <div>
        <label>
          <BiSolidRightArrow size={24} color="var(--fg-1)" />
          <input ref={input!} spellcheck={false} onKeyDown={processKey}></input>
        </label>
      </div>
      <div class={styles.symbolWrapper}>
        <For each={AHDSymbols}>
          {(AHD) => (
            <div class={styles.symbol}>
              <button
                onClick={(e) => {
                  e.preventDefault();

                  const start = input.selectionStart!;
                  input.value =
                    input.value.slice(0, start) +
                    AHD.symbol +
                    input.value.slice(start);

                  input.setSelectionRange(
                    start + AHD.symbol.length,
                    start + AHD.symbol.length
                  );
                }}
              >
                {AHD.symbol}
              </button>
              <For each={AHD.chord.split("")}>{(c) => <div>{c}</div>}</For>
            </div>
          )}
        </For>
      </div>
      <button class={styles.theme} onClick={() => setIsDark((v) => !v)}>
        <BiSolidMoon size={24} />
      </button>
    </div>
  );
};

export default App;
