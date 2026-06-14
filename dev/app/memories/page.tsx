import { ScreenShell } from "../_components/screen-shell";
import { getScreenById } from "../_lib/routes";
import { MemoryFeedScreen } from "./_components/memory-feed-screen";

export default function Page() {
  return (
    <ScreenShell screen={getScreenById("CB-13")}>
      <MemoryFeedScreen />
    </ScreenShell>
  );
}
