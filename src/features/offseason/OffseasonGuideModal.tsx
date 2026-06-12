import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";

type OffseasonGuideModalProps = {
  onClose: () => void;
};

type OffseasonGuideBannerProps = {
  onOpenGuide: () => void;
};

export function OffseasonGuideBanner({
  onOpenGuide,
}: OffseasonGuideBannerProps) {
  return (
    <Card>
      <div className="offseason-guide-banner">
        <div>
          <span>Stove League Rule</span>
          <strong>1군 5인 구성이 먼저입니다</strong>
          <p>
            2군 영입은 선택입니다. 부족한 2군 인원은 최종 등록 시 자동으로
            채워집니다.
          </p>
        </div>
        <Button variant="ghost" onClick={onOpenGuide}>
          스토브리그 룰 보기
        </Button>
      </div>
    </Card>
  );
}

export function OffseasonGuideModal({ onClose }: OffseasonGuideModalProps) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose} role="presentation">
      <section
        aria-labelledby="offseason-guide-title"
        aria-modal="true"
        className="offseason-guide-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          aria-label="닫기"
          className="modal-close-button"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <div>
          <p className="eyebrow">Stove League Guide</p>
          <h2 id="offseason-guide-title">스토브리그 기본 룰</h2>
          <p>
            이번 스토브리그의 목표는 복잡하지 않습니다. 먼저 1군 5인을
            완성하고, 2군은 필요한 만큼만 직접 보강하면 됩니다.
          </p>
        </div>
        <div className="offseason-guide-points">
          <article>
            <span>01</span>
            <strong>1군 5인 완성이 핵심 목표</strong>
            <p>
              탑, 정글, 미드, 바텀, 서포터 선발 라인을 먼저 안정적으로
              구성하세요.
            </p>
          </article>
          <article>
            <span>02</span>
            <strong>2군 영입은 선택 사항</strong>
            <p>
              유망주를 직접 고르고 싶다면 영입해도 되지만, 반드시 5명을 모두
              채울 필요는 없습니다.
            </p>
          </article>
          <article>
            <span>03</span>
            <strong>부족한 2군은 자동 배치</strong>
            <p>
              최종 등록 단계에서 2군 인원이 부족하면 시스템이 자동으로
              보충합니다.
            </p>
          </article>
        </div>
        <div className="offseason-guide-note">
          <strong>언제 다시 볼 수 있나요?</strong>
          <p>
            스토브리그 화면의 안내 카드에서 이 룰을 다시 열 수 있습니다.
            설정에서는 최초 진입 안내 표시 여부를 조정할 수 있습니다.
          </p>
        </div>
        <div className="season-summary-actions">
          <Button onClick={onClose}>확인</Button>
        </div>
      </section>
    </div>
  );
}
