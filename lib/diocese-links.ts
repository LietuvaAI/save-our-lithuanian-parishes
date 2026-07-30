// Official diocesan websites for institutions named on public parish surfaces.
// Keep this keyed by the canonical display name used in the data files.
export const DIOCESE_OFFICIAL_URL: Readonly<Record<string, string>> = {
  "Archdiocese of Boston": "https://www.bostoncatholic.org/",
  "Archdiocese of Chicago": "https://www.archchicago.org/",
  "Archdiocese of Cincinnati": "https://catholicaoc.org/",
  "Archdiocese of Detroit": "https://www.aod.org/",
  "Archdiocese of Hartford": "https://archdioceseofhartford.org/",
  "Archdiocese of Newark": "https://rcan.org/",
  "Archdiocese of Philadelphia": "https://catholicchurchofphila.org/",
  "Diocese of Allentown": "https://www.allentowndiocese.org/",
  "Diocese of Belleville": "https://www.diobelle.org/",
  "Diocese of Bridgeport": "https://www.bridgeportdiocese.org/",
  "Diocese of Brooklyn": "https://dioceseofbrooklyn.org/",
  "Diocese of Cleveland": "https://www.dioceseofcleveland.org/",
  "Diocese of Gary": "https://dcgary.org/",
  "Diocese of Rochester": "https://www.dor.org/",
  "Diocese of Scranton": "https://www.dioceseofscranton.org/",
};

export const DIOCESAN_LEADERSHIP_VERIFIED = "2026-07-29";

export type DiocesanLeadership = {
  role:
    | "Archbishop"
    | "Cardinal Archbishop"
    | "Bishop"
    | "Diocesan administrator";
  name: string;
  url: string;
  seeVacant?: boolean;
};

export const DIOCESAN_LEADERSHIP: Readonly<
  Record<string, DiocesanLeadership>
> = {
  "Archdiocese of Boston": {
    role: "Archbishop",
    name: "Richard G. Henning",
    url: "https://bostoncatholic.org/biography",
  },
  "Archdiocese of Chicago": {
    role: "Cardinal Archbishop",
    name: "Blase J. Cupich",
    url: "https://www.archchicago.org/about-us/cardinal-blase-j-cupich",
  },
  "Archdiocese of Cincinnati": {
    role: "Archbishop",
    name: "Robert G. Casey",
    url: "https://catholicaoc.org/about/archbishop-casey",
  },
  "Archdiocese of Detroit": {
    role: "Archbishop",
    name: "Edward J. Weisenburger",
    url: "https://www.aod.org/archbishop-edward-weisenburger-biography",
  },
  "Archdiocese of Hartford": {
    role: "Archbishop",
    name: "Christopher J. Coyne",
    url: "https://archdioceseofhartford.org/archbishop-christopher-j-coyne/",
  },
  "Archdiocese of Newark": {
    role: "Cardinal Archbishop",
    name: "Joseph W. Tobin, C.Ss.R.",
    url: "https://rcan.org/cardinal-tobin/",
  },
  "Archdiocese of Philadelphia": {
    role: "Archbishop",
    name: "Nelson J. Pérez",
    url: "https://catholicchurchofphila.org/our-archbishop/",
  },
  "Diocese of Allentown": {
    role: "Bishop",
    name: "Alfred A. Schlert",
    url: "https://www.allentowndiocese.org/index.php/about/bishop-schlert",
  },
  "Diocese of Belleville": {
    role: "Diocesan administrator",
    name: "Very Rev. Godfrey Mullen, OSB",
    url: "https://www.diobelle.org/our-bishop",
    seeVacant: true,
  },
  "Diocese of Bridgeport": {
    role: "Bishop",
    name: "Frank J. Caggiano",
    url: "https://www.bridgeportdiocese.org/our-bishop/bishop-frank-j-caggiano/",
  },
  "Diocese of Brooklyn": {
    role: "Bishop",
    name: "Robert J. Brennan",
    url: "https://dioceseofbrooklyn.org/offices/bishop-brennan/about-the-bishop/",
  },
  "Diocese of Cleveland": {
    role: "Bishop",
    name: "Edward C. Malesic",
    url: "https://www.dioceseofcleveland.org/about/our-history",
  },
  "Diocese of Gary": {
    role: "Bishop",
    name: "Robert J. McClory",
    url: "https://dcgary.org/office-bishop/biography",
  },
  "Diocese of Rochester": {
    role: "Bishop",
    name: "John S. Bonnici",
    url: "https://www.dor.org/the-most-reverend-john-s-bonnici-s-t-l-s-t-d/",
  },
  "Diocese of Scranton": {
    role: "Bishop",
    name: "Joseph C. Bambera",
    url: "https://www.dioceseofscranton.org/about/about-the-bishop/",
  },
};

export function dioceseOfficialUrl(name: string): string | undefined {
  return DIOCESE_OFFICIAL_URL[name];
}

export function diocesanLeadership(
  name: string,
): DiocesanLeadership | undefined {
  return DIOCESAN_LEADERSHIP[name];
}
