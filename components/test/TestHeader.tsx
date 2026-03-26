"use client";

// Đã thay đổi import: Xóa ChevronLeft/ChevronRight và thêm ChevronUp cho nút Grid
import { EyeOff, Eye, Calculator } from "lucide-react";
import { Button, Popconfirm } from "antd";

interface TestHeaderProps {
    sectionName: string;
    timeRemaining: number;
    onTimeUp: () => void;
    isTimerHidden: boolean;
    setIsTimerHidden: (hide: boolean) => void;
    isLastModule?: boolean;
    showCalculator?: boolean; 
    buttonText?: string;
    confirmTitle?: string;
    confirmDescription?: string;
    onToggleCalculator?: () => void; // Gộp chung vào interface cho gọn
}

export default function TestHeader({
    sectionName,
    timeRemaining,
    onTimeUp,
    isTimerHidden,
    setIsTimerHidden,
    onToggleCalculator,
    isLastModule,
    showCalculator = true,
    buttonText,
    confirmTitle,
    confirmDescription
}: TestHeaderProps) {

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <header className="bg-[#ebf0f7] border-b border-slate-300 h-16 flex items-center justify-between px-6 z-50 fixed top-0 w-full left-0 right-0 shadow-sm">
            <div className="flex-1 flex items-center">
                <h1 className="font-bold text-lg text-slate-800 tracking-tight">
                    {sectionName}
                </h1>
            </div>

            {/* Timer luôn nằm giữa màn hình */}
            <div className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-3">
                        {!isTimerHidden ? (
                            <span className={`text-xl font-mono font-bold tracking-wider ${timeRemaining < 300 ? "text-red-600 animate-pulse" : "text-slate-900"}`}>
                                {formatTime(timeRemaining)}
                            </span>
                        ) : (
                            <span className="text-xl font-mono text-slate-400 tracking-wider">--:--</span>
                        )}

                        <Button
                            onClick={() => setIsTimerHidden(!isTimerHidden)}
                            type="text"
                            icon={isTimerHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            className="text-slate-500 hover:text-slate-800"
                        >
                            <span className="hidden sm:inline ml-1">{isTimerHidden ? "Show" : "Hide"}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex justify-end items-center gap-4">
              {showCalculator && (
                <Button
                    onClick={onToggleCalculator}
                    icon={<Calculator className="w-4 h-4" />}
                    type="default"
                    className="flex items-center rounded-full"
                >
                    <span className="hidden sm:inline">Calculator</span>
                </Button>
              )}

           <Popconfirm 
                title={confirmTitle || (isLastModule ? "Submit Entire Test?" : "Finish This Module?")}
                description={confirmDescription || (isLastModule 
                    ? "You are about to finish the test. You cannot go back to any module after this." 
                    : "Once you move to the next module, you cannot return to the current questions.")}
                onConfirm={onTimeUp} 
                okText="Yes"
                cancelText="No"
                placement="bottomRight"
            >
                <Button 
                    // Đổi từ "primary" sang "default" để nút không bị đổ kín màu nền
                    type="default" 
                    danger={buttonText === "Submit Module" || buttonText === "Submit Test" || isLastModule} 
                    // Thay thế className cũ để áp dụng đúng màu và độ dày viền của ảnh
                    className={`
                        rounded-full px-8 h-10 font-semibold transition-all border-2
                        ${(buttonText === "Submit Module" || buttonText === "Submit Test" || isLastModule)
                            ? "!border-[#fb2a57] !text-[#fb2a57] hover:!bg-[#fb2a57]/10 bg-transparent" 
                            : "" // Nếu là nút Next Module bình thường thì giữ nguyên style mặc định
                        }
                    `}
                >
                    {buttonText || (isLastModule ? "Submit Test" : "Next Module")}
                </Button>
            </Popconfirm>
            </div>

            {/* ĐƯỜNG PHÂN CÁCH TRÊN (DƯỚI TOP BAR) */}
            <div 
                className="absolute bottom-0 left-0 w-full h-[2px]" 
                style={{ backgroundImage: 'repeating-linear-gradient(to right, #2d3642 0, #1c2128 19px, transparent 19px, transparent 20px)' }}
            ></div>
        </header>
    );
}