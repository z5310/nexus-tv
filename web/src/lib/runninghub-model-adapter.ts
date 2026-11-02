import { defaultModelCapabilityConfig, workflowImageCapabilityConfig, workflowVideoCapabilityConfig } from "@/lib/model-capabilities";
import {
    createModelChannel,
    decodeChannelModel,
    encodeChannelModel,
    normalizeRunningHubCapability,
    normalizeRunningHubWorkflowKind,
    type AiConfig,
    type ModelCapability,
    type RunningHubWorkflow,
} from "@/stores/use-config-store";

const RUNNINGHUB_MODEL_CHANNEL_ID = "runninghub-workflows";

function workflowModelKey(workflow: RunningHubWorkflow) {
    return `${normalizeRunningHubWorkflowKind(workflow.kind)}:${workflow.workflowId.trim()}`;
}

function selectableWorkflows(config: AiConfig, capability?: ModelCapability) {
    if (!config.runningHub.enabled || !config.runningHub.baseUrl.trim() || !config.runningHub.apiKey.trim()) return [];
    return config.runningHub.workflows.filter((workflow) => !capability || normalizeRunningHubCapability(workflow.capability) === capability);
}

function workflowCapabilityConfig(workflow: RunningHubWorkflow) {
    const base = defaultModelCapabilityConfig();
    const capability = normalizeRunningHubCapability(workflow.capability);
    if (capability === "image") return { ...base, image: workflowImageCapabilityConfig(workflow.fields || [], base.image!) };
    if (capability === "video") return { ...base, video: workflowVideoCapabilityConfig(workflow.fields || [], base.video!) };
    return base;
}

/** Expose configured RunningHub entries through the normal model-picker interface without persisting a fake ModelChannel. */
export function withRunningHubModels(config: AiConfig, capability?: ModelCapability): AiConfig {
    const workflows = selectableWorkflows(config, capability);
    if (!workflows.length) return config;
    const channel = createModelChannel({
        id: RUNNINGHUB_MODEL_CHANNEL_ID,
        name: "RunningHub",
        baseUrl: config.runningHub.baseUrl,
        apiKey: config.runningHub.apiKey,
        apiFormat: "openai",
        interfaceType: "runninghub-workflow",
        models: workflows.map(workflowModelKey),
        modelCosts: workflows.map((workflow) => ({
            model: workflowModelKey(workflow),
            displayName: workflow.title?.trim() || workflow.workflowId,
            channelLabel: workflow.kind === "app" ? "RunningHub App" : "RunningHub 工作流",
            description: workflow.description?.trim() || "RunningHub 云端工作流",
            capability: normalizeRunningHubCapability(workflow.capability),
            protocol: `runninghub-workflow-${normalizeRunningHubCapability(workflow.capability)}`,
            billingMode: "fixed_request" as const,
            unitPriceMicrocredits: 0,
            capabilityConfig: workflowCapabilityConfig(workflow),
        })),
    });
    return { ...config, channels: [...config.channels.filter((item) => item.id !== RUNNINGHUB_MODEL_CHANNEL_ID), channel] };
}

export function runningHubWorkflowForModel(config: AiConfig, value: string): RunningHubWorkflow | undefined {
    const decoded = decodeChannelModel(value);
    if (decoded?.channelId !== RUNNINGHUB_MODEL_CHANNEL_ID) return undefined;
    return config.runningHub.workflows.find((workflow) => workflowModelKey(workflow) === decoded.model);
}

export function runningHubModelValue(workflow: RunningHubWorkflow) {
    return encodeChannelModel(RUNNINGHUB_MODEL_CHANNEL_ID, workflowModelKey(workflow));
}

export function defaultRunningHubModelValue(config: AiConfig, capability: ModelCapability) {
    const workflows = selectableWorkflows(config, capability);
    const selected = workflows.find((workflow) => workflow.workflowId.trim() === config.runningHub.workflowId.trim()) || workflows[0];
    return selected ? runningHubModelValue(selected) : "";
}

export function configForRunningHubModel(config: AiConfig, workflow: RunningHubWorkflow): AiConfig {
    const capability = normalizeRunningHubCapability(workflow.capability);
    const pickerConfig = withRunningHubModels(config, capability);
    return {
        ...pickerConfig,
        taskWorkflowProvider: "runninghub",
        runningHub: {
            ...config.runningHub,
            capability,
            selectedKind: normalizeRunningHubWorkflowKind(workflow.kind),
            workflowId: workflow.workflowId.trim(),
        },
    };
}
