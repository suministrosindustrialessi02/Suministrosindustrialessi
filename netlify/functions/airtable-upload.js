exports.handler = async function(event){
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  const params = event.queryStringParameters || {};
  const { recordId, fieldId } = params;

  if(!recordId || !fieldId){
    return { statusCode: 400, body: JSON.stringify({ error: "Falta recordId o fieldId" }) };
  }

  const url = `https://content.airtable.com/v0/${BASE_ID}/${recordId}/${fieldId}/uploadAttachment`;

  try{
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: event.body
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
