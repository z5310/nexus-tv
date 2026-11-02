import { describe, expect, test } from "bun:test";

import {
    configForRunningHubModel,
    defaultRunningHubModelValue,
    runningHubWorkflowForModel,
    withRunningHubModels,
} from "../src/lib/runninghub-model-adapter";
import { modelDisplayName, selectableModelsByCapability, defaultConfig, type AiConfig } from "../src/stores/use-config-store";

function runningHubConfig(): AiConfig {
    return {
        ...defaultConfig,
        runningHub: {
            ...defaultConfig.runningHub,
            enabled: true,
            baseUrl: "https://www.runninghub.ai",
            apiKey: "test-key",
            selectedKind: "app",
            workflowId: "2083894278044372993",
            workflows: [{
                kind: "app",
                capability: "image",
                workflowId: "2083894278044372993",
                webappId: "2083894278044372993",
                title: "Krea 2 文生图",
                fields: [],
            }],
        },
    };
}

describe("RunningHub 模型选择适配器", () => {
    test("把已配置图片工作流暴露为普通图片模型选项", () => {
        const source = runningHubConfig();
        const config = withRunningHubModels(source, "image");
        const options = selectableModelsByCapability(config, "image");

        expect(options).toHaveLength(1);
        expect(modelDisplayName(config, options[0]!)).toBe("Krea 2 文生图");
        expect(runningHubWorkflowForModel(source, options[0]!)?.workflowId).toBe("2083894278044372993");
        expect(defaultRunningHubModelValue(source, "image")).toBe(options[0]);
        expect(source.channels).toHaveLength(0);
    });

    test("选中虚拟模型后恢复为现有 RunningHub 执行配置", () => {
        const source = runningHubConfig();
        const selected = defaultRunningHubModelValue(source, "image");
        const workflow = runningHubWorkflowForModel(source, selected)!;
        const config = configForRunningHubModel(source, workflow);

        expect(config.taskWorkflowProvider).toBe("runninghub");
        expect(config.runningHub.workflowId).toBe("2083894278044372993");
        expect(config.runningHub.selectedKind).toBe("app");
        expect(config.channels.some((channel) => channel.name === "RunningHub")).toBe(true);
    });

    test("缺少积分 API Key 时不进入模型选择器", () => {
        const source = runningHubConfig();
        source.runningHub.apiKey = "";

        expect(selectableModelsByCapability(withRunningHubModels(source, "image"), "image")).toHaveLength(0);
    });
});
