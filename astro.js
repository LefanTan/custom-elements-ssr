import { readFileSync } from "node:fs";

function getViteConfiguration() {
  return {
    optimizeDeps: {
      include: [
        "lefan-custom-elements-ssr/client-shim.min.js",
        "@webcomponents/template-shadowroot/template-shadowroot.js",
      ],
      exclude: ["lefan-custom-elements-ssr/server.js"],
    },
    ssr: {
      external: ["linkedom", "lefan-custom-elements-ssr/server.js"],
    },
  };
}

/**
 * Astro's webapi already polyfills `CustomEvent`. When creating CustomEvent in linkedom,
 * it does a check to see if `typeof CustomEvent === 'function'` which it is, because
 * Astro already polyfills it. It then uses Astro's version of `CustomEvent`, which conflicts
 * with Linkedom's `Event` and errors.
 *
 * https://github.com/WebReflection/linkedom/issues/130
 */
Object.assign(globalThis, {
  CustomEvent: null,
});

export default function customElements() {
  return {
    name: "lefan-custom-elements-ssr",
    hooks: {
      "astro:config:setup": ({ updateConfig, addRenderer, injectScript }) => {
        injectScript(
          "head-inline",
          readFileSync(new URL("./client-shim.min.js", import.meta.url), {
            encoding: "utf-8",
          })
        );

        addRenderer({
          name: "lefan-custom-elements-ssr",
          serverEntrypoint: "lefan-custom-elements-ssr/server.js",
        });

        updateConfig({
          vite: getViteConfiguration(),
        });
      },
    },
  };
}
