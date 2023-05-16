module.exports = {
  // darkMode: 'none',
  content: [
    './src/pages/**/*.tsx',
    './src/components/**/*.tsx',
    './src/layouts/**/*.tsx',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      keyframes: {
        bounce2: {
          '0%, 100%': {
            transform: 'translateY(-100%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
      animation: {
        bounce2: 'bounce2 1s infinite',
      },
      textColor: {
        primary: '#40a9ff',
      },
      backgroundColor: {
        primary: '#40a9ff',
      },
    },
  },
};
