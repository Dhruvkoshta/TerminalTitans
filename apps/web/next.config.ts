import path from "node:path";

const nextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: [
    "@my-better-t-app/db",
    "drizzle-orm",
    "@tensorflow-models/face-landmarks-detection",
    "@tensorflow-models/coco-ssd",
    "@tensorflow/tfjs"
  ],
  turbopack: {
    resolveAlias: {
      "@mediapipe/face_mesh": "./src/shims/mediapipe-face-mesh.ts",
    },
  },
  webpack(config: any) {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias["@mediapipe/face_mesh"] = path.resolve(__dirname, "src/shims/mediapipe-face-mesh.ts");
    return config;
  },
};

export default nextConfig;
