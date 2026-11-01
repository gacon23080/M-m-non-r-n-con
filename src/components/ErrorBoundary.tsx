import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Sparkles, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF5F8] flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel bg-white/90 p-8 rounded-[40px] border-4 border-white shadow-2xl text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-[#E9DCF8] to-[#FCD3E2] rounded-3xl flex items-center justify-center text-5xl shadow-lg">
              🌸
            </div>
            
            <div className="space-y-2">
              <h1 className="font-heading font-bold text-2xl text-[#3F334D]">
                Oops! Lớp học đang tạm nghỉ ♡
              </h1>
              <p className="text-[#7A6C88] text-sm leading-relaxed italic font-luxury">
                Có một chút sự cố nhỏ xảy ra trong quá trình vui chơi. <br/>
                Cô giáo đang dọn dẹp lại lớp học rồi nhé!
              </p>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-left overflow-auto max-h-32">
              <p className="text-[10px] font-mono text-rose-600 break-all">
                {this.state.error?.message}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8E75B2] to-[#E2799F] text-white font-bold shadow-lg hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <RefreshCcw className="w-5 h-5" />
              <span>QUAY LẠI LỚP HỌC</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
