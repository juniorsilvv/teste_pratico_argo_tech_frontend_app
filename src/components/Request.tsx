export default async function Request(url: string, method: string, body: object | null = null) {
    const apiCredentials = {
        "url": "http://ec2-18-116-203-37.us-east-2.compute.amazonaws.com/api/",
        "token": "DEV_TOKEN"
    }

    const requestOptions: RequestInit = {
        method: method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiCredentials.token,
        },
    };

    // Adicione o corpo apenas se não for uma requisição GET
    if (method !== 'GET' && body) {
        requestOptions.body = JSON.stringify(body);
    }

    // Retorne a Promise da requisição
    return fetch(apiCredentials.url + url, requestOptions)
        .then(response => response.json())
        .then(response => {
            // console.log(response.json())
            return response
        })
        .catch(error => {
            console.error('Erro ao fazer requisição:', error);
            throw error; // Rejeita a Promise caso ocorra um erro
        });
}