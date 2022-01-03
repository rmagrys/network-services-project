import { App } from "./src/app";

const app: App = new App();
app.init().then(() => app.runDataConsumingAndSending());
