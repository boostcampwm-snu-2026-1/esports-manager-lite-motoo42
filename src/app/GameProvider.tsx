import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useContext,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  createInitialGameState,
  gameReducer,
  type GameAction,
  type GameState,
} from "./state";

type GameStore = {
  dispatch: Dispatch<GameAction>;
  getState: () => GameState;
  subscribe: (listener: () => void) => () => void;
};

function createGameStore(): GameStore {
  let state = createInitialGameState();
  const listeners = new Set<() => void>();

  return {
    dispatch(action) {
      const nextState = gameReducer(state, action);

      if (Object.is(nextState, state)) {
        return;
      }

      state = nextState;
      listeners.forEach((listener) => listener());
    },
    getState() {
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const GameStoreContext = createContext<GameStore | null>(null);
const GameDispatchContext = createContext<Dispatch<GameAction> | null>(null);

export function GameProvider({ children }: PropsWithChildren) {
  const storeRef = useRef<GameStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createGameStore();
  }

  const store = storeRef.current;

  return (
    <GameDispatchContext.Provider value={store.dispatch}>
      <GameStoreContext.Provider value={store}>{children}</GameStoreContext.Provider>
    </GameDispatchContext.Provider>
  );
}

function useGameStore() {
  const store = useContext(GameStoreContext);

  if (!store) {
    throw new Error("Game hooks must be used inside GameProvider.");
  }

  return store;
}

export function useGameSelector<TSelected>(
  selector: (state: GameState) => TSelected,
) {
  const store = useGameStore();

  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}

export function useGameState() {
  return useGameSelector((state) => state);
}

export function useGameDispatch() {
  const dispatch = useContext(GameDispatchContext);

  if (!dispatch) {
    throw new Error("useGameDispatch must be used inside GameProvider.");
  }

  return dispatch;
}

export function useGame() {
  return {
    state: useGameState(),
    dispatch: useGameDispatch(),
  };
}
