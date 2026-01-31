import {useState} from "react";

const useLogin = (url: string) =>{
    const [response, setResponse] = useState(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const login = async (data: never) => {
        setLoading(true);

        try{
            const res = await fetch(url, {
                method: 'Post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            if(!res.ok) throw new Error('Failed to fetch')

            const dataObj = await res.json();
            setResponse(dataObj);
        }catch (e) {
            throw new Error(e);
        }finally {
            setLoading(false)
        }
    }

    return {login, loading, response, error}

}

export default useLogin;