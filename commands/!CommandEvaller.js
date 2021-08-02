// DO NOT TOUCH OR DELETE THIS FILE

module.exports = function (code) {
    eval(`
        async function run() {
            ${code}
        }
        run().then(r => r);
    `);
}