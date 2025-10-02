import { MangaDexConnector } from "./mangadex";
import { AniListConnector } from "./anilist";
import { KitsuConnector } from "./kitsu";
import type { Connector } from "./types";

export const connectors: Record<string, Connector> = {
  mangadex: MangaDexConnector,
  anilist: AniListConnector,
  kitsu: KitsuConnector,
};

export function getConnector(id: string): Connector | null {
  return connectors[id] || null;
}

export { MangaDexConnector, AniListConnector, KitsuConnector };
export * from "./types";