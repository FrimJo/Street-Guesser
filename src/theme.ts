import { Platform } from 'react-native';

export const palette = {
  backgroundStart: '#07101d',
  backgroundEnd: '#18344e',
  panel: '#102137',
  panelElevated: '#142a43',
  panelMuted: 'rgba(226, 236, 248, 0.08)',
  border: 'rgba(219, 231, 244, 0.14)',
  text: '#f7fbff',
  textMuted: '#9fb3c8',
  textSoft: '#6f8499',
  routeBase: 'rgba(231, 240, 250, 0.22)',
  highlight: '#ffd36b',
  success: '#63d9a4',
  danger: '#ff8d7a',
  shadow: '#020813',
};

export const displayFont =
  Platform.select({
    ios: 'Avenir Next Condensed',
    android: 'sans-serif-condensed',
    default: 'Trebuchet MS',
  }) ?? undefined;

export const shadowCard = {
  shadowColor: palette.shadow,
  shadowOpacity: 0.32,
  shadowRadius: 20,
  shadowOffset: {
    width: 0,
    height: 14,
  },
  elevation: 12,
} as const;
