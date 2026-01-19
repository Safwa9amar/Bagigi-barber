import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';
const env = process.env.ENV || (isProd ? 'production' : 'development');
const envFile = `.env.${env}`;
const envPath = path.resolve(__dirname, envFile);

if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
} else {
    require('dotenv').config(); // Fallback to default .env
}

export default ({ config }) => {
    return {
        ...config,
        name: "Bagigi-barber",
        slug: "Bagigi-barber",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "bagigi-barber",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        supportsRtl: true,
        splash: {
            image: "./assets/images/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.astro0666.bagigibarber"
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            edgeToEdgeEnabled: true,
            package: "com.astro0666.bagigibarber",
            googleServicesFile: "./google-services.json"
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/favicon.png"
        },
        plugins: [
            "expo-router",
            "expo-web-browser",
            "expo-font",
            "expo-notifications",
            [
                "expo-splash-screen",
                {
                    "backgroundColor": "#232323",
                    "image": "./assets/images//splash-icon.png",
                    "dark": {
                        "image": "./assets/images/splash-icon-dark.png",
                        "backgroundColor": "#000000"
                    },
                    "imageWidth": 200
                }
            ]
        ],
        experiments: {
            typedRoutes: true
        },
        extra: {
            router: {},
            eas: {
                projectId: "80a5c465-f647-4b4d-be15-294c27b68b0d"
            }
        },
        owner: "astro0666"
    };
};
