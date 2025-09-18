// @ts-check

import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";

// https://astro.build/config
export default defineConfig({
  base: "/orpc-msw/",
  vite: {
    ssr: {
      noExternal: ["zod"],
    },
  },
  site: "https://dansnow.github.io/orpc-msw/",
  integrations: [
    starlight({
      plugins: [
        starlightTypeDoc({
          entryPoints: ["../src/index.ts"],
          tsconfig: "../tsconfig.json",
        }),
      ],
      title: "orpc-msw",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/DanSnow/orpc-msw",
        },
      ],
      sidebar: [
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
        },
        typeDocSidebarGroup,
      ],
    }),
  ],
});
