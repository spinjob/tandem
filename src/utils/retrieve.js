export default retrieve (async (req,res) => {

    let limit = 3750
    var text = req.body.question;
    
    var raw = JSON.stringify({
        "input": text, 
        "model": "text-embedding-ada-002"
    });

    var requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.NEXT_PUBLIC_OPENAI_API_KEY
        },
        body: raw,
        redirect: 'follow'
    };

    var xq;

    console.log("Creating vector embeddings...")

    //Call OpenAI

    let embedding_response = await fetch("https://api.openai.com/v1/embeddings", requestOptions)
        .then(
            response => response.json()
        ).then(
            json => {
                console.log(json)
                xq = json.data[0].embedding;
            }
        ).catch(
            error => console.log('error', error)
        )

        console.log("Embedding Created");
        console.log("Embedding: " + xq);

        var raw = JSON.stringify({
            "namespace": "test",
            "vector": xq,
            "includeValues": false,
            "includeMetadata": true,
            "topK": 3
        });

        var requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Host': process.env.PINECONE_INDEX_NAME,
                'Content-Length': 60,
                'Api-Key': process.env.PINECONE_API_KEY
            },
            body: raw,
            redirect: 'follow'
        };

        //Make Call to Pinecone
        var contexts;

        console.log("Querying Pinecone...")

        let pinecone_query_response = await fetch(`https://${process.env.PINECONE_INDEX_NAME}/query`, requestOptions)
            .then(
                response => response.json()
            ).then(
                json => {
                    console.log(json);
                    console.log(json.matches[0].metadata);
                    console.log(json.matches[0].metadata.text);
                    contexts = json.matches.map(x => x.metadata.text);
                })
            .catch(
                error => console.log('error', error)
            );

        //Create Prompt for OpenAI

        async function createContextQuery(contexts) {

            let prompt;

            // build our prompt with the retrieved contexts included
            let prompt_start = (
                "Answer the question based on the context below.\n\n" +
                "Context:\n"
            );
            let prompt_end = (
                `\n\nQuestion: ${text}\nAnswer:`
            );
            // append contexts until hitting limit
            for (let i = 1; i < contexts.length; i++) {
                if (contexts.slice(0, i).join("\n\n---\n\n").length >= limit) {
                    prompt = (
                        prompt_start +
                        contexts.slice(0, i - 1).join("\n\n---\n\n") +
                        prompt_end
                    );
                    break;
                } else if (i == contexts.length - 1) {
                    prompt = (
                        prompt_start +
                        contexts.join("\n\n---\n\n") +
                        prompt_end
                    );
                }
            };

            return prompt;
        }

        console.log('Creating Prompt...');
        
        var CONTEXT_PROMPT = await createContextQuery(contexts);

        console.log('Creating Completion...');

        console.log(CONTEXT_PROMPT);

        var raw = JSON.stringify({ "prompt": CONTEXT_PROMPT, "max_tokens": 150, "temperature": 0, "top_p": 1, "frequency_penalty": 0, "presence_penalty": 0 });

        var requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.NEXT_PUBLIC_OPENAI_API_KEY
            },
            body: raw,
            redirect: 'follow'
        };

        var completion = await fetch("https://api.openai.com/v1/engines/text-davinci-003/completions", requestOptions)
            .then(response => response.json())
            .then(json => {
                console.log(json);
                return res.status(200).json(json);
            })
            .catch(error => {
                console.error(error);
                return res.status(500).send('An error occurred');
            })

        return completion;
});
