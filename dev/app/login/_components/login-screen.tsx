"use client";

import Image from "next/image";
import Link from "next/link";
import { buildKakaoAuthorizeUrl } from "@/lib/auth/kakao";

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
          unoptimized
          width={96}
        />
        <h1 className="mt-[22px] text-[28px] font-extrabold leading-tight tracking-normal">
          BuddyDuck
        </h1>
        <p className="mt-2 text-[14px] leading-[1.55] text-[var(--cb-text-2)]">
          덕메를 찾고,
          <br />
          함께 공연을 준비해요.
        </p>
        <div className="mt-auto w-full space-y-3">
          <p className="mb-1 text-[11px] leading-5 text-[var(--cb-text-3)]">
            로그인 시 서비스 약관과 개인정보 처리방침에 동의합니다.
          </p>
          {/* 콘텐츠/광고 차단기가 경로(kakao_login)·파일명(login) 패턴으로
              네트워크 차단하던 이미지 버튼을, 차단될 요청이 없는 인라인
              SVG + 텍스트로 대체. 공식 카카오 버튼 디자인(#FEE500 + 검정 심볼/텍스트) 유지. */}
          <Link
            aria-label="카카오로 시작하기"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-[14px] text-[15px] font-semibold text-[rgba(0,0,0,.85)] transition-colors hover:bg-[#ffe000]"
            href={buildKakaoAuthorizeUrl()}
          >
            <svg
              aria-hidden="true"
              fill="currentColor"
              height={18}
              viewBox="0 0 512 512"
              width={18}
            >
              <path d="M256 80C141.1 80 48 152.5 48 242c0 57.3 38.1 107.6 95.6 136.3-3.2 11.5-20.6 71.1-21.3 75.8 0 0-.4 3.6 1.9 4.9 2.3 1.4 5.1.3 5.1.3 6.5-.9 75.5-49.4 87.4-57.8 12.9 1.9 26.2 2.9 39.7 2.9 114.9 0 208-72.5 208-162S370.9 80 256 80z" />
            </svg>
            <span>카카오로 시작하기</span>
          </Link>
        </div>
      </div>
    </>
  );
}
