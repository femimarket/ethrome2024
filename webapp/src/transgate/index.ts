import TransgateConnect from "@zkpass/transgate-js-sdk"


export const tlsVerify = async () => {
    try {
        // The appid of the project created in dev center
        const appid = "f47fe8ca-03c3-42e3-b85d-511573c52e82"
    
        // Create the connector instance
        const connector = new TransgateConnect(appid)
    
        // connector.baseServer = "https://dev.zkpass.org:3000/v1/sdk/config"
        // Check if the TransGate extension is installed
        // If it returns false, please prompt to install it from chrome web store
        const isAvailable = await connector.isTransgateAvailable()
    
        if (isAvailable) {
          // The schema id of the project
          const schemaId = "7d30e98c955d471dbd471531a1befe40"
    
          // Launch the process of verification
          // This method can be invoked in a loop when dealing with multiple schemas
          const res = await connector.launch(schemaId)
    
          // verifiy the res onchain/offchain based on the requirement     
          
        } else {
          console.log('Please install TransGate')
        }
      } catch (error) {
        console.log('transgate error', error)
      }
  }