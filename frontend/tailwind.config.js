export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { ink: '#231F4D', paper: '#FBFAFF', violet: { DEFAULT: '#5B4BDB', soft: '#EFEDFF' }, sky: '#2F6FED', mint: { DEFAULT: '#0E8F6E', soft: '#E3F6EF' }, amber: { DEFAULT: '#9A6212', soft: '#FFF3DC' }, rose: { DEFAULT: '#B4233F', soft: '#FDE8EC' }, line: '#E4E1F5', mute: '#5F5B85' },
    fontFamily: { display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'], sans: ['Figtree', 'system-ui', 'sans-serif'] },
  } },
  plugins: [],
};
