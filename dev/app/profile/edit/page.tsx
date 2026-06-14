import { ScreenShell } from "../../_components/screen-shell";
import { getScreenById } from "../../_lib/routes";
import { ProfileEditScreen } from "./_components/profile-edit-screen";

export default function Page() {
  return (
    <ScreenShell screen={getScreenById("CB-14prime")}>
      <ProfileEditScreen />
    </ScreenShell>
  );
}
