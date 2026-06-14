import { ScreenShell } from "../_components/screen-shell";
import { getScreenById } from "../_lib/routes";
import { PlaceSearchScreen } from "./_components/place-search-screen";

export default function Page() {
  return (
    <ScreenShell screen={getScreenById("CB-10")}>
      <PlaceSearchScreen />
    </ScreenShell>
  );
}
