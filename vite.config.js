import { defineConfig } from "vite";
import { VitePWA } from 'vite-plugin-pwa';


export default defineConfig({
    plugins: [
        VitePWA({
            includeAssets: ['/images/pwa-icon/512.png', '/images/pwa-icon/192.png'],
            manifest: {
                name: 'Judo Scoreboard',
                theme_color: '#ffffff',
                icons: [
                    {
                      src: "/images/pwa-icon/512.png",
                      type: "image/png",
                      sizes: "512x512"
                    },
                    {
                    src: "/images/pwa-icon/192.png",
                    type: "image/png",
                    sizes: "192x192"
                  }
                ],
                start_url : "/",
                display: "Fullscreen"
            }
        })
    ]
}
);

