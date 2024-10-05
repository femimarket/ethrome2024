npx wagmi generate -c wagmi.config.ts


cast call --rpc-url fhenix_local 0x9fb118AFA23D6A7FAF1e7306f1b9E6A10f6db82e "getPl(string)(int32)" "EUR_USD"

cast send --private-key 0xa3b8db7496a3b80d0142caf6c66157821590ad82ebc04707483eb62910f4564b --rpc-url fhenix_local 0x9fb118AFA23D6A7FAF1e7306f1b9E6A10f6db82e "addPrice(string,uint32)" "EUR_USD" 10000