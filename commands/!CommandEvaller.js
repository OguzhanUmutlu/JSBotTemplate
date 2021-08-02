// DO NOT TOUCH OR DELETE THIS FILE

module.exports=async function(code){eval(`
    async function run() {
        ${code}
    }
    return await run();
`);}