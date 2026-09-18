import type { StopId } from "@/data/world";

interface StopIllustrationProps {
  id: StopId;
  className?: string;
}

/** Small, hand-built counterparts to the buildings in Minh’s 3D campus. */
export function StopIllustration({ id, className }: StopIllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="81" cy="110" rx="60" ry="12" fill="#344C3C" opacity=".09" />
      <path d="m17 96 63-26 63 26v6l-63 25-63-25z" fill="#C7C9AE" />
      <path d="m17 96 63-26 63 26-63 25z" fill="#E6E5CF" />
      <path d="m31 98 50-21 45 19-50 21z" fill="#86977A" opacity=".12" />
      {id === "commerce" && <Workshop />}
      {id === "experience" && <Office />}
      {id === "rental" && <Greenhouse />}
      {id === "about" && <LearningLab />}
      {id === "contact" && <Mailbox />}
    </svg>
  );
}

function Workshop() {
  return (
    <>
      <path d="m40 59 44-20 43 19v36l-43 20-44-20z" fill="#C57350" />
      <path d="m40 59 44 19v36L40 94z" fill="#E59871" />
      <path d="m84 78 43-20v36l-43 20z" fill="#CF805A" />
      <path d="m36 57 48-22 47 21v7L84 84 36 63z" fill="#AF7557" />
      <path d="m36 57 48-22 47 21-47 22z" fill="#EABB8D" />
      <path d="m52 54 33-15 31 14-33 15z" fill="#415F5A" />
      <path d="m54 53 31-14 29 13-31 15z" fill="#5C7D71" />
      <path
        d="m64 49 30 14m-19-19 30 14M64 58l31-14m-20 19 30-14"
        stroke="#B2C6AE"
        strokeWidth=".8"
      />
      <path d="m48 70 27 12v25L48 95z" fill="#91634C" />
      <path d="m50 73 23 10v21L50 94z" fill="#EBD7B4" />
      <path
        d="m50 79 23 10m-23-4 23 10m-23-4 23 10"
        stroke="#BBA884"
        strokeWidth="1.5"
      />
      <path d="m93 82 11-5v12l-11 5zm15-7 11-5v12l-11 5z" fill="#536F63" />
      <path d="m95 83 7-3v3l-7 3zm15-7 7-3v3l-7 3z" fill="#BCD1B9" />
      <path d="m41 96 36 15-9 4-36-15z" fill="#CBC5AA" />
      <path d="m115 101 12-6 10 4-12 6z" fill="#9DAD85" />
      <path d="m121 98 9-4v-7l-9 4z" fill="#6C8E65" />
      <path d="m114 88 9-4 7 3-9 4z" fill="#94AA7C" />
      <path d="m114 88 7 3v7l-7-3z" fill="#7E9C6E" />
      <path d="m29 85 4 2v13l-4-2z" fill="#997A54" />
      <ellipse cx="31" cy="81" rx="10" ry="13" fill="#94A875" />
      <path
        d="M31 68c9 2 12 14 6 22-1 2-4 3-6 3 5-8 5-18 0-25Z"
        fill="#788F60"
      />
    </>
  );
}

