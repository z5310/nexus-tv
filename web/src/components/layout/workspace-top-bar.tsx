import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { TopbarFeedbackButton } from "@/components/feedback/topbar-feedback-button";
import { SystemAnnouncementCenter } from "@/components/layout/system-announcement-center";
import { WorkspaceAccountMenu } from "@/components/layout/workspace-account-menu";
import { WorkspaceCreditGiftMark } from "@/components/layout/workspace-credit-gift-mark";
import { WorkspaceTopBarExtensionSlot } from "@/components/layout/workspace-top-bar-extension";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useThemeStore } from "@/stores/use-theme-store";
import { useUserStore } from "@/stores/use-user-store";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { openWorkspaceWallet } from "@/lib/workspace-wallet";

export function WorkspaceTopBar({ sidebarOpen, onToggleSidebar }: { sidebarOpen: boolean; onToggleSidebar: () => void }) {
    const theme = useThemeStore((state) => state.theme);
    const setTheme = useThemeStore((state) => state.setTheme);
    const user = useUserStore((state) => state.user);
    const creditsEnabled = useUserStore((state) => state.features.creditsEnabled);
    const { availableMicrocredits } = useWalletBalance(user?.id, creditsEnabled);
    const balance = availableMicrocredits === null ? "--" : (availableMicrocredits / 1_000_000).toLocaleString("zh-CN", { maximumFractionDigits: 2 });

    return (
        <header className="app-workspace-topbar">
            <button type="button" className="app-workspace-mobile-menu app-workspace-topbar-icon-button" aria-label={sidebarOpen ? "收起侧栏" : "展开侧栏"} onClick={onToggleSidebar}>
                {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
            </button>
            <WorkspaceTopBarExtensionSlot />
            <div className="app-workspace-topbar-actions">
                {user ? <TopbarFeedbackButton /> : null}
                {creditsEnabled ? <button type="button" className="app-workspace-topbar-credit-pill" aria-label={`打开积分中心，可用 ${balance} 积分`} onClick={() => openWorkspaceWallet()}>
                    <WorkspaceCreditGiftMark />
                    <span>积分</span>
                    <strong>{balance}</strong>
                </button> : null}
                {user ? <SystemAnnouncementCenter userId={user.id} className="app-workspace-topbar-icon-button" autoOpen /> : null}
                <AnimatedThemeToggler className="app-workspace-topbar-icon-button" theme={theme} onThemeChange={setTheme} aria-label="切换主题" />
                <WorkspaceAccountMenu />
            </div>
        </header>
    );
}
