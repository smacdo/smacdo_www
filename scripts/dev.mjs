// One development command: watch and rebuild the JavaScript bundles, and run Zola's dev server.
//
// The bundles are written into `static/`, not `public/`, so that Zola treats them as static assets.
// That means Zola copies them into `public/` for us and, more usefully, notices when a rebuild
// rewrites one and tells the browser to reload — so editing a game reloads the page automatically
// through the same channel as editing a template or stylesheet. Writing straight into `public/`
// would still update the file, but Zola does not watch `public/`, so nothing would reload.
//
// Bundling here uses esbuild's JS API rather than several `--watch` processes, so one Node process
// owns every bundle and no extra dependency is needed to run things concurrently.

import * as esbuild from "esbuild";
import { spawn } from "node:child_process";

const BUNDLES = [
    { in: "src/site/header.ts", out: "static/js/site.js" },
    { in: "src/demos/blockbreaker/demo.ts", out: "static/js/demos/blockbreaker.js" },
    { in: "src/demos/brainfreeze/demo.ts", out: "static/js/demos/brainfreeze.js" },
];

const contexts = [];
const firstBuilds = [];

for (const bundle of BUNDLES) {
    // Resolved by the plugin below once this bundle has been built for the first time, so Zola is
    // not started until every bundle exists on disk. Zola copies `static/` at startup and only
    // watches what was there at the time, so starting it early would leave the bundles unwatched.
    let onFirstBuild;
    firstBuilds.push(new Promise((resolve) => (onFirstBuild = resolve)));

    contexts.push(
        await esbuild.context({
            entryPoints: [bundle.in],
            outfile: bundle.out,
            bundle: true,
            sourcemap: true,
            logLevel: "silent",
            plugins: [
                {
                    // Reports each rebuild, so a broken bundle is visible next to Zola's output
                    // instead of failing silently and serving the previous build.
                    name: "report",
                    setup(build) {
                        build.onEnd((result) => {
                            const when = new Date().toLocaleTimeString();
                            if (result.errors.length > 0) {
                                console.error(
                                    `[js] ${when} ${bundle.out} FAILED with ${result.errors.length} error(s)`,
                                );
                                for (const e of result.errors) {
                                    const at = e.location
                                        ? `${e.location.file}:${e.location.line}:${e.location.column}`
                                        : "";
                                    console.error(`      ${e.text} ${at}`);
                                }
                            } else {
                                console.log(`[js] ${when} ${bundle.out}`);
                            }
                            onFirstBuild();
                        });
                    },
                },
            ],
        }),
    );
}

// watch() performs the initial build itself, so there is no separate rebuild() call to duplicate it.
await Promise.all(contexts.map((c) => c.watch()));
await Promise.all(firstBuilds);
console.log("[js] watching for changes\n");

// Passed as a single command string rather than a command plus an args array: with `shell: true`,
// Node deprecates the latter (DEP0190) because the arguments are concatenated rather than escaped.
// The shell is needed on Windows to resolve `zola` through PATHEXT.
const zola = spawn("zola serve", { stdio: "inherit", shell: true });

let shuttingDown = false;
const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    await Promise.all(contexts.map((c) => c.dispose()));
    zola.kill();
    process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
zola.on("exit", shutdown);
