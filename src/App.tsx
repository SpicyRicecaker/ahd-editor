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

  // document.addEventListener('click', () => {
  //   input.focus();
  // });

  const AHDSymbols: AHDSymbol[] = [
    {
      symbol: "ˌ",
      chord: ",",
    },
    {
      symbol: ",",
      chord: "ˌ,",
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

  let ahdSpelling: HTMLInputElement;
  let englishSpelling: HTMLInputElement;
  let google: HTMLIFrameElement;

  const spellingFocusList = [() => ahdSpelling, () => englishSpelling];
  let spellingFocusIndex = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();

      // try focusing
      const i = (spellingFocusIndex + 1) % spellingFocusList.length;
      spellingFocusList[i]().focus();
      spellingFocusIndex = i;
    }
  });


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
      // emacs bindings
      case "f": {
        if (e.ctrlKey) {
          e.preventDefault();
          ahdSpelling.setSelectionRange(ahdSpelling.selectionStart! + 1, ahdSpelling.selectionStart! + 1);
        }
        break;
      }
      case "b": {
        if (e.ctrlKey) {
          e.preventDefault();
          ahdSpelling.setSelectionRange(ahdSpelling.selectionStart! - 1, ahdSpelling.selectionStart! - 1);
        }
        break;
      }
      // end emacs bindings
      case "Enter": {
        google.src = `https://www.google.com/search?igu=1&ei=&q=define+${englishSpelling.value.replaceAll(" ", "+")}`
        break;
      }
      default: {
        // traverse from right to left
        let node = backmap.get(e.key);

        if (!node) {
          return;
        }

        let i = ahdSpelling.selectionStart! - 1;

        while (true) {
          const ne: Node | undefined = node!.children.get(ahdSpelling.value[i]);

          if (!ne) {
            if (node!.aHDSymbol) {
              ahdSpelling.value =
                ahdSpelling.value.slice(0, i + 1) +
                node!.aHDSymbol!.symbol +
                ahdSpelling.value.slice(ahdSpelling.selectionEnd!);

              ahdSpelling.setSelectionRange(
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
      <div class={styles.dark}>
        target: <input ref={englishSpelling!} id="english-spelling" class={styles.coolInput}></input>
      </div>
      <div>
        <label>
          <BiSolidRightArrow size={24} />
          <input id="ahd-spelling" class={styles.coolInput} ref={ahdSpelling!} spellcheck={false} onKeyDown={processKey}></input>
        </label>
      </div>
      <div class={styles.symbolWrapper}>
        <For each={AHDSymbols}>
          {(AHD) => (
            <div class={styles.symbol}>
              <button
                tabIndex={-1}
                onClick={(e) => {
                  e.preventDefault();

                  const [start, end] = [ahdSpelling.selectionStart!, ahdSpelling.selectionEnd!];

                  ahdSpelling.value =
                    ahdSpelling.value.slice(0, start) +
                    AHD.symbol +
                    ahdSpelling.value.slice(end);

                  ahdSpelling.setSelectionRange(
                    start + AHD.symbol.length,
                    start + AHD.symbol.length
                  );

                  ahdSpelling.focus();
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
      <iframe ref={google!} style="border: none;" width="600px" height="800px" src=""></iframe>
    </div>
  );
};

export default App;
