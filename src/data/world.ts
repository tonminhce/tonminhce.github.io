export const stops = [
  {
    id: "commerce",
    number: "01",
    title: "Java Workshop",
    subtitle: "Microservices, made tangible.",
    x: -16,
    z: -7,
    color: "#e98651",
    label: "PETPROJECT",
  },
  {
    id: "experience",
    number: "02",
    title: "Experience HQ",
    subtitle: "The systems I build at work.",
    x: 16,
    z: -7,
    color: "#72a398",
    label: "VNPT / KDDI",
  },
  {
    id: "rental",
    number: "03",
    title: "Data Garden",
    subtitle: "From rental listings to insights.",
    x: -16,
    z: 16,
    color: "#81a463",
    label: "RENTAL SYSTEM",
  },
  {
    id: "about",
    number: "04",
    title: "Learning Lab",
    subtitle: "A little more about Minh.",
    x: 16,
    z: 16,
    color: "#ab99c4",
    label: "ABOUT MINH",
  },
  {
    id: "contact",
    number: "05",
    title: "Hello Station",
    subtitle: "Every connection starts somewhere.",
    x: 0,
    z: -23,
    color: "#e6ac43",
    label: "SAY HELLO",
  },
] as const;
export type StopId = (typeof stops)[number]["id"];
export interface Progress {
  visited: StopId[];
  collected: number[];
  distance: number;
}
export const packetLocations = [
  [0, 6],
  [0, 0],
  [0, -7],
  [-8, -7],
  [-16, -1],
  [-16, 4],
  [-8, 16],
  [0, 16],
  [8, 16],
  [16, 6],
  [16, -1],
  [0, -17],
] as const;
export const achievements = [
  {
    id: "hello",
    title: "Hello, world!",
    description: "Drive your first 10 meters.",
    goal: (p: Progress) => p.distance >= 10,
  },
  {
    id: "connection",
    title: "First connection",
    description: "Explore your first stop.",
    goal: (p: Progress) => p.visited.length >= 1,
  },
  {
    id: "tour",
    title: "Full stack explorer",
    description: "Discover all five stops.",
    goal: (p: Progress) => p.visited.length === stops.length,
  },
  {
    id: "packets",
    title: "Packet collector",
    description: "Collect all 12 golden data packets.",
    goal: (p: Progress) => p.collected.length === packetLocations.length,
  },
  {
    id: "distance",
    title: "Long-running process",
    description: "Travel 500 meters around the campus.",
    goal: (p: Progress) => p.distance >= 500,
  },
] as const;
export const emptyProgress: Progress = {
  visited: [],
  collected: [],
  distance: 0,
};
export function readProgress(): Progress {
  try {
    const p = JSON.parse(localStorage.getItem("minh-world-v1") || "{}");
    return {
      visited: Array.isArray(p.visited)
        ? (Array.from(
            new Set(
              p.visited.filter((id: unknown) =>
                stops.some((stop) => stop.id === id),
              ),
            ),
          ) as StopId[])
        : [],
      collected: Array.isArray(p.collected)
        ? (Array.from(
            new Set(
              p.collected.filter(
                (id: unknown) =>
                  Number.isInteger(id) &&
                  Number(id) >= 0 &&
                  Number(id) < packetLocations.length,
              ),
            ),
          ) as number[])
        : [],
      distance:
        typeof p.distance === "number" && Number.isFinite(p.distance)
          ? Math.max(0, p.distance)
          : 0,
    };
  } catch {
    return { ...emptyProgress };
  }
}
