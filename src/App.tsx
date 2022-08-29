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
  const data: Map<string, Node> = new Map();

  AHDSymbols.forEach(({ chord, symbol }, idx) => {
    // assume all chords are of greater than 1 length

    if (!data.has(chord[0])) {
      data.set(chord[0], new Node());
    }
    let ptr = data.get(chord[0])!;

    for (let i = 1; i < chord.length; i++) {
      if (i === chord.length - 1) {
        ptr.children.set(chord[i], new Node(AHDSymbols[idx]));
      } else {
        if (!ptr.children.has(chord[i])) {
          ptr.children.set(chord[i], new Node());
        }
        ptr = ptr.children.get(chord[i])!;
      }
    }
  });

  console.log(data);

  let state: Node | undefined = undefined;
  function processKey(e: KeyboardEvent) {
    if (e.key === 'Shift') {
      return;
    }
    if (!state) {
      state = data.get(e.key);
    } else {
      state = state.children.get(e.key);

      if (state && state.children.size === 0) {
        e.preventDefault();

        input.value =
          input.value.slice(
            0,
            input.value.length - state.aHDSymbol!.chord.length + 1
          ) + state.aHDSymbol!.symbol;

        state = undefined;
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
              <div>{AHD.symbol}</div>
              <For each={AHD.chord.split("")}>{(c) => <div>{c}</div>}</For>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default App;
