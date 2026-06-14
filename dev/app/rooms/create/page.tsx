import { ScreenShell } from "../../_components/screen-shell";
import { getScreenById } from "../../_lib/routes";
import { CreateRoomScreen } from "./_components/create-room-screen";

export default function Page() {
  return (
    <ScreenShell screen={getScreenById("CB-05")}>
      <CreateRoomScreen />
    </ScreenShell>
  );
}
