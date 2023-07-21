import {ChatCompletionRequestMessageFunctionCall} from "openai";

export enum CallableFunction {
    GetInformation = 'getInformation',
}

export enum GetInformationKind {
    OpeningHours = 'opening-hours',
    FreeTables = 'free-tables',
}

interface GetInfomationProperties {
    kind: GetInformationKind;
}

const getInfomation = ({kind}: GetInfomationProperties): string => {
    switch (kind) {
        case GetInformationKind.OpeningHours:
            return `We are open everyday 9:00 - 21:00`;
        case GetInformationKind.FreeTables:
            return `There are 4 free tables. 3 of them are for 2 people and 1 is for 4 people.`;
        default:
            throw new Error('Unknown kind of information');
    }
};

export const handleCallableFunction = (call: ChatCompletionRequestMessageFunctionCall): string => {
    try {

        switch (call.name as CallableFunction) {
            case CallableFunction.GetInformation:
                return getInfomation(JSON.parse(call.arguments ?? 'null') as GetInfomationProperties);

            default:
                throw new Error('Unknown function name.');
        }

    } catch(e) {
        return (e as Error).message;
    }
};