function Office() {
  return (
    <>
      <path d="m46 42 40-19 40 18v52l-40 19-40-18z" fill="#679489" />
      <path d="m46 42 40 18v52L46 94z" fill="#93BAB0" />
      <path d="m86 60 40-19v52l-40 19z" fill="#67988B" />
      <path d="m42 39 44-21 44 20v7L86 66 42 46z" fill="#557D73" />
      <path d="m42 39 44-21 44 20-44 21z" fill="#C0D1BC" />
      <path d="m52 39 34-16 33 15-33 16z" fill="#DADECA" />
      <path d="m69 37 14-7 17 8v8l-14 7-17-8z" fill="#A2B7A0" />
      <path d="m69 37 14-7 17 8-14 7z" fill="#EDF0DA" />
      <path
        d="m55 55 10 4v13l-10-4zm16 7 8 4v13l-8-4zm-16 15 10 4v13l-10-4z"
        fill="#486E65"
      />
      <path
        d="m57 57 6 3v6l-6-3zm16 7 4 2v6l-4-2zm-16 15 6 3v6l-6-3z"
        fill="#D6DAB7"
      />
      <path d="m71 84 8 4v20l-8-4z" fill="#5B8073" />
      <path
        d="m94 67 9-4v13l-9 4zm15-7 9-4v13l-9 4zm-15 26 9-4v13l-9 4zm15-7 9-4v13l-9 4z"
        fill="#3F6B61"
      />
      <path
        d="m96 68 5-2v6l-5 2zm15-7 5-2v6l-5 2zm-15 26 5-2v6l-5 2zm15-7 5-2v6l-5 2z"
        fill="#B9CCAE"
      />
      <path d="m46 73 40 18 40-19" stroke="#C6D7BF" strokeWidth="2" />
      <path d="m65 105 15 7-8 4-15-7z" fill="#CACBB2" />
      <path d="m29 93 11-5 9 4v7l-11 5-9-4z" fill="#A4AA85" />
      <path d="m29 93 11-5 9 4-11 5z" fill="#B9C7A0" />
      <path
        d="M33 89c-6-12 1-15 5-5-1-16 7-17 6-3 7-7 12-1 2 7l-8 4z"
        fill="#77986E"
      />
      <path d="m128 89 4 2v13l-4-2z" fill="#9B805E" />
      <ellipse cx="130" cy="83" rx="10" ry="14" fill="#A5B988" />
      <path d="M130 69c11 1 13 20 3 27h-4c5-7 7-17 1-27Z" fill="#839E6C" />
    </>
  );
}

function Greenhouse() {
  return (
    <>
      <path d="m40 65 44 19 43-21v30l-43 21-44-19z" fill="#A5BE92" />
      <path d="m40 65 44 19v30L40 95z" fill="#C8D5AB" />
      <path d="m84 84 43-21v30l-43 21z" fill="#91AF85" />
      <path d="m40 65 22-26 22 45z" fill="#D9E2BF" />
      <path d="m62 39 43-21 22 45-43 21z" fill="#BAD0AB" />
      <path d="m40 65 22-26 43-21-22 26z" fill="#E4EAD0" />
      <path d="m48 70 11 5v20l-11-5zm19 8 9 4v20l-9-4z" fill="#A1BA8F" />
      <path d="m94 83 10-5v18l-10 5zm16-8 9-4v18l-9 4z" fill="#BBD0A6" />
      <path
        d="M52 90V80m0 6c-9-3-6-10 0-5m0 3c8-10 11-2 0 3"
        stroke="#739563"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="m96 97 0-10m0 5c-6-4-6-9 0-5m0 2c7-10 10-3 0 3m17-1V80m0 6c-6-3-7-9 0-5m0 4c7-9 9-2 0 3"
        stroke="#6C8F61"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="m40 65 22-26 22 45 43-21-22-45-43 21m22 45v30m43-51v30M40 65v30m0-30 44 19M62 39l43-21m-29 14 23 45m-9-52 22 45m-39-9 42-21m-47 9 41-21M98 78v30m15-38v30"
        stroke="#73946F"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="m38 96 46 20 45-22v4l-45 21-46-20z" fill="#859B72" />
      <path d="m25 92 10-5 7 3v10l-10 5-7-3z" fill="#BD936B" />
      <path d="m25 92 10-5 7 3-10 5z" fill="#D7B28A" />
      <path
        d="M30 91c-8-13-2-17 3-5 0-17 7-17 5-3 10-7 12 0 1 5l-6 6z"
        fill="#769564"
      />
      <path d="m128 103 9-4 8 3-9 4z" fill="#9FAF80" />
      <path
        d="M133 101c-8-7-3-14 2-6 1-11 8-8 4 1 8-3 9 3-2 7z"
        fill="#819F6C"
      />
    </>
  );
}

