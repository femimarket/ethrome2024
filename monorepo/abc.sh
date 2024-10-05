npx wagmi generate -c wagmi.config.ts


cast call --rpc-url fhenix_local 0x9fb118AFA23D6A7FAF1e7306f1b9E6A10f6db82e "getPl(string)(int32)" "EUR_USD"

cast send --private-key 0xa3b8db7496a3b80d0142caf6c66157821590ad82ebc04707483eb62910f4564b --rpc-url fhenix_local 0x97A0b403f087846b0AEE7320D9C73E223088b3B6 "addPrice(string,uint32)" "EUR_USD" 10000

cast call --private-key 0xa3b8db7496a3b80d0142caf6c66157821590ad82ebc04707483eb62910f4564b --rpc-url fhenix_local 0xC10822d956777E653D4E30F90582080F7289911f "addTrade(string,uint32)" "EUR_USD" 200


cast send --private-key 0xa3b8db7496a3b80d0142caf6c66157821590ad82ebc04707483eb62910f4564b --rpc-url fhenix_local 0x335721A3e7C3f05A89c0A037D10eeb5Ff5DA7274 "deployTrade()(address)" --value 0.1ether
 

cast tx --rpc-url fhenix_local 0x48948ffe33ff42b7f9dc78ff9604dbb38c6d323dcb9b3b2166bea6859b526dd1
cast receipt --rpc-url fhenix_local 0x48948ffe33ff42b7f9dc78ff9604dbb38c6d323dcb9b3b2166bea6859b526dd1


cast logs --rpc-url fhenix_local "deployTrade()" --address 0x86d0EbF984cA975D8785b6867a9e19A1f8f1221c 

