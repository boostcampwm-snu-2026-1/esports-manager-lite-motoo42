import { CareerSetup } from "../features/career-setup";
import { useGame } from "../app/GameProvider";

export function CareerSetupPage() {
  const { dispatch } = useGame();

  return (
    <CareerSetup
      onStart={(teamName) => dispatch({ type: "start-career", teamName })}
    />
  );
}
