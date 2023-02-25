const BASE_URL = "http://localhost:8010/";

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
