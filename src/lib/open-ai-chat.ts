import {
    ChatCompletionRequestMessage, ChatCompletionRequestMessageFunctionCall, ChatCompletionRequestMessageRoleEnum,
    Configuration,
    CreateChatCompletionRequest,
    CreateChatCompletionResponse,
    OpenAIApi
} from "openai";
import {CallableFunction, GetInformationKind} from "./callable-functions.ts";
import {config} from "../config/config.ts";

const parameters: CreateChatCompletionRequest = {
    n: 1,
    top_p: 1,
    temperature: 0.1,
    max_tokens: 300,
    stream: false,
    model: 'gpt-4', // https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4
    messages: [],
    functions: [
        {
            name: CallableFunction.GetInformation,
            description: 'Get restaurant information when user asks for it.',
            parameters: {
                type: 'object',
                properties: {
                    kind: {
                        type: 'string',
                        description: 'Type of information to get.',
                        enum: [GetInformationKind.OpeningHours, GetInformationKind.FreeTables],
                    },
                },
            },
        },
    ],
};

const openAiConfig = {
    apiKey: config.openAiKey,
    parameters,
};

export type ChatResponse = null | {
    content: null | string;
    functionCall: null | ChatCompletionRequestMessageFunctionCall;
};

const extractFirstChoice = (data: CreateChatCompletionResponse): ChatResponse => {
    const firstChoice = data?.choices?.[0]?.message;

    if (!firstChoice) {
        return null;
    }

    return {
        content: firstChoice.content ?? null,
        functionCall: firstChoice.function_call ?? null,
    };
};

export class OpenAiChat {
    private readonly openai = new OpenAIApi(new Configuration({
        apiKey: openAiConfig.apiKey,
    }));
    private readonly messages: ChatCompletionRequestMessage[];

    constructor(system: string) {
        this.messages = [
            {
                role: 'system',
                content: system,
            },
        ];
    }

    async say(
        prompt: string,
        role: ChatCompletionRequestMessageRoleEnum = ChatCompletionRequestMessageRoleEnum.User,
        functionName?: string,
    ): Promise<ChatResponse> {
        this.messages.push({
            role,
            content: prompt,
            name: functionName,
        });

        const {data} = await this.openai.createChatCompletion({
            ...openAiConfig.parameters,
            messages: this.messages,
        });

        const s = extractFirstChoice(data);

        if (s?.content) {
            this.messages.push({
                role: 'assistant',
                content: s.content,
            });
        }

        return s;
    }
}