import { ScreenShell } from "../_components/screen-shell";
import { getScreenById } from "../_lib/routes";
import { MapScreen } from "./_components/map-screen";

export default function Page() {
  return (
    <ScreenShell screen={getScreenById("CB-12")}>
      <MapScreen />
    </ScreenShell>
  );
}
