// 도트(픽셀아트) 아바타 생성기.
// 출연자 데이터(id 시드, 성별, 컨셉 이모지, 지정 컬러)에서 결정적으로 12x12 도트 캐릭터를 만든다.
// 실제 사진/캡처를 쓰지 않기 위한 장치이며, 데이터만 갈아끼우면 다음 시즌에도 재사용된다.
//
// 그리드 문자: . 투명 / h 머리 / s 피부 / e 눈 / m 입 / w 이(스마일) / b 볼터치
//              c 옷 / a 액세서리 주색 / g 액세서리 보조색

export interface AvatarSpec {
  id: string;
  gender: "M" | "F";
  emoji: string;
  color: string;
}

export interface AvatarArt {
  size: number;
  grid: string[]; // size x size
  palette: Record<string, string>;
}

const SIZE = 12;

const HAIR_COLORS = ["#2A2330", "#3D2B22", "#1E2233", "#4A332A", "#232323", "#553B2E"];
const SKIN = "#FFD9B3";
const EYE = "#241F2E";
const MOUTH = "#C96A6A";
const TEETH = "#FFFFFF";
const BLUSH = "#FFAFA0";

function hashOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return h;
}

// ---- 베이스 얼굴 (머리 스타일이 rows 1-3, 여성 롱헤어는 측면까지 덮어쓴다) ----

const MALE_HAIR: string[][] = [
  // M0 짧은 머리
  [
    "............",
    "...hhhhhh...",
    "..hhhhhhhh..",
    "..hssssssh..",
  ],
  // M1 가르마
  [
    "............",
    "...hhhhhh...",
    "..hhhhhhhh..",
    "..hhhsssss..",
  ],
  // M2 곱슬/펌
  [
    "...h.hh.h...",
    "..hhhhhhhh..",
    ".hhhhhhhhhh.",
    "..hssssssh..",
  ],
  // M3 투블럭 앞머리
  [
    "............",
    "...hhhhhh...",
    "..hhhhhhhh..",
    "..hhhhhhhh..",
  ],
];

const FEMALE_HAIR: string[][] = [
  // F0 긴 생머리 (측면은 아래 overlayLongHair 로)
  [
    "............",
    "...hhhhhh...",
    "..hhhhhhhh..",
    ".hhssssssHH.".replace("HH", "hh"),
  ],
  // F1 단발+앞머리
  [
    "............",
    "...hhhhhh...",
    ".hhhhhhhhhh.",
    ".hhhhssshhh.",
  ],
  // F2 포니테일
  [
    "......h.....",
    "...hhhhhh...",
    "..hhhhhhhhh.",
    "..hssssssh..",
  ],
  // F3 웨이브 롱
  [
    "............",
    "..hhhhhhhh..",
    ".hhhhhhhhhh.",
    ".hhsssssshh.",
  ],
];

function baseGrid(spec: AvatarSpec): string[][] {
  const h = hashOf(spec.id);
  const styles = spec.gender === "M" ? MALE_HAIR : FEMALE_HAIR;
  const hair = styles[h % styles.length];

  const rows: string[] = [
    hair[0],
    hair[1],
    hair[2],
    hair[3],
    "..ssssssss..", // 4 이마/얼굴
    "..sesssses..", // 5 눈
    "..sbssssbs..", // 6 볼터치
    "..sssmmsss..", // 7 입
    "...ssssss...", // 8 턱
    "....ssss....", // 9 목
    "..cccccccc..", // 10 어깨
    ".cccccccccc.", // 11 몸통
  ];
  const grid = rows.map((r) => r.split(""));

  // 여성 롱헤어(F0, F3, F1 일부): 얼굴 옆으로 머리카락 내려오기
  if (spec.gender === "F") {
    const style = h % FEMALE_HAIR.length;
    if (style === 0 || style === 3) {
      for (let r = 4; r <= 8; r++) {
        grid[r][1] = "h";
        grid[r][10] = "h";
      }
      grid[9][1] = "h";
      grid[9][10] = "h";
    }
    if (style === 1) {
      for (let r = 4; r <= 6; r++) {
        grid[r][1] = "h";
        grid[r][10] = "h";
      }
    }
    if (style === 2) {
      // 포니테일 꼬리
      grid[2][10] = "h";
      grid[3][10] = "h";
      grid[4][10] = "h";
      grid[5][10] = "h";
    }
  }
  return grid;
}

// ---- 컨셉 이모지 → 액세서리 ----

type Accessory =
  | "headset"
  | "glasses_square"
  | "glasses_round"
  | "cap"
  | "smile"
  | "streak"
  | "pin"
  | "flower"
  | "earrings"
  | "none";

