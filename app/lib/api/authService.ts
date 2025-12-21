import { API_BASE } from "./fetchClient";

// export const authService = {
//   /**
//    * 서버의 /auth/login 으로 이동시키면
//    * 서버가 MS 로그인 페이지로 redirect 해준다.
//    */
//   startMicrosoftLogin: (returnTo?: string) => {
//     // returnTo를 서버가 지원하면 query로 넘겨도 됨(서버 구현에 따라)
//     // 우선은 기본 /auth/login로 이동만 한다.
//     // returnTo를 쓰고 싶으면 아래처럼:
//     // const url = new URL(`${API_BASE}/auth/login`);
//     // if (returnTo) url.searchParams.set("returnTo", returnTo);
//     // window.location.href = url.toString();

//     window.location.href = `${API_BASE}/auth/login`;
//   },
// };

export const authService = {
  /**
   * MS 로그인 시작 (서버가 /auth/login에서 MS 로그인으로 redirect)
   */
  startMicrosoftLogin: () => {
    window.location.href = `${API_BASE}/auth/login`;
  },
};
