import { defineConfig } from "vite";
import { VitePWA } from 'vite-plugin-pwa';


export default defineConfig({
    plugins: [
        VitePWA({
            includeAssets: [ 'fonts/*.woff2', 'gong.mp3' ],
            manifest: {
                name: 'Judo Scoreboard',
                theme_color: '#ffffff',
                icons: [
                    {
                    src: "images/favicons/favicon.svg",
                    type: "image/svg+xml",
                    sizes: "any"
                    },
                    {
                      src: "images/favicons/512.png",
                      type: "image/png",
                      sizes: "512x512"
                    },
                    {
                    src: "images/favicons/192.png",
                    type: "image/png",
                    sizes: "192x192"
                  },
                  {
                    src: "images/favicons/apple-touch-icon.png",
                    type: "image/png",
                    sizes: "180x180"
                  }
                ],
                start_url : "/",
                display: "Fullscreen"
            }
        })
    ]
}
);

