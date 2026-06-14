import { ScreenShell } from "../_components/screen-shell";
import { getScreenById } from "../_lib/routes";
import { HomeScreen } from "./_components/home-screen";

export default function Page() {
  return (
    <ScreenShell screen={getScreenById("CB-03")}>
      <HomeScreen />
    </ScreenShell>
  );
}
