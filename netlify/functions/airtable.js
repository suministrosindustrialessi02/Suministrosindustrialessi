exports.handler = async function(event){
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  const single = event.queryStringParameters || {};
  const multi = event.multiValueQueryStringParameters || {};
  const table = single.table;
  const recordId = single.recordId;

  if(!table){
    return { statusCode: 400, body: JSON.stringify({ error: "Falta el parametro table" }) };
  }

  let url = `https://api.airtable.com/v0/${BASE_ID}/${table}`;
  if(recordId) url += `/${recordId}`;

  // Usar multiValueQueryStringParameters para no perder valores repetidos (ej. fields[]=a&fields[]=b)
  const qs = new URLSearchParams();
  const keys = Object.keys(multi).length ? Object.keys(multi) : Object.keys(single);
  for(const key of keys){
    if(key === "table" || key === "recordId") continue;
    const values = multi[key] || [single[key]];
    for(const val of values) qs.append(key, val);
  }
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
