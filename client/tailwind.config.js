/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Halloween color palette
        spooky: {
          orange: '#FF6B35',
          purple: '#6B46C1',
          green: '#10B981',
          navy: '#1F2937',
          cream: '#FEF7CD',
          'dark-purple': '#4C1D95',
          'light-orange': '#FB923C',
          'dark-green': '#059669',
        }
      },
      fontFamily: {
        'creepster': ['Creepster', 'cursive'],
        'griffy': ['Griffy', 'cursive'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'typewriter': 'typewriter 3s steps(40) 1s 1 normal both',
        'spooky-bounce': 'spooky-bounce 2s infinite',
        'ghost-float': 'ghost-float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #FF6B35, 0 0 10px #FF6B35, 0 0 15px #FF6B35' },
          '100%': { boxShadow: '0 0 10px #FF6B35, 0 0 20px #FF6B35, 0 0 30px #FF6B35' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        'spooky-bounce': {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        },
        'ghost-float': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '25%': { transform: 'translateY(-15px) translateX(5px)' },
          '50%': { transform: 'translateY(-10px) translateX(-5px)' },
          '75%': { transform: 'translateY(-20px) translateX(3px)' },
        },
      }
    },
  },
  plugins: [],
}