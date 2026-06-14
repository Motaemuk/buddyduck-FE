import { ScreenShell } from "./_components/screen-shell";
import { getScreenById } from "./_lib/routes";
import { LoginScreen } from "./login/_components/login-screen";

export default function Page() {
  return (
    <ScreenShell screen={getScreenById("CB-01")}>
      <LoginScreen />
    </ScreenShell>
  );
}
