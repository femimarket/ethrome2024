/** @type {import('next').NextConfig} */
const nextConfig = {

    webpack: (config, { isServer }) => {
        // Add WebAssembly support
        // if (!isServer) {
          config.experiments.asyncWebAssembly = true;
        //   config.experiments.futureDefaults = true;
          config.experiments.syncWebAssembly = true;
        //   config.experiments.layers = true;
          config.module.rules.push({
            test: /\.wasm$/,
            type: 'webassembly/async',
          });
        //   config.module.rules.push({
        //     test: /\.wasm$/,
        //     type: 'webassembly/sync',
        //   });
        // } 
        return config;
      },
};

export default nextConfig;
