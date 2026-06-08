import { Card } from "../shared/ui/Card";

type CareerRequiredFallbackProps = {
  title?: string;
};

export function CareerRequiredFallback({
  title = "커리어를 먼저 시작하세요",
}: CareerRequiredFallbackProps) {
  return (
    <section className="stack">
      <Card>
        <div className="career-required-fallback">
          <p className="eyebrow">Career Required</p>
          <h1>{title}</h1>
          <p>
            이 화면은 진행 중인 커리어 데이터가 있을 때 표시됩니다. 시작
            화면에서 새 커리어를 만들거나 저장된 커리어를 불러오세요.
          </p>
        </div>
      </Card>
    </section>
  );
}
