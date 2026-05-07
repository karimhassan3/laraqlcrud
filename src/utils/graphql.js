let api;
let headerCallback;
let routerInstance;
export const useGraphqlApi = (val) => {
    if (!val || typeof val !== 'object') return;
    if (val.api !== undefined) api = val.api;
    if (val.headerCallback !== undefined) headerCallback = val.headerCallback;
    if (val.router !== undefined) routerInstance = val.router;
}
const gatherErrors = (errors) => {
    let error_messages = [];
    errors.map(error => {
        if(error?.extensions?.validation){
            error_messages.push(...gatherErrors(error?.extensions?.validation))
        } else if(error?.message) {
            error_messages.push(error?.message)
        } else if(typeof error == "string") {
            error_messages.push(error)
        } else {
            error_messages.push("Unknown Error Occurred")
        }
    })
    return error_messages;
}
export const graphql = async (params) => {
    if (!params || typeof params !== 'object') throw new Error("Invalid parameters");
    
    const query = params.query ?? params.operations.query ?? ""
    const url = params.url ?? process.env.API_URL + "/graphql";
    delete params["url"]
    if(typeof api == 'undefined') {
        throw new Error("API is not defined")
    }

    let defaultHeaders = {
        Accept: "application/json",
        ...params.headers
    };
    delete params["headers"]
    defaultHeaders = {...(headerCallback !== undefined ? headerCallback(defaultHeaders) : defaultHeaders)}
    const operationMatch = query?.match(/\b(query|mutation|subscription)\s+(\w+)/);
    const operationName =  operationMatch ? operationMatch[2] :null;

    const response = await api.post(url, {
        ...params,
        operationName,
    }, {
        headers: defaultHeaders
    })

    const errors = gatherErrors(response?.data?.errors ?? []);
    if (errors.some(e => e === "Unauthenticated.")) {
        throw new Error("Session expired. Please login again.");
    }

    if (errors.length) {
        throw new Error(errors.join(", "));
    }
    return {
        status: response?.status ?? null,
        data: response?.data?.data ?? null,
        errors: []
    };
}
