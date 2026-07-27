const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

module.exports = (() => {
    const config = getDefaultConfig(__dirname);

    const { transformer, resolver } = config;

    config.transformer = {
        ...transformer,
        babelTransformerPath: require.resolve("react-native-svg-transformer/expo")
    };
    config.resolver = {
        ...resolver,
        assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
        sourceExts: [...resolver.sourceExts, "svg"],
        // On web, replace lottie-react-native with a no-op stub.
        // The real package uses @lottiefiles/dotlottie-react which crashes
        // when its canvas is rendered with zero dimensions in the browser.
        resolveRequest: (context, moduleName, platform) => {
            if (platform === "web" && moduleName === "lottie-react-native") {
                return {
                    filePath: path.resolve(__dirname, "src/mocks/lottie-web-stub.js"),
                    type: "sourceFile",
                };
            }
            return context.resolveRequest(context, moduleName, platform);
        },
    };

    return config;
})();