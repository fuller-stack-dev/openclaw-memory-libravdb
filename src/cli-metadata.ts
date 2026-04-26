import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { PLUGIN_ID, registerMemoryCliMetadata } from "./cli-descriptors.js";

export default definePluginEntry({
  id: PLUGIN_ID,
  name: "LibraVDB Memory",
  description: "Persistent vector memory with three-tier hybrid scoring",
  kind: ["memory", "context-engine"],

  register(api) {
    registerMemoryCliMetadata(api);
  },
});
