import Scene from "../components/Scene";
import type { GameState } from "../types/GameState";

const state: GameState = { supplies: 42, fuel: 17, morale: "Steady" };

export default function PlaceholderScene({ onDone }: { onDone: () => void }) {
  return (
    <Scene
      prompt="Once you finish your reconnaissance, you should return to the hold and report back to the others. Then you can collect your reward. (placeholder scene)"
      choices={[
        "They're going to pay me a lot. I need money to help someone I care about",
        "They're going to pay me a lot, I'll use the bits to retire and live in prosperity and safety",
        "I'll be responsible for the new trade route. I'll become an important person in the merchant guild, a person with major influence",
        "I'll be the one who's going to bring peace and order to this galaxy and I want to be remembered for it",
        "I just want to help people. I f I can ame this area safer, I'm going to do it.",
        "A new life. This is everything I need. I have a difficult past, I want all of this to be forgotten.",
      ]}
      onChoice={onDone}
      state={state}
    />
  );
}
