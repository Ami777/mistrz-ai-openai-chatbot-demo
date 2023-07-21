import {Widget, addResponseMessage, toggleMsgLoader} from "react-chat-widget";

import 'react-chat-widget/lib/styles.css';
import {OpenAiChat} from "../../lib/open-ai-chat.ts";
import {handleCallableFunction} from "../../lib/callable-functions.ts";
import {ChatCompletionRequestMessageRoleEnum} from "openai";

export const ChatBot = () => {
    const chat = new OpenAiChat('You are a friendly restaurant chatbot and you offer help to our customers.');

    const handleNewUserMessage = async (
        message: string,
        role: ChatCompletionRequestMessageRoleEnum = ChatCompletionRequestMessageRoleEnum.User,
        functionName?: string,
    ) => {
        toggleMsgLoader();

        try {

            const res = await chat.say(message, role, functionName);

            if (res?.functionCall) {
                handleNewUserMessage(
                    handleCallableFunction(res.functionCall),
                    ChatCompletionRequestMessageRoleEnum.Function,
                    res.functionCall.name,
                );
            }

            if (res?.content) {
                addResponseMessage(res?.content);
            }

        } finally {
            toggleMsgLoader();
        }
    };

    return <Widget
        title="RestaurantBot"
        subtitle="W czym możemy Ci pomóc?"
        handleNewUserMessage={handleNewUserMessage}
    />;
};