function LearningLab() {
  return (
    <>
      <path d="m41 61 44-20 41 18v36l-41 20-44-20z" fill="#998AAE" />
      <path d="m41 61 44 20v34L41 95z" fill="#BCACCE" />
      <path d="m85 81 41-22v36l-41 20z" fill="#9D90B3" />
      <path d="m37 57 48-22 45 21v7L85 85 37 63z" fill="#8B7F9D" />
      <path d="m37 57 48-22 45 21-45 23z" fill="#D4C7DF" />
      <path d="m52 46 31-14 23 10v19L75 75 52 65z" fill="#B6A7C8" />
      <path d="m52 46 23 10v19L52 65z" fill="#D7CBE0" />
      <path d="m75 56 31-14v19L75 75z" fill="#AA9BBC" />
      <path d="m49 43 34-16 27 12v6L76 61 49 49z" fill="#A396B3" />
      <path d="m49 43 34-16 27 12-34 16z" fill="#E5DAE8" />
      <path d="m63 41 19-9 16 7-19 9z" fill="#B4C0BA" />
      <path d="m66 41 16-7 12 5-15 7z" fill="#D8E2D0" />
      <path d="m49 74 10 4v15l-10-4zm17 7 10 5v15l-10-5z" fill="#71677F" />
      <path d="m51 77 6 2v7l-6-2zm17 7 6 3v7l-6-3z" fill="#DAD5B9" />
      <path d="m94 82 12-6v22l-12 6z" fill="#746A84" />
      <path d="m96 83 8-4v12l-8 4z" fill="#C2CDBA" />
      <path d="m112 72 8-4v13l-8 4z" fill="#70687F" />
      <path d="m114 73 4-2v7l-4 2z" fill="#C7D0BC" />
      <path d="m91 106 18-9 7 3-18 9z" fill="#C5C2B0" />
      <path d="m125 99 4-2v8l-4 2z" fill="#AA8661" />
      <ellipse cx="127" cy="88" rx="10" ry="12" fill="#91A77B" />
      <path d="M127 76c9 0 14 16 3 23h-4c5-7 6-15 1-23Z" fill="#758E64" />
      <path d="m25 96 11-5 9 4v7l-11 5-9-4z" fill="#CFB286" />
      <path d="m25 96 11-5 9 4-11 5z" fill="#E7CC9A" />
      <path
        d="M34 97v-8m0 4c-7-3-7-9 0-5m0 3c6-7 9-3 0 3"
        stroke="#7C9565"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  );
}

function Mailbox() {
  return (
    <>
      <path d="m66 106 17-8 16 7-17 8z" fill="#C9C5A7" />
      <path d="m75 77 10 4v27l-10-4z" fill="#B38A52" />
      <path d="m85 81 8-4v27l-8 4z" fill="#927047" />
      <path d="M49 51c0-17 13-28 29-21l37 16v35L84 95 49 80Z" fill="#C49345" />
      <path d="m84 60 31-14v35L84 95Z" fill="#C8984A" />
      <path
        d="M49 51c0-16 12-22 24-17 9 4 12 13 12 27v34L49 80Z"
        fill="#E3B764"
      />
      <path
        d="M49 51c0-16 12-22 24-17l32-15c-13-6-25 1-25 17Z"
        fill="#F0CF84"
      />
      <path d="M73 34c9 4 12 13 12 27l31-14c0-14-3-23-11-28Z" fill="#DDA953" />
      <path d="m54 54 24 10v5L54 59z" fill="#856943" />
      <path d="m54 53 24 10v2L54 55z" fill="#B38646" />
      <path d="m58 67 17 7v13l-17-7z" fill="#FFF0C6" />
      <path
        d="m59 68 8 10 7-4m-15 6 6-4m9 10-5-8"
        stroke="#CBAB6F"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="m101 50 4-2v26l-4 2z" fill="#805D40" />
      <path d="m103 51 0-16 18 7-1 9-9-3v5z" fill="#BE6B4B" />
      <path d="m104 36 16 6-1 4-15-6z" fill="#E58C60" />
      <circle cx="103" cy="67" r="2" fill="#E8C989" />
      <path d="m30 94 9-4 10 4v9l-9 4-10-4z" fill="#B39970" />
      <path d="m30 94 9-4 10 4-9 4z" fill="#D3BC8F" />
      <path
        d="M39 93V79m0 10c-9-1-9-10 0-5m0 1c7-11 13-3 0 3"
        stroke="#7D996A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="39" cy="77" r="4" fill="#CE8A5F" />
      <circle cx="42" cy="76" r="2.2" fill="#E4B778" />
      <path d="m111 100 21-10 10 4-21 10z" fill="#BBA886" />
      <path d="m115 103 0 7m23-13v5" stroke="#8B8366" strokeWidth="3" />
      <path d="m111 96 21-10 10 4-21 10z" fill="#D7C39B" />
      <path d="m112 96 0 4 9 4v-4zm9 4 21-10v4l-21 10z" fill="#BCA57D" />
    </>
  );
}
