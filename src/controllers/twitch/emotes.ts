import axios from "axios";

let emotes = {
    global: [],
    streamers: {},
};

exports.streamer = async (req, res) => {
    // If streamer emotes stored, just use those
    // TODO: Set expiry of data
    if (!!Object.keys(emotes.streamers).length) {
        // If the emote is provided, try and find and return it
        if(!!req.params.emote){
            const emote = emotes.streamers[req.params.streamer].find((emote) => emote.code === req.params.emote);
            if(!!emote){
                return res.status(200).json(emote);
            }else{
                return res.status(404).json({error: `Emote "${req.params.emote}" not found`});
            }
        }
        if (!!emotes.streamers[req.params.streamer]) {
            return res.status(200).json(emotes.streamers[req.params.streamer]);
        }
    }


    return await axios
        .get(
            `https://emotes.adamcy.pl/v1/channel/${req.params.streamer}/emotes/all`
        )
        .then((response) => {
            const data = response.data;
            emotes.streamers[req.params.streamer] = data;

            if(!!req.params.emote && !!emotes.streamers[req.params.streamer]){
                const emote = emotes.streamers[req.params.streamer].find((emote) => emote.code === req.params.emote);
                if(!!emote){
                    return res.status(200).json(emote);
                }else{
                    return res.status(404).json({error: `Emote "${req.params.emote}" not found`});
                }
            }

            return res.status(200).json(data);
        });
};

exports.global = async (req, res) => {
    // If global emotes stored, just use those
    // TODO: Set expiry of data
    if (!!Object.keys(emotes.global).length) {
        if(!!req.params.emote){
            const emote = emotes.global.find((emote) => emote.code === req.params.emote);
            if(!!emote){
                return res.status(200).json(emote);
            }else{
                return res.status(404).json({error: `Emote "${req.params.emote}" not found`});
            }
        }
        return res.status(200).json(emotes.global);
    }
    axios
        .get(`https://emotes.adamcy.pl/v1/global/emotes/all`)
        .then((response) => {
            const data = response.data;
            emotes.global = data;
            if(!!req.params.emote){
                const emote = emotes.global.find((emote) => emote.code === req.params.emote);
                if(!!emote){
                    return res.status(200).json(emote);
                }else{
                    return res.status(404).json({error: `Emote "${req.params.emote}" not found`});
                }
            }
            return res.status(200).json(data);
            //this.globalEmotes = data;
        });
};

// exports.getEmote = async (req, res) => {
//     if (this.channelEmotes) {
//         const emote = this.channelEmotes.find(
//             (emote) => emote.code === emoteCode
//         );
//         if (emote) {
//             return emote;
//         }
//     }

//     if (this.globalEmotes) {
//         const emote = this.globalEmotes.find(
//             (emote) => emote.code === emoteCode
//         );
//         if (emote) {
//             return emote;
//         }
//     }

//     return false;
// }
