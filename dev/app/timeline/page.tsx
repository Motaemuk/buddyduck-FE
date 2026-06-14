import { ScreenShell } from "../_components/screen-shell";
import { getScreenById } from "../_lib/routes";
import { TimelineScreen } from "./_components/timeline-screen";

export default function Page() {
  return (
    <ScreenShell screen={getScreenById("CB-09")}>
      <TimelineScreen />
    </ScreenShell>
  );
}
