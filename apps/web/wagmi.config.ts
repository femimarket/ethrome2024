import { defineConfig } from '@wagmi/cli'
import { foundry } from '@wagmi/cli/plugins'

export default defineConfig({
    out: 'src/generated.ts',
  plugins: [
    foundry({
      project: '../fhenix',
      include: [  
        // the following patterns are included by default
        'TradeFactory.json',  
        'Trade.json',  
      ],  
    }),
  ],
})

