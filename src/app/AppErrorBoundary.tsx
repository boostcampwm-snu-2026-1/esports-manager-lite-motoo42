import { Component, type ErrorInfo, type ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App render failed.", error, errorInfo);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="app-shell app-shell-simple">
        <main className="app-main app-main-simple">
          <section className="app-error-boundary" role="alert">
            <p className="eyebrow">Recovery</p>
            <h1>화면을 복구할 수 없습니다</h1>
            <p>
              저장 데이터나 화면 상태가 예상과 달라 렌더링을 멈췄습니다.
              새로고침하거나 커리어를 다시 불러오면 복구할 수 있습니다.
            </p>
            <button
              onClick={() => window.location.assign("/")}
              type="button"
            >
              시작 화면으로 이동
            </button>
          </section>
        </main>
      </div>
    );
  }
}
