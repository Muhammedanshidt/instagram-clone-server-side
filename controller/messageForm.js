const MessageSchema = require("../SchemaModel.js/MessageModel")
const ConversationSchema = require("../SchemaModel.js/ConversationModal")


//  ROOM CREATE 

// create room

const createRoom = async (req, res) => {
    console.log('jhjh');
    console.log(req.body);


    const newConversation = ConversationSchema({
        members: [req.body.senderId, req.body.receiverId]
    })
    try {
        const savesConversation = await newConversation.save()
        res.status(200).json(savesConversation)
        // console.log(req.body);
    } catch (err) {
        res.status(500).json(err)
    }
}

// get room

const getRoom = async (req, res) => {

    const userid = req.params.userId

    try {
        const showUserChat = await ConversationSchema.find({ members: { $in: [userid] } });
        res.status(200).json(showUserChat)

    } catch (error) {
        return res.status(400).json({ msg: error })

    }
}



// CONVERSATION 

// create message

const createmessage = async (req, res) => {

    console.log("uiggggvbyjjjfjkfgbfgbfgbfgbfgbopxbjjbijbj");

    console.log(req.body)


    const newMessage = MessageSchema(req.body.message)
    try {
        const messageSave = await newMessage.save();
        res.status(200).json(messageSave)
    } catch (error) {
        res.status(500).json(error);
    }


}


const getMessage = async (req, res) => {

    console.log('get messages')
    // console.log(req.params);

    const conversationId = req.params.conversationId

    // console.log(conversationId)

    try {
        // const messages = await MessageSchema.find({ conversationId: conversationId }).populate("conversationId").populate("members")

        const messages = await MessageSchema.find({ conversationId: conversationId }).populate({
            path: "conversationId",
            populate: {
              path: "members"
            }
          });
          
        res.status(200).json(messages)

    } catch (error) {
        return res.status(400).json({ msg: error })

    }
}

module.exports = {
    createRoom,
    getRoom,

    createmessage,
    getMessage
}