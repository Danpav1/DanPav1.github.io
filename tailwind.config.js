module.exports = {
  purge: {
    enabled: true,
    content: ['./docs/**/*.{html,js}'],
    safelist: [
      // Blue colors for dynamic JavaScript classes and hover states
      'text-blue-500',
      'bg-blue-500',
      'bg-blue-600',
      'hover:bg-blue-600',
      'ring-blue-500',
      'ring-opacity-50',
      // Essential gray colors for consistent theming
      'bg-gray-100',
      'bg-gray-800',
      'bg-gray-900',
      'dark:bg-gray-800',
      'dark:bg-gray-900',
      'dark:text-gray-100',
      'dark:text-gray-400',
      'dark:border-gray-600',
      'dark:border-gray-700'
    ]
  },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#030712', // Adding gray-950 for Tailwind v2 compatibility
        }
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
