// The series context tags (format / game number / set score / stage). Shown in the
// centre of the banpick strip and the game's objective strip, not the top bar.
type LiveSeriesTagsProps = {
  blueSetWins: number;
  formatLabel: string;
  gameNumber: number;
  redSetWins: number;
  setCount: number;
  stageName: string;
};

export function LiveSeriesTags({
  blueSetWins,
  formatLabel,
  gameNumber,
  redSetWins,
  setCount,
  stageName,
}: LiveSeriesTagsProps) {
  return (
    <div className="live-series-row">
      <span>{formatLabel}</span>
      <span>Game {gameNumber}</span>
      {setCount > 1 ? (
        <span>
          세트 {blueSetWins} - {redSetWins}
        </span>
      ) : null}
      <span>{stageName}</span>
    </div>
  );
}
