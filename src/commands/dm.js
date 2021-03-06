const FlakeId = require('flakeid')
const flake = new FlakeId({
    timeOffset: (2020 - 1970) * 31536000 * 1000 + (31536000 * 400)
})
exports.run = (Service, Data, args) => {
    Service.User.getUserByUID(Service.session.uid, (err, sender) => {
        if (!args[1]) return Service.Utils.Server.send(`You failed to provide a user.`, Service.io, Service.session.socketID)
        let pmUser = args[1], uidArr = pmUser.split("#"), tag = uidArr.pop(), username = uidArr.join("#")
        Service.User.getUser(username, tag, (err, recipient) => {
            if (err || !recipient) return Service.Utils.Server.send(`Failed to fetch the user provided.`, Service.io, Service.session.socketID)
            let userSession = Service.sessions.find(e => e.uid == recipient.uid)
            if (userSession.socketID == Service.session.socketID) return Service.Utils.Server.send(`You can't DM yourself.`, Service.io, Service.session.socketID) //dont let people dm themselves
            let content = args.join(" ").split(args[1]), msg = content.pop().replace(" ", "") //clears extra space on pop
            const id = flake.gen()
            Service.io.sockets.connected[Service.session.socketID].emit("msg", { id, channel: "DM", username: sender.username, tag: `${sender.tag}`, msg, uid: Service.session.uid, server: false, bot: false })
            Service.io.sockets.connected[userSession.socketID].emit("msg", { id, channel: "DM", username: sender.username, tag: `${sender.tag}`, msg, uid: Service.session.uid, server: false, bot: false })
        })
    })
}
exports.data = {
    name: "dm",
    desc: "Sends a private message to a user.",
    permission: "normal"
};