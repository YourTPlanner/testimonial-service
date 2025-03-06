async function loadApp() {
    const { app } = await import("./dist/app.js");
}
loadApp()