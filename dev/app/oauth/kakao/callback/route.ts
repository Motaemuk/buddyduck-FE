import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  getApiBaseUrl,
  getKakaoRedirectUri,
} from "@/lib/auth/constants";

type KakaoLoginResult = {
  result: {
    accessToken: string;
    profileCompleted: boolean;
  };
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (!code || oauthError) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const response = await axios.post<KakaoLoginResult>(
      `${getApiBaseUrl()}/api/auth/kakao/login`,
      {
        code,
        redirectUri: getKakaoRedirectUri(),
      },
    );

    const { accessToken, profileCompleted } = response.data.result;

    const cookieStore = await cookies();
    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.redirect(
      new URL(profileCompleted ? "/home" : "/nickname", request.url),
    );
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
