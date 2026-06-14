import { ScreenShell } from "../_components/screen-shell";
import { getScreenById } from "../_lib/routes";
import { MyRoomsScreen } from "./_components/my-rooms-screen";

export default function Page() {
  return (
    <ScreenShell screen={getScreenById("CB-06")}>
      <MyRoomsScreen />
    </ScreenShell>
  );
}
