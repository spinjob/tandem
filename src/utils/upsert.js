import {v4 as uuidv4} from 'uuid';

export default upsertVectors (async (req,res) => {

    let limit = 3750
    var text_input = req.body.text;
    
    var raw = JSON.stringify({
        "input": text_input,
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

    var vector_embeddings;

    // Get vector embeddings

    console.log("Creating vector embeddings...")

    let embedding_response = await fetch("https://api.openai.com/v1/embeddings", requestOptions)
        .then(
            response => response.json()
        ).then(
            json => {
                vectors_embeddings = json.data[0].embedding;
            }
        ).catch(
            error => console.log('error', error)
        );

    var vectors_object = {
        id: uuidv4(),
        values: vectors_embeddings,
        metadata: {
            text: text_input
        }
    }

    console.log("Vectors Object")
    console.log(vectors_object)

    var raw = JSON.stringify({"vectors": vectors_object, namespace: "test"});

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

    //Make call to Pinecone
    //Pinecone Upsert

    console.log("Upserting to Pinecone...")

    let pinecone_upsert_response = await fetch(`https://${process.env.PINECONE_INDEX_NAME}/vectors/upsert`, requestOptions)
        .then(
            response => response.text()
        ).then(
            json => {
                console.log(json)
                return json
            }
        ).catch(
            error => {
                console.log('error', error)
                return error
            }
        );   

    return pinecone_upsert_response

})