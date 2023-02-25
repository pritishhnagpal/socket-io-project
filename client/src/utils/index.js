const BASE_URL = "https://poll-service-wc5d.onrender.com/";

export async function customApi({
  endpoint,
  body,
  method = "GET",
  headers = {},
}) {
  const options = {
    body: JSON.stringify(body),
    method,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  };
  console.log("op", options);
  const response = await fetch(BASE_URL + endpoint, options);
  const data = await response.json();

  return data;
}
