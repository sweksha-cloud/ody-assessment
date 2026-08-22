import axios from "axios";

// Android emulators can't reach the host as `localhost` — override with
// EXPO_PUBLIC_API_URL (e.g. http://10.0.2.2:8787) when targeting one.
axios.defaults.baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8787";

export * from "./generated/default/default";
export * from "./generated/models";
