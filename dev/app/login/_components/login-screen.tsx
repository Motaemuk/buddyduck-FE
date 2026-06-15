"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui";

export function LoginScreen() {
  return (
    <>
      <div className="login-hero flex flex-1 flex-col items-center px-6 pb-8 pt-[118px] text-center">
        <Image
          alt="BuddyDuck"
          className="h-24 w-24 rounded-[26px] object-cover shadow-[0_18px_50px_-14px_rgba(253,190,13,.55)]"
          height={96}
          priority
          src="/images/concert-buddy-logo.png"
          width={96}
        />
        <h1 className="mt-[22px] text-[28px] font-extrabold leading-tight tracking-normal">BuddyDuck</h1>
        <p className="mt-2 text-[14px] leading-[1.55] text-[var(--cb-text-2)]">
          덕메를 찾고,
          <br />
          함께 공연을 준비해요.
        </p>
        <div className="mt-auto w-full space-y-3">
          <p className="mb-1 text-[11px] leading-5 text-[var(--cb-text-3)]">
            로그인 시 서비스 약관과 개인정보 처리방침에 동의합니다.
          </p>
          <Button asChild variant="kakao">
            <Link href="/nickname">
              <MessageCircle size={19} /> 카카오로 시작하기
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
