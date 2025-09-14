import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./public/**/*.{html,svg}'],
  theme: {
    extend: {
      colors: { brand:{DEFAULT:'#0180ff',dark:'#0062cc',light:'#e6f2ff'} },
      borderRadius:{ xl2:'1.25rem' },
      boxShadow:{ glass:'0 10px 30px rgba(1,128,255,.12)' }
    }
  },
  plugins: [],
}
export default config
