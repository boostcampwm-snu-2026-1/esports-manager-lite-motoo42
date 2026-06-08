export function SmallScreenGuard() {
  return (
    <div className="small-screen-guard" aria-live="polite">
      <div className="small-screen-guard-panel">
        <span>화면 크기 안내</span>
        <strong>PC 버전 또는 큰 가로 화면에서 이용해주세요.</strong>
        <p>
          MOBA Esports Manager Lite는 PC/노트북 또는 태블릿 가로 화면에
          최적화되어 있습니다.
        </p>
      </div>
    </div>
  );
}
