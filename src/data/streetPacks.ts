export type MapPoint = {
  latitude: number;
  longitude: number;
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
    id: 'soho-manhattan',
    name: 'SoHo, Manhattan',
    accent: '#ff7b5c',
    streets: [
      {
        id: 'broadway-soho',
        name: 'Broadway',
        route: [
          { latitude: 40.71991, longitude: -74.00072 },
          { latitude: 40.72154, longitude: -74.00118 },
          { latitude: 40.72329, longitude: -74.0017 },
          { latitude: 40.72493, longitude: -74.00215 },
        ],
      },
      {
        id: 'mercer-street',
        name: 'Mercer Street',
        route: [
          { latitude: 40.72018, longitude: -73.99868 },
          { latitude: 40.7217, longitude: -73.99814 },
          { latitude: 40.72339, longitude: -73.99756 },
          { latitude: 40.7251, longitude: -73.99696 },
        ],
      },
      {
        id: 'spring-street',
        name: 'Spring Street',
        route: [
          { latitude: 40.72167, longitude: -74.00321 },
          { latitude: 40.72171, longitude: -74.00098 },
          { latitude: 40.72178, longitude: -73.99875 },
          { latitude: 40.72187, longitude: -73.99636 },
        ],
      },
      {
        id: 'prince-street',
        name: 'Prince Street',
        route: [
          { latitude: 40.72497, longitude: -74.00223 },
          { latitude: 40.72503, longitude: -74.00036 },
          { latitude: 40.72509, longitude: -73.99818 },
          { latitude: 40.72516, longitude: -73.99617 },
        ],
      },
      {
        id: 'broome-street',
        name: 'Broome Street',
        route: [
          { latitude: 40.72321, longitude: -74.00311 },
          { latitude: 40.72327, longitude: -74.00114 },
          { latitude: 40.72333, longitude: -73.99896 },
          { latitude: 40.72341, longitude: -73.99681 },
        ],
      },
      {
        id: 'greene-street',
        name: 'Greene Street',
        route: [
          { latitude: 40.72062, longitude: -74.00008 },
          { latitude: 40.72219, longitude: -73.99952 },
          { latitude: 40.7239, longitude: -73.99893 },
          { latitude: 40.72563, longitude: -73.99831 },
        ],
      },
    ],
  },
  {
    id: 'west-village',
    name: 'West Village',
    accent: '#5eb8ff',
    streets: [
      {
        id: 'bleecker-street',
        name: 'Bleecker Street',
        route: [
          { latitude: 40.73177, longitude: -74.00495 },
          { latitude: 40.73092, longitude: -74.00342 },
          { latitude: 40.73006, longitude: -74.00184 },
          { latitude: 40.72918, longitude: -74.00026 },
        ],
      },
      {
        id: 'christopher-street',
        name: 'Christopher Street',
        route: [
          { latitude: 40.73341, longitude: -74.00676 },
          { latitude: 40.73274, longitude: -74.00532 },
          { latitude: 40.73205, longitude: -74.00387 },
          { latitude: 40.73138, longitude: -74.00245 },
        ],
      },
      {
        id: 'seventh-avenue-south',
        name: '7th Avenue South',
        route: [
          { latitude: 40.73437, longitude: -74.00598 },
          { latitude: 40.73343, longitude: -74.00508 },
          { latitude: 40.73254, longitude: -74.00419 },
          { latitude: 40.73161, longitude: -74.00331 },
        ],
      },
      {
        id: 'west-4th-street',
        name: 'West 4th Street',
        route: [
          { latitude: 40.73271, longitude: -74.00628 },
          { latitude: 40.73183, longitude: -74.00525 },
          { latitude: 40.73092, longitude: -74.00421 },
          { latitude: 40.72997, longitude: -74.00315 },
        ],
      },
      {
        id: 'grove-street',
        name: 'Grove Street',
        route: [
          { latitude: 40.73359, longitude: -74.00562 },
          { latitude: 40.73303, longitude: -74.00442 },
          { latitude: 40.73246, longitude: -74.00322 },
          { latitude: 40.73192, longitude: -74.00202 },
        ],
      },
      {
        id: 'hudson-street',
        name: 'Hudson Street',
        route: [
          { latitude: 40.73488, longitude: -74.00626 },
          { latitude: 40.73363, longitude: -74.00585 },
          { latitude: 40.73232, longitude: -74.00543 },
          { latitude: 40.73104, longitude: -74.00503 },
        ],
      },
    ],
  },
  {
    id: 'russian-hill',
    name: 'Russian Hill',
    accent: '#5fd3b6',
    streets: [
      {
        id: 'lombard-street',
        name: 'Lombard Street',
        route: [
          { latitude: 37.80214, longitude: -122.41874 },
          { latitude: 37.80176, longitude: -122.41852 },
          { latitude: 37.80141, longitude: -122.41867 },
          { latitude: 37.80103, longitude: -122.41827 },
        ],
      },
      {
        id: 'hyde-street',
        name: 'Hyde Street',
        route: [
          { latitude: 37.80402, longitude: -122.41925 },
          { latitude: 37.8028, longitude: -122.41894 },
          { latitude: 37.80159, longitude: -122.4186 },
          { latitude: 37.80038, longitude: -122.41828 },
        ],
      },
      {
        id: 'leavenworth-street',
        name: 'Leavenworth Street',
        route: [
          { latitude: 37.80378, longitude: -122.41775 },
          { latitude: 37.80255, longitude: -122.41743 },
          { latitude: 37.80134, longitude: -122.41708 },
          { latitude: 37.8001, longitude: -122.41674 },
        ],
      },
      {
        id: 'filbert-street',
        name: 'Filbert Street',
        route: [
          { latitude: 37.80198, longitude: -122.42045 },
          { latitude: 37.80205, longitude: -122.41911 },
          { latitude: 37.8021, longitude: -122.4178 },
          { latitude: 37.80215, longitude: -122.41654 },
        ],
      },
      {
        id: 'greenwich-street',
        name: 'Greenwich Street',
        route: [
          { latitude: 37.80083, longitude: -122.4208 },
          { latitude: 37.80088, longitude: -122.41952 },
          { latitude: 37.80093, longitude: -122.41821 },
          { latitude: 37.80098, longitude: -122.41691 },
        ],
      },
      {
        id: 'taylor-street',
        name: 'Taylor Street',
        route: [
          { latitude: 37.80361, longitude: -122.41558 },
          { latitude: 37.80235, longitude: -122.41525 },
          { latitude: 37.80111, longitude: -122.4149 },
          { latitude: 37.79988, longitude: -122.41456 },
        ],
      },
    ],
  },
  {
    id: 'shibuya-center',
    name: 'Shibuya Center',
    accent: '#f5b44a',
    streets: [
      {
        id: 'center-gai',
        name: 'Center Gai',
        route: [
          { latitude: 35.66068, longitude: 139.69808 },
          { latitude: 35.66019, longitude: 139.69881 },
          { latitude: 35.65969, longitude: 139.69956 },
          { latitude: 35.6592, longitude: 139.70028 },
        ],
      },
      {
        id: 'koen-dori',
        name: 'Koen Dori',
        route: [
          { latitude: 35.66238, longitude: 139.69742 },
          { latitude: 35.6617, longitude: 139.69809 },
          { latitude: 35.66097, longitude: 139.69882 },
          { latitude: 35.66026, longitude: 139.69955 },
        ],
      },
      {
        id: 'meiji-dori',
        name: 'Meiji Dori',
        route: [
          { latitude: 35.66191, longitude: 139.70154 },
          { latitude: 35.66102, longitude: 139.7011 },
          { latitude: 35.66005, longitude: 139.70058 },
          { latitude: 35.65915, longitude: 139.70012 },
        ],
      },
      {
        id: 'inokashira-dori',
        name: 'Inokashira Dori',
        route: [
          { latitude: 35.66223, longitude: 139.69902 },
          { latitude: 35.66123, longitude: 139.69983 },
          { latitude: 35.66017, longitude: 139.70068 },
          { latitude: 35.65908, longitude: 139.70154 },
        ],
      },
      {
        id: 'dogenzaka',
        name: 'Dogenzaka',
        route: [
          { latitude: 35.65993, longitude: 139.69736 },
          { latitude: 35.65923, longitude: 139.69806 },
          { latitude: 35.65848, longitude: 139.69878 },
          { latitude: 35.65772, longitude: 139.6995 },
        ],
      },
      {
        id: 'bunkamura-dori',
        name: 'Bunkamura Dori',
        route: [
          { latitude: 35.66092, longitude: 139.69652 },
          { latitude: 35.66028, longitude: 139.69727 },
          { latitude: 35.65962, longitude: 139.69797 },
          { latitude: 35.65895, longitude: 139.69869 },
        ],
      },
    ],
  },
];

export async function fetchStreetPacks(): Promise<District[]> {
  await new Promise((resolve) => setTimeout(resolve, 180));

  return STREET_PACKS;
}