const EMOJI_ACCESSORY: Record<string, Accessory> = {
  "🎮": "headset",
  "📊": "glasses_square",
  "💻": "glasses_round",
  "📚": "glasses_round",
  "🎒": "cap",
  "🦷": "smile",
  "⚡": "streak",
  "💚": "pin",
  "🌿": "pin",
  "🌸": "flower",
  "🏺": "earrings",
  "🍵": "earrings",
};

const ACCESSORY_COLORS: Record<Accessory, [string, string]> = {
  headset: ["#3A4666", "#5C7CFF"],
  glasses_square: ["#2C3240", "#2C3240"],
  glasses_round: ["#4A3A2A", "#4A3A2A"],
  cap: ["#3E63DD", "#2A4ABF"],
  smile: ["#FFFFFF", "#FFFFFF"],
  streak: ["#FFD84D", "#FFD84D"],
  pin: ["#57CC7E", "#57CC7E"],
  flower: ["#FF8FB4", "#FFD84D"],
  earrings: ["#FFD84D", "#FFD84D"],
  none: ["#000000", "#000000"],
};

function applyAccessory(grid: string[][], acc: Accessory) {
  const set = (r: number, c: number, ch: string) => {
    if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) grid[r][c] = ch;
  };
  switch (acc) {
    case "headset":
      // 머리 위 밴드 + 양쪽 이어컵 (눈높이 옆)
      set(0, 3, "a"); set(0, 4, "a"); set(0, 5, "a"); set(0, 6, "a"); set(0, 7, "a"); set(0, 8, "a");
      set(1, 2, "a"); set(1, 9, "a");
      set(4, 1, "a"); set(5, 1, "g"); set(6, 1, "a");
      set(4, 10, "a"); set(5, 10, "g"); set(6, 10, "a");
      break;
    case "glasses_square":
      // 눈(3, 8)은 보이게 두고 테두리+브릿지만
      set(5, 2, "a"); set(5, 4, "a"); set(5, 5, "a");
      set(5, 6, "a"); set(5, 7, "a"); set(5, 9, "a");
      set(6, 3, "a"); set(6, 8, "a");
      break;
    case "glasses_round":
      // 얇은 브릿지 + 눈 밑 라운드 프레임
      set(5, 5, "a"); set(5, 6, "a");
      set(6, 3, "a"); set(6, 8, "a");
      set(5, 2, "a"); set(5, 9, "a");
      break;
    case "cap":
      set(1, 3, "a"); set(1, 4, "a"); set(1, 5, "a"); set(1, 6, "a"); set(1, 7, "a"); set(1, 8, "a");
      set(2, 2, "a"); set(2, 3, "a"); set(2, 4, "a"); set(2, 5, "a");
      set(2, 6, "a"); set(2, 7, "a"); set(2, 8, "a"); set(2, 9, "a");
      set(3, 2, "g"); set(3, 3, "g"); set(3, 4, "g"); set(3, 5, "g");
      set(3, 6, "g"); set(3, 7, "g"); set(3, 8, "g"); set(3, 9, "g");
      break;
    case "smile":
      set(7, 4, "w"); set(7, 5, "w"); set(7, 6, "w"); set(7, 7, "w");
      break;
    case "streak":
      set(1, 5, "a"); set(2, 4, "a"); set(2, 7, "a"); set(3, 6, "a");
      break;
    case "pin":
      set(2, 3, "a"); set(2, 4, "a");
      break;
    case "flower":
      set(1, 8, "g"); set(2, 7, "a"); set(2, 8, "a"); set(2, 9, "a"); set(3, 8, "a");
      break;
    case "earrings":
      set(7, 1, "a"); set(7, 10, "a");
      break;
    case "none":
      break;
  }
}

export function buildAvatar(spec: AvatarSpec): AvatarArt {
  const h = hashOf(spec.id);
  const grid = baseGrid(spec);
  const acc = EMOJI_ACCESSORY[spec.emoji] ?? "none";
  applyAccessory(grid, acc);
  const [a, g] = ACCESSORY_COLORS[acc];

  return {
    size: SIZE,
    grid: grid.map((r) => r.join("")),
    palette: {
      h: HAIR_COLORS[h % HAIR_COLORS.length],
      s: SKIN,
      e: EYE,
      m: MOUTH,
      w: TEETH,
      b: BLUSH,
      c: spec.color,
      a,
      g,
    },
  };
}

/** 캔버스에 도트 아바타 그리기 (성지 카드용) */
export function drawAvatarOnCanvas(
  ctx: CanvasRenderingContext2D,
  spec: AvatarSpec,
  x: number,
  y: number,
  sizePx: number
) {
  const art = buildAvatar(spec);
  const px = sizePx / art.size;
  for (let r = 0; r < art.size; r++) {
    for (let c = 0; c < art.size; c++) {
      const ch = art.grid[r][c];
      if (ch === ".") continue;
      const color = art.palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + c * px, y + r * px, px + 0.5, px + 0.5);
    }
  }
}
