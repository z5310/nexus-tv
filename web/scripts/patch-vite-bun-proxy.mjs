import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const chunksDirectory = resolve(import.meta.dirname, "../node_modules/vite/dist/node/chunks");
const original = "socket.destroySoon();";
const compatible = "typeof socket.destroySoon === \"function\" ? socket.destroySoon() : socket.destroy();";
let patched = 0;

for (const fileName of readdirSync(chunksDirectory)) {
    if (!fileName.endsWith(".js")) continue;
    const filePath = resolve(chunksDirectory, fileName);
    const source = readFileSync(filePath, "utf8");
    if (source.includes(compatible)) {
        patched += 1;
        continue;
    }
    if (!source.includes(original)) continue;
    writeFileSync(filePath, source.replaceAll(original, compatible));
    patched += 1;
}

if (patched === 0) {
    throw new Error("未找到 Vite 代理的 socket.destroySoon 调用；请检查 Vite 版本是否已变更");
}
