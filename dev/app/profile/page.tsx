import { ScreenShell } from "../_components/screen-shell";
import { getScreenById } from "../_lib/routes";
import { ProfileScreen } from "./_components/profile-screen";

export default function Page() {
  return (
    <ScreenShell screen={getScreenById("CB-14")}>
      <ProfileScreen />
    </ScreenShell>
  );
}
