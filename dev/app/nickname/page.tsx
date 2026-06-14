import { ScreenShell } from "../_components/screen-shell";
import { getScreenById } from "../_lib/routes";
import { NicknameScreen } from "./_components/nickname-screen";

export default function Page() {
  return (
    <ScreenShell screen={getScreenById("CB-02")}>
      <NicknameScreen />
    </ScreenShell>
  );
}
