export type MapPoint = {
  x: number;
  y: number;
};

export type Street = {
  id: string;
  name: string;
  route: MapPoint[];
};

export type District = {
  id: string;
  name: string;
  accent: string;
  streets: Street[];
};

export const STREET_PACKS: District[] = [
  {
    id: 'harbor-loop',
    name: 'Harbor Loop',
    accent: '#ff7b5c',
    streets: [
      {
        id: 'jetty-street',
        name: 'Jetty Street',
        route: [
          { x: 16, y: 18 },
          { x: 19, y: 33 },
          { x: 22, y: 55 },
          { x: 26, y: 84 },
        ],
      },
      {
        id: 'anchor-lane',
        name: 'Anchor Lane',
        route: [
          { x: 17, y: 24 },
          { x: 36, y: 31 },
          { x: 61, y: 41 },
          { x: 85, y: 53 },
        ],
      },
      {
        id: 'tidal-way',
        name: 'Tidal Way',
        route: [
          { x: 11, y: 58 },
          { x: 35, y: 57 },
          { x: 58, y: 54 },
          { x: 86, y: 49 },
        ],
      },
      {
        id: 'drydock-road',
        name: 'Drydock Road',
        route: [
          { x: 28, y: 79 },
          { x: 46, y: 66 },
          { x: 63, y: 56 },
          { x: 79, y: 38 },
        ],
      },
      {
        id: 'gull-run',
        name: 'Gull Run',
        route: [
          { x: 38, y: 14 },
          { x: 44, y: 29 },
          { x: 53, y: 52 },
          { x: 66, y: 82 },
        ],
      },
      {
        id: 'mariner-avenue',
        name: 'Mariner Avenue',
        route: [
          { x: 54, y: 18 },
          { x: 69, y: 25 },
          { x: 82, y: 38 },
          { x: 86, y: 64 },
        ],
      },
    ],
  },
  {
    id: 'old-quarter',
    name: 'Old Quarter',
    accent: '#5eb8ff',
    streets: [
      {
        id: 'lantern-row',
        name: 'Lantern Row',
        route: [
          { x: 14, y: 18 },
          { x: 24, y: 31 },
          { x: 39, y: 49 },
          { x: 55, y: 68 },
        ],
      },
      {
        id: 'bellmaker-street',
        name: 'Bellmaker Street',
        route: [
          { x: 17, y: 72 },
          { x: 34, y: 61 },
          { x: 53, y: 50 },
          { x: 74, y: 36 },
        ],
      },
      {
        id: 'mason-alley',
        name: 'Mason Alley',
        route: [
          { x: 23, y: 15 },
          { x: 41, y: 20 },
          { x: 59, y: 30 },
          { x: 77, y: 49 },
        ],
      },
      {
        id: 'archive-road',
        name: 'Archive Road',
        route: [
          { x: 14, y: 47 },
          { x: 31, y: 46 },
          { x: 56, y: 44 },
          { x: 83, y: 43 },
        ],
      },
      {
        id: 'copper-court',
        name: 'Copper Court',
        route: [
          { x: 48, y: 15 },
          { x: 49, y: 34 },
          { x: 51, y: 55 },
          { x: 53, y: 82 },
        ],
      },
      {
        id: 'cathedral-way',
        name: 'Cathedral Way',
        route: [
          { x: 66, y: 16 },
          { x: 61, y: 31 },
          { x: 58, y: 53 },
          { x: 66, y: 79 },
        ],
      },
    ],
  },
  {
    id: 'market-grid',
    name: 'Market Grid',
    accent: '#5fd3b6',
    streets: [
      {
        id: 'citrus-street',
        name: 'Citrus Street',
        route: [
          { x: 12, y: 24 },
          { x: 34, y: 24 },
          { x: 58, y: 24 },
          { x: 87, y: 24 },
        ],
      },
      {
        id: 'loom-lane',
        name: 'Loom Lane',
        route: [
          { x: 31, y: 12 },
          { x: 31, y: 34 },
          { x: 31, y: 57 },
          { x: 31, y: 86 },
        ],
      },
      {
        id: 'saffron-avenue',
        name: 'Saffron Avenue',
        route: [
          { x: 18, y: 78 },
          { x: 35, y: 63 },
          { x: 54, y: 50 },
          { x: 77, y: 31 },
        ],
      },
      {
        id: 'foundry-road',
        name: 'Foundry Road',
        route: [
          { x: 12, y: 49 },
          { x: 33, y: 49 },
          { x: 54, y: 49 },
          { x: 84, y: 49 },
        ],
      },
      {
        id: 'canopy-place',
        name: 'Canopy Place',
        route: [
          { x: 58, y: 13 },
          { x: 58, y: 32 },
          { x: 58, y: 56 },
          { x: 58, y: 84 },
        ],
      },
      {
        id: 'station-row',
        name: 'Station Row',
        route: [
          { x: 14, y: 64 },
          { x: 36, y: 64 },
          { x: 61, y: 64 },
          { x: 89, y: 64 },
        ],
      },
    ],
  },
  {
    id: 'north-hills',
    name: 'North Hills',
    accent: '#f5b44a',
    streets: [
      {
        id: 'ridge-road',
        name: 'Ridge Road',
        route: [
          { x: 12, y: 68 },
          { x: 29, y: 54 },
          { x: 47, y: 41 },
          { x: 68, y: 26 },
          { x: 86, y: 18 },
        ],
      },
      {
        id: 'birch-hollow',
        name: 'Birch Hollow',
        route: [
          { x: 18, y: 18 },
          { x: 29, y: 32 },
          { x: 44, y: 49 },
          { x: 59, y: 69 },
        ],
      },
      {
        id: 'summit-street',
        name: 'Summit Street',
        route: [
          { x: 33, y: 12 },
          { x: 44, y: 20 },
          { x: 61, y: 31 },
          { x: 82, y: 43 },
        ],
      },
      {
        id: 'quarry-lane',
        name: 'Quarry Lane',
        route: [
          { x: 17, y: 49 },
          { x: 34, y: 49 },
          { x: 57, y: 49 },
          { x: 83, y: 49 },
        ],
      },
      {
        id: 'switchback-way',
        name: 'Switchback Way',
        route: [
          { x: 63, y: 16 },
          { x: 55, y: 31 },
          { x: 70, y: 45 },
          { x: 59, y: 61 },
          { x: 72, y: 82 },
        ],
      },
      {
        id: 'overlook-drive',
        name: 'Overlook Drive',
        route: [
          { x: 24, y: 82 },
          { x: 42, y: 73 },
          { x: 59, y: 68 },
          { x: 81, y: 65 },
        ],
      },
    ],
  },
];

export async function fetchStreetPacks(): Promise<District[]> {
  await new Promise((resolve) => setTimeout(resolve, 180));

  return STREET_PACKS;
}
