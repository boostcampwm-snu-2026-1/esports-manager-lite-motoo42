import { useEffect, useState } from "react";
import { gameGuideSlides } from "../../domain/career/gameGuide";
import { Button } from "../../shared/ui/Button";

type GameGuideModalProps = {
  onClose: () => void;
};

export function GameGuideModal({ onClose }: GameGuideModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = gameGuideSlides[activeIndex];
  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === gameGuideSlides.length - 1;
  const titleId = "game-guide-title";

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((currentIndex) => Math.max(0, currentIndex - 1));
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((currentIndex) =>
          Math.min(gameGuideSlides.length - 1, currentIndex + 1),
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose} role="presentation">
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="game-guide-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          aria-label="게임 기초 가이드 닫기"
          className="modal-close-button"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <div className="game-guide-shell">
          <aside className="game-guide-rail" aria-label="가이드 진행 단계">
            {gameGuideSlides.map((slide, index) => (
              <button
                aria-current={index === activeIndex ? "step" : undefined}
                className={`game-guide-step ${
                  index === activeIndex ? "game-guide-step-active" : ""
                }`}
                key={slide.id}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{slide.eyebrow}</strong>
              </button>
            ))}
          </aside>

          <div className="game-guide-slide">
            <div>
              <p className="eyebrow">{activeSlide.eyebrow}</p>
              <h2 id={titleId}>{activeSlide.title}</h2>
              <p>{activeSlide.body}</p>
            </div>
            <div className="game-guide-point-list">
              {activeSlide.points.map((point, index) => (
                <article key={point}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{point}</p>
                </article>
              ))}
            </div>
            <div className="game-guide-progress">
              {gameGuideSlides.map((slide, index) => (
                <button
                  aria-label={`${slide.title} 슬라이드로 이동`}
                  className={`game-guide-dot ${
                    index === activeIndex ? "game-guide-dot-active" : ""
                  }`}
                  key={slide.id}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                />
              ))}
            </div>
            <div className="game-guide-actions">
              <Button
                disabled={isFirstSlide}
                onClick={() => setActiveIndex((currentIndex) => currentIndex - 1)}
                variant="ghost"
              >
                이전
              </Button>
              <span>
                {activeIndex + 1} / {gameGuideSlides.length}
              </span>
              <Button
                onClick={() => {
                  if (isLastSlide) {
                    onClose();
                    return;
                  }

                  setActiveIndex((currentIndex) => currentIndex + 1);
                }}
              >
                {isLastSlide ? "확인" : "다음"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
