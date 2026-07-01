exports.handler = async function(event){
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  const params = event.queryStringParameters || {};
  const table = params.table;
  const recordId = params.recordId;

  if(!table){
    return { statusCode: 400, body: JSON.stringify({ error: "Falta el parametro table" }) };
  }

  let url = `https://api.airtable.com/v0/${BASE_ID}/${table}`;
  if(recordId) url += `/${recordId}`;

  const qs = new URLSearchParams(params);
  qs.delete("table");
  qs.delete("recordId");
  const qsString = qs.toString();
  if(qsString) url += `?${qsString}`;

  try{
    const resp = await fetch(url, {
      method: event.httpMethod,
      headers: {
        "Authorization": `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: (event.httpMethod === "POST" || event.httpMethod === "PATCH") ? event.body : undefined
    });
    const data = await resp.json();
    return {
      statusCode: resp.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch(err){
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
