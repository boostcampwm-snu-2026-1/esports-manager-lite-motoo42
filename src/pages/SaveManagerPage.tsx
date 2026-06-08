import type { ReactNode } from "react";
import { useGameSelector } from "../app/GameProvider";
import { Card } from "../shared/ui/Card";
import { CareerRequiredFallback } from "./CareerRequiredFallback";

type SaveManagerPageProps = {
  savePanel?: ReactNode;
};

export function SaveManagerPage({ savePanel }: SaveManagerPageProps) {
  const career = useGameSelector((state) => state.career);

  if (!career) {
    return <CareerRequiredFallback title="데이터 저장 화면을 열 수 없습니다" />;
  }

  return (
    <section className="stack save-manager-page">
      <header>
        <p className="eyebrow">Data Save</p>
        <h1>데이터 저장</h1>
        <p className="lede">
          현재 커리어의 수동 저장, 새 저장 생성, 저장 슬롯 불러오기를 한곳에서
          관리합니다.
        </p>
      </header>

      <div className="two-column save-manager-layout">
        <div>{savePanel}</div>
        <Card>
          <p className="eyebrow">Auto Save</p>
          <h2>자동 저장 안내</h2>
          <p className="muted">
            자동 저장은 커리어 시작, 날짜 진행, 경기 종료, 대회 전환, 시즌 전환
            같은 주요 체크포인트에서 실행됩니다.
          </p>
          <p className="muted">
            진행 버튼 옆에는 자동 저장 상태만 간단히 표시되고, 저장 슬롯 관리는
            이 화면에서만 처리합니다.
          </p>
        </Card>
      </div>
    </section>
  );
}
