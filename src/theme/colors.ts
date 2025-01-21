const colors = {
  // Primary colors
  'lodge-brown': {
    DEFAULT: '#6B4E3E',
    50: '#F5F0EE',
    100: '#E8DCD6',
    200: '#D1B9AD',
    300: '#BA9684',
    400: '#A3735B',
    500: '#6B4E3E',
    600: '#563F32',
    700: '#412F26',
    800: '#2C201A',
    900: '#17100D',
  },
  'pine-green': {
    DEFAULT: '#2E5D50',
    50: '#EDF3F2',
    100: '#D4E3E0',
    200: '#A9C7C1',
    300: '#7EABA2',
    400: '#538F83',
    500: '#2E5D50',
    600: '#254A40',
    700: '#1C3830',
    800: '#132520',
    900: '#091310',
  },
  'cabin-cream': {
    DEFAULT: '#F2ECE4',
    50: '#FFFFFF',
    100: '#F2ECE4',
    200: '#E5D9CA',
    300: '#D8C6B0',
    400: '#CBB396',
    500: '#BEA07C',
    600: '#B18D62',
    700: '#997548',
    800: '#775A38',
    900: '#554028',
  },
};

/** @type {keyof typeof colors} */
type ColorName = keyof typeof colors;

module.exports = { colors }; 