// DO NOT TOUCH OR DELETE THIS FILE

module.exports = async function (code) {
    return await eval(`
        (async () => {
            try {
                ${code};
            } catch (e) {
                return new Error(require("util").inspect(e));
            }
        })();
    `);
}